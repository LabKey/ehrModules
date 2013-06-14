/**
 * This field is used to diplay EHR projects.  It contains a custom template for the combo list which displays both the project and protocol.
 * It also listens for participantchange events and will display only the set of allowable projects for the selected animal.
 */
Ext4.define('EHR.form.field.ProjectField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.ehr-projectfield',

    initComponent: function(){
        LABKEY.ExtAdapter.apply(this, {
            fieldLabel: 'Project',
            name: this.name || 'project',
            dataIndex: 'project',
            emptyText:'',
            displayField:'project',
            valueField: 'project',
            typeAhead: true,
            forceSelection: true,
            queryMode: 'local',
            disabled: false,
            plugins: ['ehr-usereditablecombo'],
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
                select: function(combo, rec){
                    if(this.ownerCt.boundRecord){
                        this.ownerCt.boundRecord.beginEdit();
                        this.ownerCt.boundRecord.set('project', rec.get('project'));
                        this.ownerCt.boundRecord.set('account', rec.get('account'));
                        this.ownerCt.boundRecord.endEdit();
                    }
                }
            },
            tpl: [
                '<tpl for=".">' +
                '<div class="x-combo-list-item">{[values["project"] + " " + (values["protocol"] ? "("+values["protocol"]+")" : "")]}' +
                '&nbsp;</div></tpl>'
            ]
        });

        this.callParent(arguments);

        //this.mon(this.ownerCt, 'participantchange', this.getProjects, this);
    },

    makeSql: function(id, date){
        var sql = "SELECT DISTINCT a.project, a.project.account, a.project.protocol as protocol FROM study.assignment a " +
            "WHERE a.id='"+id+"' " +

            //this protocol contains tracking projects
            "AND a.project.protocol != 'wprc00' ";

        if(!this.allowAllProtocols){
            sql += ' AND a.project.protocol IS NOT NULL '
        }

        if(date)
            sql += "AND cast(a.date as date) <= '"+date.format('Y-m-d')+"' AND (cast(a.enddate as date) >= '"+date.format('Y-m-d')+"' OR a.enddate IS NULL)";
        else
            sql += "AND a.enddate IS NULL ";

        if(this.defaultProjects){
            sql += " UNION ALL (SELECT project, account, project.protocol as protocol FROM ehr.project WHERE project IN ('"+this.defaultProjects.join("','")+"'))";
        }

        return sql;
    },

    getProjects : function(field, id){
        if(!id && this.ownerCt.boundRecord)
            id = this.ownerCt.boundRecord.get('Id');

        var date;
        if(this.ownerCt.boundRecord){
            date = this.ownerCt.boundRecord.get('date');
        }

        this.emptyText = 'Select project...';
        this.store.baseParams.sql = this.makeSql(id, date);
        this.store.load();
    }
});