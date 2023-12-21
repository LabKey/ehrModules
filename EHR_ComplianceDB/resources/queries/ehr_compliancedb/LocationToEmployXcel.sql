select

    jj.location as location,
    coalesce(jj.employeeid, '') as employeeid


from ehr_compliancedb.employee_assigned_location  jj

group by   jj.employeeid, jj.location

    PIVOT employeeid by location