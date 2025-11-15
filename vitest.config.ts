import {defineConfig} from "vitest/config";
import path from 'path'
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        coverage: {
            provider: "v8",
        }
    },
    resolve: {
        alias: {
            "@CParser/": path.resolve(__dirname, "./src/lib/CVIS/CParser/"),
            "@CMachine/": path.resolve(__dirname, "./src/lib/CVIS/CMachine/"),
            "@CVIS/": path.resolve(__dirname, "./src/lib/CVIS/"),
        },
    },
    plugins: [
        tsconfigPaths()
    ]
});
