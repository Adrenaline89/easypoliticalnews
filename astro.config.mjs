
import { defineConfig } from 'astro/config'; 
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

import tailwind from "@astrojs/tailwind";

let integrations = [];
let output = '';

console.log('SKIP_KEYSTATIC :' + process.env.SKIP_KEYSTATIC);

if(process.env.SKIP_KEYSTATIC == 'true') {
  integrations =  [react(), markdoc(), tailwind()];
  output = 'static';
} else {
  integrations =  [react(), markdoc(), tailwind(), keystatic()];
  output = 'hybrid'
}

// https://astro.build/config
export default defineConfig({
  integrations: integrations,
  output: output
}); 
