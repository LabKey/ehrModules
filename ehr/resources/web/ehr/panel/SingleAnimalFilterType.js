
Ext4.define('EHR.panel.SingleAnimalFilterType', {
    extend: 'LDK.panel.SingleSubjectFilterType',
    alias: 'widget.ehr-singleanimalfiltertype',

    statics: {
        filterName: 'singleSubject',
        DEFAULT_LABEL: 'Single Animal'
    },

    validateAlias: function(tab) {
        if (!this.isValid()) {
            tab.items[0].report.warning = 'Animal ID not found';
        }
        else {
            tab.items[0].report.warning = undefined;
        }

        return tab;
    },

    getAlias: function (subjectArray, callback, panel, tab, forceRefresh) {
        this.aliasTableConfig(subjectArray);

        this.aliasTable.success = function (results) {
            this.handleAliases(results);
            this.getSubjectMessages();
            this.validateAlias(tab);
            callback.call(panel, this.handleFilters(tab, this.subjects), forceRefresh);
        };

        LABKEY.Query.selectRows(this.aliasTable);
    }

});
