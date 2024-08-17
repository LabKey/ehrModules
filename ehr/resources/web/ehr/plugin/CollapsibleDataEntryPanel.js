
/**
 * A plugin for Ext.form.TextArea that will allow the box to be resized by the user.
 */
Ext4.define('EHR.plugin.CollapsibleDataEntryPanel', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.ehr-collapsibleDataEntryPanel',

    init: function(panel){

        // Don't apply this to sub-panels in other windows/panels
        if (!panel.border) {
            return;
        }

        panel.collapsible = true;

        // - initCollapsed: initialize the panel as collapsed if it has no data
        // - initCollapsedWithData: initialize the panel as collapsed regardless of data. dataDependentCollapseHeader will
        // still be respected this is just the initial state of collapsed.
        if ((panel.formConfig?.initCollapsed && (!panel.store || panel.store.getCount() === 0))
            || panel.formConfig?.initCollapsedWithData) {
            panel.collapsed = true;
        }

        panel.onPanelDataChange = function() {
            this.expand();
        }

        panel.mon(panel, 'panelDataChange', panel.onPanelDataChange, panel, {buffer: 500});

        panel.on('collapse', function() {
            if (!panel.formConfig.dataDependentCollapseHeader || !panel.store || panel.store.getCount() === 0) {
                panel.header?.addCls('collapsed-dataentry-panel');
            }
        }, panel);

        panel.on('expand', function() {
            panel.header?.removeCls('collapsed-dataentry-panel');
        }, panel);

        panel.on('afterrender', function() {
            if (panel.header) {
                if ((!panel.formConfig.dataDependentCollapseHeader || panel.store?.getCount() === 0) && panel.formConfig.initCollapsed) {
                    panel.header.addCls('collapsed-dataentry-panel');
                }

                panel.header.on('click', function () {
                    if (panel.collapsed) {
                        panel.expand();
                    }
                    else {
                        panel.collapse();
                    }
                }, panel);
            }
        }, panel);
    }
});