package org.labkey.test.tests;

import org.jetbrains.annotations.NotNull;
import org.labkey.remoteapi.CommandException;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.query.InsertRowsCommand;
import org.labkey.remoteapi.query.TruncateTableCommand;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.TestFileUtils;
import org.labkey.test.WebTestHelper;
import org.labkey.test.tests.ehr.AbstractEHRTest;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class EHRAppTestSetupHelper
{
    private final BaseWebDriverTest _test;
    private final String _projectName;
    private final String _folderName;
    private final String _modulePath;
    private final String _containerPath;

    public EHRAppTestSetupHelper(BaseWebDriverTest test, String projectName, String folderName, String modulePath, String containerPath)
    {
        _test = test;
        _projectName = projectName;
        _folderName = folderName;
        _modulePath = modulePath;
        _containerPath = containerPath;
    }

    public EHRAppTestSetupHelper(BaseWebDriverTest test, String projectName)
    {
        this(test, projectName, null, null, null);
    }

    public void populateInitialData(AbstractEHRTest test) throws Exception
    {
        populateInitialDataForSchema("ehr_lookups", Arrays.asList("cage"));

        _test.beginAt(WebTestHelper.buildURL("ehr", _containerPath, "populateInitialData"));
        test.repopulate("Reports");
    }

    private void populateInitialDataForSchema(String schemaName, @NotNull List<String> tablesToSkip) throws Exception
    {
        Connection connection = _test.createDefaultConnection();
        String relativePath = "EHR_App/" + schemaName;
        File tsvs = TestFileUtils.getSampleData(relativePath);
        File[] files = tsvs.listFiles();
        for (File tsv : Objects.requireNonNull(files))
        {
            String queryName = tsv.getName().replace(".tsv", "");
            if (tablesToSkip.contains(queryName))
                continue;

            populateInitialDataForQuery(connection, relativePath, schemaName, queryName);
        }
    }

    private void populateInitialDataForQuery(Connection connection, String relativePath, String schemaName, String queryName) throws IOException, CommandException
    {
        truncateTable(connection, schemaName, queryName);

        _test.log("Loading tsv data: " + schemaName + "." + queryName);
        File tsvFile = TestFileUtils.getSampleData(relativePath + "/" + queryName + ".tsv");
        insertTsvData(connection, schemaName, queryName, tsvFile);
    }

    private void insertTsvData(Connection connection, String schemaName, String queryName, File tsvFile) throws IOException, CommandException
    {
        InsertRowsCommand command = new InsertRowsCommand(schemaName, queryName);
        List<Map<String, Object>> tsv = _test.loadTsv(tsvFile);
        command.setRows(tsv);
        command.execute(connection, _folderName != null ? _projectName + "/" + _folderName : _projectName);
    }

    private void truncateTable(Connection connection, String schemaName, String queryName) throws IOException, CommandException
    {
        _test.log("Truncating table: " + schemaName + "." + queryName);
        TruncateTableCommand command = new TruncateTableCommand(schemaName, queryName);
        command.execute(connection, _folderName != null ? _projectName + "/" + _folderName : _projectName);
    }

    public void populateRoomRecords() throws Exception
    {
        // now that QC States have been defined, we can load the cage.tsv file
        Connection connection = _test.createDefaultConnection();
        populateInitialDataForQuery(connection, "EHR_App/ehr_lookups", "ehr_lookups", "cage");
    }

}
