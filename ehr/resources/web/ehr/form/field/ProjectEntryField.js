/**
 * This field is used to diplay EHR projects.  It contains a custom template for the combo list which displays both the project and protocol.
 * It also listens for participantchange events and will display only the set of allowable projects for the selected animal.
 *
 *
 */
Ext4.define('EHR.form.field.ProjectEntryField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.ehr-projectentryfield',

    initComponent: function(){
        LABKEY.ExtAdapter.apply(this, {
            fieldLabel: 'Project',
            emptyText:'',
            displayField: 'displayName',
            valueField: 'project',
            typeAhead: true,
            forceSelection: true,
            queryMode: 'local',
            disabled: false,
            plugins: [Ext4.create('EHR.plugin.UserEditableCombo', {
                onClickOther: function(){
                    Ext4.create('Ext.window.Window', {
                        modal: true,
                        closeAction: 'destroy',
                        bodyStyle: 'padding: 5px',
                        items: [{
                            xtype: 'ehr-projectfield',
                            width: 400,
                            fieldLabel: 'Project',
                            itemId: 'projectField'
                        }],
                        buttons: [{
                            scope: this,
                            text: 'Submit',
                            handler: function(btn){
                                var win = btn.up('window');
                                var field = win.down('#projectField');
                                var project = field.getValue();
                                var rec = field.findRecord('project', project);
                                LDK.Assert.assertNotEmpty('Record not found: ' + project, rec);

                                this.addNewValue({
                                    project: project,
                                    displayName: rec.get('displayName'),
                                    protocol: rec.get('protocol/displayName'),
                                    investigator: rec.get('investigatorId/lastName')
                                });

                                win.close();
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
                sort: 'project',
                autoLoad: true
            },
            listeners: {
                scope: this,
                select: function(combo, rec){
                    var form = combo.up('form');
                    if(form.boundRecord){
                        form.boundRecord.beginEdit();
                        form.boundRecord.set('project', rec.get('project'));
                        form.boundRecord.set('account', rec.get('account'));
                        form.boundRecord.endEdit();
                    }
                },
                beforerender: function(field){
                    var form = field.up('form');
                    if (form)
                        field.mon(form, 'animalchange', field.getProjects, field);
                    else
                        console.error('no form found');
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
    },

    getInnerTpl: function(){
        //(values["protocol"] ? values["protocol"] : "")
        return ['<span style="white-space:nowrap;">{[values["displayName"] + " " + (values["investigator"] ? "(" + (values["investigator"] ? values["investigator"] : "") + ")" : "")]}&nbsp;</span>'];
    },

    getDisallowedProtocols: function(){
        return null;
    },

    getDefaultProjects: function(){
        return null;
    },

    makeSql: function(id, date){
        var sql = "SELECT DISTINCT a.project as project, a.project.displayName as displayName, a.project.protocol.displayName as protocol, a.project.investigatorId.lastName as investigator FROM study.assignment a " +
            "WHERE a.id='"+id+"' ";

        if (this.getDisallowedProtocols()){
            sql += " AND a.project.protocol NOT IN ('" + this.getDisallowedProtocols().join("', '") + "') ";
        }

        if(date)
            sql += "AND cast(a.date as date) <= '"+date.format('Y-m-d')+"' AND (a.enddateCoalesced >= '"+date.format('Y-m-d')+"')";
        else
            sql += "AND a.enddate IS NULL ";

        if(this.getDefaultProjects()){
            sql += " UNION ALL (SELECT project, account, project.protocol as protocol FROM ehr.project WHERE project IN ('" + this.getDefaultProjects().join("','") + "'))";
        }

        return sql;
    },

    getProjects : function(id){
        var boundRecord = this.up('form').boundRecord;
        if(!id && boundRecord)
            id = boundRecord.get('Id');

        var date;
        if(boundRecord){
            date = boundRecord.get('date');
        }

        this.emptyText = 'Select project...';
        this.store.sql = this.makeSql(id, date);
        this.store.removeAll();
        this.store.load();
    }
});