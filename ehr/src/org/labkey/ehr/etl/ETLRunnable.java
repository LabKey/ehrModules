/*
 * Copyright (c) 2010-2011 LabKey Corporation
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
package org.labkey.ehr.etl;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import org.apache.log4j.Logger;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.security.ValidEmail;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.HttpView;
import org.labkey.api.view.ViewContext;

import java.io.Closeable;
import java.io.File;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class ETLRunnable implements Runnable
{

    public final static String TIMESTAMP_PROPERTY_DOMAIN = "wnprc.ehr.etl.timestamp";
    public final static String CONFIG_PROPERTY_DOMAIN = "wnprc.ehr.etl.config";
    private final DateFormat dateFormat = DateFormat.getDateTimeInstance(DateFormat.SHORT, DateFormat.SHORT);
    private final Map<String, String> listQueries;
    private final Map<String, String> studyQueries;

    private final static Logger log = Logger.getLogger(ETLRunnable.class);
    private static final int UPSERT_BATCH_SIZE = 5000;
    private boolean shutdown;

    public ETLRunnable() throws IOException, SQLException, ValidEmail.InvalidEmailException
    {
        this.listQueries = loadQueries(getResource("lists").listFiles());
        this.studyQueries = loadQueries(getResource("datasets").listFiles());
    }

    @Override
    public void run()
    {
        User user;
        Container container;
        shutdown = false;

        try
        {
            user = UserManager.getUser(new ValidEmail(getConfigProperty("labkeyUser")));
            container = ContainerManager.getForPath(getConfigProperty("labkeyContainer"));
            if (null == user)
            {
                throw new BadConfigException("bad configuration: invalid labkey user");
            }
            if (null == container)
            {
                throw new BadConfigException("bad configuration: invalid labkey container");
            }
        }
        catch (ValidEmail.InvalidEmailException e)
        {
            log.error(e.getMessage(), e);
            return;
        }
        catch (BadConfigException e)
        {
           log.error(e.getMessage(), e);
           return;
        }


        int stackSize = -1;
        try
        {
            log.info("Begin incremental sync from external datasource.");

            // Push a fake ViewContext onto the HttpView stack
            stackSize = HttpView.getStackSize();
            ViewContext.getMockViewContext(user, container, new ActionURL("ehr", "fake.view", container), true);

            ETLAuditViewFactory.addAuditEntry(container, user, "START", "Starting EHR synchronization", 0, 0);

            for (String datasetName : studyQueries.keySet())
            {
                long lastTs = getLastTimestamp(datasetName);
                log.info(String.format("dataset %s last synced %s", datasetName, lastTs == 0 ? "never" : new Date(lastTs).toString()));
            }

            for (String listName : listQueries.keySet())
            {
                long lastTs = getLastTimestamp(listName);
                log.info(String.format("list %s last synced %s", listName, lastTs == 0 ? "never" : new Date(lastTs).toString()));
            }

            UserSchema listSchema = QueryService.get().getUserSchema(user, container, "lists");
            UserSchema studySchema = QueryService.get().getUserSchema(user, container, "study");

            int listErrors = merge(user, container, listQueries, listSchema);
            int datasetErrors = merge(user, container, studyQueries, studySchema);

            log.info("End incremental sync run.");

            ETLAuditViewFactory.addAuditEntry(container, user, "FINISH", "Finishing EHR synchronization", listErrors, datasetErrors);
        }
        catch (Throwable x)
        {
            // Depending on the configuration of the executor,
            // if run() throws anything future executions may all canceled.
            // But we'd rather catch unexpected exceptions and continue trying,
            // to smooth over any transient issues like the remote datasource
            // being temporarily unavailable.
            log.error("Fatal incremental sync error", x);
            ETLAuditViewFactory.addAuditEntry(container, user, "FATAL ERROR", "Fatal error during EHR synchronization", 0, 0);

        }
        finally
        {
            if (stackSize > -1)
                HttpView.resetStackSize(stackSize);
        }

    }

    /** @return count of collections that encountered errors */
    int merge(User user, Container container, Map<String, String> queries, UserSchema schema) throws BadConfigException
    {
        // run postgres ANALYZE if enabled.
        doDbAnalyze(schema.getDbSchema());

        DbScope scope = schema.getDbSchema().getScope();
        int errorCount = 0;

        for (Map.Entry<String, String> kv : queries.entrySet())
        {
            if (isShutdown())
            {
                return errorCount;
            }

            Connection originConnection = null;
            String targetTableName = null;
            String sql;
            PreparedStatement ps = null;
            ResultSet rs = null;

            try
            {
                targetTableName = kv.getKey();
                sql = kv.getValue();
                TableInfo targetTable = schema.getTable(targetTableName);

                if (targetTable == null)
                {
                    log.warn(targetTableName + " is not a known labkey study name, skipping the so-named sql query");
                    errorCount++;
                    continue;
                }

                // Are we starting with an empty collection?
                // Optimizations below if true.
                boolean isTargetEmpty = isEmpty(targetTable);

                originConnection = getOriginConnection();

                log.info("Preparing query " + targetTableName);
                ps = originConnection.prepareStatement(sql);
                // Hack for MySQL. If setFetchSize is not set, or is set to any value other than Integer.MIN_VALUE,
                // mysql driver will read the whole resultset into memory, potentially running out of heap.
                ps.setFetchSize(Integer.MIN_VALUE);
                // Each statement will have zero or more bind variables in it. Set them all to
                // the baseline timestamp date.
                int paramCount = ps.getParameterMetaData().getParameterCount();
                Timestamp fromDate = new Timestamp(getLastTimestamp(targetTableName));
                for (int i = 1; i <= paramCount; i++)
                {
                    ps.setTimestamp(i, fromDate);
                }

                // get deletes from the origin.
                Set<String> deletedIds = getDeletes(originConnection, targetTableName, getLastTimestamp(targetTableName));

                log.info("querying for " + targetTableName + " since " + new Date(fromDate.getTime()));

                int updates = 0;
                Long newBaselineTimestamp = getOriginDataSourceCurrentTime();
                boolean rollback = false;

                rs = ps.executeQuery();
                log.info("query " + targetTableName + " returned");

                QueryUpdateService updater = targetTable.getUpdateService();
                updater.setBulkLoad(true);
                Map<String, Object> extraContext = new HashMap<String, Object>();
                extraContext.put("dataSource", "etl");

                try
                {
                    scope.ensureTransaction();
                    // perform any deletes
                    if (!deletedIds.isEmpty())
                    {

                        ColumnInfo objid = targetTable.getColumn("objectid");
                        List<ColumnInfo> keys = targetTable.getPkColumns();
                        Map<String, SQLFragment> joins = new HashMap<String, SQLFragment>();
                        objid.declareJoins("t", joins);
                        // Some ehr records are transformed into multiple records en route to labkey. the multiple records have objectids that
                        // are constructed from the original objectid plus a suffix. If one of those original records gets deleted we only know the
                        // original objectid. So we need to find the child ones with a LIKE objectid% query. Which is really complicated.
                        SQLFragment like = new SQLFragment("SELECT ");
                        String comma = "";
                        for (ColumnInfo key : keys)
                        {
                            like.append(comma + " ");
                            like.append(key.getValueSql("t"));
                            like.append(" AS \"" + key.getName() + "\"");
                            comma = ",";
                        }
                        like.append(" FROM ");
                        like.append(targetTable.getFromSQL("t"));
                        if (!joins.isEmpty())
                            like.append(joins.values().iterator().next());
                        like.append(" WHERE ");

                        List<Map<String, Object>> deleteSelectors = new ArrayList<Map<String, Object>>();
                        SQLFragment likeWithIds = new SQLFragment(like.getSQL(), new ArrayList<Object>(like.getParams()));
                        int count = 0;
                        for (final String deletedId : deletedIds)
                        {
                            // Do this query in batches no larger than 100 to prevent from building up too many JDBC
                            // parameters
                            likeWithIds.add(deletedId);
                            if (count > 0)
                            {
                                likeWithIds.append(" OR ");
                            }
                            likeWithIds.append(objid.getValueSql("t") + " LIKE ? || '%' ");
                            if (count++ > 100)
                            {
                                deleteSelectors.addAll(Arrays.asList((Map<String, Object>[])Table.executeQuery(schema.getDbSchema(), likeWithIds, Map.class)));
                                // Reset the count and SQL
                                likeWithIds = new SQLFragment(like.getSQL(), new ArrayList<Object>(like.getParams()));
                                count = 0;
                            }
                        }
                        if (count > 0)
                        {
                            // Do the SELECT for any remaining ids
                            deleteSelectors.addAll(Arrays.asList((Map<String, Object>[])Table.executeQuery(schema.getDbSchema(), likeWithIds, Map.class)));
                        }

                        updater.deleteRows(user, container, deleteSelectors, extraContext);
                        log.info("deleted objectids " + deletedIds.toString());
                    }

                    List<Map<String, Object>> sourceRows = new ArrayList<Map<String, Object>>();
                    // accumulating batches of rows. would employ ResultSet.isDone to manage the last remainder
                    // batch but the MySQL jdbc driver doesn't support that method if it is a streaming result set.
                    boolean isDone = false;
                    while (!isDone)
                    {

                        if (isShutdown())
                        {
                            rollback = true;
                            return errorCount;
                        }

                        isDone = !rs.next();

                        if (!isDone)
                        {
                            sourceRows.add(mapResultSetRow(rs));
                        }
                        else
                        {
                            // avoid leaving the mysql statement open while
                            // we process the results.
                            close(rs);
                            rs = null;
                            close(ps);
                            close(originConnection);
                        }

                        if (sourceRows.size() == UPSERT_BATCH_SIZE || isDone)
                        {
                            if (!isTargetEmpty) {
                                updater.deleteRows(user, container, sourceRows, extraContext);
                            }
                            BatchValidationException errors = new BatchValidationException();
                            updater.insertRows(user, container, sourceRows, errors, extraContext);
                            if (errors.hasErrors())
                                throw errors;
                            updates += sourceRows.size();
                            log.info("Updated " + updates + " records in " + targetTableName);
                            sourceRows.clear();
                        }

                    } // each record

                } // all records in a target
                catch (Throwable e) // comm errors and timeouts with remote, labkey exceptions
                {
                    log.error(e, e);
                    rollback = true;
                    errorCount++;
                }
                finally
                {
                    if (rollback)
                    {
                        scope.closeConnection();
                        log.warn("Rolled back update of " + targetTableName);
                    }
                    else
                    {
                        scope.commitTransaction();
                        setLastTimestamp(targetTableName, newBaselineTimestamp);
                        log.info(MessageFormat.format("Committed updates for {0} records in {1}", updates, targetTableName));

                        // run postgres ANALYZE if enabled and if any updates were performed.
                        if (updates > 0) doDbAnalyze(schema.getDbSchema());
                    }

                }
            }
            catch (SQLException e)
            {
                // exception connecting, preparing or executing the query to the origin db
                log.error(String.format("Error syncing '%s' - caught SQLException: %s", targetTableName, e.getMessage()), e);
                errorCount++;
            }
            finally
            {
                close(rs);
                close(ps);
                close(originConnection);
            }

        } // each target collection
        return errorCount;
    }

    /**
     *
     * @param tableName for which to get deletes
     * @param fromTime return deletes performed after this timestamp
     * @return
     * @throws SQLException
     * @throws BadConfigException
     */
    Set<String> getDeletes(Connection originConnection, String tableName, long fromTime) throws SQLException, BadConfigException
    {
        PreparedStatement ps = null;
        ResultSet rs = null;
        Set<String> deletes = new HashSet<String>();

        try
        {
            originConnection = getOriginConnection();
            ps = originConnection.prepareStatement("SELECT uuid FROM deleted_records WHERE labkeyTable = ? AND ts > ?");
            ps.setString(1, tableName);
            ps.setTimestamp(2, new Timestamp(fromTime));
            rs = ps.executeQuery();
            while (rs.next())
            {
                deletes.add(rs.getString(1));
            }

            if (!deletes.isEmpty())
                log.info(deletes.size() + " deletes pending for " + tableName);
        }
        finally
        {
            close(rs);
            close(ps);
        }

        return deletes;
    }

    /**
     * @return the timestamp last stored by @setLastTimestamp, or 0 time if not present
     */
    private long getLastTimestamp(String tableName)
    {
        Map<String, String> m = PropertyManager.getProperties(TIMESTAMP_PROPERTY_DOMAIN);
        String value = m.get(tableName);
        if (value != null)
        {
            return Long.parseLong(value);
        }

        // If we haven't already synced, look in the properties file for a default timestamp
        try
        {
            return dateFormat.parse(getConfigProperty("defaultTimestamp")).getTime();

        }
        catch (Throwable t)
        {
            return 0;
        }

    }

    boolean isEmpty(TableInfo tinfo) throws SQLException
    {
        SQLFragment sql = new SQLFragment("SELECT COUNT(*) FROM ").append(tinfo.getFromSQL("x"));
        return Table.executeSingleton(tinfo.getSchema(), sql.getSQL(), sql.getParamsArray(), Long.class) == 0;
    }

    /**
     * Persist the baseline timestamp to use next time we sync this table. It should be the origin db's idea of what time it is.
     *
     * @param ts the timestamp we want returned by the next call to @getLastTimestamp
     */
    private void setLastTimestamp(String tableName, Long ts)
    {
        log.info(String.format("setting new baseline timestamp of %s on collection %s", new Date(ts.longValue()).toString(), tableName));
        PropertyManager.PropertyMap pm = PropertyManager.getWritableProperties(TIMESTAMP_PROPERTY_DOMAIN, true);
        pm.put(tableName, ts.toString());
        PropertyManager.saveProperties(pm);
    }

    /**
     * @return the current time according to the origin db.
     */
    private Long getOriginDataSourceCurrentTime() throws SQLException, BadConfigException
    {
        Connection con = null;
        Long ts = null;
        try
        {
            con = getOriginConnection();
            PreparedStatement ps = con.prepareStatement("select now()");
            ResultSet rs = ps.executeQuery();
            if (rs.next())
            {
                ts = new Long(rs.getTimestamp(1).getTime());
            }
        }
        finally
        {
            close(con);
        }
        return ts;
    }

    private Connection getOriginConnection() throws SQLException, BadConfigException
    {
        try
        {
            Class.forName("com.mysql.jdbc.Driver").newInstance();
        }
        catch (Throwable t)
        {
            throw new RuntimeException(t);
        }

        return DriverManager.getConnection(getConfigProperty("jdbcUrl"));
    }

    private Map<String, String> loadQueries(File[] sqlFiles) throws IOException
    {
        Map<String, String> qMap = new HashMap<String, String>();

        for (File f : sqlFiles)
        {
            if (!f.getName().endsWith("sql")) continue;
            String sql = Files.toString(f, Charsets.UTF_8);
            String key = f.getName().substring(0, f.getName().indexOf('.'));
            qMap.put(key, sql);
        }

        return qMap;
    }

    private Map<String, Object> mapResultSetRow(ResultSet rs) throws SQLException
    {
        Map<String, Object> map = new CaseInsensitiveHashMap<Object>();
        ResultSetMetaData md = rs.getMetaData();
        int columnCount = md.getColumnCount();
        for (int i = 1; i <= columnCount; i++)
        {
            // Pull out of ResultSet based on label instead of name, as the column
            // may have been aliased to match with its target in the dataset or list
            map.put(md.getColumnLabel(i), rs.getObject(i));
        }
        return map;
    }

    /**
     * @param path relative to ehr/resources/etl dir
     * @return File object for the specified file or directory
     */
    private File getResource(String path)
    {
        return new File(ModuleLoader.getInstance().getModule("EHR").getExplodedPath() + "/etl/" + path);
    }

    private static void close(Closeable o)
    {
        if (o != null) try
        {
            o.close();
        }
        catch (Exception ignored)
        {
        }
    }

    private static void close(Connection o)
    {
        if (o != null) try
        {
            o.close();
        }
        catch (Exception ignored)
        {
        }
    }

    private static void close(ResultSet o)
    {
        if (o != null) try
        {
            o.close();
        }
        catch (Exception ignored)
        {
        }
    }

    private static void close(PreparedStatement o)
    {
        if (o != null) try
        {
            o.close();
        }
        catch (Exception ignored)
        {
        }
    }

    public boolean shouldAnalyze()
    {
        String prop = PropertyManager.getProperties(CONFIG_PROPERTY_DOMAIN).get("shouldAnalyze");
        return prop != null && prop.equals("true");
    }

    public int getRunIntervalInMinutes()
    {
        String prop = PropertyManager.getProperties(CONFIG_PROPERTY_DOMAIN).get("runIntervalInMinutes");
        return null == prop ? 0 : Integer.parseInt(prop);
    }

    private String getConfigProperty(String key) throws BadConfigException
    {
        String prop = PropertyManager.getProperties(CONFIG_PROPERTY_DOMAIN).get(key);
        if (null == prop)
            throw new BadConfigException("No " + key + " is configured");
        else
            return prop;

    }

    /**
     * run db ANALYZE if configured and if db is postgres.
     *
     * This is really important for postgres performance when a table goes from no rows to millions of rows,
     * which studydata does when first syncing from EHR's legacy database.
     * @param dbSchema
     */
    private void doDbAnalyze(DbSchema dbSchema)
    {
        if (shouldAnalyze() && dbSchema.getSqlDialect().isPostgreSQL()) {
            log.info("ANALYZE");
            try
            {
                Table.execute(dbSchema, dbSchema.getSqlDialect().getAnalyzeCommandForTable(""));
            }
            catch (SQLException e)
            {
                log.warn("error running db ANALYZE: " + e.getMessage(), e);
            }
        }

    }

    public boolean isShutdown()
    {
        return shutdown;
    }

    public void shutdown()
    {
        this.shutdown = true;
    }


    class BadConfigException extends Throwable
    {
        public BadConfigException(String s)
        {
            super(s);
        }
    }
}
