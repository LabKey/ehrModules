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
    setupFilesAfterEnv: [
        './src/test/jest.setup.ts'
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
                tsconfig: "tsconfig.json"
            }
        ]
    },
    transformIgnorePatterns: [
        'node_modules/(?!(lib0|y-protocols))'
    ],
    moduleNameMapper: {
        '\\.(css|scss|sass)$': '<rootDir>/src/test/styleMock.js'
    },
};
