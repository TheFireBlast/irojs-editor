import fs from "fs";
import path from "path";
import sourcemaps from "rollup-plugin-sourcemaps";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import { string } from "rollup-plugin-string";
import scss from "rollup-plugin-scss";
import postcss from "postcss";
import autoprefixer from "autoprefixer";
import { terser } from "rollup-plugin-terser";

const production = !process.env.ROLLUP_WATCH;

let IROVERSION = JSON.parse(fs.readFileSync(path.join(__dirname, "node_modules/irojs/package.json")))["version"];
let EDITORVERSION = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json")))["version"];

/**@type {import("rollup").RollupOptions} */
const config = {
    input: "src/main.js",
    output: {
        format: "iife",
        file: "public/build/bundle.js",
        sourcemap: true,
        globals: {
            "split.js": "Split",
            tabbyjs: "Tabby",
            nearley: "nearley",
            moo: "moo",
        },
        intro: `const IROVERSION=${JSON.stringify(IROVERSION)}, EDITORVERSION=${JSON.stringify(EDITORVERSION)};`,
    },
    external: ["split.js", "tabbyjs", "nearley", "moo"],
    plugins: [
        scss({
            processor: () => postcss([autoprefixer()]),
            watch: "src/style/*.scss",
        }),
        sourcemaps(),
        nodeResolve({ browser: true }),
        commonjs(),
        string({ include: "src/sample.*" }),
        production && terser(),
    ],
};

export default config;
