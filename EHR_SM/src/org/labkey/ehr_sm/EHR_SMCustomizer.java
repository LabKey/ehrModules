package org.labkey.ehr_sm;

import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.ContainerService;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.DisplayColumn;
import org.labkey.api.data.DisplayColumnFactory;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.MutableColumnInfo;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.RenderContext;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ldk.table.AbstractTableCustomizer;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.query.AliasedColumn;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryForeignKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Set;

public class EHR_SMCustomizer extends AbstractTableCustomizer
{
    @Override
    public void customize(TableInfo tableInfo)
    {
        if (tableInfo instanceof AbstractTableInfo && "Animal".equalsIgnoreCase(tableInfo.getName()))
        {
            customizeAnimal((AbstractTableInfo) tableInfo);
            return;
        }

        UserSchema us = tableInfo.getUserSchema();
        if (null != us)
        {
            PropertyManager.PropertyMap props = PropertyManager.getProperties(us.getContainer(), EHR_SMManager.ANIMAL_SAMPLE_PROP_SET_NAME);

            if (tableInfo instanceof AbstractTableInfo && props.containsKey(tableInfo.getName()))
            {
                customizeSamples((AbstractTableInfo) tableInfo);
                return;
            }
        }
    }

    private SQLFragment getAgeSql(TableInfo demographics, String alias, ColumnInfo idCol, ColumnInfo receivedCol)
    {
        SQLFragment ageSql = null;
        if (demographics.getSqlDialect().isSqlServer())
        {
            ageSql = new SQLFragment("(SELECT CONVERT(DECIMAL(10,2), DATEDIFF(month, dem.birth, ").append(receivedCol.getValueSql(alias));
            ageSql.append(") / 12.0) as ageAtSample FROM ").append(demographics, "dem");
            ageSql.append(" WHERE dem.ParticipantId = ").append(idCol.getValueSql(alias)).append(")");
        }
        else if (demographics.getSqlDialect().isPostgreSQL())
        {
            ageSql = new SQLFragment("(SELECT ROUND(CAST((EXTRACT(YEAR FROM age) + EXTRACT(MONTH FROM age) / 12) AS NUMERIC), 2) AS ageAtSample ");
            ageSql.append("FROM age(").append(receivedCol.getValueSql(alias)).append(", ");
            ageSql.append("(SELECT dem.birth FROM ").append(demographics, "dem");
            ageSql.append(" WHERE dem.ParticipantId = ").append(idCol.getValueSql(alias)).append(")) AS t(age))");
        }

        return ageSql;
    }

    private void customizeSamples(AbstractTableInfo ti)
    {
        String ehrContainerName = getEHRContainer(Objects.requireNonNull(ti.getUserSchema()).getContainer());
        if (null == ehrContainerName)
            return;

        FieldKey idFk = FieldKey.fromParts("Ancestors", "RegistryAndSources", "Animal", "Id");
        ColumnInfo idCol = QueryService.get().getColumns(ti, Arrays.asList(idFk)).get(idFk);

        if (null != idCol)
        {
            // Add to default columns
            List<FieldKey> defaultCols = new ArrayList<>(ti.getDefaultVisibleColumns());

            FieldKey animalRecordFk = FieldKey.fromParts("AnimalRecord");
            var aliasCol = new AliasedColumn(idCol.getParentTable(), animalRecordFk, idCol, false);
            aliasCol.setShownInInsertView(false);
            aliasCol.setShownInUpdateView(false);

            defaultCols.add(animalRecordFk);
            defaultCols.add(FieldKey.fromParts("AnimalRecord", "Demographics", "Species"));
            defaultCols.add(FieldKey.fromParts("AnimalRecord", "Demographics", "Gender"));
            ti.setDefaultVisibleColumns(defaultCols);
            ti.addColumn(aliasCol);

            // Get received sample date column for age at sample time calculation. Default to created if not set
            PropertyManager.PropertyMap props = PropertyManager.getProperties(ti.getUserSchema().getContainer(), EHR_SMManager.ANIMAL_SAMPLE_PROP_SET_NAME);
            String receivedDateCol = props.get(EHR_SMManager.ANIMAL_SAMPLE_RECEIVED_PROP);
            if (null == receivedDateCol)
                receivedDateCol = "Created";

            ColumnInfo receivedCol = ti.getColumn(receivedDateCol);
            ((MutableColumnInfo) receivedCol).setRequired(true);
            TableInfo demographics = QueryService.get().getUserSchema(ti.getUserSchema().getUser(), ContainerService.get().getForPath(ehrContainerName), "study").getTable("demographics");

            // Age at sample time column
            if (null != receivedCol && null != demographics)
            {
                SQLFragment ageSql = getAgeSql(demographics, ti.getName(), idCol, receivedCol);
                if (null != ageSql)
                {
                    FieldKey ageFk = FieldKey.fromParts("ageAtSample");
                    defaultCols.add(ageFk);
                    ExprColumn ageAtSampleCol = new ExprColumn(ti, ageFk, ageSql, JdbcType.DECIMAL, idCol, receivedCol);
                    ageAtSampleCol.setLabel("Age At Sample (yrs)");

                    // Need this display column factory just to ensure the "received column" is available in the underlying
                    // samples query if it is not in the displayed view
                    ageAtSampleCol.setDisplayColumnFactory(new DisplayColumnFactory()
                    {
                        @Override
                        public DisplayColumn createRenderer(ColumnInfo colInfo)
                        {
                            return new DataColumn(colInfo)
                            {
                                @Override
                                public void addQueryFieldKeys(Set<FieldKey> keys)
                                {
                                    super.addQueryFieldKeys(keys);
                                    keys.add(receivedCol.getFieldKey());
                                }
                            };
                        }
                    });
                    ti.addColumn(ageAtSampleCol);
                }
            }
        }
    }

    private String getEHRContainer(Container c)
    {
        Module ehr = ModuleLoader.getInstance().getModule("ehr");
        ModuleProperty mp = ehr.getModuleProperties().get("EHRStudyContainer");
        if (mp == null || mp.getEffectiveValue(c) == null)
        {
            _log.warn("Attempted to access EHR containerPath Module Property, which has not been set for the root container", new Exception());
            return null;
        }

        return mp.getEffectiveValue(c);
    }

    private void customizeAnimal(AbstractTableInfo ti)
    {
        MutableColumnInfo idCol = (MutableColumnInfo) ti.getColumn("Id");
        if (null != idCol)
        {
            // Prevent manually entering values that will be ETLed in instead. There might be nothing wrong
            // with manually entering values and having ETL merge on Id, but cross container fk is not resolving so just
            // don't allow for now.
            idCol.setRequired(true);
            idCol.setShownInUpdateView(false);
            idCol.setShownInInsertView(false);

            UserSchema us = ti.getUserSchema();
            if (null != us)
            {
                String ehrContainerName = getEHRContainer(us.getContainer());
                if (null != ehrContainerName)
                {
                    Container ehrContainer = ContainerService.get().getForPath(ehrContainerName);
                    if (null != ehrContainer)
                    {
                        ContainerFilter ehrCF = new ContainerFilter.SimpleContainerFilterWithUser(ti.getUserSchema().getUser(), ehrContainer);
                        TableInfo animalTi = QueryService.get().getUserSchema(ti.getUserSchema().getUser(), ehrContainer, "study").getTable("Animal", ehrCF);
                        idCol.setFk(new QueryForeignKey(animalTi, "Id", "Id"));
                    }
                }
                else
                {
                    _log.warn("EHR container not found for sample animal Id lookup.");
                }
            }
        }
    }
}

