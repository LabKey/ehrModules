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

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.json.JSONObject;
import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.ButtonBarConfig;
import org.labkey.api.data.ButtonConfig;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.DisplayColumn;
import org.labkey.api.data.DisplayColumnFactory;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.RenderContext;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.TableCustomizer;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.UserDefinedButtonConfig;
import org.labkey.api.data.WrappedColumn;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.gwt.client.FacetingBehaviorType;
import org.labkey.api.ldk.LDKService;
import org.labkey.api.ldk.table.ButtonConfigFactory;
import org.labkey.api.query.DetailsURL;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.LookupForeignKey;
import org.labkey.api.query.QueryDefinition;
import org.labkey.api.query.QueryException;
import org.labkey.api.query.QueryForeignKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.study.DataSetTable;
import org.labkey.api.view.HttpView;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.ehr.EHRSchema;

import java.io.IOException;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * User: bimber
 * Date: 12/7/12
 * Time: 2:29 PM
 */
public class DefaultEHRCustomizer implements TableCustomizer
{
    public static final String ID_COL = "Id";
    private static final Logger _log = Logger.getLogger(DefaultEHRCustomizer.class);
    private Map<String, UserSchema> _userSchemas = new HashMap<>();
    private boolean _addLinkDisablers = true;
    private static final String MORE_ACTIONS = "More Actions";

    public DefaultEHRCustomizer()
    {

    }

    public void customize(TableInfo table)
    {
        _userSchemas = new HashMap<>();

        LDKService.get().getBuiltInColumnsCustomizer(false).customize(table);
        UserSchema us = table.getUserSchema();
        if (us != null)
        {
            Container c = us.getContainer();
            String df = EHRService.get().getDateFormat(c);
            if (df != null)
            {
                for (ColumnInfo col : table.getColumns())
                {
                    if (col.getJavaClass().equals(Date.class) && col.getFormat() == null)
                        col.setFormat(df);
                }
            }
        }

        //NOTE: no datasets should be included below.  these should be customized in customizeDataset()
        if (table instanceof DataSetTable)
        {
            customizeDataset((DataSetTable)table);
        }
        else if ("StudyData".equalsIgnoreCase(table.getName()))
        {
            customizeStudyData((AbstractTableInfo)table);
        }
        else if (table instanceof AbstractTableInfo && table.getName().equalsIgnoreCase("Animal"))
        {
            customizeAnimalTable((AbstractTableInfo)table);
        }
        else if (table.getName().equalsIgnoreCase("project") && table.getSchema().getName().equalsIgnoreCase("ehr"))
        {
            customizeProjectTable((AbstractTableInfo)table);
        }
        else if (table.getName().equalsIgnoreCase("protocol") && table.getSchema().getName().equalsIgnoreCase("ehr"))
        {
            customizeProtocolTable((AbstractTableInfo)table);
        }
        else if (table.getName().equalsIgnoreCase("animal_groups") && table.getSchema().getName().equalsIgnoreCase("ehr"))
        {
            customizeAnimalGroups((AbstractTableInfo) table);
        }
        else if (table.getName().equalsIgnoreCase("animal_group_members") && table.getSchema().getName().equalsIgnoreCase("ehr"))
        {
            customizeAnimalGroupMembers((AbstractTableInfo)table);
        }
        else if (table.getName().equalsIgnoreCase("snomed") && table.getSchema().getName().equalsIgnoreCase("ehr_lookups"))
        {
            customizeSNOMED((AbstractTableInfo) table);
        }
        else if (table.getName().equalsIgnoreCase("snomed_tags") && table.getSchema().getName().equalsIgnoreCase("ehr"))
        {
            customizeSNOMEDTags((AbstractTableInfo) table);
        }
        else if (table instanceof AbstractTableInfo)
        {
            doSharedCustomization((AbstractTableInfo)table);
        }

        //this should execute after any default EHR code
        if (us != null)
        {
            Container c = us.getContainer();

            List<TableCustomizer> customizers = EHRService.get().getCustomizers(c, table.getSchema().getName(), table.getName());
            for (TableCustomizer tc : customizers)
            {
                tc.customize(table);
            }
        }

        if (table instanceof AbstractTableInfo)
        {
            //this will force qcstate toward the end of the non-calculated columns
            ColumnInfo qc = table.getColumn("qcstate");
            if (qc != null)
            {
                AbstractTableInfo ati = (AbstractTableInfo)table;
                ati.removeColumn(qc);
                ati.addColumn(qc);
            }
        }

        LDKService.get().getColumnsOrderCustomizer().customize(table);
    }

    private void doSharedCustomization(AbstractTableInfo ti)
    {
        appendEnddate(ti);
        appendDuration(ti);
        appendDateOnly(ti);
        if (_addLinkDisablers)
            setLinkDisablers(ti);

        if (ti.getColumn("dateOnly") != null)
        {
            appendCalculatedCols(ti, "dateOnly");
        }

        ColumnInfo objectId = ti.getColumn("objectid");
        if (objectId != null)
        {
            objectId.setHidden(true);
            objectId.setLabel("Key");
            objectId.setUserEditable(false);
        }

        customizeRoomCol(ti, "room");
        customizeRoomCol(ti, "room1");
        customizeRoomCol(ti, "room2");

        customizeCageCol(ti, "cage");
        customizeCageCol(ti, "cage1");
        customizeCageCol(ti, "cage2");

        ColumnInfo description = ti.getColumn("description");
        if (description != null)
        {
            description.setDisplayWidth("400");
            description.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
        }

        ColumnInfo project = ti.getColumn("project");
        if (project != null && !ti.getName().equalsIgnoreCase("project"))
        {
            UserSchema us = getUserSchema(ti, "ehr");
            if (us != null)
                project.setFk(new QueryForeignKey(us, "project", "project", "project"));
        }

        ColumnInfo code = ti.getColumn("code");
        if (code != null)
        {
            code.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
        }
    }

    private void customizeRoomCol(AbstractTableInfo ti, String name)
    {
        ColumnInfo room = ti.getColumn(name);
        if (room != null)
        {
            if (!ti.getName().equalsIgnoreCase("rooms"))
            {
                UserSchema us = getUserSchema(ti, "ehr_lookups");
                if (us != null){
                    room.setFk(new QueryForeignKey(us, "rooms", "room", "room"));
                }
                room.setLabel("Room");

                //room.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
            }
        }
    }

    private void customizeCageCol(AbstractTableInfo ti, String name)
    {
        ColumnInfo cage = ti.getColumn(name);
        if (cage != null)
        {
            cage.setDisplayWidth("40");
            cage.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
        }
    }

    private void customizeDataset(DataSetTable ds)
    {
        AbstractTableInfo ti = (AbstractTableInfo)ds;
        hideStudyColumns(ti);

        doSharedCustomization(ti);
        if (ds.getName().equalsIgnoreCase("Drug Administration") || ds.getName().equalsIgnoreCase("Treatment Orders"))
        {
            addUnitColumns(ti);

            if (ds.getName().equalsIgnoreCase("Treatment Orders"))
            {
                addIsActiveColWithTime(ti);
            }
        }
        else if (ds.getName().equalsIgnoreCase("Clinical Encounters") || ds.getName().equalsIgnoreCase("Encounters"))
        {
            customizeEncountersTable(ti);
        }
        else if (ds.getName().equalsIgnoreCase("housing"))
        {
            customizeHousing(ti);
        }
        else if (ds.getName().equalsIgnoreCase("assignment"))
        {
            addIsActiveCol(ti);
        }
        else if (ds.getName().equalsIgnoreCase("notes"))
        {
            addIsActiveCol(ti);
        }
        else if (ds.getName().equalsIgnoreCase("problem") || ds.getName().equalsIgnoreCase("problem list"))
        {
            addIsActiveCol(ti);
        }
        else if (ds.getName().equalsIgnoreCase("flags") || ds.getName().equalsIgnoreCase("Animal Record Flags"))
        {
            addIsActiveCol(ti, false);
        }
        else if (ds.getName().equalsIgnoreCase("diet"))
        {
            addIsActiveCol(ti);
        }

        appendHistoryCol(ti);

        ColumnInfo runId = ti.getColumn("runId");
        if (runId != null)
        {
            runId.setLabel("Run Id");
            UserSchema study = getStudyUserSchema(ti);
            if (study != null)
                runId.setFk(new QueryForeignKey(study, "Clinpath Runs", "objectid", ID_COL));

            runId.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
        }

        ColumnInfo parentId = ti.getColumn("parentId");
        if (parentId != null)
        {
            parentId.setLabel("Encounter Id");
            UserSchema study = getStudyUserSchema(ti);
            if (study != null)
                parentId.setFk(new QueryForeignKey(study, "Clinical Encounters", "objectid", ID_COL));

            parentId.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
        }

        customizeButtonBar((AbstractTableInfo) ds);
    }

    private void addIsActiveCol(AbstractTableInfo ti)
    {
        addIsActiveCol(ti, true);
    }

    private void addIsActiveCol(AbstractTableInfo ti, boolean allowSameDay)
    {
        String name = "isActive";
        if (ti.getColumn(name) == null)
        {
            SQLFragment sql = new SQLFragment("(CASE " +
                    " WHEN (" + ExprColumn.STR_TABLE_ALIAS + ".date > {fn now()}) THEN " + ti.getSqlDialect().getBooleanFALSE() +
                    " WHEN (" + ExprColumn.STR_TABLE_ALIAS + ".enddate IS NULL) THEN " + ti.getSqlDialect().getBooleanTRUE() +
                    (allowSameDay ? " WHEN (" + ExprColumn.STR_TABLE_ALIAS + ".enddate IS NOT NULL AND CAST(" + ExprColumn.STR_TABLE_ALIAS + ".enddate AS DATE) = {fn curdate()} AND CAST(" + ExprColumn.STR_TABLE_ALIAS + ".date as DATE) = {fn curdate()}) THEN " + ti.getSqlDialect().getBooleanTRUE() : "") +
                    " WHEN (CAST(" + ExprColumn.STR_TABLE_ALIAS + ".enddate AS DATE) > {fn curdate()}) THEN " + ti.getSqlDialect().getBooleanTRUE() +
                    " ELSE " + ti.getSqlDialect().getBooleanFALSE() +
                    " END)");

            ExprColumn col = new ExprColumn(ti, name, sql, JdbcType.BOOLEAN, ti.getColumn("date"), ti.getColumn("enddate"));
            col.setLabel("Is Active?");
            ti.addColumn(col);
        }
    }

    //note: intended specially for treatment orders.  note slightly unusual behavior around start date
    private void addIsActiveColWithTime(AbstractTableInfo ti)
    {
        String name = "isActive";
        if (ti.getColumn(name) == null)
        {
            SQLFragment sql = new SQLFragment("(CASE " +
                " WHEN (cast(" + ExprColumn.STR_TABLE_ALIAS + ".date as date) > {fn curdate()}) THEN " + ti.getSqlDialect().getBooleanFALSE() +
                " WHEN (" + ExprColumn.STR_TABLE_ALIAS + ".enddate IS NULL) THEN " + ti.getSqlDialect().getBooleanTRUE() +
                " WHEN (" + ExprColumn.STR_TABLE_ALIAS + ".enddate >= {fn now()}) THEN " + ti.getSqlDialect().getBooleanTRUE() +
                " ELSE " + ti.getSqlDialect().getBooleanFALSE() +
                " END)");

            ExprColumn col = new ExprColumn(ti, name, sql, JdbcType.BOOLEAN, ti.getColumn("date"), ti.getColumn("enddate"));
            col.setLabel("Is Active?");
            ti.addColumn(col);
        }
    }

    private void appendCalculatedCols(AbstractTableInfo ti, String dateFieldName)
    {
        if (ti.getName().equalsIgnoreCase("demographics"))
            return;

        if (ti.getColumn(dateFieldName) == null || ti.getColumn(ID_COL) == null)
            return;

        UserSchema us = getStudyUserSchema(ti);
        if (us != null){

            //needs date/time
            appendHousingAtTimeCol(us, ti, "date");

            //date only
            appendAgeAtTimeCol(us, ti, "dateOnly");

            appendSurvivorshipCol(us, ti);
            appendTimeSinceCol(us, ti);
        }
    }

    private void customizeStudyData(AbstractTableInfo ti)
    {
        hideStudyColumns(ti);
        customizeButtonBar(ti);
    }

    private void customizeEncountersTable(final AbstractTableInfo ti)
    {
        appendEncountersCol(ti, "participants", "Participants", "encounter_participants_summary");
        appendEncountersCol(ti, "summaries", "Summaries", "encounter_summaries_summary");
        appendEncountersCol(ti, "flags", "Flags", "encounter_flags_summary");

        appendSNOMEDCol(ti);
    }

    private void appendSNOMEDCol(AbstractTableInfo ti)
    {
        String name = "codes";
        ColumnInfo existing = ti.getColumn(name);
        if (existing == null)
        {
            String chr = ti.getSqlDialect().isPostgreSQL() ? "chr" : "char";
            SQLFragment sql = new SQLFragment("(SELECT " + ti.getSqlDialect().getGroupConcat(new SQLFragment(ti.getSqlDialect().concatenate("s.meaning", "' ('", "t.code", "')'")), true, true, chr + "(10)") +
                "FROM ehr.snomed_tags t JOIN ehr_lookups.snomed s ON (s.code = t.code) " +
                " WHERE t.recordid = " + ExprColumn.STR_TABLE_ALIAS + ".objectid AND " + ExprColumn.STR_TABLE_ALIAS + ".participantid = t.id " +
                " GROUP BY t.recordid " +
                " )");

            ExprColumn newCol = new ExprColumn(ti, name, sql, JdbcType.VARCHAR, ti.getColumn("objectid"));
            newCol.setLabel("SNOMED Codes");
            newCol.setDisplayWidth("250");
            ti.addColumn(newCol);
        }
    }

    private void appendEncountersCol(AbstractTableInfo ti, String name, String label, final String targetTableName)
    {
        appendEncountersCol(ti, name, label, targetTableName, "parentid");
    }

    private void appendEncountersCol(AbstractTableInfo ti, String name, String label, final String targetTableName, String targetColName)
    {
        ColumnInfo existing = ti.getColumn(name);
        if (existing == null)
        {
            final UserSchema us = getUserSchema(ti, EHRSchema.EHR_SCHEMANAME);

            ColumnInfo ci = new WrappedColumn(ti.getColumn("objectid"), name);
            LookupForeignKey fk = new LookupForeignKey(targetColName)
            {
                @Override
                public TableInfo getLookupTableInfo()
                {
                    return us.getTable(targetTableName);
                }
            };
            fk.addJoin(FieldKey.fromString(ID_COL), ID_COL, false);

            ci.setFk(fk);
            ci.setUserEditable(false);
            ci.setIsUnselectable(true);
            ci.setDisplayWidth("400");
            ci.setLabel(label);
            ti.addColumn(ci);
        }
    }

    private void appendHistoryCol(AbstractTableInfo ti)
    {
        if (ti.getColumn("history") != null)
            return;

        ColumnInfo ci = new WrappedColumn(ti.getColumn(ID_COL), "history");
        ci.setDisplayColumnFactory(new DisplayColumnFactory()
        {
            @Override
            public DisplayColumn createRenderer(final ColumnInfo colInfo)
            {
                return new DataColumn(colInfo){

                    public void renderGridCellContents(RenderContext ctx, Writer out) throws IOException
                    {
                        String objectid = (String)ctx.get("objectid");
                        Date date = (Date)ctx.get("date");
                        String id = (String)ctx.get(ID_COL);

                        out.write("<span style=\"white-space:nowrap\"><a href=\"javascript:void(0);\" onclick=\"EHR.Utils.showClinicalHistory('" + objectid + "', '" + id + "', '" + date + "', this);\">[Show Hx]</a></span>");
                    }

                    @Override
                    public void addQueryFieldKeys(Set<FieldKey> keys)
                    {
                        super.addQueryFieldKeys(keys);
                        keys.add(FieldKey.fromString("date"));
                        keys.add(FieldKey.fromString("objectid"));
                    }

                    public boolean isSortable()
                    {
                        return false;
                    }

                    public boolean isFilterable()
                    {
                        return false;
                    }

                    public boolean isEditable()
                    {
                        return false;
                    }
                };
            }
        });
        ci.setIsUnselectable(false);
        ci.setLabel("History");

        ti.addColumn(ci);
    }

    private void setLinkDisablers(AbstractTableInfo ti)
    {
        ti.setInsertURL(AbstractTableInfo.LINK_DISABLER);
        ti.setUpdateURL(AbstractTableInfo.LINK_DISABLER);
        ti.setDeleteURL(AbstractTableInfo.LINK_DISABLER);
        ti.setImportURL(AbstractTableInfo.LINK_DISABLER);
    }

    private void addUnitColumns(AbstractTableInfo ds)
    {
        addUnitsConcatCol(ds, "amount", "amount_units", "Amount To Give");
        addUnitsConcatCol(ds, "volume", "vol_units", "Volume");
        addUnitsConcatCol(ds, "concentration", "conc_units", "Concentration");
    }

    private void addUnitsConcatCol(AbstractTableInfo ds, String colName, String unitColName, String label)
    {
        ColumnInfo col = ds.getColumn(colName);
        ColumnInfo unitCol = ds.getColumn(unitColName);

        if (col != null && unitCol != null)
        {
            String name = col.getName() + "WithUnits";
            SQLFragment sql = new SQLFragment("CASE " +
                " WHEN " + ExprColumn.STR_TABLE_ALIAS + "." + unitCol.getSelectName() + " IS NULL THEN CAST(" + ExprColumn.STR_TABLE_ALIAS + "." + col.getSelectName() + " AS VARCHAR)" +
                " ELSE " + ds.getSqlDialect().concatenate("CAST(" + ExprColumn.STR_TABLE_ALIAS + "." + col.getSelectName() + " AS VARCHAR)", "' '", ExprColumn.STR_TABLE_ALIAS + "." + unitCol.getSelectName()) +
                " END"
            );
            ExprColumn newCol = new ExprColumn(ds, name, sql, JdbcType.VARCHAR, col, unitCol);
            newCol.setLabel(label);
            newCol.setHidden(true);
            newCol.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
            ds.addColumn(newCol);
        }
    }

    private void customizeButtonBar(AbstractTableInfo ti)
    {
        ButtonBarConfig cfg = ti.getButtonBarConfig();
        if (cfg == null)
        {
            cfg = new ButtonBarConfig(new JSONObject());
            cfg.setIncludeStandardButtons(true);
        }

        setScriptIncludes(cfg);
        configureMoreActionsBtn(ti, cfg);
        addHiddenButton(cfg);
    }

    private void configureMoreActionsBtn(AbstractTableInfo ti, ButtonBarConfig cfg)
    {
        List<ButtonConfigFactory> buttons = EHRService.get().getMoreActionsButtons(ti);

        List<ButtonConfig> existingBtns = cfg.getItems();
        UserDefinedButtonConfig moreActionsBtn = null;
        if (existingBtns != null)
        {
            for (ButtonConfig btn : existingBtns)
            {
                if (btn instanceof UserDefinedButtonConfig)
                {
                    UserDefinedButtonConfig ub = (UserDefinedButtonConfig)btn;
                    if (MORE_ACTIONS.equals(ub.getText()))
                    {
                        moreActionsBtn = ub;
                        break;
                    }
                }
            }
        }

        if (moreActionsBtn == null)
        {
            //abort if there are no custom buttons
            if (buttons == null || buttons.size() == 0)
                return;

            moreActionsBtn = new UserDefinedButtonConfig();
            moreActionsBtn.setText(MORE_ACTIONS);
            moreActionsBtn.setInsertPosition(-1);

            List<NavTree> menuItems = new ArrayList<NavTree>();
            if (moreActionsBtn.getMenuItems() != null)
                menuItems.addAll(moreActionsBtn.getMenuItems());

            //create map of existing item names
            Map<String, NavTree> btnNameMap = new HashMap<String, NavTree>();
            for (NavTree item : menuItems)
            {
                btnNameMap.put(item.getText(), item);
            }

            for (ButtonConfigFactory fact : buttons)
            {
                NavTree newButton = fact.create(ti);
                if (!btnNameMap.containsKey(newButton.getText()))
                {
                    btnNameMap.put(newButton.getText(), newButton);
                    menuItems.add(newButton);

                    for (ClientDependency cd : fact.getClientDependencies(ti.getUserSchema().getContainer(), ti.getUserSchema().getUser()))
                    {
                        addScriptInclude(cfg, cd.getScriptString());
                    }
                }
            }

            moreActionsBtn.setMenuItems(menuItems);

            existingBtns.add(moreActionsBtn);
            cfg.setItems(existingBtns);
        }
    }

    private void addScriptInclude(ButtonBarConfig cfg, String script)
    {
        Set<String> scripts = new HashSet<String>();
        String[] existing = cfg.getScriptIncludes();
        if (existing != null)
        {
            for (String s : existing)
            {
                scripts.add(s);
            }
        }

        scripts.add(script);
        cfg.setScriptIncludes(scripts.toArray(new String[scripts.size()]));
    }

    private void addHiddenButton(ButtonBarConfig cfg)
    {
        boolean found = false;
        for (ButtonConfig btn : cfg.getItems())
        {
            if (btn instanceof UserDefinedButtonConfig)
            {
                UserDefinedButtonConfig udb = (UserDefinedButtonConfig)btn;
                if (" ".equals(udb.getText()))
                {
                    found = true;
                    break;
                }
            }
        }

        if (!found)
        {
            UserDefinedButtonConfig newButton = new UserDefinedButtonConfig();
            newButton.setText(" ");
            newButton.setInsertAfter("More Actions");
            newButton.setOnClick("javascript:void(0);");
            newButton.setRequiresSelection(true);
            cfg.getItems().add(newButton);
        }
    }

    private void setScriptIncludes(ButtonBarConfig cfg)
    {
        if (cfg != null)
        {
            Set<String> scripts = new HashSet<>();
            String[] existing = cfg.getScriptIncludes();
            if (existing != null)
            {
                for (String s : existing)
                {
                    scripts.add(s);
                }
            }

            scripts.add("ehr.context");
            cfg.setScriptIncludes(scripts.toArray(new String[scripts.size()]));
        }
    }

    private void customizeAnimalTable(AbstractTableInfo ds)
    {
        hideStudyColumns(ds);
        
        UserSchema us = getStudyUserSchema(ds);
        if (us == null){            
            return;
        }

        if (ds.getColumn("age") != null)
        {
            _log.warn("Table already has an age column.  Customize might have been called twice?  " + ds.getName());
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

        ColumnInfo col9 = getWrappedIdCol(us, ds, "numRoommates", "demographicsCurrentRoommates");
        col9.setLabel("Cagemates");
        col9.setDescription("Calculates the total number of roommates per animal and total animals per cage");
        ds.addColumn(col9);

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
        col14.setLabel("Housing - Final Location");
        col14.setDescription("This calculates the final housing location for the animal.  This is distinct from active housing, because it will return a location for dead animals");
        ds.addColumn(col14);

        ColumnInfo col15 = getWrappedIdCol(us, ds, "totalOffspring", "demographicsTotalOffspring");
        col15.setLabel("Number of Offspring");
        col15.setDescription("Shows the total offspring of each animal");
        ds.addColumn(col15);

        ColumnInfo col16 = getWrappedIdCol(us, ds, "Surgery", "demographicsSurgery");
        col16.setLabel("Surgical History");
        col16.setDescription("Calculates whether this animal has ever had any surgery or a surgery flagged as major");
        ds.addColumn(col16);

        ColumnInfo col19 = getWrappedIdCol(us, ds, "weightChange", "demographicsWeightChange");
        col19.setLabel("Weight Change");
        col19.setDescription("This calculates the percent change over the past 30, 90 or 180 days relative to the most recent weight");
        ds.addColumn(col19);

        ColumnInfo col20 = getWrappedIdCol(us, ds, "MostRecentWeight", "demographicsMostRecentWeight");
        col20.setLabel("Weight - Current");
        col20.setDescription("This calculates the most recent weight for the animal, based on the weight table");
        ds.addColumn(col20);

        ColumnInfo col8 = getWrappedIdCol(us, ds, "CageClass", "demographicsCageClass");
        col8.setLabel("Required Case Size");
        col8.setDescription("Calculates the cage size necessary for this animal, based on weight");
        ds.addColumn(col8);

        ColumnInfo col21 = getWrappedIdCol(us, ds, "activeAnimalGroups", "demographicsActiveAnimalGroups");
        col21.setLabel("Animal Groups - Active");
        col21.setDescription("Displays the animal groups to which this animal currently belongs");
        ds.addColumn(col21);

        ColumnInfo col22 = getWrappedIdCol(us, ds, "historicAnimalGroups", "demographicsAnimalGroups");
        col22.setLabel("Animal Groups - Historic");
        col22.setDescription("Displays all animal groups to which this animal has ever belonged");
        ds.addColumn(col22);

        if (ds.getColumn("animalGroupsPivoted") == null)
        {
            UserSchema ehrSchema = getUserSchema(ds, EHRSchema.EHR_SCHEMANAME);
            if (ehrSchema != null)
            {
                ColumnInfo agPivotCol = getWrappedIdCol(ehrSchema, ds, "animalGroupsPivoted", "animalGroupsPivoted");
                agPivotCol.setLabel("Active Group Summary");
                agPivotCol.setHidden(true);
                agPivotCol.setDescription("Displays the active groups for each animal");
                ds.addColumn(agPivotCol);
            }
        }

        ColumnInfo id = ds.getColumn(ID_COL);
        if (id != null)
        {
            id.setURL(DetailsURL.fromString("/ehr/participantView.view?participantId=${Id}"));
        }
        ds.setDetailsURL(DetailsURL.fromString("/ehr/participantView.view?participantId=${Id}"));
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

    private void customizeHousing(AbstractTableInfo ti)
    {
        if (ti.getColumn("previousLocation") == null)
        {
            UserSchema us = getStudyUserSchema(ti);
            if (us != null)
            {
                ColumnInfo lsidCol = ti.getColumn("lsid");
                ColumnInfo col = ti.addColumn(new WrappedColumn(lsidCol, "previousLocation"));
                col.setLabel("Previous Location");
                col.setUserEditable(false);
                col.setIsUnselectable(true);
                col.setFk(new QueryForeignKey(us, "housingPreviousLocation", "lsid", "location"));
            }
        }
    }

    private void customizeSNOMED(AbstractTableInfo table)
    {
        doSharedCustomization(table);

        String codeAndMeaning = "codeAndMeaning";
        if (table.getColumn(codeAndMeaning) == null)
        {
            String chr = table.getSqlDialect().isPostgreSQL() ? "chr" : "char";
            SQLFragment sql = new SQLFragment(table.getSqlDialect().concatenate(ExprColumn.STR_TABLE_ALIAS + ".code", chr + "(9)", ExprColumn.STR_TABLE_ALIAS + ".meaning"));
            ExprColumn col = new ExprColumn(table, codeAndMeaning, sql, JdbcType.VARCHAR, table.getColumn("code"), table.getColumn("meaning"));
            col.setLabel("Code and Meaning");
            table.addColumn(col);
        }
    }

    private void customizeSNOMEDTags(AbstractTableInfo table)
    {
        doSharedCustomization(table);

        String codeAndMeaning = "codeWithSort";
        if (table.getColumn(codeAndMeaning) == null)
        {
            SQLFragment sql = new SQLFragment("(" + table.getSqlDialect().concatenate("CAST(" + ExprColumn.STR_TABLE_ALIAS + ".sort as varchar)", "': '", ExprColumn.STR_TABLE_ALIAS + ".code") + ")");
            ExprColumn col = new ExprColumn(table, codeAndMeaning, sql, JdbcType.VARCHAR, table.getColumn("code"), table.getColumn("sort"));
            col.setLabel("Code(s)");
            table.addColumn(col);
        }
    }

    private void customizeAnimalGroupMembers(AbstractTableInfo table)
    {
        doSharedCustomization(table);
        addIsActiveCol(table);
    }

    private void customizeAnimalGroups(AbstractTableInfo table)
    {
        doSharedCustomization(table);

        String name = "totalAnimals";
        if (table.getColumn(name) == null)
        {
            SQLFragment sql = new SQLFragment("(select count(distinct g.id) as total from ehr.animal_group_members g where g.groupId = " + ExprColumn.STR_TABLE_ALIAS + ".rowid AND (g.date <= {fn now()} AND (g.enddate IS NULL or CAST(g.enddate as date) > {fn curdate()})))");
            ExprColumn totalCol = new ExprColumn(table, name, sql, JdbcType.INTEGER, table.getColumn("rowid"));
            totalCol.setLabel("Total Animals");
            totalCol.setURL(DetailsURL.fromString("/query/executeQuery.view?schemaName=ehr&query.queryName=animal_group_members&query.groupId~eq=${rowid}&query.isActive~eq=true"));
            table.addColumn(totalCol);
        }
    }

    private void customizeProtocolTable(AbstractTableInfo table)
    {
        doSharedCustomization(table);

        if (table.getColumn("activeAnimals") == null)
        {
            UserSchema us = getUserSchema(table, "ehr");
            if (us != null)
            {
                ColumnInfo protocolCol = table.getColumn("protocol");
                ColumnInfo col = table.addColumn(new WrappedColumn(protocolCol, "activeAnimals"));
                col.setLabel("Animals Actively Assigned");
                col.setUserEditable(false);
                col.setIsUnselectable(true);
                col.setFk(new QueryForeignKey(us, "protocolActiveAnimals", "protocol", "protocol"));
            }
        }

        String name = "displayName";
        if (table.getColumn(name) == null)
        {
            SQLFragment sql = new SQLFragment("COALESCE(" + ExprColumn.STR_TABLE_ALIAS + ".external_id, " + ExprColumn.STR_TABLE_ALIAS + ".protocol)");
            ExprColumn displayCol = new ExprColumn(table, name, sql, JdbcType.VARCHAR, table.getColumn("external_id"), table.getColumn("protocol"));
            displayCol.setLabel("Display Name");
            displayCol.setURL(DetailsURL.fromString("/ehr/protocolDetails.view?key=${protocol}"));
            table.addColumn(displayCol);

            table.setTitleColumn(name);
        }
    }

    private void customizeProjectTable(AbstractTableInfo table)
    {
        doSharedCustomization(table);
        table.setTitleColumn("project");

        UserSchema us = getUserSchema(table, "ehr");
        if (us != null)
        {
            ColumnInfo projectCol = table.getColumn("project");
            if (table.getColumn("activeAssignments") == null)
            {
                ColumnInfo col = table.addColumn(new WrappedColumn(projectCol, "activeAssignments"));
                col.setLabel("Animals Actively Assigned");
                col.setUserEditable(false);
                col.setIsUnselectable(true);
                col.setFk(new QueryForeignKey(us, "projectTotalActivelyAssigned", "project", "project"));
            }

            if (table.getColumn("activelyAssignedBySpecies") == null)
            {
                ColumnInfo col2 = table.addColumn(new WrappedColumn(projectCol, "activelyAssignedBySpecies"));
                col2.setLabel("Animals Actively Assigned, By Species");
                col2.setUserEditable(false);
                col2.setIsUnselectable(true);
                col2.setFk(new QueryForeignKey(us, "projectTotalActivelyAssignedBySpecies", "project", "project"));
            }

            String name = "displayName";
            if (table.getColumn(name) == null)
            {
                SQLFragment sql = new SQLFragment("COALESCE(" + ExprColumn.STR_TABLE_ALIAS + ".name, CAST(" + ExprColumn.STR_TABLE_ALIAS + ".project AS varchar))");
                ExprColumn displayCol = new ExprColumn(table, name, sql, JdbcType.VARCHAR, table.getColumn("name"), table.getColumn("project"));
                displayCol.setLabel("Display Name");
                table.addColumn(displayCol);

                table.setTitleColumn(name);
            }
        }

        String name = "displayName";
        if (table.getColumn(name) == null)
        {
            SQLFragment sql = new SQLFragment("COALESCE(" + ExprColumn.STR_TABLE_ALIAS + ".name, " + "CAST(" + ExprColumn.STR_TABLE_ALIAS + ".project AS varchar))");
            ExprColumn displayCol = new ExprColumn(table, name, sql, JdbcType.VARCHAR, table.getColumn("name"), table.getColumn("project"));
            displayCol.setLabel("Display Name");
            table.addColumn(displayCol);

            table.setTitleColumn(name);
        }
    }

    private boolean hasTable (AbstractTableInfo ti, String schemaName, String queryName)
    {
        UserSchema us = getUserSchema(ti, schemaName);
        if (us == null)
            return false;

        return us.getTableNames().contains(queryName);
    }

    //note: these columns should both be date/time
    private void appendHousingAtTimeCol(final UserSchema us, final AbstractTableInfo ds, final String dateColName)
    {
        if (!hasTable(ds, "study", "Housing"))
            return;

        String name = "housingAtTime";
        if (ds.getColumn(name) != null)
            return;

        final ColumnInfo pkCol = getPkCol(ds);
        if (pkCol == null)
            return;

        ColumnInfo dateCol = ds.getColumn(dateColName);
        if (dateCol == null)
            return;

        WrappedColumn col = new WrappedColumn(pkCol, name);
        col.setLabel("Housing At Time");
        col.setReadOnly(true);
        col.setIsUnselectable(true);
        col.setUserEditable(false);

        final boolean hasLookup = hasAnimalLookup(ds);

        col.setFk(new LookupForeignKey(){
            public TableInfo getLookupTableInfo()
            {
                String name = ds.getName() + "_housingAtTime";
                QueryDefinition qd = QueryService.get().createQueryDef(us.getUser(), us.getContainer(), us, name);
                qd.setSql("SELECT\n" +
                    "sd." + pkCol.getSelectName() + ",\n" +
                    "cast((\n" +
                    "  SELECT group_concat(DISTINCT h.room, chr(10)) as room FROM study.Housing h\n" +
                    "  WHERE sd.id = h.id AND h.date <= sd." + dateColName + " AND (sd." + dateColName + " < h.enddateTimeCoalesced" + (hasLookup ? " OR d.death = h.enddateTimeCoalesced" : "") + ")\n" +
                    "  AND h.qcstate.publicdata = true\n" +
                    ") as varchar) as RoomAtTime,\n" +
                    "cast((\n" +
                    "  SELECT group_concat(DISTINCT h.cage, chr(10)) as cage FROM study.Housing h\n" +
                    "  WHERE sd.id = h.id AND h.date <= sd." + dateColName + " AND (sd." + dateColName + " < h.enddateTimeCoalesced" + (hasLookup ? " OR d.death = h.enddateTimeCoalesced" : "") + ")\n" +
                    "  AND h.qcstate.publicdata = true\n" +
                    ") as varchar) as CageAtTime,\n" +
                    "FROM \"" + ds.getPublicSchemaName() + "\".\"" + ds.getName() + "\" sd" +
                    (hasLookup ? " LEFT JOIN study.demographics d ON (d.id = sd.id)\n" : ""));
                qd.setIsTemporary(true);

                List<QueryException> errors = new ArrayList<>();
                TableInfo ti = qd.getTable(errors, true);
                if (errors.size() > 0)
                {
                    for (QueryException e : errors)
                    {
                        _log.error(e.getMessage(), e);
                    }
                }

                ColumnInfo roomAtTime = ti.getColumn("RoomAtTime");
                roomAtTime.setFk(new QueryForeignKey(getUserSchema(ds, "ehr_lookups"), "rooms", "room", "room"));

                ti.getColumn(pkCol.getSelectName()).setHidden(true);
                ti.getColumn(pkCol.getSelectName()).setKeyField(true);

                return ti;
            }
        });

        ds.addColumn(col);
    }

    private ColumnInfo getPkCol(TableInfo ti)
    {
        List<ColumnInfo> pks = ti.getPkColumns();
        return (pks.size() != 1) ? null : pks.get(0);
    }

    private boolean hasAnimalLookup(AbstractTableInfo ti)
    {
        ColumnInfo idCol = ti.getColumn("Id");
        //TODO: !idCol.getFk().getLookupSchemaName().equalsIgnoreCase("study") ||
        if (idCol == null || idCol.getFk() == null || !idCol.getFk().getLookupTableName().equalsIgnoreCase("animal"))
            return false;

        return true;
    }

    private void appendSurvivorshipCol(final UserSchema us, final AbstractTableInfo ds)
    {
        String name = "survivorship";
        if (ds.getColumn(name) != null)
            return;

        final ColumnInfo pkCol = getPkCol(ds);
        if (pkCol == null)
            return;

        if (!hasAnimalLookup(ds))
            return;

        ColumnInfo dateCol = ds.getColumn("date");
        if (dateCol == null)
            return;

        final String dateColName = dateCol.getSelectName();

        WrappedColumn col = new WrappedColumn(pkCol, name);
        col.setLabel("Survivorship");
        col.setReadOnly(true);
        col.setIsUnselectable(true);
        col.setUserEditable(false);
        col.setFk(new LookupForeignKey(){
            public TableInfo getLookupTableInfo()
            {
                String name = ds.getName() + "_survivorship";
                QueryDefinition qd = QueryService.get().createQueryDef(us.getUser(), us.getContainer(), us, name);
                qd.setSql("SELECT\n" +
                    "c." + pkCol.getSelectName() + ",\n" +
                    "CASE\n" +
                    "WHEN c." + dateColName + " is null\n" +
                    "  THEN null\n" +
                    "ELSE\n" +
                    //"  timestampdiff('SQL_TSI_YEAR', c.dateOnly, coalesce(c.id.dataset.demographics.death, curdate()))\n" +
                    "  age(c.dateOnly, coalesce(c.id.dataset.demographics.death, curdate()))\n" +
                    "END as survivorshipInYears,\n" +
                    "CASE\n" +
                    "WHEN c." + dateColName + " is null\n" +
                    "  THEN null\n" +
                    "ELSE\n" +
                    "  timestampdiff('SQL_TSI_DAY', c.dateOnly, coalesce(c.id.dataset.demographics.death, curdate()))\n" +
                    "END as survivorshipInDays,\n" +
                    "\n" +
                    "FROM \"" + ds.getPublicSchemaName() + "\".\"" + ds.getName() + "\" c");
                qd.setIsTemporary(true);

                List<QueryException> errors = new ArrayList<>();
                TableInfo ti = qd.getTable(errors, true);
                if (errors.size() > 0)
                {
                    for (QueryException e : errors)
                    {
                        _log.error(e.getMessage(), e);
                    }
                }

                ti.getColumn(pkCol.getSelectName()).setHidden(true);
                ti.getColumn(pkCol.getSelectName()).setKeyField(true);

                return ti;
            }
        });

        ds.addColumn(col);
    }

    private void appendTimeSinceCol(final UserSchema us, final AbstractTableInfo ti)
    {
        //TODO: make PG compatible
        if (ti.getSqlDialect().isPostgreSQL())
            return;

        String name = "daysElapsed";
        if (ti.getColumn(name) == null)
        {
            ColumnInfo date = ti.getColumn("date");
            SQLFragment sql = new SQLFragment("(CASE WHEN " + ExprColumn.STR_TABLE_ALIAS + "." + date.getSelectName() + " <= {fn now()} THEN (" + ti.getSqlDialect().getDateDiff(Calendar.DATE, "{fn curdate()}", "CAST(" + ExprColumn.STR_TABLE_ALIAS + "." + date.getSelectName() + " AS DATE)") + " + 1) ELSE null END)");
            ExprColumn col = new ExprColumn(ti, name, sql, JdbcType.INTEGER, date);
            col.setCalculated(true);
            col.setUserEditable(false);
            col.setHidden(true);
            col.setLabel("Days Elapsed");
            ti.addColumn(col);
        }
    }

    private void appendAgeAtTimeCol(final UserSchema us, final AbstractTableInfo ds, final String dateColName)
    {
        String name = "ageAtTime";
        if (ds.getColumn(name) != null)
            return;

        final ColumnInfo pkCol = getPkCol(ds);
        if (pkCol == null)
            return;

        if (ds.getColumn(dateColName) == null)
            return;

        if (!hasAnimalLookup(ds))
            return;

        WrappedColumn col = new WrappedColumn(pkCol, name);
        col.setLabel("Age At The Time");
        col.setReadOnly(true);
        col.setIsUnselectable(true);
        col.setUserEditable(false);
        col.setFk(new LookupForeignKey(){
            public TableInfo getLookupTableInfo()
            {
                String name = ds.getName() + "_ageAtTime";
                QueryDefinition qd = QueryService.get().createQueryDef(us.getUser(), us.getContainer(), us, name);
                //NOTE: do not need to account for QCstate b/c study.demographics only allows 1 row per subject
                qd.setSql("SELECT\n" +
                    "c." + pkCol.getSelectName() + ",\n" +
                    "\n" +
                    "CAST(\n" +
                    "CASE\n" +
                    "WHEN c.id.dataset.demographics.birth is null or c." + dateColName + " is null\n" +
                    "  THEN null\n" +
                    "ELSE\n" +
                    "  ROUND(CONVERT(age_in_months(c.id.dataset.demographics.birth, COALESCE(c.id.dataset.demographics.death, c." + dateColName + ")), DOUBLE) / 12, 1)\n" +
                    "END AS float) as AgeAtTime,\n" +
                    "\n" +
                    "CAST(\n" +
                    "CASE\n" +
                    "WHEN c.id.dataset.demographics.birth is null or c." + dateColName + " is null\n" +
                    "  THEN null\n" +
                    "ELSE\n" +
                    "  floor(age(c.id.dataset.demographics.birth, COALESCE(c.id.dataset.demographics.death, c." + dateColName + ")))\n" +
                    "END AS float) as AgeAtTimeYearsRounded,\n" +
                    "\n" +
                    "CAST(\n" +
                    "CASE\n" +
                    "WHEN c.id.dataset.demographics.birth is null or c." + dateColName + " is null\n" +
                    "  THEN null\n" +
                    "ELSE\n" +
                    "  CONVERT(age_in_months(c.id.dataset.demographics.birth, COALESCE(c.id.dataset.demographics.death, c." + dateColName + ")), INTEGER)\n" +
                    "END AS float) as AgeAtTimeMonths,\n" +
                    "\n" +
                    "FROM \"" + ds.getPublicSchemaName() + "\".\"" + ds.getName() + "\" c");
                qd.setIsTemporary(true);

                List<QueryException> errors = new ArrayList<>();
                TableInfo ti = qd.getTable(errors, true);
                if (errors.size() > 0)
                {
                    for (QueryException e : errors)
                    {
                        _log.error(e.getMessage(), e);
                    }
                }

                ti.getColumn(pkCol.getSelectName()).setHidden(true);
                ti.getColumn(pkCol.getSelectName()).setKeyField(true);

                return ti;
            }
        });

        ds.addColumn(col);
    }

    public UserSchema getStudyUserSchema(AbstractTableInfo ds)
    {
        return getUserSchema(ds, "study");
    }

    public UserSchema getUserSchema(AbstractTableInfo ds, String name)
    {
        if (_userSchemas.containsKey(name))
            return _userSchemas.get(name);

        UserSchema us = ds.getUserSchema();
        if (us != null)
        {
            _userSchemas.put(us.getName(), us);

            if (name.equalsIgnoreCase(us.getName()))
                return us;

            UserSchema us2 = QueryService.get().getUserSchema(us.getUser(), us.getContainer(), name);
            if (us2 != null)
                _userSchemas.put(name, us2);

            return us2;
        }

        return null;
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

    private void appendDuration(AbstractTableInfo ti)
    {
        ColumnInfo date = ti.getColumn("date");
        ColumnInfo enddate = ti.getColumn("enddate");
        if (date != null && enddate != null && ti.getColumn("duration") == null)
        {
            String type = ti.getSqlDialect().isPostgreSQL() ? "timestamp" : "date";
            SQLFragment sql = new SQLFragment("(" + ti.getSqlDialect().getDateDiff(Calendar.DATE, "(cast(COALESCE(CAST(" + ExprColumn.STR_TABLE_ALIAS + "." + enddate.getSelectName() + " as date), {fn curdate()}) as " + type + ")", "CAST(" + ExprColumn.STR_TABLE_ALIAS + "." + date.getSelectName() + " AS date)") + ") + 1)");
            ExprColumn col = new ExprColumn(ti, "duration", sql, JdbcType.INTEGER);
            col.setCalculated(true);
            col.setUserEditable(false);
            col.setHidden(true);
            col.setLabel("Duration (Days)");
            ti.addColumn(col);
        }

    }

    private void appendEnddate(AbstractTableInfo ti)
    {
        ColumnInfo enddate = ti.getColumn("enddate");
        if (enddate != null && ti.getColumn("enddateCoalesced") == null)
        {
            SQLFragment sql = new SQLFragment("CAST(COALESCE(" + ExprColumn.STR_TABLE_ALIAS + "." + enddate.getSelectName() + ", {fn curdate()}) as date)");
            ExprColumn col = new ExprColumn(ti, "enddateCoalesced", sql, JdbcType.DATE);
            col.setCalculated(true);
            col.setUserEditable(false);
            col.setHidden(true);
            col.setLabel("Enddate, Coalesced");

            if (enddate.getFormat() != null)
                col.setFormat(enddate.getFormat());

            ti.addColumn(col);
        }

        if (enddate != null && ti.getColumn("enddatetimeCoalesced") == null)
        {
            SQLFragment sql = new SQLFragment("COALESCE(" + ExprColumn.STR_TABLE_ALIAS + "." + enddate.getSelectName() + ", {fn now()})");
            ExprColumn col = new ExprColumn(ti, "enddatetimeCoalesced", sql, JdbcType.DATE);
            col.setCalculated(true);
            col.setUserEditable(false);
            col.setHidden(true);
            col.setLabel("End Time, Coalesced");
            col.setFormat("yyyy-MM-dd HH:mm");

            ti.addColumn(col);
        }
    }

    private void appendDateOnly(AbstractTableInfo ti)
    {
        ColumnInfo date = ti.getColumn("date");
        if (date != null && ti.getColumn("dateOnly") == null)
        {
            SQLFragment sql = new SQLFragment(ti.getSqlDialect().getDateTimeToDateCast(ExprColumn.STR_TABLE_ALIAS + "." + date.getSelectName()));
            ExprColumn col = new ExprColumn(ti, "dateOnly", sql, JdbcType.DATE);
            col.setCalculated(true);
            col.setUserEditable(false);
            col.setHidden(true);
            col.setLabel("Date Only");
            ti.addColumn(col);
        }
    }

    public boolean isAddLinkDisablers()
    {
        return _addLinkDisablers;
    }

    public void setAddLinkDisablers(boolean addLinkDisablers)
    {
        _addLinkDisablers = addLinkDisablers;
    }
}
