import type { RollupOptions } from 'rollup';
import yargs from "yargs";
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json';
import camelCase from 'lodash.camelcase';
import typescript from 'rollup-plugin-typescript2';
import sourceMaps from "rollup-plugin-sourcemaps";
import vue from "rollup-plugin-vue";
import serve from 'rollup-plugin-serve';
import livereload from "rollup-plugin-livereload";
import postcss from "rollup-plugin-postcss";
import autoprefixer from "autoprefixer";
import postcssImport from "postcss-import";
import postcssUrl from "postcss-url";
import url from "@rollup/plugin-url";
import cssnano from "cssnano";
import vueJsx from '@vitejs/plugin-vue-jsx'
import copy from "rollup-plugin-copy";
import path from 'path';


const pkg = require('./package.json')

// 使用yargs解析命令行执行时的添加参数
const commandLineParameters = yargs(process.argv.slice(1)).options({
    // css文件独立状态,默认为内嵌
    splitCss: { type: "string", alias: "spCss", default: "false" },
    // 打包格式, 默认为 umd,esm,common 三种格式
    packagingFormat: {
        type: "string",
        alias: "pkgFormat",
        default: "umd,esm,common"
    },
    // 打包后的js压缩状态
    compressedState: { type: "string", alias: "compState", default: "false" },
    // 显示每个包的占用体积, 默认不显示
    showModulePKGInfo: { type: "string", alias: "showPKGInfo", default: "false" },
    // 是否开启devServer, 默认不开启
    useDevServer: { type: "string", alias: "useDServer", default: "false" }
}).parseSync();

// 需要让rollup忽略的自定义参数
// const ignoredWarningsKey = [...Object.keys(commandLineParameters)];
const splitCss = commandLineParameters.splitCss;
const packagingFormat = commandLineParameters.packagingFormat.split(",");
const compressedState = commandLineParameters.compressedState;
const showModulePKGInfo = commandLineParameters.showModulePKGInfo;
const useDevServer = commandLineParameters.useDevServer;

const libraryName = 'Context Menu';
const config: RollupOptions = {
    input: [`src/index.ts`],
    output: [
        {
            file: pkg.main,
            name: camelCase(libraryName),
            format: 'umd',
            sourcemap: true,
            globals: {
                vue: "Vue" // 告诉rollup全局变量Vue即是vue
            }
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap: true,
            globals: {
                vue: "Vue" // 告诉rollup全局变量Vue即是vue
            }
        },
    ],
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: ["vue"],
    watch: {
        include: 'src/**',
    },
    plugins: [
        vueJsx(),
        vue({
            target: "browser",
            preprocessStyles: true,
            compilerOptions: {
                comments: false // 删除注释
            },
        }),
        postcss({
            // 内联的css
            extract: splitCss === "true" ? "style/css/contextmenu.css" : false,
            minimize: true,
            sourceMap: false,
            extensions: [".css", ".less"],
            // 当前正在处理的CSS文件的路径, postcssUrl在拷贝资源时需要根据它来定位目标文件
            to: path.resolve(__dirname, "dist/assets/*"),
            use: ["less"],
            // autoprefixer: 给css3的一些属性加前缀
            // postcssImport: 处理css文件中的@import语句
            // cssnano: 它可以通过移除注释、空格和其他不必要的字符来压缩CSS代码
            plugins: [
                autoprefixer(),
                postcssImport(),
                // 对scss中的别名进行统一替换处理
                postcssUrl({
                    filter: "**/*.*",
                    url(asset) {
                        return asset.url.replace(/~@/g, ".");
                    }
                }),
                // 再次调用将css中引入的图片按照规则进行处理
                postcssUrl({
                    basePath: path.resolve(__dirname, "src"),
                    url: "inline",
                    maxSize: 8, // 最大文件大小（单位为KB），超过该大小的文件将不会被编码为base64
                    fallback: (
                        asset: {
                            url: string; pathname?: string | undefined;
                            absolutePath?: string | undefined;
                            relativePath?: string | undefined;
                            search?: string | undefined;
                            hash?: string | undefined;
                        },
                        dir: {
                            from?: string | undefined;
                            to?: string | undefined;
                            file?: string | undefined;
                        }) => {
                        return "copy"
                    }, // 如果文件大小超过最大大小，则使用copy选项复制文件
                    useHash: true, // 进行hash命名
                    encodeType: "base64" // 指定编码类型为base64
                } as any),
                cssnano({
                    preset: "default" // 使用默认配置
                })
            ]
        }),
        // 处理通过img标签引入的图片
        url({
            include: ["**/*.jpg", "**/*.png", "**/*.svg"],
            // 输出路径
            destDir: "dist/assets",
            // 超过10kb则拷贝否则转base64
            limit: 10 * 1024 // 10KB
        }),
        // Allow json resolution
        json(),
        // Compile TypeScript files
        typescript({
            tsconfig: "tsconfig.json",
            tsconfigOverride: {
                compilerOptions: {
                    // dev模式下不生成.d.ts文件
                    declaration: useDevServer !== "true",
                    // 指定目标环境为es5
                    target: "es5"
                }
            },
            clean: true
        }),
        // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
        commonjs(),
        // Allow node_modules resolution, so you can use 'external' to control
        // which external modules to include in the bundle
        // https://github.com/rollup/rollup-plugin-node-resolve#usage
        resolve(),

        // Resolve source maps to the original source
        sourceMaps(),
        serve({
            // open: true,
            // openPage: "/index.html",
            port: 8123,
            contentBase: "dist"
        }),
        // watch dist目录，当目录中的文件发生变化时，刷新页面
        livereload({
            watch: ["dist", "public"]
        }),
        copy({
            targets: [
                {
                    src: "public/**",
                    dest: "dist"
                }
            ]
        })
    ],
};

export default config;