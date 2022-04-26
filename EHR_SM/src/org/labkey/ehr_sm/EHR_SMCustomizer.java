package org.labkey.ehr_sm;

import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.ContainerService;
import org.labkey.api.data.MutableColumnInfo;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ldk.table.AbstractTableCustomizer;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.query.AliasedColumn;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryForeignKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;

import java.util.Arrays;

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
        MutableColumnInfo ancestors = (MutableColumnInfo) ti.getColumn("Ancestors");
        String ehrContainerName = getEHRContainer(ti.getUserSchema().getContainer());
        if (null != ancestors && null != ehrContainerName)
        {

            FieldKey idFk = FieldKey.fromParts("Ancestors", "Registry and Sources", "Animal", "Id");
            ColumnInfo idCol = QueryService.get().getColumns(ti, Arrays.asList(idFk)).get(idFk);

            // Get received sample date column for age at sample time calculation. Default to created if not set
            PropertyManager.PropertyMap props = PropertyManager.getProperties(ti.getUserSchema().getContainer(), EHR_SMManager.ANIMAL_SAMPLE_PROP_SET_NAME);
            String receivedDateCol = props.get(EHR_SMManager.ANIMAL_SAMPLE_RECEIVED_PROP);
            if (null == receivedDateCol)
                receivedDateCol = "Created";

            FieldKey receivedKey = FieldKey.fromParts(receivedDateCol);
            ColumnInfo receivedCol = QueryService.get().getColumns(ti, Arrays.asList(receivedKey)).get(receivedKey);

            Container ehrContainer = ContainerService.get().getForPath(ehrContainerName);
            TableInfo ehrAgeTable = QueryService.get().getUserSchema(ti.getUserSchema().getUser(), ehrContainer, "study").getTable("");


            FieldKey ageAtSampleKey = FieldKey.fromParts("ageAtSample");
            var aliasCol = new AliasedColumn(idCol.getParentTable(), ageAtSampleKey, idCol, false);
            aliasCol.setFk(QueryForeignKey.from(ehrAgeTable.getUserSchema(), ehrAgeTable.getContainerFilter()));


//                TableInfo demographics = QueryService.get().getUserSchema(ti.getUserSchema().getUser(), ContainerService.get().getForPath(ehrContainerName), "study").getTable("demographics");
//
//                // Age at sample time column
//                if (null != receivedCol && null != demographics)
//                {
//                    SQLFragment ageSql = getAgeSql(demographics, ti.getName(), idCol, receivedCol);
//                    if (null != ageSql)
//                    {
//                        FieldKey ageFk = FieldKey.fromParts("ageAtSample");
//                        defaultCols.add(ageFk);
//                        ExprColumn ageAtSampleCol = new ExprColumn(ti, ageFk, ageSql, JdbcType.DECIMAL, idCol, receivedCol);
//                        ageAtSampleCol.setLabel("Age At Sample (yrs)");
//                        ti.addColumn(ageAtSampleCol);
//                    }
//                }
//            }
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
            // This is a hack to prevent manually entering values, will be ETLed in instead. There might be nothing wrong
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

