importPackage(java.io);

function write(xml, filename)
{
    var out = new PrintWriter(filename);
    out.print(xml.toXMLString());
    out.print('\n');
    out.flush();
    out.close();
}

function columns(tables, columnNames, fn)
{
    if (columnNames instanceof Array)
    {
        var o = { };
        for (var i = 0; i < columnNames.length; i++)
            o[columnNames[i]] = true;
        columnNames = o;
    }

    for each (var table in tables..table)
    {
        var tableName = table.@tableName;
        print("processing " + tableName + "...");

        for each (var col in table..column.(@columnName in columnNames))
        {
            print("  " + col.@columnName);
            fn(col);
        }
    }
}
