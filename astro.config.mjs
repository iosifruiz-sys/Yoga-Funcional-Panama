import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://iosifruiz.com',
  base: '/',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
