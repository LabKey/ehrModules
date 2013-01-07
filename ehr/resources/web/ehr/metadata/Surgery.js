/**
 * This is the default metadata applied to records in the context of a Surgery task.
 */
EHR.Metadata.registerMetadata('Surgery', {
    allQueries: {

    },
    byQuery: {
        'Clinical Encounters': {
            type: {
                defaultValue: 'Surgery'
            },
            major: {
                allowBlank: false
            }
        },
        'Drug Administration': {
            category: {
                hidden: false
            }
        }
    }
});