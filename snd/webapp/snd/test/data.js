/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
(function ($) {

    var SNDTEST_INIT_DATA = {
        BEFORE_ALL_TESTS: {
            INIT_CATEGORIES: [
                {
                    CategoryId: 20,
                    Description: 'ChlorideTestTrigger',
                    Active: true,
                    Comment: 'This is chloride test trigger validation.'
                },
                {
                    CategoryId: 21,
                    Description: 'ChlorideBloodTestTrigger',
                    Active: true,
                    Comment: 'This is chloride blood test trigger validation.'
                },
                {
                    CategoryId: 22,
                    Description: 'ElectrolytesTestTrigger',
                    Active: true,
                    Comment: 'This is electrolytes test trigger validation.'
                },
                {
                    CategoryId: 23,
                    Description: 'CalciumTestTrigger',
                    Active: true,
                    Comment: 'This is electrolytes test trigger validation.'
                },
                {
                    CategoryId: 24,
                    Description: 'SNDPermissionTest',
                    Active: true,
                    Comment: 'This is required to save and view data.'
                }
            ],
            INIT_GROUPS: {
                SNDTestGroup: {
                    roles: ['org.labkey.api.security.roles.FolderAdminRole']
                }
            },
            INIT_ROLES_ASSIGNMENT: [
                {
                    categoryId: 24,
                    groupName: 'SNDTestGroup',
                    roleName: 'SND Data Admin'
                }
            ],
            INIT_PACKAGES: [
                {
                    jsonData: {
                        id: 810,
                        description: 'Sodium blood test',
                        active: true,
                        repeatable: true,
                        narrative: 'Sodium: {amount} {units} measured using {kit_type}',
                        categories: [],
                        subPackages: [],
                        attributes: [
                            {
                                name: 'amount',
                                label: 'Amount',
                                rangeURI: 'int',
                                required: true,
                                validators: [{
                                    expression: "~gte=1&~lte=500",
                                    name: "SND Range",
                                    description: "SND Numeric Range",
                                    type: "range"
                                }]
                            }, {
                                name: 'units',
                                label: 'Units',
                                rangeURI: 'string',
                                required: true
                            }, {
                                name: 'kit_type',
                                label: 'Kit',
                                rangeURI: 'string',
                                required: true
                            }
                        ]
                    }
                }, {
                    jsonData: {
                        id: 811,
                        description: 'Potassium blood test',
                        active: true,
                        repeatable: true,
                        narrative: 'Potassium: {amount} {units} measured using {kit_type}',
                        categories: [],
                        subPackages: [],
                        attributes: [
                            {
                                name: 'amount',
                                label: 'Amount',
                                rangeURI: 'int',
                                redactedText: 'Redacted Value',
                                required: true
                            }, {
                                name: 'units',
                                label: 'Units',
                                rangeURI: 'string',
                                required: true

                            }, {
                                name: 'kit_type',
                                label: 'Kit',
                                rangeURI: 'string',
                                required: true
                            }
                        ]
                    }
                }, {
                    jsonData: {
                        id: 812,
                        description: 'Carbon Dioxide, Bicarbonate (CO2) Test',
                        active: true,
                        repeatable: true,
                        narrative: 'Bicarbonate: {amount} {units} measured using {kit_type}',
                        categories: [],
                        subPackages: [],
                        attributes: [
                            {
                                name: 'amount',
                                label: 'Amount',
                                rangeURI: 'int',
                                required: true
                            }, {
                                name: 'units',
                                label: 'Units',
                                rangeURI: 'string',
                                required: true

                            }, {
                                name: 'kit_type',
                                label: 'Kit',
                                rangeURI: 'string',
                                required: true
                            }
                        ]
                    }
                }, {
                    jsonData: {
                        id: 813,
                        description: 'Chloride blood test',
                        active: true,
                        repeatable: true,
                        narrative: 'Chloride: {amount} {units} measured using {kit_type}',
                        categories: [20, 21],
                        subPackages: [],
                        attributes: [
                            {
                                name: 'amount',
                                label: 'Amount',
                                rangeURI: 'int',
                                required: true
                            }, {
                                name: 'units',
                                label: 'Units',
                                rangeURI: 'string',
                                required: true

                            }, {
                                name: 'kit_type',
                                label: 'Kit',
                                rangeURI: 'string',
                                required: true
                            }
                        ]
                    }
                }, {
                    jsonData: {
                        id: 814,
                        description: 'Electrolyte Tests',
                        active: true,
                        repeatable: true,
                        narrative: 'Electrolytes',
                        categories: [22, 24],
                        subPackages: [{
                            pkgId: 810,
                            sortOrder: 2,
                            required: false
                        }, {
                            pkgId: 811,
                            sortOrder: 1,
                            required: false
                        }, {
                            pkgId: 812,
                            sortOrder: 3,
                            required: true
                        }, {
                            pkgId: 813,
                            sortOrder: 4,
                            required: false
                        }],
                        attributes: []
                    }
                }, {
                    jsonData: {
                        id: 815,
                        description: 'Blood Urea Nitrogen (BUN)',
                        active: true,
                        repeatable: true,
                        narrative: 'BUN: {concentration} {units} measured using {kit_type} test',
                        categories: [],
                        subPackages: [],
                        attributes: [
                            {
                                name: 'concentration',
                                label: 'Concentration',
                                rangeURI: 'int',
                                required: true
                            }, {
                                name: 'units',
                                label: 'Units',
                                rangeURI: 'string',
                                required: true

                            }, {
                                name: 'kit_type',
                                label: 'Kit',
                                rangeURI: 'string',
                                required: true
                            }
                        ]
                    }
                }, {
                    jsonData: {
                        id: 816,
                        description: 'Calcium blood test',
                        active: true,
                        repeatable: true,
                        narrative: 'Calcium: {amount} {units} measured using {kit_type} test',
                        categories: [23, 24],
                        subPackages: [],
                        attributes: [
                            {
                                name: 'amount',
                                label: 'Amount',
                                rangeURI: 'int',
                                required: true
                            }, {
                                name: 'units',
                                label: 'Units',
                                rangeURI: 'string',
                                required: true

                            }, {
                                name: 'kit_type',
                                label: 'Kit',
                                rangeURI: 'string',
                                required: true
                            }
                        ]
                    }
                }, {
                    jsonData: {
                        id: 817,
                        description: 'Glucose blood test',
                        active: true,
                        repeatable: true,
                        narrative: 'Glucose: {amount} {units} measured using {kit_type} test',
                        categories: [],
                        subPackages: [],
                        attributes: [
                            {
                                name: 'amount',
                                label: 'Amount',
                                rangeURI: 'int',
                                required: true
                            }, {
                                name: 'units',
                                label: 'Units',
                                rangeURI: 'string',
                                required: true

                            }, {
                                name: 'kit_type',
                                label: 'Kit',
                                rangeURI: 'string',
                                required: true
                            }
                        ]
                    }
                }, {
                    jsonData: {
                        id: 818,
                        description: 'Creatinine blood test',
                        active: true,
                        repeatable: true,
                        narrative: 'Creatinine: {amount} {units} measured using {kit_type} test',
                        categories: [24],
                        subPackages: [],
                        attributes: [
                            {
                                name: 'amount',
                                label: 'Amount',
                                rangeURI: 'int',
                                required: true
                            }, {
                                name: 'units',
                                label: 'Units',
                                rangeURI: 'string',
                                required: true

                            }, {
                                name: 'kit_type',
                                label: 'Kit',
                                rangeURI: 'string',
                                required: true
                            }
                        ]
                    }
                }, {
                    jsonData: {
                        id: 819,
                        description: 'Blood Draw',
                        active: true,
                        repeatable: true,
                        narrative: '{amount} {units} of blood drawn in {tube} tube. Regeneration date {regenDate}.',
                        categories: [24],
                        subPackages: [],
                        attributes: [
                            {
                                name: 'amount',
                                label: 'Amount',
                                rangeURI: 'int',
                                required: true,
                                validators: [{
                                    expression: "~gte=1&~lte=300",
                                    name: "SND Range",
                                    description: "SND Numeric Range",
                                    type: "range"
                                }]
                            }, {
                                name: 'units',
                                label: 'Units',
                                rangeURI: 'string',
                                required: true

                            }, {
                                name: 'tube',
                                label: 'Tube',
                                rangeURI: 'string',
                                redactedText: 'Redacted Value',
                                required: true
                            }, {
                                name: 'regenDate',
                                label: 'Regeneration Date',
                                rangeURI: 'date',
                                required: false
                            }
                        ]
                    }
                }, {
                    jsonData: {
                        id: 820,
                        description: 'Basic Metabolic Panel',
                        active: true,
                        repeatable: true,
                        narrative: 'Basic Metabolic Panel',
                        categories: [24],
                        subPackages: [{
                            pkgId: 814,
                            sortOrder: 1,
                            required: false
                        }, {
                            pkgId: 815,
                            sortOrder: 2,
                            required: false
                        }, {
                            pkgId: 816,
                            sortOrder: 3,
                            required: false
                        }, {
                            pkgId: 817,
                            sortOrder: 4,
                            required: false
                        }, {
                            pkgId: 818,
                            sortOrder: 5,
                            required: false
                        }, {
                            pkgId: 819,
                            sortOrder: 6,
                            required: false
                        }],
                        attributes: []
                    }
                }
            ],
            INIT_PROJECTS: [
                {
                    jsonData: {
                        projectId: 60,
                        active: true,
                        description: "Blood Analysis",
                        referenceId: 120,
                        startDate: "2018-02-26",
                        projectItems: [{
                            pkgId: 814,
                            active: true
                        }, {
                            pkgId: 819,
                            active: true
                        }, {
                            pkgId: 820,
                            active: true
                        }
                        ]
                    }
                },{

                    jsonData: {
                        projectId: 61,
                        active: true,
                        description: "Testing the framework",
                        referenceId: 121,
                        startDate: "2018-01-27",
                        projectItems: [{
                            pkgId: 814,
                            active: true
                        },{
                            pkgId: 816,
                            active: true
                        },{
                            pkgId: 818,
                            active: true
                        }
                        ]
                    }
                },{

                    jsonData: {
                        projectId: 62,
                        active: true,
                        description: "Testing the framework for package dependency",
                        referenceId: 122,
                        startDate: "2018-01-27",
                        projectItems: [{
                            pkgId: 814,
                            active: true
                        }]
                    }
                }
            ]
        }
    };


    function getEventTestData() {
        if (!LABKEY.SND_PKG_CACHE || !LABKEY.SND_PKG_CACHE.loaded) {
            return [];
        }

        return [
            {
                name: 'Valid Save Event: Use Property Names',
                jsonData: {
                    eventId: 1800000,
                    subjectId: "1",
                    date: "2018-02-26T17:51:20",
                    note: "This is a test event note.",
                    projectIdRev: '60|0',
                    qcState: 'Completed',
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['819'][0]['superPkgId'],
                            attributes: [{
                                propertyName: 'amount',
                                value: '10'
                            }, {
                                propertyName: 'units',
                                value: "mL"
                            }, {
                                propertyName: 'tube',
                                value: 'red'
                            }, {
                                propertyName: 'regenDate',
                                value: "2018-03-26"
                            }]
                        },
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['819'][0]['superPkgId'],
                            attributes: [{
                                propertyName: 'amount',
                                value: '11'
                            }, {
                                propertyName: 'units',
                                value: "mL"
                            }, {
                                propertyName: 'tube',
                                value: 'red'
                            }, {
                                propertyName: 'regenDate',
                                value: "2018-03-25"
                            }]
                        }
                    ]
                },
                expected: {
                    eventId: 1800000,
                    subjectId: "1",
                    date: "2018-02-26T17:51:20",
                    note: "This is a test event note.",
                    projectIdRev: '60|0',
                    qcState: 'Completed',
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['819'][0]['superPkgId'],
                            narrativeTemplate: LABKEY.SND_PKG_CACHE['819'][0]['narrative'],
                            attributes: [{
                                propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][0]['attributes'], 'amount')['propertyId'],
                                propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][0]['attributes'], 'amount')['name'],
                                value: '10'
                            }, {
                                propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][0]['attributes'], 'units')['propertyId'],
                                propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][0]['attributes'], 'units')['name'],
                                value: "mL"
                            }, {
                                propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][0]['attributes'], 'tube')['propertyId'],
                                propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][0]['attributes'], 'tube')['name'],
                                value: 'red'
                            }, {
                                propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][0]['attributes'], 'regenDate')['propertyId'],
                                propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][0]['attributes'], 'regenDate')['name'],
                                value: "2018-03-26"
                            }]
                        },
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['819'][0]['superPkgId'],
                            narrativeTemplate: LABKEY.SND_PKG_CACHE['819'][0]['narrative'],
                            attributes: [{
                                propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][0]['attributes'], 'amount')['propertyId'],
                                propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][0]['attributes'], 'amount')['name'],
                                value: '11'
                            }, {
                                propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][0]['attributes'], 'units')['propertyId'],
                                propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][0]['attributes'], 'units')['name'],
                                value: "mL"
                            }, {
                                propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][0]['attributes'], 'tube')['propertyId'],
                                propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][0]['attributes'], 'tube')['name'],
                                value: 'red'
                            }, {
                                propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][0]['attributes'], 'regenDate')['propertyId'],
                                propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][0]['attributes'], 'regenDate')['name'],
                                value: "2018-03-25"
                            }]
                        }
                    ]
                }
            }, {
                name: 'Valid Save Event with super package and trigger unit type conversion',
                roles: ['org.labkey.api.security.roles.ReaderRole',
                    'org.labkey.api.security.roles.EditorRole',
                    'org.labkey.snd.security.roles.SNDBasicSubmitterRole',
                    'org.labkey.snd.security.roles.SNDEditorRole'],
                jsonData: {
                    eventId: 1800001,
                    subjectId: "2",
                    date: "2018-02-26T17:51:20",
                    note: "Note for event attribute data sample JSON",
                    projectIdRev: '61|0',
                    qcState: 'In Progress',
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['814'][0]['superPkgId'],
                            attributes: [],
                            subPackages: [{
                                superPkgId: LABKEY.getSubpackageSuperPkgId(810, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][0]['attributes'], 'amount')['propertyId'],
                                        value: "100"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][0]['attributes'], 'units')['propertyId'],
                                        value: "mEq/L"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][0]['attributes'], 'kit_type')['propertyId'],
                                        value: "Sodium Colorimetric Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(811, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][0]['attributes'], 'amount')['propertyId'],
                                        value: "200"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][0]['attributes'], 'units')['propertyId'],
                                        value: "mEq/L"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][0]['attributes'], 'kit_type')['propertyId'],
                                        value: "Potassium Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(812, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['812'][0]['attributes'], 'amount')['propertyId'],
                                        value: "300"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['812'][0]['attributes'], 'units')['propertyId'],
                                        value: "mEq/L"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['812'][0]['attributes'], 'kit_type')['propertyId'],
                                        value: "Carbon Dioxide (CO2) Colorimetric Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(813, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][0]['attributes'], 'amount')['propertyId'],
                                        value: "400"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][0]['attributes'], 'units')['propertyId'],
                                        value: "mg/dL"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][0]['attributes'], 'kit_type')['propertyId'],
                                        value: "Chloride Blood Detection Kit"
                                    }]
                            }]
                        }
                    ]
                },
                expected: {
                    eventId: 1800001,
                    subjectId: "2",
                    date: "2018-02-26T17:51:20",
                    note: "Note for event attribute data sample JSON",
                    projectIdRev: '61|0',
                    qcState: 'In Progress',
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['814'][0]['superPkgId'],
                            attributes: [],
                            subPackages: [{
                                superPkgId: LABKEY.getSubpackageSuperPkgId(811, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][0]['attributes'], 'amount')['propertyId'],
                                        value: "200"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][0]['attributes'], 'units')['propertyId'],
                                        value: "mEq/L"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][0]['attributes'], 'kit_type')['propertyId'],
                                        value: "Potassium Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(810, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][0]['attributes'], 'amount')['propertyId'],
                                        value: "100"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][0]['attributes'], 'units')['propertyId'],
                                        value: "mEq/L"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][0]['attributes'], 'kit_type')['propertyId'],
                                        value: "Sodium Colorimetric Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(812, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['812'][0]['attributes'], 'amount')['propertyId'],
                                        value: "300"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['812'][0]['attributes'], 'units')['propertyId'],
                                        value: "mEq/L"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['812'][0]['attributes'], 'kit_type')['propertyId'],
                                        value: "Carbon Dioxide (CO2) Colorimetric Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(813, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][0]['attributes'], 'amount')['propertyId'],
                                        value: "112"  // Unit conversion in trigger script
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][0]['attributes'], 'units')['propertyId'],
                                        value: "mEq/L"  // Unit conversion in trigger script
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][0]['attributes'], 'kit_type')['propertyId'],
                                        value: "Chloride Blood Detection Kit"
                                    }]
                            }]
                        }
                    ]
                }
            }, {
                name: 'Valid Save Event with Narrative generation and trigger order check',
                getEventParams: {
                    getTextNarrative: true,
                    getHtmlNarrative: true,
                    getRedactedHtmlNarrative: true,
                    getRedactedTextNarrative: true
                },
                jsonData: {
                    eventId: 1800003,
                    subjectId: "2",
                    date: "2018-02-26T17:51:20",
                    note: "Note for narrative generation sample JSON",
                    projectIdRev: '61|0',
                    qcState: 'Completed',
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['814'][0]['superPkgId'],
                            attributes: [],
                            subPackages: [{
                                superPkgId: LABKEY.getSubpackageSuperPkgId(810, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][0]['attributes'], 'amount')['propertyId'],
                                        value: "100"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][0]['attributes'], 'units')['propertyId'],
                                        value: "mEq/L"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][0]['attributes'], 'kit_type')['propertyId'],
                                        value: "Sodium Colorimetric Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(811, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][0]['attributes'], 'amount')['propertyId'],
                                        value: "200"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][0]['attributes'], 'units')['propertyId'],
                                        value: "mEq/L"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][0]['attributes'], 'kit_type')['propertyId'],
                                        value: "Potassium Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(812, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['812'][0]['attributes'], 'amount')['propertyId'],
                                        value: "300"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['812'][0]['attributes'], 'units')['propertyId'],
                                        value: "mEq/L"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['812'][0]['attributes'], 'kit_type')['propertyId'],
                                        value: "Carbon Dioxide (CO2) Colorimetric Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(813, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][0]['attributes'], 'amount')['propertyId'],
                                        value: "400"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][0]['attributes'], 'units')['propertyId'],
                                        value: "mg/dL"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][0]['attributes'], 'kit_type')['propertyId'],
                                        value: "Chloride Blood Detection Kit"
                                    }]
                            }]
                        }
                    ]
                },
                expected: {
                    eventId: 1800003,
                    subjectId: "2",
                    date: "2018-02-26T17:51:20",
                    note: "Note for narrative generation sample JSON",
                    projectIdRev: '61|0',
                    qcState: 'Completed',
                    textNarrative: "2018-02-26 17:51\n" +
                            "Subject Id: 2\n" +
                            "** Electrolytes-- Potassium: 200 mEq/L measured using Potassium Detection Kit-- Sodium: 100 mEq/L measured using Sodium Colorimetric Detection Kit-- Bicarbonate: 300 mEq/L measured using Carbon Dioxide (CO2) Colorimetric Detection Kit-- Chloride: 112 mEq/L measured using Chloride Blood Detection KitProcedure Note: Note for narrative generation sample JSON\n",
                    redactedHtmlNarrative: "<div class='snd-event-date'>2018-02-26 17:51</div>\n" +
                            "<div class='snd-event-subject'>Subject Id: 2</div>\n" +
                            "<div class='snd-event-data'>** &emsp;Electrolytes<span class='snd-superpkg-pkg-id'> (814) </span></div>\n" +
                            "<div class='snd-event-data'>-- &emsp;&emsp;Potassium: <span class='snd-attribute-data'>Redacted Value</span> <span class='snd-attribute-data'>mEq/L</span> measured using <span class='snd-attribute-data'>Potassium Detection Kit</span><span class='snd-superpkg-pkg-id'> (811) </span></div>\n" +
                            "<div class='snd-event-data'>-- &emsp;&emsp;Sodium: <span class='snd-attribute-data'>100</span> <span class='snd-attribute-data'>mEq/L</span> measured using <span class='snd-attribute-data'>Sodium Colorimetric Detection Kit</span><span class='snd-superpkg-pkg-id'> (810) </span></div>\n" +
                            "<div class='snd-event-data'>-- &emsp;&emsp;Bicarbonate: <span class='snd-attribute-data'>300</span> <span class='snd-attribute-data'>mEq/L</span> measured using <span class='snd-attribute-data'>Carbon Dioxide (CO2) Colorimetric Detection Kit</span><span class='snd-superpkg-pkg-id'> (812) </span></div>\n" +
                            "<div class='snd-event-data'>-- &emsp;&emsp;Chloride: <span class='snd-attribute-data'>112</span> <span class='snd-attribute-data'>mEq/L</span> measured using <span class='snd-attribute-data'>Chloride Blood Detection Kit</span><span class='snd-superpkg-pkg-id'> (813) </span></div>\n" +
                            "<br><div class='snd-event-note'>Procedure Note: <br>Note for narrative generation sample JSON</div>\n",
                    redactedTextNarrative: "2018-02-26 17:51\n" +
                            "Subject Id: 2\n" +
                            "** Electrolytes-- Potassium: Redacted Value mEq/L measured using Potassium Detection Kit-- Sodium: 100 mEq/L measured using Sodium Colorimetric Detection Kit-- Bicarbonate: 300 mEq/L measured using Carbon Dioxide (CO2) Colorimetric Detection Kit-- Chloride: 112 mEq/L measured using Chloride Blood Detection KitProcedure Note: Note for narrative generation sample JSON\n",
                    htmlNarrative: "<div class='snd-event-date'>2018-02-26 17:51</div>\n" +
                            "<div class='snd-event-subject'>Subject Id: 2</div>\n" +
                            "<div class='snd-event-data'>** &emsp;Electrolytes<span class='snd-superpkg-pkg-id'> (814) </span></div>\n" +
                            "<div class='snd-event-data'>-- &emsp;&emsp;Sodium: <span class='snd-attribute-data'>100</span> <span class='snd-attribute-data'>mEq/L</span> measured using <span class='snd-attribute-data'>Sodium Colorimetric Detection Kit</span><span class='snd-superpkg-pkg-id'> (810) </span></div>\n" +
                            "<div class='snd-event-data'>-- &emsp;&emsp;Potassium: <span class='snd-attribute-data'>200</span> <span class='snd-attribute-data'>mEq/L</span> measured using <span class='snd-attribute-data'>Potassium Detection Kit</span><span class='snd-superpkg-pkg-id'> (811) </span></div>\n" +
                            "<div class='snd-event-data'>-- &emsp;&emsp;Bicarbonate: <span class='snd-attribute-data'>300</span> <span class='snd-attribute-data'>mEq/L</span> measured using <span class='snd-attribute-data'>Carbon Dioxide (CO2) Colorimetric Detection Kit</span><span class='snd-superpkg-pkg-id'> (812) </span></div>\n" +
                            "<div class='snd-event-data'>-- &emsp;&emsp;Chloride: <span class='snd-attribute-data'>112.67605633802818</span> <span class='snd-attribute-data'>mEq/L</span> measured using <span class='snd-attribute-data'>Chloride Blood Detection Kit</span><span class='snd-superpkg-pkg-id'> (813) </span></div>\n" +
                            "<br><div class='snd-event-note'>Procedure Note: <br>Note for narrative generation sample JSON</div>",
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['814'][0]['superPkgId'],
                            attributes: [],
                            subPackages: [{
                                superPkgId: LABKEY.getSubpackageSuperPkgId(811, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][0]['attributes'], 'amount')['propertyId'],
                                        value: "200"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][0]['attributes'], 'units')['propertyId'],
                                        value: "mEq/L"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][0]['attributes'], 'kit_type')['propertyId'],
                                        value: "Potassium Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(810, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][0]['attributes'], 'amount')['propertyId'],
                                        value: "100"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][0]['attributes'], 'units')['propertyId'],
                                        value: "mEq/L"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][0]['attributes'], 'kit_type')['propertyId'],
                                        value: "Sodium Colorimetric Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(812, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['812'][0]['attributes'], 'amount')['propertyId'],
                                        value: "300"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['812'][0]['attributes'], 'units')['propertyId'],
                                        value: "mEq/L"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['812'][0]['attributes'], 'kit_type')['propertyId'],
                                        value: "Carbon Dioxide (CO2) Colorimetric Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(813, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][0]['attributes'], 'amount')['propertyId'],
                                        value: "112"  // Unit conversion in trigger script
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][0]['attributes'], 'units')['propertyId'],
                                        value: "mEq/L"  // Unit conversion in trigger script
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][0]['attributes'], 'kit_type')['propertyId'],
                                        value: "Chloride Blood Detection Kit"
                                    }]
                            }]
                        }
                    ]
                }
            }, {
                name: 'Valid Save Event: Fill in empty packages',
                jsonData: {
                    eventId: 1800009,
                    subjectId: "1",
                    date: "2018-02-26T17:51:20",
                    note: "Fill in empty packages and attributes",
                    projectIdRev: '60|0',
                    qcState: 'Completed',
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['820'][0]['superPkgId'],
                            attributes: [],
                            subPackages: [
                                {
                                    superPkgId: LABKEY.SND_PKG_CACHE['819'][1]['superPkgId'],
                                    attributes: [{
                                        propertyName: 'amount',
                                        value: '10'
                                    }, {
                                        propertyName: 'units',
                                        value: "mL"
                                    }, {
                                        propertyName: 'tube',
                                        value: 'red'
                                    }
                                    ]
                                }, {
                                    superPkgId: LABKEY.SND_PKG_CACHE['816'][1]['superPkgId'],
                                    attributes: [{
                                        propertyName: 'amount',
                                        value: "90"
                                    }, {
                                        propertyName: 'units',
                                        value: "mg/dL"
                                    }, {
                                        propertyName: 'kit_type',
                                        value: "blue"
                                    }]
                                }
                            ]
                        }]
                },
                expected: {
                    eventId: 1800009,
                    subjectId: "1",
                    date: "2018-02-26T17:51:20",
                    note: "Fill in empty packages and attributes",
                    projectIdRev: '60|0',
                    qcState: 'Completed',
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['820'][0]['superPkgId'],
                            narrativeTemplate: LABKEY.SND_PKG_CACHE['820'][0]['narrative'],
                            subPackages: [
                                {
                                    superPkgId: LABKEY.SND_PKG_CACHE['814'][1]['superPkgId'],
                                    attributes: [],
                                    subPackages: [
                                        {
                                            superPkgId: LABKEY.SND_PKG_CACHE['811'][1]['superPkgId'],
                                            attributes: [{
                                                propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][1]['attributes'], 'amount')['propertyId'],
                                                propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][1]['attributes'], 'amount')['name'],
                                                value: null
                                            }, {
                                                propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][1]['attributes'], 'units')['propertyId'],
                                                propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][1]['attributes'], 'units')['name'],
                                                value: null
                                            }, {
                                                propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][1]['attributes'], 'kit_type')['propertyId'],
                                                propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][1]['attributes'], 'kit_type')['name'],
                                                value: null
                                            }]
                                        }, {
                                            superPkgId: LABKEY.SND_PKG_CACHE['810'][1]['superPkgId'],
                                            attributes: [{
                                                propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][1]['attributes'], 'amount')['propertyId'],
                                                propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][1]['attributes'], 'amount')['name'],
                                                value: null
                                            }, {
                                                propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][1]['attributes'], 'units')['propertyId'],
                                                propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][1]['attributes'], 'units')['name'],
                                                value: null
                                            }, {
                                                propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][1]['attributes'], 'kit_type')['propertyId'],
                                                propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][1]['attributes'], 'kit_type')['name'],
                                                value: null
                                            }]
                                        }, {
                                            superPkgId: LABKEY.SND_PKG_CACHE['812'][1]['superPkgId'],
                                            attributes: [{
                                                propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['812'][1]['attributes'], 'amount')['propertyId'],
                                                propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['812'][1]['attributes'], 'amount')['name'],
                                                value: null
                                            }, {
                                                propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['812'][1]['attributes'], 'units')['propertyId'],
                                                propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['812'][1]['attributes'], 'units')['name'],
                                                value: null
                                            }, {
                                                propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['812'][1]['attributes'], 'kit_type')['propertyId'],
                                                propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['812'][1]['attributes'], 'kit_type')['name'],
                                                value: null
                                            }]
                                        }, {
                                            superPkgId: LABKEY.SND_PKG_CACHE['813'][1]['superPkgId'],
                                            attributes: [{
                                                propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][1]['attributes'], 'amount')['propertyId'],
                                                propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][1]['attributes'], 'amount')['name'],
                                                value: null
                                            }, {
                                                propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][1]['attributes'], 'units')['propertyId'],
                                                propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][1]['attributes'], 'units')['name'],
                                                value: null
                                            }, {
                                                propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][1]['attributes'], 'kit_type')['propertyId'],
                                                propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][1]['attributes'], 'kit_type')['name'],
                                                value: null
                                            }]
                                        }
                                    ]
                                }, {
                                    superPkgId: LABKEY.SND_PKG_CACHE['815'][1]['superPkgId'],
                                    attributes: [{
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['815'][1]['attributes'], 'concentration')['propertyId'],
                                        propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['815'][1]['attributes'], 'concentration')['name'],
                                        value: null
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['815'][1]['attributes'], 'units')['propertyId'],
                                        propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['815'][1]['attributes'], 'units')['name'],
                                        value: null
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['815'][1]['attributes'], 'kit_type')['propertyId'],
                                        propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['815'][1]['attributes'], 'kit_type')['name'],
                                        value: null
                                    }]
                                }, {
                                    superPkgId: LABKEY.SND_PKG_CACHE['816'][1]['superPkgId'],
                                    attributes: [{
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['816'][1]['attributes'], 'amount')['propertyId'],
                                        propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['816'][1]['attributes'], 'amount')['name'],
                                        value: "25"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['816'][1]['attributes'], 'units')['propertyId'],
                                        propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['816'][1]['attributes'], 'units')['name'],
                                        value: "mEq/L"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['816'][1]['attributes'], 'kit_type')['propertyId'],
                                        propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['816'][1]['attributes'], 'kit_type')['name'],
                                        value: "blue"
                                    }]
                                }, {
                                    superPkgId: LABKEY.SND_PKG_CACHE['817'][1]['superPkgId'],
                                    attributes: [{
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['817'][1]['attributes'], 'amount')['propertyId'],
                                        propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['817'][1]['attributes'], 'amount')['name'],
                                        value: null
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['817'][1]['attributes'], 'units')['propertyId'],
                                        propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['817'][1]['attributes'], 'units')['name'],
                                        value: null
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['817'][1]['attributes'], 'kit_type')['propertyId'],
                                        propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['817'][1]['attributes'], 'kit_type')['name'],
                                        value: null
                                    }]
                                }, {
                                    superPkgId: LABKEY.SND_PKG_CACHE['818'][1]['superPkgId'],
                                    attributes: [{
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['818'][1]['attributes'], 'amount')['propertyId'],
                                        propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['818'][1]['attributes'], 'amount')['name'],
                                        value: null
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['818'][1]['attributes'], 'units')['propertyId'],
                                        propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['818'][1]['attributes'], 'units')['name'],
                                        value: null
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['818'][1]['attributes'], 'kit_type')['propertyId'],
                                        propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['818'][1]['attributes'], 'kit_type')['name'],
                                        value: null
                                    }]
                                }, {
                                    superPkgId: LABKEY.SND_PKG_CACHE['819'][1]['superPkgId'],
                                    attributes: [{
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][1]['attributes'], 'amount')['propertyId'],
                                        propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][1]['attributes'], 'amount')['name'],
                                        value: '10'
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][1]['attributes'], 'units')['propertyId'],
                                        propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][1]['attributes'], 'units')['name'],
                                        value: "mL"
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][1]['attributes'], 'tube')['propertyId'],
                                        propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][1]['attributes'], 'tube')['name'],
                                        value: 'red'
                                    }, {
                                        propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][1]['attributes'], 'regenDate')['propertyId'],
                                        propertyName: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['819'][1]['attributes'], 'regenDate')['name'],
                                        value: null
                                    }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }, {
                name: 'Failed Save Event: Trigger error on unit check',
                jsonData: {
                    eventId: 1800002,
                    subjectId: "2",
                    date: "2018-02-26T17:51:20",
                    note: "Note for Save Event: Out of range attribute",
                    projectIdRev: '61|0',
                    qcState: 'Completed',
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['814'][0]['superPkgId'],
                            attributes: [],
                            subPackages: [{
                                superPkgId: LABKEY.getSubpackageSuperPkgId(810, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyName: 'amount',
                                        value: "200"
                                    }, {
                                        propertyName: 'units',
                                        value: "mEq/L"
                                    }, {
                                        propertyName: 'kit_type',
                                        value: "Sodium Colorimetric Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(811, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyName: 'amount',
                                        value: "200"
                                    }, {
                                        propertyName: 'units',
                                        value: "mEq/L"
                                    }, {
                                        propertyName: 'kit_type',
                                        value: "Potassium Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(812, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyName: 'amount',
                                        value: "300"
                                    }, {
                                        propertyName: 'units',
                                        value: "mEq/L"
                                    }, {
                                        propertyName: 'kit_type',
                                        value: "Carbon Dioxide (CO2) Colorimetric Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(813, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyName: 'amount',
                                        value: "112"
                                    }, {
                                        propertyName: 'units',
                                        value: "L"
                                    }, {
                                        propertyName: 'kit_type',
                                        value: "Chloride Blood Detection Kit"
                                    }]
                            }]
                        }
                    ]
                },
                expectedFailure: '1 error found',
                expected: {
                    eventId: 1800002,
                    subjectId: "2",
                    date: "2018-02-26T17:51:20",
                    note: "Note for Save Event: Out of range attribute",
                    projectIdRev: '61|0',
                    qcState: 'Completed',
                    exception: {
                        severity: "Error",
                        message: "1 error found"
                    },
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['814'][0]['superPkgId'],
                            attributes: [],
                            subPackages: [{
                                superPkgId: LABKEY.getSubpackageSuperPkgId(810, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyName: 'amount',
                                        value: "200"
                                    }, {
                                        propertyName: 'units',
                                        value: "mEq/L"
                                    }, {
                                        propertyName: 'kit_type',
                                        value: "Sodium Colorimetric Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(811, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyName: 'amount',
                                        value: "200"
                                    }, {
                                        propertyName: 'units',
                                        value: "mEq/L"
                                    }, {
                                        propertyName: 'kit_type',
                                        value: "Potassium Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(812, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyName: 'amount',
                                        value: "300"
                                    }, {
                                        propertyName: 'units',
                                        value: "mEq/L"
                                    }, {
                                        propertyName: 'kit_type',
                                        value: "Carbon Dioxide (CO2) Colorimetric Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(813, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyName: 'amount',
                                        value: "112"
                                    }, {
                                        propertyName: 'units',
                                        value: "L",
                                        exception: {
                                            severity: "Error",
                                            message: 'units: Chloride Test Trigger: Invalid units (L). mEq/L or mg/dL required.'
                                        }
                                    }, {
                                        propertyName: 'kit_type',
                                        value: "Chloride Blood Detection Kit"
                                    }]
                            }]
                        }
                    ]
                }
            },{
                name: 'Failed Save Event: Package dependency error',
                jsonData: {
                    eventId: 1800015,
                    subjectId: "2",
                    date: "2018-02-26T17:51:20",
                    note: "Note for Package dependency",
                    projectIdRev: '62|0',
                    qcState: 'Completed',
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['814'][0]['superPkgId'],
                            attributes: [],
                            subPackages: [
                                {
                                    superPkgId: LABKEY.getSubpackageSuperPkgId(811, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                    attributes: [
                                        {
                                            propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][0]['attributes'], 'amount')['propertyId'],
                                            value: "200"
                                        }, {
                                            propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][0]['attributes'], 'units')['propertyId'],
                                            value: "mEq/L"
                                        }, {
                                            propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][0]['attributes'], 'kit_type')['propertyId'],
                                            value: "Potassium Detection Kit"
                                        }]

                                }, {
                                    superPkgId: LABKEY.getSubpackageSuperPkgId(810, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                    attributes: [
                                        {
                                            propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][0]['attributes'], 'amount')['propertyId'],
                                            value: "100"
                                        }, {
                                            propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][0]['attributes'], 'units')['propertyId'],
                                            value: "mEq/L"
                                        }, {
                                            propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][0]['attributes'], 'kit_type')['propertyId'],
                                            value: "Sodium Colorimetric Detection Kit"
                                        }]

                                }, {
                                    superPkgId: LABKEY.getSubpackageSuperPkgId(813, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                    attributes: [
                                        {
                                            propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][0]['attributes'], 'amount')['propertyId'],
                                            value: "112"  // Unit conversion in trigger script
                                        }, {
                                            propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][0]['attributes'], 'units')['propertyId'],
                                            value: "mEq/L"  // Unit conversion in trigger script
                                        }, {
                                            propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][0]['attributes'], 'kit_type')['propertyId'],
                                            value: "Chloride Blood Detection Kit"
                                        }]
                                }]
                        }
                    ]
                },
                expectedFailure: '1 error found',
                expected: {
                    eventId: 1800015,
                    subjectId: "2",
                    date: "2018-02-26T17:51:20",
                    note: "Note for Package dependency",
                    projectIdRev: '62|0',
                    qcState: 'Completed',
                    exception: {
                        severity: "Error",
                        message: "1 error found"
                    },
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['814'][0]['superPkgId'],
                            attributes: [],
                            subPackages: [
                                {
                                    superPkgId: LABKEY.getSubpackageSuperPkgId(811, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                    attributes: [
                                        {
                                            propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][0]['attributes'], 'amount')['propertyId'],
                                            value: "200"
                                        }, {
                                            propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][0]['attributes'], 'units')['propertyId'],
                                            value: "mEq/L"
                                        }, {
                                            propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['811'][0]['attributes'], 'kit_type')['propertyId'],
                                            value: "Potassium Detection Kit"
                                        }]

                                }, {
                                    superPkgId: LABKEY.getSubpackageSuperPkgId(810, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                    attributes: [
                                        {
                                            propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][0]['attributes'], 'amount')['propertyId'],
                                            value: "100"
                                        }, {
                                            propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][0]['attributes'], 'units')['propertyId'],
                                            value: "mEq/L"
                                        }, {
                                            propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['810'][0]['attributes'], 'kit_type')['propertyId'],
                                            value: "Sodium Colorimetric Detection Kit"
                                        }]

                                }, {
                                    superPkgId: LABKEY.getSubpackageSuperPkgId(813, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                    attributes: [
                                        {
                                            propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][0]['attributes'], 'amount')['propertyId'],
                                            value: "112"  // Unit conversion in trigger script
                                        }, {
                                            propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][0]['attributes'], 'units')['propertyId'],
                                            value: "mEq/L"  // Unit conversion in trigger script
                                        }, {
                                            propertyId: LABKEY.getAttributeByName(LABKEY.SND_PKG_CACHE['813'][0]['attributes'], 'kit_type')['propertyId'],
                                            value: "Chloride Blood Detection Kit"
                                        }]
                                }]
                        }
                    ]
                }
            },{
                name: 'Failed Save Event: Out of range value',
                jsonData: {
                    eventId: 1800004,
                    subjectId: "25",
                    date: "2017-05-25T17:51:20",
                    note: "Note for Save Event: Out of range attribute",
                    projectIdRev: '61|0',
                    qcState: 'Completed',
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['814'][0]['superPkgId'],
                            attributes: [],
                            subPackages: [{
                                superPkgId: LABKEY.getSubpackageSuperPkgId(810, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyName: 'amount',
                                        value: "600"
                                    }, {
                                        propertyName: 'units',
                                        value: "mEq/L"
                                    }, {
                                        propertyName: 'kit_type',
                                        value: "Sodium Colorimetric Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(811, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyName: 'amount',
                                        value: "200"
                                    }, {
                                        propertyName: 'units',
                                        value: "mEq/L"
                                    }, {
                                        propertyName: 'kit_type',
                                        value: "Potassium Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(812, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyName: 'amount',
                                        value: "300"
                                    }, {
                                        propertyName: 'units',
                                        value: "mEq/L"
                                    }, {
                                        propertyName: 'kit_type',
                                        value: "Carbon Dioxide (CO2) Colorimetric Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(813, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyName: 'amount',
                                        value: "112"
                                    }, {
                                        propertyName: 'units',
                                        value: "mEq/L"
                                    }, {
                                        propertyName: 'kit_type',
                                        value: "Chloride Blood Detection Kit"
                                    }]
                            }]
                        }
                    ]
                },
                expectedFailure: '1 error found',
                expected: {
                    eventId: 1800004,
                    subjectId: "25",
                    date: "2017-05-25T17:51:20",
                    note: "Note for Save Event: Out of range attribute",
                    projectIdRev: '61|0',
                    qcState: 'Completed',
                    exception: {
                        severity:"Error",
                        message:"1 error found"
                    },
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['814'][0]['superPkgId'],
                            attributes: [],
                            subPackages: [{
                                superPkgId: LABKEY.getSubpackageSuperPkgId(810, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyName: 'amount',
                                        value: "600",
                                        exception: {
                                            severity: "Error",
                                            message: "Value '600.0' for field 'Amount' is invalid. "
                                        }
                                    }, {
                                        propertyName: 'units',
                                        value: "mEq/L"
                                    }, {
                                        propertyName: 'kit_type',
                                        value: "Sodium Colorimetric Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(811, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyName: 'amount',
                                        value: "200"
                                    }, {
                                        propertyName: 'units',
                                        value: "mEq/L"
                                    }, {
                                        propertyName: 'kit_type',
                                        value: "Potassium Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(812, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyName: 'amount',
                                        value: "300"
                                    }, {
                                        propertyName: 'units',
                                        value: "mEq/L"
                                    }, {
                                        propertyName: 'kit_type',
                                        value: "Carbon Dioxide (CO2) Colorimetric Detection Kit"
                                    }]

                            }, {
                                superPkgId: LABKEY.getSubpackageSuperPkgId(813, LABKEY.SND_PKG_CACHE['814'][0]['subPackages']),
                                attributes: [
                                    {
                                        propertyName: 'amount',
                                        value: "112"
                                    }, {
                                        propertyName: 'units',
                                        value: "mEq/L"
                                    }, {
                                        propertyName: 'kit_type',
                                        value: "Chloride Blood Detection Kit"
                                    }]
                            }]
                        }
                    ]
                }
            }, {
                name: 'Failed Save Event: Trigger warning',
                jsonData: {
                    eventId: 1800005,
                    subjectId: "25",
                    date: "2017-05-25T17:51:20",
                    note: "Note for Save Event: Trigger warning",
                    projectIdRev: '61|0',
                    qcState: 'Completed',
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['816'][0]['superPkgId'],
                            attributes: [{
                                propertyName: 'amount',
                                value: "401"

                            }, {
                                propertyName: 'units',
                                value: "mEq/L"
                            }, {
                                propertyName: 'kit_type',
                                value: "Calcium Detection Kit"
                            }],
                            subPackages: []
                        }
                    ]
                },
                expectedFailure: '1 warning found',
                expected: {
                    eventId: 1800005,
                    subjectId: "25",
                    date: "2017-05-25T17:51:20",
                    note: "Note for Save Event: Trigger warning",
                    projectIdRev: '61|0',
                    qcState: 'Completed',
                    exception: {
                        severity:"Warning",
                        message:"1 warning found"
                    },
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['816'][0]['superPkgId'],
                            attributes: [{
                                propertyName: 'amount',
                                value: '401',
                                exception: {
                                    severity: "Warning",
                                    message: "amount: Calcium amount over 400 mEq/L"
                                }
                            }, {
                                propertyName: 'units',
                                value: "mEq/L"
                            }, {
                                propertyName: 'kit_type',
                                value: "Calcium Detection Kit"
                            }],
                            subPackages: []
                        }
                    ]
                }
            }, {
                name: 'Failed Save Event: Missing attribute. EventData error',
                jsonData: {
                    eventId: 1800006,
                    subjectId: "25",
                    date: "2017-05-25T17:51:20",
                    note: "Note for Save Event: Missing attribute. EventData warning",
                    projectIdRev: '61|0',
                    qcState: 'Completed',
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['818'][0]['superPkgId'],
                            attributes: [{
                                propertyName: 'units',
                                value: "mEq/L"
                            }, {
                                propertyName: 'kit_type',
                                value: "Creatinine Detection Kit"
                            }],
                            subPackages: []
                        }
                    ]
                },
                expectedFailure: '1 error found',
                expected: {
                    eventId: 1800006,
                    subjectId: "25",
                    date: "2017-05-25T17:51:20",
                    note: "Note for Save Event: Missing attribute. EventData warning",
                    projectIdRev: '61|0',
                    qcState: 'Completed',
                    exception: {
                        severity:"Error",
                        message:"1 error found"
                    },
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['818'][0]['superPkgId'],
                            attributes: [{
                                propertyName: 'units',
                                value: "mEq/L"
                            }, {
                                propertyName: 'kit_type',
                                value: "Creatinine Detection Kit"
                            }],
                            subPackages: [],
                            exception: {
                                severity: "Error",
                                message: "amount: Required field 'amount' in package 818 not found."
                            }
                        }
                    ]
                }
            }, {
                name: 'Failed Save Event: Trigger info',
                jsonData: {
                    eventId: 1800007,
                    subjectId: "25",
                    date: "2017-05-25T17:51:20",
                    note: "Note for Save Event: Trigger info",
                    projectIdRev: '61|0',
                    qcState: 'Completed',
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['816'][0]['superPkgId'],
                            attributes: [{
                                propertyName: 'amount',
                                value: "99"

                            }, {
                                propertyName: 'units',
                                value: "mEq/L"
                            }, {
                                propertyName: 'kit_type',
                                value: "Calcium Detection Kit"
                            }],
                            subPackages: []
                        }
                    ]
                },
                expectedFailure: '1 info found',
                expected: {
                    eventId: 1800007,
                    subjectId: "25",
                    date: "2017-05-25T17:51:20",
                    note: "Note for Save Event: Trigger info",
                    projectIdRev: '61|0',
                    qcState: 'Completed',
                    exception: {
                        severity:"Info",
                        message:"1 info found"
                    },
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['816'][0]['superPkgId'],
                            attributes: [{
                                propertyName: 'amount',
                                value: '99',
                                exception: {
                                    severity: "Info",
                                    message: "amount: Calcium amount less than 100 mEq/L. Verify kit."
                                }
                            }, {
                                propertyName: 'units',
                                value: "mEq/L"
                            }, {
                                propertyName: 'kit_type',
                                value: "Calcium Detection Kit"
                            }],
                            subPackages: []
                        }
                    ]
                }
            }, {
                name: 'Failed Insert Event: Wrong permissions. Reader inserting Completed event.',
                roles: ['org.labkey.api.security.roles.ReaderRole',
                    'org.labkey.api.security.roles.EditorRole',
                    'org.labkey.snd.security.roles.SNDReaderRole',
                    'org.labkey.snd.security.roles.SNDEditorRole'],
                jsonData: {
                    eventId: 1800007,
                    subjectId: "25",
                    date: "2017-05-25T17:51:20",
                    note: "Note for Save Event",
                    projectIdRev: '61|0',
                    qcState: 'Completed',
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['816'][0]['superPkgId'],
                            attributes: [{
                                propertyName: 'amount',
                                value: "99"

                            }, {
                                propertyName: 'units',
                                value: "mEq/L"
                            }, {
                                propertyName: 'kit_type',
                                value: "Calcium Detection Kit"
                            }],
                            subPackages: []
                        }
                    ]
                },
                expectedFailure: 'You do not have permission to Update event data for QC state Completed for these super packages.',
                expected: {
                    exception: {
                        severity:"Error",
                        message:"You do not have permission to Update event data for QC state Completed for these super packages."
                    }
                }
            }, {
                name: 'Failed Update Event: Wrong permission. Basic submitter updating to rejected',
                roles: ['org.labkey.api.security.roles.ReaderRole',
                    'org.labkey.api.security.roles.EditorRole',
                    'org.labkey.snd.security.roles.SNDBasicSubmitterRole',
                    'org.labkey.snd.security.roles.SNDEditorRole'],
                jsonData: {
                    eventId: 1800008,
                    subjectId: "25",
                    date: "2017-05-25T17:51:20",
                    note: "Note for Save Event",
                    projectIdRev: '61|0',
                    qcState: 'Rejected',
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['816'][0]['superPkgId'],
                            attributes: [{
                                propertyName: 'amount',
                                value: "99"

                            }, {
                                propertyName: 'units',
                                value: "mEq/L"
                            }, {
                                propertyName: 'kit_type',
                                value: "Calcium Detection Kit"
                            }],
                            subPackages: []
                        }
                    ]
                },
                expectedFailure: 'You do not have permission to Insert event data for QC state Rejected for these super packages.',
                expected: {
                    exception: {
                        severity:"Error",
                        message:"You do not have permission to Insert event data for QC state Rejected for these super packages."
                    }
                }
            }, {
                name: 'Failed Insert Event: Wrong permission. Reviewer inserting In Progress data.',
                roles: ['org.labkey.api.security.roles.ReaderRole',
                    'org.labkey.api.security.roles.EditorRole',
                    'org.labkey.snd.security.roles.SNDDataReviewerRole',
                    'org.labkey.snd.security.roles.SNDEditorRole'],
                jsonData: {
                    eventId: 1800008,
                    subjectId: "25",
                    date: "2017-05-25T17:51:20",
                    note: "Note for Save Event",
                    projectIdRev: '61|0',
                    qcState: 'In Progress',
                    eventData: [
                        {
                            superPkgId: LABKEY.SND_PKG_CACHE['816'][0]['superPkgId'],
                            attributes: [{
                                propertyName: 'amount',
                                value: "99"

                            }, {
                                propertyName: 'units',
                                value: "mEq/L"
                            }, {
                                propertyName: 'kit_type',
                                value: "Calcium Detection Kit"
                            }],
                            subPackages: []
                        }
                    ]
                },
                expectedFailure: 'You do not have permission to Insert event data for QC state In Progress for these super packages.',
                expected: {
                    exception: {
                        severity:"Error",
                        message:"You do not have permission to Insert event data for QC state In Progress for these super packages."
                    }
                }
            }
        ];
    }

    var SNDTEST_CLEAN_DATA = {
        EVENTIDS: [1800000, 1800001, 1800002, 1800003, 1800004, 1800005, 1800006, 1800007, 1800008, 1800009]
    };

    LABKEY.getInitData = function () {
        return SNDTEST_INIT_DATA
    };
    LABKEY.getCleanData = function () {
        return SNDTEST_CLEAN_DATA
    };
    LABKEY.getEventTestData = function () {
        return getEventTestData()
    };

})(jQuery);