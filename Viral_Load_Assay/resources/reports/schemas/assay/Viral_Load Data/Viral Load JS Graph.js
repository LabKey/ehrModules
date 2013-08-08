/*
 * Copyright (c) 2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
function render(context, div){
//TODO: remove debug code
LDK.Utils.logToServer({
    message: "VL graph ctx: " + context.schemaName + '/' + context.queryName
});
    var queryConfig = Ext4.applyIf({
        requiredVersion: 9.1,
        columns: 'subjectId,date,viralLoad',
        success: onSuccess,
        filterArray: [LABKEY.Filter.create('date', null, LABKEY.Filter.Types.NONBLANK)],
        failure: LDK.Utils.getErrorCallback({
            logToServer: true
        }),
        scope: this
    }, context);

    LABKEY.Query.selectRows(queryConfig);

    function onSuccess(results){
        Ext4.create('LDK.panel.WebpartPanel', {
            title: 'Viral Loads',
            items: [{
                xtype: 'ldk-graphpanel',
                renderTo: div.id,
                plotConfig: {
                    results: results,
                    title: 'Viral Loads',
                    height: 400,
                    width: 900,
                    yLabel: 'Viral Load (copies/mL)',
                    xLabel: 'Date',
                    xField: 'date',
                    grouping: ['subjectId'],
                    layers: [{
                        y: 'viralLoad',
                        name: 'Viral Load'
                    }]
                }
            }]
        }).render;
    }
}



