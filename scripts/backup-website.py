"""Create and restore-test an offline Git backup; never read local working files."""
import hashlib
import json
import pathlib
import re
import subprocess
import sys
import tempfile
import zipfile
from datetime import datetime, timezone


def git(repo, *args):
    return subprocess.check_output(['git', '-C', str(repo), *args])


repo, output = map(pathlib.Path, sys.argv[1:])
output.mkdir(parents=True, exist_ok=False)
sha = git(repo, 'rev-parse', 'refs/heads/main').decode().strip()
stamp = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H-%M-%SZ')
stem = f'website-{stamp}-{sha}'
refs = git(repo, 'show-ref').decode()
git(repo, 'fsck', '--full', '--strict')

# Fail rather than silently remove committed files from a full-history backup.
# This filename guard is not a general-purpose secret-content scanner.
objects = git(repo, 'rev-list', '--objects', '--all').decode().splitlines()
for entry in objects:
    path = entry.partition(' ')[2]
    name = pathlib.PurePosixPath(path).name.lower()
    if ((name == '.env' or name.startswith('.env.'))
            and name not in {'.env.example', '.env.sample', '.env.template'}
            or name in {'credentials.json', 'id_rsa', 'id_ed25519', '.npmrc', '.netrc'}
            or re.search(r'\.(pem|key|p12|pfx)$', name)):
        raise RuntimeError('Potential secret file in Git history; review before backup: ' + path)

bundle = output / f'{stem}.bundle'
git(repo, 'bundle', 'create', str(bundle.resolve()), '--all')
git(repo, 'bundle', 'verify', str(bundle.resolve()))
paths = git(repo, 'ls-tree', '-rz', '--full-tree', sha).split(b'\0')
entries = []
for entry in paths:
    if not entry:
        continue
    header, path = entry.split(b'\t', 1)
    mode, kind, oid = header.decode().split()
    if kind != 'blob':
        raise RuntimeError('Submodule requires an independent backup: ' + path.decode())
    entries.append((mode, oid, path.decode()))

source = output / f'{stem}-sources.zip'
with zipfile.ZipFile(source, 'w', zipfile.ZIP_DEFLATED) as archive:
    for mode, oid, path in entries:
        info = zipfile.ZipInfo('website/' + path)
        info.create_system = 3
        info.external_attr = int(mode, 8) << 16
        info.compress_type = zipfile.ZIP_DEFLATED
        archive.writestr(info, git(repo, 'cat-file', 'blob', oid))
with zipfile.ZipFile(source) as archive:
    assert archive.testzip() is None
    assert archive.namelist() == ['website/' + p for _, _, p in entries]
    for _, oid, path in entries:
        assert archive.read('website/' + path) == git(repo, 'cat-file', 'blob', oid)

with tempfile.TemporaryDirectory(prefix='website-restore-') as temp:
    restored = pathlib.Path(temp) / 'restored.git'
    subprocess.run(['git', 'clone', '--mirror', str(bundle.resolve()), str(restored)], check=True)
    git(restored, 'fsck', '--full', '--strict')
    assert git(restored, 'rev-parse', 'refs/heads/main').decode().strip() == sha
    assert git(restored, 'show-ref').decode() == refs
    work = pathlib.Path(temp) / 'checkout'
    subprocess.run(['git', 'clone', '--no-local', '--branch', 'main', str(restored), str(work)], check=True)
    assert git(work, 'rev-parse', 'HEAD').decode().strip() == sha
    assert not git(work, 'status', '--porcelain')

(output / 'FILES.json').write_text(json.dumps([p for _, _, p in entries], ensure_ascii=False, indent=2), encoding='utf-8')
(output / 'REFS.txt').write_text(refs, encoding='utf-8')
metadata = {'created_utc': stamp, 'main_sha': sha, 'refs': refs.splitlines(),
            'source_file_count': len(entries), 'restoration_verified': True,
            'archives': {p.name: p.stat().st_size for p in (bundle, source)}}
(output / 'METADATA.json').write_text(json.dumps(metadata, indent=2), encoding='utf-8')
(output / 'REPORT.md').write_text(
    f'# Website backup\n\nUTC: {stamp}\n\nmain SHA: `{sha}`\n\n'
    f'Tracked source files: {len(entries)} (FILES.json). All captured refs: REFS.txt.\n\n'
    + '\n'.join(f'- {p.name}: {p.stat().st_size} bytes' for p in (bundle, source))
    + '\n\nVerified: bundle, Git fsck, all refs, restored checkout SHA, ZIP CRC and every source blob.\n'
    + '\nExcluded: untracked/local files, credentials, GitHub settings/secrets, issues, PRs, artifacts, external LFS/submodule content.\n', encoding='utf-8')
checksums = []
for path in sorted(output.iterdir()):
    with path.open('rb') as stream:
        digest = hashlib.file_digest(stream, 'sha256').hexdigest()
    checksums.append(f'{digest}  {path.name}\n')
(output / 'SHA256SUMS').write_text(''.join(checksums), encoding='utf-8')
print((output / 'REPORT.md').read_text(encoding='utf-8'))
