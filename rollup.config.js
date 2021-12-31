import sourcemaps from "rollup-plugin-sourcemaps";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import { string } from "rollup-plugin-string";
import scss from "rollup-plugin-scss";
import postcss from "postcss";
import autoprefixer from "autoprefixer";
import { terser } from "rollup-plugin-terser";

const production = !process.env.ROLLUP_WATCH;

/**@type {import("rollup").RollupOptions} */
const config = {
    input: "src/main.js",
    output: {
        format: "iife",
        file: "public/bundle.js",
        sourcemap: true,
        globals: {
            "split.js": "Split",
            tabbyjs: "Tabby",
            nearley: "nearley",
            moo: "moo",
        },
        intro: 'const IROVERSION="0.1.0", WEBVERSION="0.1.0";',
    },
    external: ["split.js", "tabbyjs", "nearley", "moo"],
    plugins: [
        scss({
            processor: () => postcss([autoprefixer()]),
            watch: "src/style/*.scss",
        }),
        sourcemaps(),
        nodeResolve(),
        commonjs(),
        string({ include: "src/sample.*" }),
        production && terser(),
    ],
};

export default config;
