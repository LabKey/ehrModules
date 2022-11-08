/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
module.exports = {
    apps: [{
        name: 'EHRLookups',
        title: 'EHR Lookups Page',
        permission: 'read',
        path: './src/client/EHRLookups'
    },{
        name: 'EHRLookupsWebpart',
        title: 'EHRLookups Webpart',
        permission: 'read',
        path: './src/client/EHRLookups/webpart',
        generateLib: true // used by views/ehrLookups.html
    }]
};