/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.ehr_billing.notification;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.time.DateUtils;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Aggregate;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.data.ResultsImpl;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr_billing.notification.BillingNotificationProvider;
import org.labkey.api.ehr_billing.notification.FieldDescriptor;
import org.labkey.api.ldk.notification.AbstractNotification;
import org.labkey.api.module.Module;
import org.labkey.api.query.DetailsURL;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryDefinition;
import org.labkey.api.query.QueryException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.view.ActionURL;
import org.labkey.ehr_billing.EHR_BillingManager;
import org.labkey.ehr_billing.EHR_BillingSchema;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

/**
 * This class creates a set of billing/finance notifications that uses queries created against ehr_billing tables.
 * Any EHR billing module to utilize this notification should implement BillingNotificationService. And Center specific notifications
 * can be added esp. by implementing BillingNotificationService.getAdditionalNotifications().
 *  Below queries against ehr_billing tables are expected:
 * - duplicateAliases.sql
 * - invalidChargeRateEntries.sql
 * - duplicateChargeableItems.sql
 * - chargesMissingRate.sql
 */
public class BillingNotification extends AbstractNotification
{
    private BillingNotificationProvider _notificationProvider;
    protected static final DecimalFormat _dollarFormat = new DecimalFormat("$###,##0.00");
    protected static final DecimalFormat _numItemsFormat = new DecimalFormat("###,##0.00");
    private static final String _ehrBillingSchemaName = EHR_BillingSchema.NAME;

    public BillingNotification(Module module, BillingNotificationProvider provider)
    {
        super(module);
        _notificationProvider = provider;
    }

    @Override
    public String getName()
    {
        return _notificationProvider.getName();
    }

    @Override
    public String getCategory()
    {
        return "Billing";
    }

    @Override
    public String getEmailSubject(Container c)
    {
        return "Finance/Billing Alerts: " + getDateTimeFormat(c).format(new Date());
    }

    @Override
    public String getCronString()
    {
        return _notificationProvider.getCronString();
    }

    @Override
    public String getScheduleDescription()
    {
        return _notificationProvider.getScheduleDescription();
    }

    @Override
    public String getDescription()
    {
        return _notificationProvider.getDescription();
    }


    public String getCenterName()
    {
        return _notificationProvider.getCenterName();
    }

    @Override
    public String getMessageBodyHTML(Container c, User u)
    {
        String centerName = getCenterName();
        Container billingContainer = EHR_BillingManager.get().getBillingContainer(c);
        Container ehrContainer = EHRService.get().getEHRStudyContainer(c);
        List<FieldDescriptor> fields = _notificationProvider.getFieldDescriptor();

        if (billingContainer == null)
        {
            log.error("Finance/Billing container is not defined, so the BillingNotification cannot run");
            return null;
        }

        StringBuilder msg = new StringBuilder();

        Date now = new Date();
        msg.append(getDescription() + "  Notification was run on: " + getDateFormat(c).format(now) + " at " + _timeFormat.format(now) + ".<p>");

        Date lastInvoiceDate = getLastInvoiceDate(c, u);
        Map<String, String> categoryToQuery = _notificationProvider.getCategoriesToQuery();
        Map<String, Container> containerMap = _notificationProvider.getQueryCategoryContainerMapping(c);

        //if we have no previous value, set to an arbitrary value
        if (lastInvoiceDate == null)
            lastInvoiceDate = DateUtils.truncate(new Date(0), Calendar.DATE);

        Map<String, Map<String, Map<String, Map<String, Integer>>>> dataMap = new TreeMap<>();
        Map<String, Map<String, Double>> totalsByCategory = new TreeMap<>();

        Calendar startDate = Calendar.getInstance();
        startDate.setTime(lastInvoiceDate);
        startDate.add(Calendar.DATE, 1);

        Calendar endDate = Calendar.getInstance();
        endDate.setTime(new Date());
        endDate.add(Calendar.DATE, 1);

        getProjectSummaryPerCategory(u, startDate, endDate, categoryToQuery, containerMap, dataMap, totalsByCategory, fields);

        simpleAlert(billingContainer, u , msg, _ehrBillingSchemaName, "duplicateAliases",
                " duplicate account(s) found.  This is a potentially serious problem that could result in improper" +
                        " or duplicate charge(s) and should be corrected ASAP.");

        //based on data gathered on Project Summary Per Category above, create charge summary report
        createChargeSummaryReport(msg, lastInvoiceDate, startDate, endDate, dataMap, totalsByCategory, categoryToQuery, containerMap, c, fields);

        simpleAlert(billingContainer, u , msg,_ehrBillingSchemaName, "invalidChargeRateEntries",
                " charge rate record(s) with invalid or overlapping intervals.  This indicates a problem with how the records " +
                        "are setup in the system and may cause problems with the billing calculation.");

        getInvalidProjectAliases(ehrContainer, u, msg, centerName);
        getExpiredAliases(ehrContainer, u, msg, centerName);
        getAliasesDisabled(ehrContainer, u, msg, centerName);
        getProjectsWithoutAliases(ehrContainer, u, msg, centerName);
        projectAliasesExpiringSoon(ehrContainer, u, msg, centerName);

        simpleAlert(billingContainer, u , msg, _ehrBillingSchemaName, "duplicateChargeableItems",
                " active chargeable item record(s) with duplicate name(s) or item code(s).  This indicates a problem with " +
                        "how the records are setup in the system and may cause problems with the billing calculation.");

        chargesMissingRates(billingContainer, u, msg);
        addCenterSpecificNotifications(_notificationProvider.getAdditionalNotifications(u), msg);

        return msg.toString();
    }

    private void addCenterSpecificNotifications(List<StringBuilder> additionalMessages, StringBuilder msg)
    {
        if (null != additionalMessages)
        {
            for (StringBuilder notification : additionalMessages)
            {
                msg.append(notification);
            }
        }
    }

    private void getProjectSummaryPerCategory(User u, Calendar startDate, Calendar endDate, Map<String, String> categoryToQuery,
                                              Map<String, Container> containerMap, Map<String, Map<String, Map<String, Map<String, Integer>>>> dataMap,
                                              Map<String, Map<String, Double>> totalsByCategory, List<FieldDescriptor> fields)
    {
        if (null != categoryToQuery && null != containerMap)
        {
            for (String categoryName : categoryToQuery.keySet())
            {
                getProjectSummary(containerMap.get(categoryName), u, startDate, endDate, categoryName, categoryToQuery.get(categoryName), dataMap, totalsByCategory, fields);
            }
        }
    }

    protected Date getLastInvoiceDate(Container c, User u)
    {
        Container billingContainer = EHR_BillingManager.get().getBillingContainer(c);
        if (billingContainer == null)
        {
            return null;
        }

        TableInfo ti = QueryService.get().getUserSchema(u, billingContainer, _ehrBillingSchemaName).getTable(EHR_BillingSchema.TABLE_INVOICE_RUNS);
        TableSelector ts = new TableSelector(ti);
        Map<String, List<Aggregate.Result>> aggs = ts.getAggregates(Collections.singletonList(new Aggregate(FieldKey.fromString("billingPeriodEnd"), Aggregate.BaseType.MAX)));
        for (List<Aggregate.Result> ag : aggs.values())
        {
            for (Aggregate.Result r : ag)
            {
                if (r.getValue() instanceof Date)
                {
                    return r.getValue() == null ? null : DateUtils.truncate((Date)r.getValue(), Calendar.DATE);
                }
            }
        }

        return null;
    }

    private String getSingularOrPluralBasedOnCount(long count)
    {
        if (count == 1)
            return "is";
        else
            return "are";
    }

    private void simpleAlert(Container c, User u, StringBuilder msg, String schemaName, String queryName, String message)
    {
        TableInfo ti = QueryService.get().getUserSchema(u, c, schemaName).getTable(queryName);
        TableSelector ts = new TableSelector(ti);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>Warning: There " + getSingularOrPluralBasedOnCount(count) + " " + count + " " + message + "</b><p>");
            msg.append("<a href='" + createURL(c, schemaName, queryName, null) + "'>Click here to view them</a>");
            msg.append("<hr>");
        }
    }

    private void getInvalidProjectAliases(Container c, User u, StringBuilder msg, String centerName)
    {
        TableInfo ti = QueryService.get().getUserSchema(u, c, "ehr").getTable("project");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("account"), ",", CompareType.CONTAINS);
        TableSelector ts = new TableSelector(ti, filter, null);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>Warning: There " + getSingularOrPluralBasedOnCount(count) + " " + count + " " + centerName + " project(s) with duplicate active accounts.</b><p>");
            msg.append("<a href='" + createURL(c, "ehr", "project", "Alias Info") +
                    "&" + filter.toQueryString("query") + "'>Click here to view them</a>");
            msg.append("<hr>");
        }
    }

    private void getProjectSummary(Container c, User u, final Calendar start, Calendar endDate, final String categoryName,
                                   String queryName, final Map<String, Map<String, Map<String, Map<String, Integer>>>> dataMap,
                                   final Map<String, Map<String, Double>> totalsByCategory, List<FieldDescriptor> fields)
    {
        UserSchema us = QueryService.get().getUserSchema(u, c, _notificationProvider.getCenterSpecificBillingSchema());
        QueryDefinition qd = us.getQueryDefForTable(queryName);
        List<QueryException> errors = new ArrayList<>();
        TableInfo ti = qd.getTable(us, errors, true);

        Map<String, Object> params = new HashMap<>();
        Long numDays = ((DateUtils.truncate(new Date(), Calendar.DATE).getTime() - start.getTimeInMillis()) / DateUtils.MILLIS_PER_DAY) + 1;
        params.put("StartDate", start.getTime());
        params.put("EndDate", endDate.getTime());
        params.put("NumDays", numDays.intValue());

        Set<FieldKey> fieldKeys = new HashSet<>();
        for (ColumnInfo col : ti.getColumns())
        {
            fieldKeys.add(col.getFieldKey());
        }

        for (FieldDescriptor fd : fields)
        {
            fieldKeys.add(fd.getFieldKey());
        }

        final Map<FieldKey, ColumnInfo> cols = QueryService.get().getColumns(ti, fieldKeys);
        TableSelector ts = new TableSelector(ti, cols.values(), null, null);
        ts.setNamedParameters(params);

        ts.forEach(new Selector.ForEachBlock<ResultSet>()
        {
            @Override
            public void exec(ResultSet object) throws SQLException
            {
                Results rs = new ResultsImpl(object, cols);
                Map<String, Double> totalsMap = totalsByCategory.get(categoryName);
                if (totalsMap == null)
                    totalsMap = new HashMap<>();

                Double unitCost = rs.getDouble(FieldKey.fromString("unitCost"));
                Double quantity = rs.getDouble(FieldKey.fromString("quantity"));
                if (unitCost != null && quantity != null)
                {
                    Double t = totalsMap.containsKey("totalCost") ? totalsMap.get("totalCost") : 0.0;
                    t += (quantity * unitCost);
                    totalsMap.put("totalCost", t);
                }

                if (quantity != null)
                {
                    Double t = totalsMap.containsKey("total") ? totalsMap.get("total") : 0.0;
                    t += quantity;
                    totalsMap.put("total", t);
                }

                totalsByCategory.put(categoryName, totalsMap);

                String projectDisplay = rs.getString(FieldKey.fromString("project"));
                if (projectDisplay == null)
                {
                    projectDisplay = "None";
                }

                String financialAnalyst = rs.getString(FieldKey.fromString("investigator"));
                if (financialAnalyst == null)
                {
                    financialAnalyst = "Not Assigned";
                }

                String account = rs.getString(FieldKey.fromString("debitedAccount"));
                account = StringUtils.trimToNull(account);
                if (account == null)
                {
                    account = "Unknown";
                }

                String projectNumber = rs.getString(FieldKey.fromString("projectNumber"));//Institution generated/given "project" number associated with ehr_billing.alias, and is not necessarily same as ehr.project.project.
                if (projectNumber == null)
                {
                    projectNumber = "None";
                }

                String key = StringUtils.join(new String[]{financialAnalyst, projectDisplay, account, projectNumber}, "<>");

                for (FieldDescriptor fd : fields)
                {
                    if (!rs.hasColumn(fd.getFieldKey()))
                    {
                        continue;
                    }

                    if (fd.shouldFlag(rs))
                    {
                        Map<String, Map<String, Map<String, Integer>>> valuesForFA = dataMap.get(financialAnalyst);
                        if (valuesForFA == null)
                            valuesForFA = new TreeMap<>();

                        Map<String, Map<String, Integer>> valuesForKey = valuesForFA.get(key);
                        if (valuesForKey == null)
                            valuesForKey = new TreeMap<>();

                        Map<String, Integer> values = valuesForKey.get(categoryName);
                        if (values == null)
                            values = new HashMap<>();


                        Integer count = values.containsKey(fd.getFieldName()) ? values.get(fd.getFieldName()) : 0;
                        count++;
                        values.put(fd.getFieldName(), count);

                        valuesForKey.put(categoryName, values);
                        valuesForFA.put(key, valuesForKey);
                        dataMap.put(financialAnalyst, valuesForFA);
                    }
                }
            }
        });
    }

    protected void createChargeSummaryReport(final StringBuilder msg, Date lastInvoiceEnd, Calendar start, Calendar endDate,
                                             final Map<String, Map<String, Map<String, Map<String, Integer>>>> dataMap,
                                             final Map<String, Map<String, Double>> totalsByCategory, Map<String, String> categoryToQuery,
                                             Map<String, Container> containerMap, Container c, List<FieldDescriptor> fields)
    {

        String centerSpecificBillingSchema = _notificationProvider.getCenterSpecificBillingSchema();

        msg.append("<b>Charge Summary:</b><p>");
        msg.append("The table below summarizes projected charges since the last invoice date of " + getDateFormat(c).format(lastInvoiceEnd));

        msg.append("<table border=1 style='border-collapse: collapse;'><tr style='font-weight: bold;'><td align='center'>Category</td><td align='center'># Items</td><td align='center'>Amount</td>");
        for (String category : totalsByCategory.keySet())
        {
            Map<String, Double> totalsMap = totalsByCategory.get(category);
            Container container = containerMap.get(category);

            String url = createURL(container, centerSpecificBillingSchema, categoryToQuery.get(category), null) + "&query.param.StartDate=" + getDateFormat(c).format(start.getTime()) + "&query.param.EndDate=" + getDateFormat(c).format(endDate.getTime());
            msg.append("<tr><td><a href='" + url + "'>" + category + "</a></td><td align='right'>" + _numItemsFormat.format(totalsMap.get("total")) + "</td><td align='right'>" + _dollarFormat.format(totalsMap.get("totalCost")) + "</td></tr>");
        }
        msg.append("</table><br><br>");

        msg.append("The tables below highlight any suspicious or abnormal items, grouped by project.  These will not necessarily be problems, but may warrant investigation.<br><br>");

        for (String financialAnalyst : dataMap.keySet())
        {
            //first build header row.  we want to keep fields in the same order as _fields for consistency between tables
            Set<FieldDescriptor> foundCols = new LinkedHashSet<>();
            outerloop:
            for (FieldDescriptor fd : fields)
            {
                for (String key : dataMap.get(financialAnalyst).keySet())
                {
                    Map<String, Map<String, Integer>> projectDataByCategory = dataMap.get(financialAnalyst).get(key);
                    for (String category : projectDataByCategory.keySet())
                    {
                        if (projectDataByCategory.get(category).containsKey(fd.getFieldName()))
                        {
                            foundCols.add(fd);
                            continue outerloop;
                        }
                    }
                }
            }

            msg.append("<table border=1 style='border-collapse: collapse;'><tr style='font-weight: bold;'><td>Financial Analyst</td><td>Project</td><td>Account</td><td>Institution Project Number</td><td>Category</td>");
            for (FieldDescriptor fd : foundCols)
            {
                msg.append("<td>" + fd.getLabel() + "</td>");
            }
            msg.append("</tr>");

            //then append the rows
            for (String key : dataMap.get(financialAnalyst).keySet())
            {
                String[] tokens = key.split("<>");
                Map<String, Map<String, Integer>> dataByCategory = dataMap.get(financialAnalyst).get(key);
                for (String category : dataByCategory.keySet())
                {
                    Map<String, Integer> totals = dataByCategory.get(category);

                    String baseUrl = createURL(containerMap.get(category), centerSpecificBillingSchema, categoryToQuery.get(category), null) + "&query.param.StartDate=" + getDateFormat(c).format(start.getTime()) + "&query.param.EndDate=" + getDateFormat(c).format(endDate.getTime());
                    String projUrl = baseUrl + ("None".equals(tokens[1]) ? "&query.project~isblank" : "&query.project~eq=" + tokens[1]);
                    msg.append("<tr><td>" + financialAnalyst + "</td>");    //the FA
                    msg.append("<td><a href='" + projUrl + "'>" + tokens[1] + "</a></td>");

                    String accountUrl = null;
                    Container financeContainer = EHR_BillingManager.get().getBillingContainer(containerMap.get(category));
                    if (financeContainer != null && !"Unknown".equals((tokens[2])))
                    {
                        accountUrl = createURL(financeContainer, _ehrBillingSchemaName, "aliases", null) + "&query.alias~eq=" + tokens[2];
                    }

                    if (accountUrl != null)
                    {
                        msg.append("<td><a href='" + accountUrl + "'>" + tokens[2] + "</a></td>");
                    }
                    else
                    {
                        msg.append("<td>" + (tokens[2]) + "</td>");
                    }

                    msg.append("<td>" + (tokens[3]) + "</td>");
                    msg.append("<td>" + category + "</td>");

                    for (FieldDescriptor fd : foundCols)
                    {
                        if (totals.containsKey(fd.getFieldName()))
                        {
                            String url = projUrl + fd.getFilter();
                            msg.append("<td" + (fd.isShouldHighlight() ? " style='background-color: yellow;'" : "") + "><a href='" + url + "'>" + totals.get(fd.getFieldName()) + "</a></td>");
                        }
                        else
                        {
                            msg.append("<td></td>");
                        }
                    }

                    msg.append("</tr>");
                }
            }

            msg.append("</table><br><br>");
        }

        msg.append("<hr><p>");
    }

    private void chargesMissingRates(Container c, User u, StringBuilder msg)
    {
        Map<String, Object> params = Collections.singletonMap("date", new Date());
        TableInfo ti = QueryService.get().getUserSchema(u, c, _ehrBillingSchemaName).getTable("chargesMissingRate");
        if (params != null)
        {
            SQLFragment sql = ti.getFromSQL("t");
            QueryService.get().bindNamedParameters(sql, params);
            sql = new SQLFragment("SELECT * FROM ").append(sql);
            QueryService.get().bindNamedParameters(sql, params);

            SqlSelector ss = new SqlSelector(ti.getSchema(), sql);
            long count = ss.getRowCount();

            if (count > 0)
            {
                msg.append("<b>Warning: There " + getSingularOrPluralBasedOnCount(count) + " " + count + " active charge item(s) " +
                        "missing either a default rate or a default credit alias.  This may cause problems with the billing calculation.</b><p>");
                String url = createURL(c, _ehrBillingSchemaName, "chargesMissingRate", null);
                url += "&query.param.Date=" + getDateFormat(c).format(new Date());

                msg.append("<a href='" + url + "'>Click here to view them</a>");
                msg.append("<hr>");
            }
        }
    }

    private void projectAliasesExpiringSoon(Container ehrContainer, User u, StringBuilder msg, String centerName)
    {
        TableInfo ti = QueryService.get().getUserSchema(u, ehrContainer, "ehr").getTable("project");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("enddateCoalesced"), "-0d", CompareType.DATE_GTE);
        filter.addCondition(FieldKey.fromString("account/budgetEndDate"), null, CompareType.NONBLANK);
        filter.addCondition(FieldKey.fromString("account/budgetEndDate"), "-0d", CompareType.DATE_GTE);
        filter.addCondition(FieldKey.fromString("account/budgetEndDate"), "+30d", CompareType.DATE_LTE);

        TableSelector ts = new TableSelector(ti, filter, null);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("Note: There " + getSingularOrPluralBasedOnCount(count) + " " + count + " active " + centerName + " project(s) " +
                    "with account(s) where the budget period will expire in the next 30 days.<p>");
            msg.append("<a href='" + createURL(ehrContainer, "ehr", "project", "Alias Info") +
                    "&" + filter.toQueryString("query") + "'>Click here to view them</a>");
            msg.append("<hr>");
        }
    }

    private void getAliasesDisabled(Container c, User u, StringBuilder msg, String centerName)
    {
        TableInfo ti = QueryService.get().getUserSchema(u, c, "ehr").getTable("project");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("enddateCoalesced"), "-0d", CompareType.DATE_GTE);
        filter.addCondition(FieldKey.fromString("account/isAcceptingCharges"), true, CompareType.NEQ_OR_NULL);
        filter.addCondition(FieldKey.fromString("account"), null, CompareType.NONBLANK);
        TableSelector ts = new TableSelector(ti, filter, null);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>Warning: There " + getSingularOrPluralBasedOnCount(count) + " " + count + " active " + centerName + " project(s) with account(s) that are not accepting charges.</b><p>");
            msg.append("<a href='" + createURL(c, "ehr", "project", "Alias Info") + "&" +
                    filter.toQueryString("query") + "'>Click here to view them</a>");
            msg.append("<hr>");
        }
    }

    private void getExpiredAliases(Container c, User u, StringBuilder msg, String centerName)
    {
        TableInfo ti = QueryService.get().getUserSchema(u, c, "ehr").getTable("project");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("enddateCoalesced"), "-0d", CompareType.DATE_GTE);
        filter.addCondition(FieldKey.fromString("account/budgetEndDate"), null, CompareType.NONBLANK);
        filter.addCondition(FieldKey.fromString("account/budgetEndDate"), "-0d", CompareType.DATE_LT);
        filter.addCondition(FieldKey.fromString("account"), null, CompareType.NONBLANK);
        TableSelector ts = new TableSelector(ti, filter, null);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>Warning: There " + getSingularOrPluralBasedOnCount(count) + " " + count + " active " + centerName +
                    " project(s) with account(s) that have an expired budget period.</b><p>");
            msg.append("<a href='" + createURL(c, "ehr", "project", "Alias Info") + "&" +
                    filter.toQueryString("query") + "'>Click here to view them</a>");
            msg.append("<hr>");
        }
    }

    private void getProjectsWithoutAliases(Container c, User u, StringBuilder msg, String centerName)
    {
        TableInfo ti = QueryService.get().getUserSchema(u, c, "ehr").getTable("project");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("enddateCoalesced"), "-0d", CompareType.DATE_GTE);
        filter.addCondition(FieldKey.fromString("account"), null, CompareType.ISBLANK);
        TableSelector ts = new TableSelector(ti, filter, null);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>Warning: There " + getSingularOrPluralBasedOnCount(count) + " " + count + " active " + centerName + " project(s) without an account.</b><p>");
            msg.append("<a href='" + createURL(c, "ehr", "project", "Alias Info") + "&" +
                    filter.toQueryString("query") + "'>Click here to view them</a>");
            msg.append("<hr>");
        }
    }

    private String createURL(Container c, String schemaName, String queryName, @Nullable String viewName)
    {
        DetailsURL detailsURL = DetailsURL.fromString("/query/executeQuery.view", c);
        ActionURL url = new ActionURL(detailsURL.getActionURL().toString());
        url.addParameter("schemaName", schemaName);
        url.addParameter("queryName", queryName);

        if(null != viewName)
            url.addParameter("viewName", viewName);

        return url.getLocalURIString();
    }

}
