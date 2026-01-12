import esbuild from 'esbuild';

try {
  await esbuild.build({
    entryPoints: ['src/index.tsx'],
    bundle: true,
    outfile: 'build/bundle.js',
    platform: 'node',
    format: 'esm',
    jsx: 'automatic',
    external: ['react-devtools-core'],
    banner: {
      js: '#!/usr/bin/env node',
    },
  });
  console.log('⚡ Build finished successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
