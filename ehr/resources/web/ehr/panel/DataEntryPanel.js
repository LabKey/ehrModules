/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 *
 * @cfg extraMetaData
 */
Ext4.define('EHR.panel.DataEntryPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-dataentrypanel',

    storeCollection: null,
    hideErrorPanel: false,

    initComponent: function(){
        Ext4.QuickTips.init();

        this.storeCollection = Ext4.create(this.formConfig.storeCollectionClass || 'EHR.data.StoreCollection', {
            extraMetaData: this.extraMetaData
        });
        this.storeCollection.formConfig = this.formConfig;

        this.storeCollection.on('initialload', this.onStoreCollectionInitialLoad, this);
        this.storeCollection.on('commitcomplete', this.onStoreCollectionCommitComplete, this);
        this.storeCollection.on('validation', this.onStoreCollectionValidation, this);
        this.storeCollection.on('beforecommit', this.onStoreCollectionBeforeCommit, this);
        this.storeCollection.on('commitexception', this.onStoreCollectionCommitException, this);
        //this.storeCollection.on('serverdatachanged', this.onStoreCollectionServerDataChanged, this);


        this.createServerStores();

        //NOTE: this is done to instantiate the clientStores.  this isnt the best way to do this and should get reworked eventually
        this._cachedItems = this.getItems();

        Ext4.apply(this, {
            border: false,
            layout: 'anchor',
            defaults: {
                border: false
            },
            items: [{
                html: 'Loading...'
            }]
        });

        this.callParent();
        EHR.DataEntryUtils.setDataEntryPanel(this);

        this.addEvents('datachanged', 'serverdatachanged', 'clientdatachanged', 'animalchange');

        //monitor dirty state
        window.onbeforeunload = LABKEY.beforeunload(function (){
            return this.isDirty();
        }, this);
    },

    isDirty: function(){
        return this.storeCollection.isDirty();
    },

    onStoreCollectionCommitComplete: function(sc, extraContext){
        Ext4.Msg.hide();

        if(extraContext && extraContext.successURL){
            window.onbeforeunload = Ext4.emptyFn;
            window.location = extraContext.successURL;
        }

        this.updateDirtyStateMessage();
    },

    onStoreCollectionValidation: function(sc){
        if (!this.hasStoreCollectionLoaded){
            return;
        }

        this.updateDirtyStateMessage();

        var maxSeverity = sc.getMaxErrorSeverity();

        if(EHR.debug && maxSeverity)
            console.log('Error level: '+ maxSeverity);

        function processItem(item){
            if(item.disableOn){
                if(maxSeverity && EHR.Utils.errorSeverity[item.disableOn] <= EHR.Utils.errorSeverity[maxSeverity]){
                    item.setDisabled(true);
                    item.setTooltip('Disabled due to errors in the form');
                }
                else {
                    item.setDisabled(false);
                    item.setTooltip('')
                }
            }

            if (item.menu){
                item.menu.items.each(function(menuItem){
                    processItem(menuItem);
                }, this);
            }
        }

        var btns = this.getToolbarItems();
        if (btns){
            Ext4.Array.forEach(btns, function(toolbar){
                toolbar.items.each(function(item){
                    processItem(item);
                }, this);
            }, this);
        }
    },

    getToolbarItems: function(){
        var up = this.getUpperPanel();
        if (up){
            return up.getDockedItems('toolbar[dock="bottom"]');
        }
    },

    getUpperPanel: function(){
        if (!this.upperPanel)
            this.upperPanel = this.down('#upperPanel');

        return this.upperPanel;
    },

    onStoreCollectionBeforeCommit: function(sc, records, commands, extraContext){
        if (!commands || !commands.length){
            console.log('no commands');
        }
    },

    onStoreCollectionCommitException: function(sc, response){
        console.log(arguments);
        var serverMsg = 'There was an error saving data';
        var errorMsgs = [];
        if (response && response.result){
            Ext4.Array.forEach(response.result, function(command){
                if (command.errors && command.errors.exception){
                    errorMsgs.push(command.errors.exception);
                }
            }, this);

            errorMsgs = Ext4.Array.unique(errorMsgs);

            serverMsg += '.  The error messages were: ' + errorMsgs.join('\n') + '\n\n';
            serverMsg += '.  The response JSON was:\n' + Ext4.encode(response.result);
        }
        else if (!response){
            serverMsg += '.  The response argument was null';
        }

        if (response && response.exception){
            serverMsg += '.  Exception: ' + response.exception + '\n\n';
        }

        if (response && response.stack && response.stackTrace.length){
            serverMsg += '.  Stack: ' + response.stackTrace.join('\n') + '\n\n';
        }

        Ext4.Msg.hide();
        Ext4.Msg.alert('Error', 'There was an error saving the data' + (errorMsgs.length ? '.  The errors were:<br><br>' + errorMsgs.join('<br>') : ''));
        LDK.Utils.logToServer({
            level: 'ERROR',
            message: serverMsg
        });
    },

    onStoreCollectionServerDataChanged: function(sc, changed){
        //console.log('server data has been changd');
    },

    createServerStores: function(){
        var i, j;
        if (!this.formConfig || !this.formConfig.sections || !this.formConfig.sections.length)
            return;

        var fieldMap = {};
        for (i=0; i<this.formConfig.sections.length; i++){
            var section = this.formConfig.sections[i];
            if (!section.fieldConfigs)
                continue;

            for (j=0;j<section.fieldConfigs.length;j++){
                var field = section.fieldConfigs[j];
                var key = field.schemaName + '.' + field.queryName;
                if (!fieldMap[key])
                    fieldMap[key] = {
                        schemaName: field.schemaName,
                        queryName: field.queryName,
                        fields: {}
                    };

                if (section.serverStoreSort){
                    LDK.Assert.assertTrue('There is already a serverSort for store: ' + field.schemaName + '.' + field.queryName, !fieldMap[key].sort || fieldMap[key].sort == section.serverStoreSort);
                    fieldMap[key].sort = section.serverStoreSort;
                }

                //TODO: consider allowing aliasing server->client
                fieldMap[key].fields[field.name] = field.name;
            }
        }

        for (var storeId in fieldMap){
            var cfg = fieldMap[storeId];
            this.storeCollection.addServerStoreFromConfig(this.applyConfigToServerStore({
                schemaName: cfg.schemaName,
                queryName: cfg.queryName,
                sort: cfg.sort,
                columns: LABKEY.Utils.isEmptyObj(cfg.fields) ? null : Ext4.Object.getKeys(cfg.fields).join(',')
            }));
        }

        this.storeCollection.loadDataFromServer();
    },

    /**
     * Allows subclasses to modify the stores prior to creation, such as applying filters
     */
    applyConfigToServerStore: function(cfg){
        cfg.autoLoad = false;
        return cfg;
    },

    onStoreCollectionInitialLoad: function(){
        this.removeAll();
        var toAdd = [{
            xtype: 'panel',
            itemId: 'upperPanel',
            items: this.getItems(),
            buttonAlign: 'left',
            buttons: this.getButtons()
        }];

        if (!this.hideErrorPanel){
            toAdd.push({
                xtype: 'ehr-dataentryerrorpanel',
                itemId: 'errorPanel',
                style: 'padding-top: 10px;',
                storeCollection: this.storeCollection
            });
        }

        this.add(toAdd);
        this.hasStoreCollectionLoaded = true;
    },

    updateMinWidth: function(minWidth){
        if (minWidth && (!this.minWidth || this.minWidth < minWidth)){
            this.minWidth = minWidth;
        }
    },

    getItems: function(){
        if (this._cachedItems){
            var items = this._cachedItems;
            this._cachedItems = null;
            return items;
        }

        if (!this.formConfig || !this.formConfig.sections || !this.formConfig.sections.length){
            return [];
        }

        var items = [];
        var tabItems = [];
        for (var i=0; i<this.formConfig.sections.length; i++){
            var section = this.formConfig.sections[i];

            var sectionCfg = LABKEY.ExtAdapter.apply({
                xtype: section.xtype,
                border: true,
                style: 'margin-bottom: 10px;',
                title: section.label,
                formConfig: section,
                dataEntryPanel: this,
                extraMetaData: this.extraMetaData,
                store: this.storeCollection.getClientStoreForSection(this, section)
            }, section.formConfig);

            if (section.location == 'Tabs'){
                tabItems.push(sectionCfg);
            }
            else {
                items.push(sectionCfg);
            }
        }

        if (tabItems.length){
            var newTabs = [];
            var tabMap = {};
            Ext4.Array.forEach(tabItems, function(tab){
                if (!tab.formConfig.tabName){
                    newTabs.push(tab);
                }
                else {
                    if (tabMap[tab.formConfig.tabName]){
                        tabMap[tab.formConfig.tabName].items.push(tab);
                    }
                    else {
                        var i = {
                            title: tab.formConfig.tabName,
                            defaults: {
                                style: 'padding-bottom: 10px;'
                            },
                            items: [tab]
                        }

                        tabMap[tab.formConfig.tabName] = i;

                        newTabs.push(i);
                    }
                }
            }, this);

            items.push({
                xtype: 'tabpanel',
                items: newTabs
            });
        }

        return items;
    },

    getSectionByLabel: function(label){
        var up = this.getUpperPanel();
        if (!up)
            return;

        var ret;
        up.items.each(function(item){
            if (item.title == label){
                ret = item;
                return false;
            }
        }, this);

        if (!ret){
            var tabPanel = this.down('tabpanel');
            if (tabPanel){
                tabPanel.items.each(function(tab){
                    if (!tab.formConfig){
                        tab.items.each(function(subTab){
                            if (subTab.formConfig && subTab.formConfig.name == name){
                                ret = subTab;
                                return false;
                            }
                        }, this);
                    }
                    else if (tab.formConfig && tab.formConfig.name == name){
                        ret = tab;
                        return false;
                    }
                }, this);
            }
        }

        return ret;
    },

    getSectionByName: function(name){
        var up = this.getUpperPanel();
        if (!up)
            return;

        var ret;
        up.items.each(function(item){
            if (item.formConfig && item.formConfig.name == name){
                ret = item;
                return false;
            }
        }, this);

        if (!ret){
            var tabPanel = this.down('tabpanel');
            if (tabPanel){
                tabPanel.items.each(function(tab){
                    if (!tab.formConfig){
                        tab.items.each(function(subTab){
                            if (subTab.formConfig && subTab.formConfig.name == name){
                                ret = subTab;
                                return false;
                            }
                        }, this);
                    }
                    else if (tab.formConfig && tab.formConfig.name == name){
                        ret = tab;
                        return false;
                    }
                }, this);
            }
        }

        return ret;
    },

    updateDirtyStateMessage: function(){
        var target = this.getDirtyStateArea();
        if (target)
            target.setVisible(this.storeCollection.isDirty());
    },

    getDirtyStateArea: function(){
        if (!this.dirtyStateArea)
            this.dirtyStateArea = this.down('#dirtyStateIcon');

        return this.dirtyStateArea;
    },

    getButtons: function(){
        var buttons = [{
            xtype: 'container',
            cls: 'x4-form-invalid-tip-body',
            hidden: false,
            itemId: 'dirtyStateIcon',
            height: 20,
            width: 20,
            listeners: {
                render: function(){
                    Ext4.QuickTips.register({
                        target: this.getEl(),
                        text: 'This form has unsaved data'
                    });
                }
            }
        }];

        if (this.formConfig){
            if (this.formConfig.buttons){
                Ext4.Array.forEach(this.formConfig.buttons, function(name){
                    var btnCfg = EHR.DataEntryUtils.getDataEntryFormButton(name);
                    if (btnCfg){
                        btnCfg = this.configureButton(btnCfg);
                        if (btnCfg)
                            buttons.push(btnCfg);
                    }
                }, this);
            }

            if (this.formConfig.moreActionButtons){
                var moreActions = [];
                Ext4.Array.forEach(this.formConfig.moreActionButtons, function(name){
                    var btnCfg = EHR.DataEntryUtils.getDataEntryFormButton(name);
                    if (btnCfg){
                        btnCfg = this.configureButton(btnCfg);
                        if (btnCfg){
                            delete btnCfg.xtype;
                            moreActions.push(btnCfg);
                        }
                    }
                }, this);

                if (moreActions.length){
                    buttons.push({
                        text: 'More Actions',
                        cls: 'ehr-dataentrybtn',
                        menu: moreActions
                    });
                }
            }
        }

        return buttons;
    },

    configureButton: function(buttonCfg){
        buttonCfg.scope = this;
        buttonCfg.xtype = 'button';
        buttonCfg.cls = 'ehr-dataentrybtn';

        //only show button if user can access this QCState
        if(buttonCfg.requiredQC){
            if(!this.hasPermission(buttonCfg.requiredQC, (buttonCfg.requiredPermission || 'insert'))){
                //buttonCfg.hidden = true;
                //buttonCfg.tooltip = 'You do not have permission to perform this action';
                return null;
            }
        }

        return buttonCfg;
    },

    hasPermission: function(qcStateLabel, permissionName){
        return EHR.DataEntryUtils.hasPermission(qcStateLabel, permissionName, this.formConfig.permissions, null);
    },

    onSubmit: function(btn){
        Ext4.Msg.wait("Saving Changes...");
        this.storeCollection.transformClientToServer();

        //add a context flag to the request to saveRows
        var extraContext = {
            targetQC : btn.targetQC,
            errorThreshold: btn.errorThreshold,
            successURL : btn.successURL
        };

        //we delay this event so that any modified fields can fire their blur events and/or commit changes
        this.storeCollection.commitChanges.defer(300, this.storeCollection, [true, extraContext]);
    },

    discard: function(extraContext){
        Ext4.Msg.confirm('Discard Form', 'This will delete all records in this form.  Are you sure you want to do this?', function(val){
            if (val == 'yes')
                this.storeCollection.discard(extraContext);
        }, this);
    }
});
