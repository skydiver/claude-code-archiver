import esbuild from 'esbuild';

// Plugin to skip Ink's devtools module (avoids react-devtools-core dependency)
const skipDevtoolsPlugin: esbuild.Plugin = {
  name: 'skip-ink-devtools',
  setup(build) {
    // Intercept the dynamic import of devtools.js from Ink's reconciler
    build.onResolve({ filter: /\.\/devtools\.js$/ }, (args) => {
      if (args.importer.includes('ink')) {
        return { path: 'ink-devtools-stub', namespace: 'stub' };
      }
    });
    // Return empty module for the stub
    build.onLoad({ filter: /.*/, namespace: 'stub' }, () => {
      return { contents: 'export default {}', loader: 'js' };
    });
  },
};

try {
  await esbuild.build({
    entryPoints: ['src/index.tsx'],
    bundle: true,
    outfile: 'build/bundle.js',
    platform: 'node',
    format: 'esm',
    jsx: 'automatic',
    plugins: [skipDevtoolsPlugin],
    banner: {
      js: `#!/usr/bin/env node
import { createRequire } from 'module';
const require = createRequire(import.meta.url);`,
    },
  });
  console.log('⚡ Build finished successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
