EHR.model.DataModelManager.registerMetadata('Charges', {
    allQueries: {

    },
    byQuery: {
        'ehr_billing.miscCharges': {
            Id: {
                allowBlank: true,
                nullable: true
            },
            unitcost: {
                hidden: false,
                editorConfig: {
                    decimalPrecision: 2
                }
            },
            date: {
                hidden: false,
                columnConfig: {
                    width: 125
                }
            },
            comment: {
                hidden: false,
                columnConfig: {
                    width: 225
                }
            },
            debitedaccount: {
                hidden: false,
                columnConfig: {
                    width: 125
                }
            },
            chargeUnit: {
                hidden: false,
                columnConfig: {
                    width: 100
                }
            },
            chargeCategory: {
                hidden: false,
                columnConfig: {
                    width: 125
                }
            },
            creditedaccount: {
                hidden: true,
                columnConfig: {
                    width: 125
                }
            },
            project: {
                hidden: false,
                columnConfig: {
                    width: 125
                }
            }
        }
    }
});