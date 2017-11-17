Ext4.ns('EHR_Billing.BillingUtils');

EHR_Billing.BillingUtils = new function(billingPeriodLength){
    var BILLING_PERIOD_LENGTH = billingPeriodLength;

    return {
        /**
         * Returns the estimated billing period start, based on the passed date.
         * We either use the 1st of the month or the 16th, depending on the date
         */
        getBillingPeriodStart: function(date){
            var dayOfMonth = date.getDate();
            if (dayOfMonth <= BILLING_PERIOD_LENGTH)
            {
                return Ext4.Date.getFirstDateOfMonth(date);
            }
            else {
                var ret = Ext4.Date.getFirstDateOfMonth(date);
                return Ext4.Date.add(ret, Ext4.Date.DAY, BILLING_PERIOD_LENGTH)
            }
        },

        /**
         * Returns the estimated billing period end, based on the passed date
         * We either use the 15th of the month or the last day of the month
         */
        getBillingPeriodEnd: function(date){
            var dayOfMonth = date.getDate();
            if (dayOfMonth > BILLING_PERIOD_LENGTH)
            {
                return Ext4.Date.getLastDateOfMonth(date);
            }
            else {
                var ret = Ext4.Date.getFirstDateOfMonth(date);
                return Ext4.Date.add(ret, Ext4.Date.DAY, BILLING_PERIOD_LENGTH - 1)
            }
        },

        deleteInvoiceRuns: function(dataRegionName){
            if (!LABKEY.Security.currentUser.canDelete){
                alert('You do not have permission to delete data');
                return;
            }

            var dataRegion = LABKEY.DataRegions[dataRegionName];
            var checked = dataRegion.getChecked();

            if (!checked.length){
                alert('Must select one or more rows');
                return;
            }

            window.location = LABKEY.ActionURL.buildURL('ehr_billing', 'deleteBillingPeriod', null, {
                dataRegionSelectionKey: dataRegion.name,
                '.select': checked,
                returnURL: window.location.pathname + window.location.search
            });
        },

        isBillingAdmin: function(){
            return true; //TODO: add logic when permission classes are created.
        }
    }
};