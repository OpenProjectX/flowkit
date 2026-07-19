import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
    plugins: [
        react(),
        dts({
            insertTypesEntry: true,
            include: ['src/**/*'],
            exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/__*__/**']
        })
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        }
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'OpenprojectxUiFoundation',
            formats: ['es'],
            fileName: () => 'index.js'
        },
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                'react/jsx-runtime',
                'notistack',
                /^@mui\/.*/,
                /^@emotion\/.*/
            ],
            output: {
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === 'style.css') return 'styles.css'
                    return assetInfo.name || 'asset'
                }
            }
        },
        cssCodeSplit: false,
        sourcemap: false
    }
})
