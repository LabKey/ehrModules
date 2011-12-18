/*
/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR', 'EHR.Assay');

//NOTE: this entire file has been depreciated in favor of newer version in the Laboratory module.
//It can likely be removed once the Viral Load and MHC SSP assays have been validated

EHR.Assay.showButtonBar = function(assay)
{
    var id = (typeof assay == "object") ? assay.id : LABKEY.ActionURL.getParameter("rowId");

    var buttons = [
    {title:"overview", url:LABKEY.ActionURL.buildURL("assay", "begin", null, {rowId:id})},
//    {title:"view workbooks", url:LABKEY.ActionURL.buildURL("core", "manageWorkbooks", null, null)},
    {title:"view workbooks", url:LABKEY.ActionURL.buildURL("ehr", "assayWorkbooks", null, {assayId:id, folderType:'Sequence%20Analysis%20Workbook'})},
    {title:"view batches", url:LABKEY.ActionURL.buildURL("assay", "assayBatches", null, {rowId:id})},
    {title:"view runs", url:LABKEY.ActionURL.buildURL("assay", "assayRuns", null, {rowId:id})},
    {title:"view results", url:LABKEY.ActionURL.buildURL("assay", "assayResults", null, {rowId:id})},
    {title:"import data", url:LABKEY.ActionURL.buildURL("assay", "moduleAssayUpload", null, {rowId:id})}
    ];
    
    if (LABKEY.Security.currentUser.isAdmin)
        buttons.push({url:LABKEY.ActionURL.buildURL("assay", "designer", null, {rowId:id, providerName:assay.name}), title:"manage"});

    Ext.get("labkey-nav-trail-current-page").createChild(EHR.Assay._buildHtmlBar(assay.name, buttons));
};

EHR.Assay._buildHtmlBar = function(pageTitle, buttonArray)
{
    var html = {
       tag: 'div'
       ,children: [{tag: 'p'}]
    };

    for (var i = 0; i < buttonArray.length; i++)
        html.children.push({tag: 'span', html: LABKEY.Utils.textLink({href: buttonArray[i].url, text: buttonArray[i].title})});

    return html;
};


//EHR.Assay._buildButtonBar = function(pageTitle, buttonArray)
//{
//    var html = '<table style="width:100%;border-top:1px solid white;margin:0;padding:0">\
//    <tr><td class="labkey-nav-page-header" style="padding:0pt;width:100%">' + pageTitle + '</td><td>\
//            <table class="labkey-app-button-bar labkey-no-spacing" >\
//                <tr><td class="labkey-app-button-bar-left"><img width="13" src="/labkey/_.gif" alt=""/></td>';
//
//    for (var i = 0; i < buttonArray.length; i++)
//        html += '<td class="labkey-app-button-bar-button"><a href="' + buttonArray[i].url + '">'+ buttonArray[i].title +'</a></td>'
//
//    html += '<td class="labkey-app-button-bar-right"><img width="13" src="/labkey/_.gif" alt=""/></td></tr>' +
//            '</table></td></tr></tbody></table>';
//
//    return html;
//}


EHR.Assay.findFieldname = function(field, meta)
{
    for (var i=0;i<meta.length;i++){
        //TODO: Aliases?
        if (EHR.Assay.compareNoCase(field, meta[i].name) || EHR.Assay.compareNoCase(field, meta[i].caption))
            return meta[i].name;
    }

    alert('Unknown Field Label: '+field);     
    return field;
}


//generic error handler
EHR.Assay.onError = function(error){
    console.log(error);
    /*
    LABKEY.Query.insertRows({
         containerPath: '/shared',
         schemaName: 'auditlog',
         queryName: 'audit',
         rows: [{
            EventType: "Client API Actions",
            Key1: "Assay Client Error",
            Comment: error.message,
            Date: new Date()
        }],
    });
    */
};

EHR.Assay.compareNoCase = function(a, b){
    if (a.toLowerCase() == b.toLowerCase()){
        return true;
    }
    else {
        return false;
    }
}

EHR.Assay.addJsonType = function(fieldObj){
    var jsonType;
    fieldObj.typeName = fieldObj.type || fieldObj.typeName;

    switch (fieldObj.typeName) {
        case 'String':
            jsonType='string'; break;
        case 'DateTime':
            jsonType='date'; break;
        case 'Double':
        case 'float':
            jsonType='float'; break;
        case 'Integer':
        case 'int':
            jsonType='int'; break;
        default:
            fieldObj.jsonType='string';
    }

    return jsonType;
}

/**
 * Recursively copies all the properties of config to obj if they don't already exist
 * @param {Object} obj The receiver of the properties
 * @param {Object} config The source of the properties
 * @return {Object} returns obj
 */
EHR.Assay.rApplyIf = function(o, c){
    if(o){
        for(var p in c){
            if(!Ext.isDefined(o[p])){
                o[p] = c[p];
            }
            else if(Ext.type(o[p])=='object'){
                EHR.Assay.rApplyIf(o[p], c[p]);
            }
        }
    }
    return o;
}

/**
 * Recursively copies all the properties of config to obj.
 * @param {Object} obj The receiver of the properties
 * @param {Object} config The source of the properties
 * @return {Object} returns obj
 */
EHR.Assay.rApply = function(o, c){
    if(o){
        for(var p in c){
            if(Ext.type(o[p])=='object'){
                EHR.Assay.rApply(o[p], c[p]);
            }
            else {
                o[p] = c[p];
            }
        }
    }
    return o;
}


EHR.Assay.createRunsPage = function(){

//    EHR.Assay.showButtonBar(LABKEY.page.assay);

    var wp = new LABKEY.QueryWebPart({
        renderTo:"runsQWP"
       ,schemaName: "assay"
       ,queryName: LABKEY.page.assay.name+" Runs"
       ,frame: 'none'
       ,allowChooseQuery: false
       ,allowChooseView: true
       ,showDeleteButton: true
       ,timeout: 0
    }).render();
}

EHR.Assay.createResultsPage = function(){

//    EHR.Assay.showButtonBar(LABKEY.page.assay);

    var wp = new LABKEY.QueryWebPart({
        renderTo:"resultsQWP"
       ,schemaName: "assay"
       ,queryName: LABKEY.page.assay.name+" Data"
       ,dataRegionName: LABKEY.page.assay.name+" Data"
       ,frame: 'none'
       ,allowChooseQuery: false
       ,allowChooseView: true
       ,showDeleteButton: true
       ,buttonBar: {
           includeStandardButtons: false,
           items:[
             LABKEY.QueryWebPart.standardButtons.insertNew,
             LABKEY.QueryWebPart.standardButtons.views,
             LABKEY.QueryWebPart.standardButtons.exportRows,
             LABKEY.QueryWebPart.standardButtons.deleteRows,
             LABKEY.QueryWebPart.standardButtons.print,
             LABKEY.QueryWebPart.standardButtons.pageSize
           ]
       }
       ,timeout: 0
    }).render();
}

EHR.Assay.createBatchesPage = function(){

//    EHR.Assay.showButtonBar(LABKEY.page.assay);

    var wp = new LABKEY.QueryWebPart({
        renderTo:"batchesQWP"
       ,schemaName: "assay"
       ,queryName: LABKEY.page.assay.name+" Batches"
       ,frame: 'none'
       ,allowChooseQuery: false
       ,allowChooseView: true
       ,showDeleteButton: true
       ,buttonBar: {
           includeStandardButtons: false,
           items:[
             LABKEY.QueryWebPart.standardButtons.insertNew,
             LABKEY.QueryWebPart.standardButtons.views,
             LABKEY.QueryWebPart.standardButtons.exportRows,
             LABKEY.QueryWebPart.standardButtons.deleteRows,
             LABKEY.QueryWebPart.standardButtons.print,
             LABKEY.QueryWebPart.standardButtons.pageSize
           ]
       }
       ,timeout: 0
    }).render();
}
