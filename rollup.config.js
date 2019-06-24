import sass from 'rollup-plugin-sass';
import uglify from 'rollup-plugin-uglify';
import merge from 'deepmerge';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';


// TODO: write better config
const enums = {
    input: 'src/enums.js',
    output: {
        name: 'Enums',
        file: 'dist/enums.js',
        format: 'umd'
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        }),
        uglify()
    ]
};

const dev = {
    input: 'src/index.js',
    output: {
        name: 'Gantt',
        file: 'dist/frappe-gantt.js',
        format: 'umd'
    },
    plugins: [
        resolve(),
        commonjs(),
        sass({
            output: 'dist/frappe-gantt.css'
        }),
        babel({
            exclude: 'node_modules/**'
        }),
        json({
            // All JSON files will be parsed by default,
            // but you can also specifically include/exclude files
            include: 'node_modules/**',

            // for tree-shaking, properties will be declared as
            // variables, using either `var` or `const`
            // preferConst: true, // Default: false

            // specify indentation for the generated default export —
            // defaults to '\t'
            // indent: '  ',

            // ignores indent and generates the smallest code
            // compact: true, // Default: false

            // generate a named export for every property of the JSON object
            // namedExports: true // Default: true
        })
    ]
};

const prod = merge(dev, {
    output: {
        file: 'dist/frappe-gantt.min.js'
    },
    plugins: [uglify()]
});

export default [enums, dev, prod];
