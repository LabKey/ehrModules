require("ehr/triggers").initScript(this);

var CHARGEABLE_ITEMS_ROWID_OLDPK_MAP = {};
var chargeableItems = LABKEY.Query.selectRows({
    schemaName: 'ehr_billing',
    queryName: 'chargeableItems',
    columns: 'rowid, oldpk',
    scope: this,
    success: function(results){
        var rows = results.rows;
        for(var index = 0; index < rows.length; index++) {
            CHARGEABLE_ITEMS_ROWID_OLDPK_MAP[rows[index].oldPk] = rows[index].rowid;
        }
    },
    failure: function(results){
        console.log("Error getting ehr_billing.chargeableItems");
    }
});

function onInit(event, helper){
    helper.setScriptOptions({
        allowFutureDates: true
    });
}

function onUpsert(helper, scriptErrors, row, oldRow){

    if(CHARGEABLE_ITEMS_ROWID_OLDPK_MAP[row.chargeId]) {
        row.chargeId = CHARGEABLE_ITEMS_ROWID_OLDPK_MAP[row.chargeId];
    }
}