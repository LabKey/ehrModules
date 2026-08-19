/*
 * Copyright (c) 2023-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
module.exports = {
    globals: {
        LABKEY: {
            contextPath: '/labkey',
            container: {
                path: '',
                formats: {
                    dateFormat: 'yyyy-MM-dd',
                    dateTimeFormat: 'yyyy-MM-dd HH:mm'
                }
            },
            project: {
                rootId: 'ROOTID'
            },
            user: {
                id: 1004
            },
            helpLinkPrefix: 'https://www.labkey.org/Documentation/wiki-page.view?name=',
            moduleContext: {
                study: {
                    subject: {
                        nounPlural: 'Animals',
                        tableName: 'Animal',
                        nounSingular: 'Animal',
                        columnName: 'Id'
                    },
                    timepointType: 'CONTINUOUS'
                }
            }
        }
    },
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    roots: ['<rootDir>'],
    setupFiles: ['./src/client/test/jest.polyfills.ts'],
    setupFilesAfterEnv: [
        './src/client/test/jest.setup.ts'
    ],
    testEnvironment: 'jsdom',
    testPathIgnorePatterns: [
        '/node_modules/'
    ],
    testRegex: '(\\.(test))\\.(ts|tsx)$',
    testResultsProcessor: 'jest-teamcity-reporter',
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                // This increases test perf by a considerable margin
                isolatedModules: true,
            }
        ]
    },
    transformIgnorePatterns: [
        'node_modules/(?!(lib0|y-protocols))'
    ],
};
