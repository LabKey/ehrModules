/*
 * Copyright (c) 2013-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/*
 * This is a subclass of the AnimalHistory page, used as the details page for all study participants.
 * It should display the same set of reports, except it does not allow the user to toggle between participants or rooms
 * @cfg participantId The ID of the participant to display
 */

Ext4.define('EHR.panel.ParticipantDetailsPanel', {
    extend: 'EHR.panel.AnimalHistoryPanel',

    initComponent: function(){
        this.callParent();

        this.down('#submitBtn').hidden = true;
    },

    filterTypes: [{
        xtype: 'ehr-hiddensinglesubjectfiltertype',
        inputValue: LDK.panel.SingleSubjectFilterType.filterName,
        label: 'Single Animal'
    }],

    getFilterOptionsItems: function(){
        var items = this.callParent();
        items[0].hidden = true;
        items[1].hidden = true;

        return items;
    },

    getFiltersFromUrl: function(){
        var context = this.callParent(arguments);

        // Handle parameter participantId (animal quicksearch)
        if (document.location.search && document.location.search.indexOf('participantId') !== -1) {
            context["subjects"] = document.location.search.split("=")[1];
            context["inputType"] = "singleSubject";
            this.isReportTabSelected = true;
        }

        return context;
    }
});