import sass from 'rollup-plugin-sass';
import uglify from 'rollup-plugin-uglify';
import merge from 'deepmerge';
import babel from 'rollup-plugin-babel';

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
        sass({
            output: 'dist/frappe-gantt.css'
        }),
        babel({
            exclude: 'node_modules/**',
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
