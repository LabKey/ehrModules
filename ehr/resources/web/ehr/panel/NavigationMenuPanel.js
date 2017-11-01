/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext4.define('EHR.panel.NavigationMenuPanel', {
    extend: 'Ext.panel.Panel',
    cls: 'labkey-iconpanel',
    width: 300,
    border: false,
    itemId: 'menuPanel',
    defaults: {
        items: [{
            xtype: 'dataview',
            overItemCls: 'x4-item-over',
            trackOver: true,
            itemSelector: 'div.thumb-wrap',
            cls: 'labkey-iconpanel',
            tpl: [
                '<tpl for=".">',
                    '<tpl if="publicUrl">',
                        '<div style="width: 300px;font-weight: bold;" class="thumb-wrap thumb-wrap-side">',
                            '<span style="float: left;position: relative;">{name:htmlEncode}:</span>',
                            '<span style="float: right;position: relative;margin-right: 5px;">',
                            '<tpl if="!canReadPublic"><span data-qtip="You do not have permission to view this page"> [Public] </a>',
                            '<tpl else><a href="{publicUrl}"> [Public] </a>',
                            '</tpl>',

                            '<tpl if="!canRead"><span data-qtip="You do not have permission to view this page" > [Private] </span>',
                            '<tpl else><a href="{url}"> [Private] </a>',
                            '</tpl>',
                            '</span>',
                        '</div>',
                    '<tpl else>',
                        '<div ',
                        '<tpl if="!canRead">data-qtip="You do not have permission to view this page"</tpl>',
                        'style="width: 300px;" class="thumb-wrap thumb-wrap-side">',
                        '<tpl if="url"><a href="{url}"></tpl>',
                        '<span style="font-weight: bold" class="thumb-label-side">{name:htmlEncode}</span>',
                        '<tpl if="url"></a></tpl>',
                        '</div>',
                    '</tpl>',
                '</tpl>',
                '<div class="x-clear"></div>'
            ],
            store: {
                proxy: 'memory',
                fields: ['name', 'url', 'canRead', 'publicUrl', 'canReadPublic']
            }
        }],
        border: true,
        minHeight: 50,
        collapsed: true,
        header: {
            listeners: {
                click: function(header){
                    var panel = header.up('panel');
                    if (panel.collapsed)
                        panel.expand(Ext4.Component.DIRECTION_BOTTOM, true);
                    else
                        panel.collapse(Ext4.Component.DIRECTION_TOP, true);
                }
            }
        },
        listeners: {
            collapse: function(panel){
                if (LABKEY.HoverPopup && LABKEY.HoverPopup._visiblePopup && LABKEY.HoverPopup._visiblePopup.extPopup){
                    LABKEY.HoverPopup._visiblePopup.extPopup.sync();
                }
            },
            beforeexpand: function(panel){
                this.up('#menuPanel').items.each(function(i){
                    if (i != panel){
                        i.collapse(Ext4.Component.DIRECTION_TOP, true);
                    }
                }, this);
            }
        }
    }
});