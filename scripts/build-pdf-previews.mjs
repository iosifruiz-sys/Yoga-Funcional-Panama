import { readdir, readFile, mkdir, rename, rm, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const root=process.cwd();
const source=path.join(root,'src/content/resources/es');
const target=path.join(root,'public/resources/previews');
const probe=spawnSync('pdftoppm',['-v'],{encoding:'utf8'});
if(probe.error?.code==='ENOENT'){console.warn('[pdf-previews] Poppler unavailable: keep original cover');process.exit(0);}
if(probe.error)throw probe.error;
await mkdir(target,{recursive:true});
for(const file of await readdir(source)){
 if(!file.endsWith('.json'))continue;
 const data=JSON.parse(await readFile(path.join(source,file),'utf8'));
 if(data.draft||!data.approved||data.type!=='pdf'||!data.file)continue;
 const basename=path.posix.basename(data.file);
 if(!/^[-a-z0-9_]+\.pdf$/i.test(basename)||data.file!=='/resources/'+basename)continue;
 const pdf=path.join(root,'public/resources',basename);
 try{await access(pdf)}catch{continue}
 const slug=basename.replace(/\.pdf$/i,'');
 for(let i=1;i<=4;i++)await rm(path.join(target,slug+'-page-'+String(i).padStart(2,'0')+'.png'),{force:true});
 const prefix=path.join(target,slug+'-render');
 const result=spawnSync('pdftoppm',['-f','1','-l','4','-scale-to','900','-png','-q',pdf,prefix],{encoding:'utf8'});
 if(result.status!==0){console.warn('[pdf-previews] Failed '+basename+': '+(result.stderr||result.error?.message));continue}
 const produced=(await readdir(target)).filter(n=>n.startsWith(slug+'-render-')&&n.endsWith('.png')).sort((a,b)=>Number(a.match(/-(\d+)\.png$/)?.[1])-Number(b.match(/-(\d+)\.png$/)?.[1]));
 for(const [i,name] of produced.slice(0,4).entries())await rename(path.join(target,name),path.join(target,slug+'-page-'+String(i+1).padStart(2,'0')+'.png'));
 console.log('[pdf-previews] '+basename+': '+Math.min(4,produced.length)+' pages');
}
