/*
 * Copyright (c) 2023-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
const { merge } = require('webpack-merge');
const baseConfig = require('./node_modules/@labkey/build/webpack/package.config');

module.exports = merge(baseConfig, {
    entry: {
        ehr: './src/index.ts',
        participanthistory: {
            import: './src/ParticipantHistory/index.ts',
        }
    },
    output: {
        filename: '[name].js',
    },
});