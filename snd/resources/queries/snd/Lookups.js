var console = require("console");
var LABKEY = require("labkey");

function init(event){

    if (event === 'truncate') {
        throw "Not allowed to truncate snd.Lookups. Truncating this table can orphan lookup values in snd data.";
    }
}

function onUpsert(row, errors) {
    // reuse LookupSetId if the SetName already exists. This primarily happens during ETLs
    if (row.LookupSetId === undefined || row.LookupSetId == 'undefined') {
        LABKEY.Query.selectRows({
            schemaName: 'snd',
            queryName: 'LookupSets',
            columns: 'LookupSetId',
            scope: this,
            filterArray: [
                LABKEY.Filter.create('SetName', row.SetName, LABKEY.Filter.Types.EQUAL),

            ],
            success: function (data) {
                if (data.rows && data.rows.length) {
                    row.LookupSetId = data.rows[0].LookupSetId;

                    //  console.log('caching ' + cacheKey + ': ' + row.GroupId);
                }
            },
            failure: function (error) {
                console.log('Select rows error');
                console.log(error);
            }
        });
    }
}

function beforeInsert(row, errors) {
    row.objectId = row.objectId || LABKEY.Utils.generateUUID().toUpperCase();
    onUpsert(row, errors);
}

function beforeUpdate(row, errors) {
    onUpsert(row, errors);
}

function beforeDelete(row, errors) {
    if (row.LookupSetId !== undefined) {

        let lookupQuery

        LABKEY.Query.selectRows({
            schemaName: 'snd',
            queryName: 'LookupSets',
            columns: 'SetName',
            scope: this,
            filterArray: [
                LABKEY.Filter.create('LookupSetId', row.LookupSetId, LABKEY.Filter.Types.EQUAL)
            ],
            success: function (data) {
                if (data.rows && data.rows.length) {
                    lookupQuery = data.rows[0].SetName
                }
                else {
                    errors._form = 'LookupSet not found - shouldn\'t happen'
                    return
                }

            },
            failure: function (error) {
                console.log('Select rows error');
                console.log(error);
            }
        });


        LABKEY.Query.selectRows({
            schemaName: 'snd',
            queryName: 'Lookups',
            columns: 'IsInUse',
            scope: this,
            filterArray: [
                LABKEY.Filter.create('LookupId', row["LookupId"], LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('IsInUse', 'true', LABKEY.Filter.Types.EQUAL)

            ],
            success: function (data) {
                if (data.rows && data.rows.length) {
                    errors._form = 'Lookup item cannot be deleted - Lookup is in use.'
                }
            },
            failure: function (error) {
                console.log('Select rows error');
                console.log(error);
            }
        });
    }
}

