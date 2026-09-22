import { defineConfig } from 'astro/config';

const repository = 'Yoga-Funcional-Panama';

export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL ?? 'https://iosifruiz-sys.github.io',
  base: process.env.PUBLIC_BASE_PATH ?? `/${repository}`,
  trailingSlash: 'always',
  build: { format: 'directory' },
});
