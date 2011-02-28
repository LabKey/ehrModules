/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.UTILITIES');


EHR.UTILITIES.navMenu = Ext.extend(Ext.Panel, {
    initComponent: function(){
        //calculate size
        var maxHeight = this.maxHeight || 15;

        var size = 0;
        for (var i=0;i<this.sections.length;i++){
            //for the header
            size++;
            size += this.sections[i].items.length;
        }

        var columns = Math.ceil(size / maxHeight);

        Ext.apply(this, {
            border: false,
            width: this.width || '80%',
            defaults: {
                border: false
            }
        });

        EHR.UTILITIES.navMenu.superclass.initComponent.call(this);

        for (var i=0;i<this.sections.length;i++){
            var tmp = this.sections[i];

            var section = this.add({
                xtype: 'panel',
                title: tmp.header + ':',
                width: this.colWidth,
                style: 'padding-bottom:15px;padding-right:10px;',
                headerCfg: {
                    cls: 'ehr-nav-header',
                    style: 'margin-bottom:5px;'
                },
                defaults: {
                    border: false
                }
            });

            for (var j=0;j<tmp.items.length;j++){
                var item;
                if(this.renderer){
                    item = this.renderer(tmp.items[j])
                }
                else {
                   item = {
                        html: '<a href="'+tmp.items[j].url+'">'+tmp.items[j].name+'</a>',
                        style: 'padding-left:5px;'
                    }
                }
                section.add(item)
            }

            section.add({tag: 'p'});
        }
    }
});


//EHR.UTILITIES.navMenuFromQuery = function(config){
//
//    LABKEY.Query.selectRows({
//            schemaName: config.schemaName,
//            queryName: config.queryName,
//            successCallback: onSuccess,
//            scope: this,
//            errorCallback: EHR.UTILITIES.onError,
//            sort: config.headerField+','+config.displayField,
//            filterArray: config.filterArray
//    });
//
//    function onSuccess(data){
//        var menuCfg = {target: config.target, sections: []}
//        var prevHeader;
//        var section;
//        for (var i=0;i<data.rows.length;i++){
//            var tmp = data.rows[i];
//
//            if (tmp[config.headerField] != prevHeader){
//                menuCfg.sections.push(section);
//                prevHeader = tmp[config.headerField];
//
//                section = {header: tmp[config.headerField], items: []};
//            }
//
//            section.items.push({name: tmp[config.displayField], url: null})
//
//        }
//    }
//
//
//};