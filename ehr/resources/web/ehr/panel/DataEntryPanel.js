/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.DataEntryPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-dataentrypanel',

    storeCollection: null,

    initComponent: function(){
        Ext4.QuickTips.init();

        this.storeCollection = Ext4.create(this.formConfig.storeCollectionClass || 'EHR.data.StoreCollection', {});
        this.storeCollection.formConfig = this.formConfig;

        this.storeCollection.on('load', this.onStoreCollectionLoad, this);
        this.storeCollection.on('commitcomplete', this.onStoreCollectionCommitComplete, this);
        this.storeCollection.on('validation', this.onStoreCollectionValidation, this);
        this.storeCollection.on('beforecommit', this.onStoreCollectionBeforeCommit, this);
        this.storeCollection.on('commitexception', this.onStoreCollectionCommitException, this);
        this.storeCollection.on('serverdatachanged', this.onStoreCollectionServerDataChanged, this);


        this.createServerStores();

        //NOTE: this is done to instantiate the clientStores.  this isnt the best way to do this and should get reworked eventually
        this._cachedItems = this.getItems();

        Ext4.apply(this, {
            border: false,
            defaults: {
                border: false
            },
            items: [{
                html: 'Loading...'
            }],
            buttonAlign: 'left',
            buttons: this.getButtons()
        });

        this.callParent();

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
        console.log('commit complete');
        console.log(arguments);

        Ext4.Msg.hide();

        if(extraContext && extraContext.successURL){
            window.onbeforeunload = Ext4.emptyFn;
            window.location = extraContext.successURL;
        }
    },

    onStoreCollectionValidation: function(sc){
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
        Ext4.Array.forEach(this.getDockedItems('toolbar[dock="bottom"]'), function(toolbar){
            toolbar.items.each(function(item){
                processItem(item);
            }, this);
        }, this);
    },

    onStoreCollectionBeforeCommit: function(sc, records, commands, extraContext){
        if (!commands || !commands.length){
            console.log('no commands');
        }
    },

    onStoreCollectionCommitException: function(sc){
        console.log(arguments);
        console.log('commit exception');
        Ext4.Msg.hide();
        Ext4.Msg.alert('Error', 'There was an error saving the data');
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

            for(j=0;j<section.fieldConfigs.length;j++){
                var field = section.fieldConfigs[j];
                var key = field.schemaName + '.' + field.queryName;
                if (!fieldMap[key])
                    fieldMap[key] = {
                        schemaName: field.schemaName,
                        queryName: field.queryName,
                        fields: {}
                    };

                //TODO: consider allowing aliasing server->client
                fieldMap[key].fields[field.name] = field.name;
            }
        }

        for(var storeId in fieldMap){
            var cfg = fieldMap[storeId];
            this.storeCollection.addServerStoreFromConfig(this.applyConfigToServerStore({
                schemaName: cfg.schemaName,
                queryName: cfg.queryName,
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

    onStoreCollectionLoad: function(){
        //TODO: only want to do this once
        this.removeAll();
        this.add(this.getItems());
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
                collapsible: true,
                title: section.label,
                formConfig: section,
                dataEntryPanel: this,
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
            items.push({
                xtype: 'tabpanel',
                items: tabItems
            });
        }

        return items;
    },

    getButtons: function(){
        var buttons = [];

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
        var permMap = this.formConfig.permissions;
        var permissionName = EHR.Security.getPermissionName(qcStateLabel, permissionName);

        var hasPermission = true;
        Ext4.Object.each(permMap, function(schemaName, queries) {
            // minor improvement.  non-study tables cannot have per-table permissions, so instead we check
            // for the container-level DataEntryPermission
            if (schemaName.toLowerCase() != 'study'){
                permissionName = 'org.labkey.api.ehr.security.EHRDataEntryPermission';
            }
            Ext4.Object.each(queries, function(queryName, permissions) {
                if (!permissions[permissionName]){
                    hasPermission = false;
                    return false;
                }
            }, this);

            if (!hasPermission)
                return false;
        }, this);

        return hasPermission;
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
