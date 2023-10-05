const { merge } = require('webpack-merge');
const baseConfig = require('./node_modules/@labkey/build/webpack/package.config');

module.exports = merge(baseConfig, {
    entry: {
        ehr: './src/index.ts',
        animalhistory: {
            import: './src/reports/AnimalHistory/index.ts',
        }
    },
    output: {
        filename: '[name].js',
    },
});