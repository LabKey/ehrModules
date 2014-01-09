/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.grid.column.SnomedColumn', {
    extend: 'Ext.grid.column.Action',
    alias: 'widget.ehr-snomedcolumn',

    actionIdRe: new RegExp(Ext4.baseCSSPrefix + 'ehr-action-col-(\\d+)'),

    renderer: function(value, meta, record, rowIdx, colIdx, store, view){
        var snomedStore = EHR.DataEntryUtils.getSnomedStore();
        if (snomedStore && value){
            var display = [];
            value = value.split(';');
            var rec, recIdx;
            Ext4.Array.forEach(value, function(code, idx){
                recIdx = snomedStore.find('code', code);
                rec = recIdx != -1 ? snomedStore.getAt(recIdx) : null;

                if (rec && rec.get('meaning')){
                    display.push((idx + 1) + ': ' + rec.get('meaning') + ' (' + code + ')');
                }
                else {
                    display.push((idx + 1) + ': ' + code);
                }
            }, this);

            meta.tdCls += ' ehr-action-col-' + rowIdx;
            return display.join('<br>');
        }

        return value;
    },

    processEvent : function(type, view, cell, recordIndex, cellIndex, e, record, row){
        var me = this,
                target = e.getTarget(),
                match,
                item, fn,
                key = type == 'keydown' && e.getKey(),
                disabled;

        if (target) {
            item = me.items[0];
            disabled = item.disabled || (item.isDisabled ? item.isDisabled.call(item.scope || me.origScope || me, view, recordIndex, cellIndex, item, record) : false);
            if (item && !disabled) {
                if (type == 'click' || (key == e.ENTER || key == e.SPACE)) {
                    fn = item.handler || me.handler;
                    if (fn) {
                        fn.call(item.scope || me.origScope || me, view, recordIndex, cellIndex, item, e, record, row);
                    }
                } else if (type == 'mousedown' && item.stopSelection !== false) {
                    return false;
                }
            }
        }
        return me.callParent(arguments);
    },

    handler: function(view, rowIndex, colIndex, item, e, rec) {
        Ext4.create('EHR.window.SnomedCodeWindow', {
            boundRec: rec
        }).show();
    }
});