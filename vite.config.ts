import {defineConfig} from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        watch: {
            usePolling: true,
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@lib': path.resolve(__dirname, './src/lib'),
            '@CVIS': path.resolve(__dirname, './src/lib/CVIS'),
            '@CParser': path.resolve(__dirname, './src/lib/CVIS/CParser'),
            '@CVisual': path.resolve(__dirname, './src/lib/CVIS/CVisual'),
            '@CMachine': path.resolve(__dirname, './src/lib/CVIS/CMachine'),
        }
    }

})
