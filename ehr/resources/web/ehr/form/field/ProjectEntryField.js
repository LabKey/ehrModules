/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This field is used to diplay EHR projects.  It contains a custom template for the combo list which displays both the project and protocol.
 * It also listens for participantchange events and will display only the set of allowable projects for the selected animal.
 *
 * @cfg includeDefaultProjects defaults to true
 */
Ext4.define('EHR.form.field.ProjectEntryField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.ehr-projectentryfield',

    fieldLabel: 'Project',
    typeAhead: true,
    forceSelection: true, //NOTE: has been re-enabled, but it is important to let the field get set prior to loading
    emptyText:'',
    disabled: false,
    matchFieldWidth: false,
    includeDefaultProjects: true,

    initComponent: function(){
        this.allProjectStore = EHR.DataEntryUtils.getProjectStore();

        this.trigger2Cls = Ext4.form.field.ComboBox.prototype.triggerCls;
        this.onTrigger2Click = Ext4.form.field.ComboBox.prototype.onTriggerClick;

        LABKEY.ExtAdapter.apply(this, {
            displayField: 'displayName',
            valueField: 'project',
            queryMode: 'local',
            plugins: [Ext4.create('LDK.plugin.UserEditableCombo', {
                createWindow: function(){
                    return Ext4.create('Ext.window.Window', {
                        modal: true,
                        closeAction: 'destroy',
                        bodyStyle: 'padding: 5px',
                        items: [{
                            xtype: 'ehr-projectfield',
                            width: 400,
                            fieldLabel: 'Project',
                            itemId: 'projectField'
                        },{
                            xtype: 'ldk-linkbutton',
                            linkTarget: '_blank',
                            text: '[View All Projects]',
                            href: LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: 'ehr', 'query.queryName': 'project', 'query.viewName': 'Active Projects'}),
                            style: 'padding-top: 5px;padding-bottom: 5px;padding-left: 100px;'
                        }],
                        buttons: [{
                            scope: this,
                            text: 'Submit',
                            handler: function(btn){
                                var win = btn.up('window');
                                var field = win.down('#projectField');
                                var project = field.getValue();
                                var rec = field.findRecord('project', project);
                                LDK.Assert.assertTrue('Record not found: ' + project, !!rec);

                                if (rec){
                                    this.onWindowClose({
                                        project: project,
                                        displayName: rec.get('displayName'),
                                        protocolDisplayName: rec.get('protocol/displayName'),
                                        protocol: rec.get('protocol'),
                                        title: rec.get('title'),
                                        shortname: rec.get('shortname'),
                                        investigator: rec.get('investigatorId/lastName')
                                    });

                                    win.close();
                                }
                                else {
                                    Ext4.Msg.alert('Error', 'Unknown Project');
                                }
                            }
                        },{
                            text: 'Cancel',
                            handler: function(btn){
                                btn.up('window').close();
                            }
                        }]
                    }).show();
                }
            })],
            validationDelay: 500,
            //NOTE: unless i have this empty store an error is thrown
            store: {
                type: 'labkey-store',
                schemaName: 'study',
                sql: this.makeSql(),
                sort: 'sort_order,project',
                autoLoad: false,
                loading: true,
                listeners: {
                    scope: this,
                    delay: 50,
                    load: function(store){
                        this.resolveProjectFromStore();
                        this.getPicker().refresh();
                    }
                }
            },
            listeners: {
                scope: this,
                beforerender: function(field){
                    var target = field.up('form');
                    if (!target)
                        target = field.up('grid');

                    LDK.Assert.assertNotEmpty('Unable to find form or grid', target);
                    if (target) {
                        field.mon(target, 'animalchange', field.getProjects, field);
                    }
                    else {
                        console.error('Unable to find target');
                    }

                    //attempt to load for the bound Id
                    this.getProjects();
                }
            }
        });

        this.listConfig = this.listConfig || {};
        Ext4.apply(this.listConfig, {
            innerTpl: this.getInnerTpl(),
            getInnerTpl: function(){
                return this.innerTpl;
            },
            style: 'border-top-width: 1px;' //this was added in order to restore the border above the boundList if it is wider than the field
        });

        this.callParent(arguments);

        this.on('render', function(){
            Ext4.QuickTips.register({
                target: this.triggerEl.elements[0],
                text: 'Click to lookup allowable projects'
            });
        }, this);
    },

    getInnerTpl: function(){
        //(values["protocol"] ? values["protocol"] : "")
        return ['<span style="white-space:nowrap;">{[values["displayName"] + " " + (values["shortname"] ? ("(" + values["shortname"] + ")") : (values["investigator"] ? "(" + (values["investigator"] ? values["investigator"] : "") : "") + (values["account"] ? ": " + values["account"] : "") + (values["investigator"] ? ")" : ""))]}&nbsp;</span>'];
    },

    trigger1Cls: 'x4-form-search-trigger',

    onTrigger1Click: function(){
        var boundRecord = EHR.DataEntryUtils.getBoundRecord(this);
        if (!boundRecord){
            Ext4.Msg.alert('Error', 'Unable to locate associated animal Id');
            return;
        }

        var id = boundRecord.get('Id');
        if (!id){
            Ext4.Msg.alert('Error', 'No Animal Id Provided');
            return;
        }

        this.getProjects(id);
    },

    getDisallowedProtocols: function(){
        return null;
    },

    makeSql: function(id, date){
        if (!id && !this.includeDefaultProjects)
            return;

        //avoid unnecessary reloading
        var key = id + '||' + date;
        if (this.loadedKey == key){
            return;
        }
        this.loadedKey = key;

        var sql = "SELECT DISTINCT t.project, t.displayName, t.account, t.protocolDisplayName, t.protocol, t.investigator, t.title, t.shortname, false as fromClient, max(sort_order) as sort_order FROM (";

        if (id){
            sql += "SELECT  a.project as project, a.project.displayName as displayName, a.project.account as account, a.project.protocol.displayName as protocolDisplayName, a.project.protocol as protocol, a.project.title, a.project.shortname, a.project.investigatorId.lastName as investigator, 0 as sort_order FROM study.assignment a " +
            "WHERE a.id='"+id+"' ";

            if (this.getDisallowedProtocols()){
                sql += " AND a.project.protocol NOT IN ('" + this.getDisallowedProtocols().join("', '") + "') ";
            }

            //NOTE: if the date is in the future, we assume active projects
            if (date){
                sql += "AND cast(a.date as date) <= '"+date.format('Y-m-d')+"' AND ((a.enddateCoalesced >= '"+date.format('Y-m-d')+"') OR ('"+date.format('Y-m-d')+"' >= now() and a.enddate IS NULL))";
            }
            else {
                sql += "AND a.isActive = true ";
            }
        }

        if (this.includeDefaultProjects){
            if (id)
                sql += ' UNION ALL ';

            sql += " SELECT p.project, p.displayName, p.account, p.protocol.displayName as protocolDisplayName, p.protocol as protocol, p.title, p.shortname, p.investigatorId.lastName as investigator, 1 as sort_order FROM ehr.project p WHERE p.alwaysavailable = true and p.enddateCoalesced >= curdate()";
        }

        sql+= " ) t GROUP BY t.project, t.displayName, t.account, t.protocolDisplayName, t.protocol, t.investigator, t.title, t.shortname";

        return sql;
    },

    getProjects : function(id){
        var boundRecord = EHR.DataEntryUtils.getBoundRecord(this);
        if (!boundRecord){
            console.warn('no bound record found');
        }

        if(!id && boundRecord)
            id = boundRecord.get('Id');

        var date;
        if (boundRecord){
            date = boundRecord.get('date');
        }

        this.emptyText = 'Select project...';
        var sql = this.makeSql(id, date);
        if (sql){
            this.store.loading = true;
            this.store.sql = sql;
            this.store.removeAll();
            this.store.load();
        }
    },

    setValue: function(val){
        var rec;
        if (Ext4.isArray(val)){
            val = val[0];
        }

        if (val && Ext4.isPrimitive(val)){
            rec = this.store.findRecord('project', val);
            if (!rec){
                rec = this.store.findRecord('displayName', val, null, false, false, true);

                if (rec)
                    console.log('resolved project entry field by display value')
            }

            if (!rec){
                rec = this.resolveProject(val);
            }
        }

        if (rec){
            val = rec;
        }

        // NOTE: if the store is loading, Combo will set this.value to be the actual model.
        // this causes problems downstream when other code tries to convert that into the raw datatype
        if (val && val.isModel){
            val = val.get(this.valueField);
        }

        this.callParent([val]);
    },

    resolveProjectFromStore: function(){
        var val = this.getValue();
        if (!val)
            return;

        var rec = this.store.findRecord('project', val);
        if (rec){
            return;
        }

        rec = this.allProjectStore.findRecord('project', val);
        if (rec){
            var newRec = this.store.createModel({});
            newRec.set({
                project: rec.data.project,
                account: rec.data.account,
                displayName: rec.data.displayName,
                protocolDisplayName: rec.data['protocol/displayName'],
                protocol: rec.data.protocol,
                title: rec.data.title,
                investigator: rec.data['investigatorId/lastName'],
                fromClient: true
            });

            this.store.insert(0, newRec);

            return newRec;
        }
    },

    resolveProject: function(val){
        if (this.allProjectStore.isLoading()){
            this.allProjectStore.on('load', function(store){
                var newRec = this.resolveProjectFromStore();
                if (newRec)
                    this.setValue(val);
            }, this, {single: true});
        }
        else {
            this.resolveProjectFromStore();
        }
    }
});