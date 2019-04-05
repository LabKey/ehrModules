/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This field is used to display EHR projects.  It contains a custom template for the combo list which displays both the project and protocol.
 * It also listens for participantchange events and will display only the set of allowable projects for the selected animal.
 *
 * @cfg includeDefaultProjects defaults to true
 */
Ext4.define('EHR_Billing.form.field.EHRBillingProjectEntryField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.ehr_billingprojectentryfield',

    typeAhead: true,
    forceSelection: true,
    emptyText:'',
    disabled: false,
    matchFieldWidth: false,
    includeDefaultProjects: true,
    schemaName:'ehr',
    filterSQL: null,
    listenForAnimalChange: true,

    initComponent: function(){
        this.allProjectStore = EHR.DataEntryUtils.getProjectStore();

        Ext4.apply(this, {
            expandToFitContent: true,
            queryMode: 'local',
            anyMatch: true,
            trigger2Cls: Ext4.form.field.ComboBox.prototype.triggerCls,
            onTrigger2Click: Ext4.form.field.ComboBox.prototype.onTriggerClick,
            trigger1Cls: 'x4-form-search-trigger',
            store: {
                type: 'labkey-store',
                schemaName: 'study',
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
            valueField: 'project',
            displayField: 'project',
            listeners: {
                scope: this,
                beforerender: function (field) {
                    if (this.listenForAnimalChange) {
                        var target = field.up('form');
                        if (!target)
                            target = field.up('grid');

                        if (target) {
                            field.mon(target, 'animalchange', field.getProjects, field);
                        }
                        else {
                            console.error('Unable to find target');
                        }
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
                text: 'Click to recalculate allowable projects'
            });
        }, this);
    },

    getInnerTpl: function(){
        return ['<span style="white-space:nowrap;{' +
        '[values["isAssigned"] ? "font-weight:bold;" : ""]}">{[' +
        LABKEY.Utils.encodeHtml + '(values["project"])' +
        ' + " " + (values["title"] ? (' +
        LABKEY.Utils.encodeHtml + '("(" + values["title"] + ")")' +
        ') : "")' +
        ']}&nbsp;</span>'];
    },

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

        var sql = "SELECT DISTINCT t.project, t.investigator, t.title,  " +
                "false as fromClient, min(sort_order) as sort_order, max(isAssigned) as isAssigned FROM (";

        if (id){
            //NOTE: show any actively assigned projects, or projects under the same protocol.  we also only show projects if either the animal is assigned, or that project is active
            sql += "SELECT p.project, " +
                    "p.inves as investigator, " +
                    "p.title,  " +
                    "1 as sort_order, " +
                    "CASE WHEN (a.project = p.project) THEN 1 ELSE 0 END as isAssigned " +
                    " FROM ehr.project p JOIN study.assignment a ON (a.project = p.project) " +
                    " WHERE a.id='"+id+"' AND (a.project = p.project) ";

            //NOTE: if the date is in the future, we assume active projects
            if (date){
                sql += "AND cast(a.date as date) <= '"+date.format('Y-m-d')+"' AND ((a.enddateCoalesced >= '"+date.format('Y-m-d')+"') OR ('"+date.format('Y-m-d')+"' >= now() and a.enddate IS NULL))";
            }
            else {
                sql += "AND a.isActive = true ";
            }

            if (this.getDisallowedProtocols()){
                sql += " AND p.protocol NOT IN ('" + this.getDisallowedProtocols().join("', '") + "') ";
            }
        }

        if (this.includeDefaultProjects){
            if (id)
                sql += ' UNION ALL ';

            sql += " SELECT p.project," +
                    "p.inves as investigator," +
                    "p.title, " +
                    "3 as sort_order, " +
                    "0 as isAssigned " +
                    "FROM ehr.project p ";

            if (this.filterSQL) {
                sql += "WHERE " + this.filterSQL + " ";
            }
        }

        sql+= " ) t GROUP BY t.project,t.investigator, t.title";

        return sql;
    },

    getProjects : function(id){
        var boundRecord = EHR.DataEntryUtils.getBoundRecord(this);
        if (!boundRecord){
            console.warn('no bound record found');
        }

        if (boundRecord && boundRecord.store){
            LDK.Assert.assertNotEmpty('ProjectEntryField is being used on a store that lacks an Id field: ' + boundRecord.store.storeId, boundRecord.fields.get('Id'));
        }

        if (!id && boundRecord)
            id = boundRecord.get('Id');

        var date;
        if (boundRecord){
            date = boundRecord.get('date');
        }

        // this.emptyText = 'Select project...';
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

        // if (val){
        if (val && Ext4.isPrimitive(val)){
            rec = this.store.findRecord('project', val);
            if (!rec){
                rec = this.store.findRecord('project', val, null, false, false, true);

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
        if (!val || this.isDestroyed)
            return;

        LDK.Assert.assertNotEmpty('Unable to find store in ProjectEntryField', this.store);
        var rec = this.store ? this.store.findRecord('project', val) : null;
        if (rec){
            return;
        }

        rec = this.allProjectStore.findRecord('project', val);
        if (rec){
            var newRec = this.store.createModel({});
            newRec.set({
                project: rec.data.project,
                account: rec.data.account,
                title: rec.data.title,
                investigator: rec.data.inves,
                isAssigned: 0,
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