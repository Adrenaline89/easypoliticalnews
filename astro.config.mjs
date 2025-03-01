import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), markdoc(), tailwind(), ...(process.env.SKIP_KEYSTATIC ? [] : [keystatic()])],
  output: (process.env.SKIP_KEYSTATIC ? 'static' : 'hybrid')
}); 