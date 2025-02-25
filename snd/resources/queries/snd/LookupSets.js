var console = require("console");
var LABKEY = require("labkey");

function init(event){

    if (event === 'truncate') {
        throw "Not allowed to truncate snd.LookupSets. Truncating this table can orphan lookup values in snd data.";
    }
}

function beforeInsert(row, errors) {
    row.objectId = row.objectId || LABKEY.Utils.generateUUID().toUpperCase();
}

function beforeDelete(row, errors) {

    if (row.LookupSetId !== undefined) {
        LABKEY.Query.selectRows({
            schemaName: 'snd',
            queryName: 'Lookups',
            columns: 'LookupSetId',
            scope: this,
            filterArray: [
                LABKEY.Filter.create('LookupSetId', row.LookupSetId, LABKEY.Filter.Types.EQUAL),

            ],
            success: function (data) {
                if (data.rows && data.rows.length) {
                    errors._form = 'LookupSet is in use and cannot be deleted'
                    return;
                }
            },
            failure: function (error) {
                console.log('Select rows error');
                console.log(error);
            }
        });
    }
}