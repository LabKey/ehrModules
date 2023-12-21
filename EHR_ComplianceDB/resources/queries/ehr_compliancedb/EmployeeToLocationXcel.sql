
select

    coalesce(jj.location, '') as location,

    jj.employeeid as employeeid


from ehr_compliancedb.employee_assigned_location  jj

group by   jj.employeeid, jj.location

    PIVOT location by  employeeid
