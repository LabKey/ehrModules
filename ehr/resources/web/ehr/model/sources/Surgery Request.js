/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @name EHR.Metadata.Sources.Request
 * This is the default metadata applied any record when displayed in the context of a request.  Metadata placed here
 * can be used to hide fields not editable at time of request.  It also configured a parent/child relationship between the ehr.reqeusts record and dataset records.
 */
EHR.model.DataModelManager.registerMetadata('Surgery Request', {
    byQuery: {
        'study.Clinical Encounters': {
            type: {
                defaultValue: 'Surgery',
                hidden: true
            }
        }
    }
});