import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import babel from 'rollup-plugin-babel'
import shebang from 'rollup-plugin-preserve-shebang'
import { terser } from 'rollup-plugin-terser'

const plugins = () => {
  return [
    shebang(),
    resolve(),
    json(),
    babel({
      exclude: 'node_modules/**', // only transpile our source code
    }),
    terser(),
  ]
}

export default {
  input: 'bin/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
  plugins: plugins(),
  external: [
    'assert',
    'child_process',
    'fs',
    'path',
    'os',
    'https',
    'readline',
    'zlib',
    'events',
    'stream',
    'util',
    'buffer',
  ],
}
