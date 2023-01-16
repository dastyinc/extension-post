import {defineConfig} from 'vite'
import {svelte} from '@sveltejs/vite-plugin-svelte'
import * as path from 'path'

// @ts-ignore
import pkg from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [svelte()],
    resolve: {
        alias: {
            $lib: path.resolve(__dirname, 'src/lib'),
            $static: path.resolve(__dirname, 'src/static'),
        }
    },
    base: 'https://static.herewe.space/extension/panel/study/',
    build: {
        rollupOptions: {
            output: {
                entryFileNames: `${pkg.version}/[name].js`,
                chunkFileNames: `${pkg.version}/[name].js`,
                assetFileNames: `${pkg.version}/[name].[ext]`,
            }
        }
    }
})
