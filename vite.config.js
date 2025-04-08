import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { coverageConfigDefaults } from 'vitest/config'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        ...Object.keys(pkg.dependencies),
        ...Object.keys(pkg.peerDependencies),
        /^node:.*/,
      ],
    },
    target: 'esnext',
  },
  plugins: [
    dts({
      copyDtsFiles: true,
    }),
  ],
  test: {
    clearMocks: true,
    coverage: {
      exclude: ['bin/**', 'examples/**', ...coverageConfigDefaults.exclude],
    },
  },
})
