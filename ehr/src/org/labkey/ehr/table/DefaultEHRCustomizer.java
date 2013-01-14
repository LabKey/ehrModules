/*
 * Copyright (c) 2012-2013 LabKey Corporation
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
package org.labkey.ehr.table;

import org.apache.log4j.Logger;
import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.TableCustomizer;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.WrappedColumn;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ldk.LDKService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.query.FilteredTable;
import org.labkey.api.query.LookupForeignKey;
import org.labkey.api.query.QueryDefinition;
import org.labkey.api.query.QueryException;
import org.labkey.api.query.QueryForeignKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.settings.AppProps;
import org.labkey.api.study.DataSetTable;
import org.labkey.api.util.GUID;
import org.labkey.api.view.HttpView;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.ehr.EHRModule;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 12/7/12
 * Time: 2:29 PM
 */
public class DefaultEHRCustomizer implements TableCustomizer
{
    public static final String ID_COL = "Id";
    private static final Logger _log = Logger.getLogger(DefaultEHRCustomizer.class);

    public DefaultEHRCustomizer()
    {

    }

    public void customize(TableInfo table)
    {
        LDKService.get().getBuiltInColumnsCustomizer().customize(table);

        if (table instanceof FilteredTable)
        {
            Container c = ((FilteredTable)table).getContainer();
            String df = EHRService.get().getDateFormat(c);
            if (df != null)
            {
                for (ColumnInfo col : table.getColumns())
                {
                    if (col.getJavaClass().equals(Date.class))
                        col.setFormat(df);
                }
            }
        }

        if (table instanceof DataSetTable)
        {
            customizeDataset((DataSetTable)table);
        }
        else if (table instanceof AbstractTableInfo && table.getName().equalsIgnoreCase("Animal"))
        {
            customizeAnimalTable((AbstractTableInfo)table);
        }


        //this should execute after any default EHR code
        if (table instanceof FilteredTable)
        {
            Container c = ((FilteredTable)table).getContainer();

            List<TableCustomizer> customizers = EHRService.get().getCustomizers(c, table.getSchema().getName(), table.getName());
            for (TableCustomizer tc : customizers)
            {
                tc.customize(table);
            }
        }
    }

    private void customizeDataset(DataSetTable ds)
    {
        AbstractTableInfo ti = (AbstractTableInfo)ds;
        hideStudyColumns(ti);
        appendEnddate(ti);
        appendDateOnly(ti);

        UserSchema us = getStudyUserSchema(ti);
        if (us != null){
            appendHousingAtTimeCol(us, ti);
            appendSurvivorshipCol(us, ti);
            appendAgeAtTimeCol(us, ti);
        }

        setLinkDisablers((AbstractTableInfo)ds);
        //setScriptIncludes((AbstractTableInfo) ds);
    }

    private void setLinkDisablers(AbstractTableInfo ti)
    {
        ti.setInsertURL(AbstractTableInfo.LINK_DISABLER);
        ti.setUpdateURL(AbstractTableInfo.LINK_DISABLER);
        ti.setDeleteURL(AbstractTableInfo.LINK_DISABLER);
        ti.setImportURL(AbstractTableInfo.LINK_DISABLER);
    }

    private void setScriptIncludes(AbstractTableInfo ti)
    {
        if (ti instanceof FilteredTable)
        {
            Container c = ((FilteredTable)ti).getContainer();
            Module m = ModuleLoader.getInstance().getModule(EHRModule.class);
            List<String> paths = new ArrayList<String>();
            //TODO: lacking user is dangerous.  we should get the UserSchema from the TI
            for (ClientDependency cd : m.getClientDependencies(c, null))
            {
                paths.addAll(cd.getJsPaths(c, null, AppProps.getInstance().isDevMode()));
                //paths.addAll(cd.getCssPaths(c, null, AppProps.getInstance().isDevMode()));
            }
            //ti.getButtonBarConfig().setScriptIncludes(paths.toArray(new String[paths.size()]));
        }
    }

    private void customizeAnimalTable(AbstractTableInfo ds)
    {
        hideStudyColumns(ds);
        
        UserSchema us = getStudyUserSchema(ds);
        if (us == null){            
            return;
        }

        ColumnInfo col = getWrappedIdCol(us, ds, "age", "demographicsAge");
        col.setLabel("Age");
        col.setDescription("This calculates the age of the animal in year, months or days.  It shows the current age for living animals or age at time of death.");
        ds.addColumn(col);

        ColumnInfo col3 = getWrappedIdCol(us, ds, "AgeClass", "demographicsAgeClass");
        col3.setLabel("Age Class");
        col3.setDescription("Calculates the age class of the animal, which is used to calculate reference ranges");
        ds.addColumn(col3);

        ColumnInfo col2 = getWrappedIdCol(us, ds, "MostRecentArrival", "demographicsArrival");
        col2.setLabel("Arrival Date");
        col2.setDescription("Calculates the most recent arrival per animal, if applicable, and most recent arrival at the center.");
        ds.addColumn(col2);

        ColumnInfo col4 = getWrappedIdCol(us, ds, "currentAssignments", "demographicsAssignments");
        col4.setLabel("Assignments - Active");
        col4.setDescription("Contains summaries of the assignments for each animal, including the project numbers, availability codes and a count");
        ds.addColumn(col4);

        ColumnInfo col7 = getWrappedIdCol(us, ds, "AvailBlood", "demographicsBloodSummary");
        col7.setLabel("Blood Remaining");
        col7.setDescription("Calculates the total blood draw and remaining, which is determine by weight and blood drawn in the past 30 days.");
        ds.addColumn(col7);

        ColumnInfo col8 = getWrappedIdCol(us, ds, "CageClass", "demographicsCageClass");
        col8.setLabel("Cage Class");
        col8.setDescription("Calculates the cage class necessary for this animal, which is used to determine space requirements");
        ds.addColumn(col8);

        ColumnInfo col9 = getWrappedIdCol(us, ds, "numRoommates", "demographicsCurrentRoommates");
        col9.setLabel("Cagemates");
        col9.setDescription("Calculates the total number of roommates per animal and total animals per cage");
        ds.addColumn(col9);

        ColumnInfo col10 = getWrappedIdCol(us, ds, "DaysAlone", "demographicsDaysAlone");
        col10.setLabel("Days Alone");
        col10.setDescription("Calculates the total number of days each animal has been single housed, if applicable.");
        ds.addColumn(col10);

        ColumnInfo col12 = getWrappedIdCol(us, ds, "MostRecentDeparture", "demographicsMostRecentDeparture");
        col12.setLabel("Departure Date");
        col12.setDescription("Calculates the most recent departure date for each animal");
        ds.addColumn(col12);

        ColumnInfo col11 = getWrappedIdCol(us, ds, "Demographics", "demographics");
        col11.setLabel("Demographics");
        col11.setDescription("Contains basic demographic information on the animals, including gender, dam, sire, etc.  This is similar to what was formerly called abstract.");
        ds.addColumn(col11);

        ColumnInfo col13 = getWrappedIdCol(us, ds, "curLocation", "demographicsCurLocation");
        col13.setLabel("Housing - Current");
        col13.setDescription("The calculates the current housing location for each living animal.");
        ds.addColumn(col13);

        ColumnInfo col14 = getWrappedIdCol(us, ds, "lastHousing", "demographicsLastHousing");
        col14.setLabel("Housing - Last Location");
        col14.setDescription("This calculates the last housing location for the animal.  This is distinct from active housing, because it will return a location for dead animals");
        ds.addColumn(col14);

        ColumnInfo col15 = getWrappedIdCol(us, ds, "totalOffspring", "demographicsTotalOffspring");
        col15.setLabel("Number of Offspring");
        col15.setDescription("Shows the total offspring of each animal");
        ds.addColumn(col15);

        ColumnInfo col16 = getWrappedIdCol(us, ds, "Surgery", "demographicsSurgery");
        col16.setLabel("Surgical History");
        col16.setDescription("Calculates whether this animal has ever had any surgery or a surgery flagged as major");
        ds.addColumn(col16);

        ColumnInfo col17 = getWrappedIdCol(us, ds, "MostRecentTB", "demographicsMostRecentTBDate");
        col17.setLabel("TB Tests");
        col17.setDescription("Calculates the most recent TB date for this animal, time since TB and the last eye TB tested");
        ds.addColumn(col17);

        ColumnInfo col18 = getWrappedIdCol(us, ds, "Virology", "demographicsVirology");
        col18.setLabel("Virology");
        col18.setDescription("This calculates the distinct pathogens listed as positive for this animal from the virology table");
        ds.addColumn(col18);

        ColumnInfo col19 = getWrappedIdCol(us, ds, "weightChange", "demographicsWeightChange");
        col19.setLabel("Weight Change");
        col19.setDescription("This calculates the percent change over the past 30, 90 or 180 days relative to the most recent weight");
        ds.addColumn(col19);

        ColumnInfo col20 = getWrappedIdCol(us, ds, "MostRecentWeight", "demographicsMostRecentWeight");
        col20.setLabel("Weight - Current");
        col20.setDescription("This calculates the most recent weight for the animal, based on the weight table");
        ds.addColumn(col20);
    }

    private ColumnInfo getWrappedIdCol(UserSchema us, AbstractTableInfo ds, String name, String queryName)
    {
        WrappedColumn col = new WrappedColumn(ds.getColumn(ID_COL), name);
        col.setReadOnly(true);
        col.setIsUnselectable(true);
        col.setUserEditable(false);        
        col.setFk(new QueryForeignKey(us, queryName, ID_COL, ID_COL));

        return col;
    }

    private void appendHousingAtTimeCol(final UserSchema us, final AbstractTableInfo ds)
    {
        WrappedColumn col = new WrappedColumn(ds.getColumn("lsid"), "housingAtTime");
        col.setLabel("Housing At Time");
        col.setReadOnly(true);
        col.setIsUnselectable(true);
        col.setUserEditable(false);
        col.setFk(new LookupForeignKey(){
            public TableInfo getLookupTableInfo()
            {
                QueryDefinition qd = QueryService.get().createQueryDef(us.getUser(), us.getContainer(), us, new GUID().toString());
                qd.setSql("SELECT\n" +
                    "sd.lsid,\n" +
                    "sd.id,\n" +
                    "sd.date,\n" +
                    "\n" +
                    "cast((\n" +
                    "  SELECT group_concat(DISTINCT h.room) as room FROM study.Housing h\n" +
                    "  WHERE sd.id = h.id AND h.date <= sd.date AND sd.date < COALESCE(h.enddate, now())\n" +
                    "  AND h.qcstate.publicdata = true\n" +
                    ") as varchar) as RoomAtTime,\n" +
                    "cast((\n" +
                    "  SELECT group_concat(h.cage) as cage FROM study.Housing h\n" +
                    "  WHERE sd.id = h.id AND h.date <= sd.date AND sd.date < COALESCE(h.enddate, now())\n" +
                    "  AND h.qcstate.publicdata = true\n" +
                    ") as varchar) as CageAtTime,\n" +
                    "FROM study.\"" + ds.getName() + "\" sd");
                qd.setIsTemporary(true);

                List<QueryException> errors = new ArrayList<QueryException>();
                TableInfo ti = qd.getTable(errors, true);
                ti.getColumn("lsid").setHidden(true);
                ti.getColumn("lsid").setKeyField(true);

                return ti;
            }
        });

        ds.addColumn(col);
    }

    private void appendAssignmentAtTimeCol(final UserSchema us, final AbstractTableInfo ds)
    {
        WrappedColumn col = new WrappedColumn(ds.getColumn("lsid"), "assignmentAtTime");
        col.setLabel("Assignments At Time");
        col.setReadOnly(true);
        col.setIsUnselectable(true);
        col.setUserEditable(false);
        col.setFk(new LookupForeignKey(){
            public TableInfo getLookupTableInfo()
            {
                QueryDefinition qd = QueryService.get().createQueryDef(us.getUser(), us.getContainer(), us, new GUID().toString());
                qd.setSql("SELECT\n" +
                    "sd.lsid,\n" +
                    "group_concat(DISTINCT h.project) as AssignmentsAtTime\n" +
                    "FROM study.\"" + ds.getName() + "\" sd\n" +
                    "JOIN study.assignment h\n" +
                    "  ON (sd.id = h.id AND h.date <= sd.date AND sd.date < COALESCE(h.enddate, now()) AND h.qcstate.publicdata = true)\n" +
                    "group by sd.lsid");
                qd.setIsTemporary(true);

                List<QueryException> errors = new ArrayList<QueryException>();
                TableInfo ti = qd.getTable(errors, true);

                ti.getColumn("lsid").setHidden(true);
                ti.getColumn("lsid").setKeyField(true);

                return ti;
            }
        });

        ds.addColumn(col);
    }

    private void appendSurvivorshipCol(final UserSchema us, final AbstractTableInfo ds)
    {
        WrappedColumn col = new WrappedColumn(ds.getColumn("lsid"), "survivorship");
        col.setLabel("Survivorship");
        col.setReadOnly(true);
        col.setIsUnselectable(true);
        col.setUserEditable(false);
        col.setFk(new LookupForeignKey(){
            public TableInfo getLookupTableInfo()
            {
                QueryDefinition qd = QueryService.get().createQueryDef(us.getUser(), us.getContainer(), us, new GUID().toString());
                qd.setSql("SELECT\n" +
                    "c.lsid,\n" +
                    "c.id.dataset.demographics.calculated_status AS status,\n" +
                    "\n" +
                    "CASE\n" +
                    "WHEN c.date is not null\n" +
                    "  THEN null\n" +
                    "WHEN c.id.dataset.demographics.death is not null\n" +
                    "  THEN age(c.date, c.id.dataset.demographics.death)\n" +
                    "ELSE\n" +
                    "  null\n" +
                    "END as Survivorship,\n" +
                    "\n" +
                        "FROM study.\"" + ds.getName() + "\" c");
                qd.setIsTemporary(true);

                List<QueryException> errors = new ArrayList<QueryException>();
                TableInfo ti = qd.getTable(errors, true);
                ti.getColumn("lsid").setHidden(true);
                ti.getColumn("lsid").setKeyField(true);

                return ti;
            }
        });

        ds.addColumn(col);
    }

    private void appendAgeAtTimeCol(final UserSchema us, final AbstractTableInfo ds)
    {
        WrappedColumn col = new WrappedColumn(ds.getColumn("lsid"), "ageAtTime");
        col.setLabel("Age At The Time");
        col.setReadOnly(true);
        col.setIsUnselectable(true);
        col.setUserEditable(false);
        col.setFk(new LookupForeignKey(){
            public TableInfo getLookupTableInfo()
            {
                QueryDefinition qd = QueryService.get().createQueryDef(us.getUser(), us.getContainer(), us, new GUID().toString());
                //NOTE: do not need to account for QCstate b/c study.demographics only allows 1 row per subject
                qd.setSql("SELECT\n" +
                    "c.lsid,\n" +
                    "\n" +
                    "CAST(\n" +
                    "CASE\n" +
                    "WHEN c.id.dataset.demographics.birth is null or c.date is null\n" +
                    "  THEN null\n" +
                    "ELSE\n" +
                    "  ROUND(CONVERT(age_in_months(c.id.dataset.demographics.birth, COALESCE(c.id.dataset.demographics.death, c.date)), DOUBLE) / 12, 1)\n" +
                    "END AS float) as AgeAtTime,\n" +
                    "\n" +
                    "CAST(\n" +
                    "CASE\n" +
                    "WHEN c.id.dataset.demographics.birth is null or c.date is null\n" +
                    "  THEN null\n" +
                    "ELSE\n" +
                    "  floor(age(c.id.dataset.demographics.birth, COALESCE(c.id.dataset.demographics.death, c.date)))\n" +
                    "END AS float) as AgeAtTimeYearsRounded,\n" +
                    "\n" +
                    "CAST(\n" +
                    "CASE\n" +
                    "WHEN c.id.dataset.demographics.birth is null or c.date is null\n" +
                    "  THEN null\n" +
                    "ELSE\n" +
                    "  CONVERT(age_in_months(c.id.dataset.demographics.birth, COALESCE(c.id.dataset.demographics.death, c.date)), INTEGER)\n" +
                    "END AS float) as AgeAtTimeMonths,\n" +
                    "\n" +
                        "FROM study.\"" + ds.getName() + "\" c");
                qd.setIsTemporary(true);

                List<QueryException> errors = new ArrayList<QueryException>();
                TableInfo ti = qd.getTable(errors, true);
                ti.getColumn("lsid").setHidden(true);
                ti.getColumn("lsid").setKeyField(true);

                return ti;
            }
        });

        ds.addColumn(col);
    }

    private void appendSnomedCol(String colName, final UserSchema us, AbstractTableInfo ds, String name)
    {
        WrappedColumn col = new WrappedColumn(ds.getColumn(colName), name);
        col.setReadOnly(true);
        //TODO: look at custom aggregate


        ds.addColumn(col);
    }

    private void appendProjectCol(String colName, final UserSchema us, AbstractTableInfo ds, String name)
    {
        WrappedColumn col = new WrappedColumn(ds.getColumn(colName), name);
        col.setReadOnly(true);
        //TODO: lookup to pivot query


        ds.addColumn(col);
    }

    private UserSchema getStudyUserSchema(AbstractTableInfo ds)
    {
        return getUserSchema(ds, "study");
    }

    public static UserSchema getUserSchema(AbstractTableInfo ds, String name)
    {
        if (!(ds instanceof FilteredTable))
        {
            return null;
        }

        User u;
        Container c = ((FilteredTable)ds).getContainer();

        if (HttpView.hasCurrentView()){
            u = HttpView.currentContext().getUser();
        }
        else
        {
            u = EHRService.get().getEHRUser(c);
        }

        if (u == null)
            return null;

        return QueryService.get().getUserSchema(u, c, name);
    }

    private void hideStudyColumns(AbstractTableInfo ds)
    {
        for (String name : new String[]{"EnrollmentSiteId", "CurrentSiteId", "InitialCohort", "Cohort", "StartDate"})
        {
            ColumnInfo col = ds.getColumn(name);
            if (col != null)
            {
                col.setHidden(true);
                col.setShownInInsertView(false);
                col.setShownInUpdateView(false);
                col.setShownInDetailsView(false);
            }
        }
    }

    private void appendEnddate(AbstractTableInfo ti)
    {
        if (ti.getColumn("enddate") != null)
        {
            //TODO: get type conversion right
            SQLFragment sql = new SQLFragment("COALESCE(" + ExprColumn.STR_TABLE_ALIAS + ".enddate, {fn curdate()})");
            ExprColumn col = new ExprColumn(ti, "enddateCoalesced", sql, JdbcType.TIMESTAMP);
            col.setCalculated(true);
            col.setUserEditable(false);
            col.setHidden(true);
            col.setLabel("Enddate, Coalesced");
            ti.addColumn(col);
        }
    }

    private void appendDateOnly(AbstractTableInfo ti)
    {
        if (ti.getColumn("date") != null)
        {
            SQLFragment sql = new SQLFragment(ti.getSqlDialect().getDateTimeToDateCast(ExprColumn.STR_TABLE_ALIAS + ".date"));
            ExprColumn col = new ExprColumn(ti, "dateOnly", sql, JdbcType.DATE);
            col.setCalculated(true);
            col.setUserEditable(false);
            col.setHidden(true);
            col.setLabel("Date Only");
            ti.addColumn(col);
        }
    }
}
