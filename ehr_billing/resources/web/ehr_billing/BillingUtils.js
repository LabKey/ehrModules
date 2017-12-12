Ext4.ns('EHR_Billing.BillingUtils');

EHR_Billing.BillingUtils = new function(){
    var BILLING_PERIOD_LENGTH = 15;
    return {
        /**
         * Returns the estimated billing period start, based on the passed date.
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

            return true;
            var ctx = LABKEY.getModuleContext('ehr_billing');
            if (!ctx || !ctx.BillingContainerInfo)
                return false;

            return ctx.BillingContainerInfo.effectivePermissions.indexOf('org.labkey.ehr_billing.security.EHR_BillingAdminPermission') > -1;
        }
    }
};