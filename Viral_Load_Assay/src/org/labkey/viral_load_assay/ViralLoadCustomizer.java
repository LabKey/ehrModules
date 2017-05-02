package org.labkey.viral_load_assay;

import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.TableCustomizer;
import org.labkey.api.data.TableInfo;
import org.labkey.api.exp.api.ExpProtocol;
import org.labkey.api.laboratory.LaboratoryService;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.study.assay.AssayProtocolSchema;
import org.labkey.api.study.assay.AssayProvider;
import org.labkey.api.study.assay.AssayService;

import java.util.List;

/**
 * Created by bimber on 4/12/2017.
 */
public class ViralLoadCustomizer implements TableCustomizer
{
    @Override
    public void customize(TableInfo tableInfo)
    {
        if (tableInfo instanceof AbstractTableInfo)
        {
            doCustomize((AbstractTableInfo)tableInfo);
        }
    }

    private void doCustomize(AbstractTableInfo ti)
    {
        ColumnInfo dateCol = null;
        ColumnInfo subjectCol = null;
        for (ColumnInfo ci : ti.getColumns())
        {
            if (LaboratoryService.PARTICIPANT_CONCEPT_URI.equals(ci.getConceptURI()))
            {
                subjectCol = ci;
            }
            else if (LaboratoryService.SAMPLEDATE_CONCEPT_URI.equals(ci.getConceptURI()))
            {
                dateCol = ci;
            }
        }

        if (dateCol != null && subjectCol != null)
        {
            appendVLCol(ti, subjectCol, dateCol);
        }

    }

    private void appendVLCol(AbstractTableInfo ti, ColumnInfo subjectCol, ColumnInfo dateCol)
    {
        Container target = ti.getUserSchema().getContainer().isWorkbookOrTab() ? ti.getUserSchema().getContainer().getParent() : ti.getUserSchema().getContainer();
        AssayProvider ap = AssayService.get().getProvider(Viral_Load_Manager.VL_ASSAY_PROVIDER_NAME);
        List<ExpProtocol> protocols = AssayService.get().getAssayProtocols(target, ap);
        if (protocols.size() == 1)
        {
            AssayProtocolSchema schema = ap.createProtocolSchema(ti.getUserSchema().getUser(), target, protocols.get(0), null);
            if (schema == null)
            {
                return;
            }

            TableInfo data = schema.createDataTable();
            String tableName = data.getDomain().getStorageTableName();

            String name = "viralLoad";
            if (ti.getColumn(name) == null)
            {
                SQLFragment sql = new SQLFragment("(SELECT avg(viralLoad) as expr FROM assayresult." + tableName + " t WHERE t.subjectId = " + ExprColumn.STR_TABLE_ALIAS + "." + subjectCol.getName() + " AND CAST(t.date AS DATE) = CAST(" + ExprColumn.STR_TABLE_ALIAS + "." + dateCol.getName() + " AS DATE))");
                ExprColumn newCol = new ExprColumn(ti, name, sql, JdbcType.DOUBLE, subjectCol, dateCol);
                newCol.setDescription("Displays the viral load from this timepoint, if present");
                newCol.setLabel("Viral Load (copies/mL)");
                ti.addColumn(newCol);
            }
        }
    }
}
