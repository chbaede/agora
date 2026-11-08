import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://agora.yocto.kr',
  output: 'static',
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
});
