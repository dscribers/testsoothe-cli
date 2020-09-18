import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'

const output = 'dist/testsuite.js'

const plugins = () => {
  return [
    resolve(),
    commonjs(),
    json(),
    babel({
      exclude: 'node_modules/**', // only transpile our source code
    }),
    terser(),
  ]
}

export default {
  input: 'src/bin/index.js',
  output: [
    {
      file: output,
      format: 'cjs',
    },
  ],
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
