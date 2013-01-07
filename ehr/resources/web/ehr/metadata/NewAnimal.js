EHR.Metadata.registerMetadata('NewAnimal', {
    allQueries: {
        project: {
            allowBlank: true
        },
        account: {
            allowBlank: true
        }
    },
    byQuery: {
        'TB Tests': {
            notPerformedAtCenter: {
                defaultValue: true
            },
            result1: {
                defaultValue: '-'
            },
            result2: {
                defaultValue: '-'
            },
            result3: {
                defaultValue: '-'
            }
        }
    }
});