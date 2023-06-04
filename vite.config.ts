import { UserConfigExport, defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

export default (): UserConfigExport => defineConfig({
    plugins: [vue(), vueJsx()],
    build: {
        target: 'es2015',
        outDir: 'dist-example',
        minify: "terser",
        terserOptions: {
            compress: {
                keep_infinity: true,
                drop_console: false,
                drop_debugger: true,
            },
        },
        reportCompressedSize: false,
        chunkSizeWarningLimit: 2000,
    },
    server: {
        open: false, // 自动开启浏览器
        host: '0.0.0.0',
        https: false,
        hmr: true,
    },
})