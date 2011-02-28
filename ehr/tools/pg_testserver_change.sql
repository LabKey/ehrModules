/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/*
This script is designed to alter postgres settings on a staging/development server following a full postgres dump from
a production server.  This script comes with no guarantee whatsoever.  Test prior to use.
  
*/

--use labkey;
--'use' doesnt appear supported in postgres
--maybe alternative is \c.  ie: postgres=# \c labkey



--will inactivate all users except site admins and labkey
-- update   core.Principals
-- SET      Active = FALSE
-- WHERE type = 'u'
--       AND UserId NOT IN (select p.UserId from core.Principals p inner join core.Members m on (p.UserId = m.UserId and m.GroupId=-1))
--       AND Name NOT LIKE '%@labkey.com'
--       --AND Name NOT IN ('someuser@myServer.com', 'someOtherUser@myServer.com')
-- ;


UPDATE    prop.Properties p
SET       Value = 'https://test-ehr.primate.wisc.edu:8443'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'SiteConfig'
          AND p.Name = 'baseServerURL'
;

UPDATE    prop.Properties p
SET       Value = 'TestServer'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'LookAndFeel'
          AND p.Name = 'systemShortName'
;

UPDATE    prop.Properties p
SET       Value = 'EHR Test Server'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'LookAndFeel'
          AND p.Name = 'systemDescription'
;

UPDATE    prop.Properties p
SET       Value = 'Seattle'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'LookAndFeel'
          AND p.Name = 'themeName'
;

--this is the test-ehr's analytics ID.
UPDATE    prop.Properties p
SET       Value = 'UA-12818769-2'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'analytics'
          AND p.Name = 'accountId'
;

--replace the mySQL server used.  use replace so we dont save the password here 
UPDATE    prop.Properties p
SET       Value = replace(Value, 'saimiri', 'colony-test')
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'wnprc.ehr.etl.config'
	      AND p.Name = 'jdbcUrl'
;


--not used, but might be of interest
-- UPDATE    prop.Properties p
-- SET       Value = FALSE
-- WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'SiteConfig'
--             AND p.Name = 'sslRequired'
-- ;

-- UPDATE    prop.Properties p
-- SET       Value = '8443'
-- WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'SiteConfig'
--             AND p.Name = 'sslPort'
-- ;

-- UPDATE    prop.Properties p
-- SET       Value = 'c:\labkey_data'
-- WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'SiteConfig'
--             AND p.Name = 'webRoot'
-- ;

-- UPDATE    prop.Properties p
-- SET       Value = TRUE
-- WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'SiteConfig'
--             AND p.Name = 'adminOnlyMode'
-- ;

--not used, but might be of interest
-- INSERT into    core.Members m
-- (GroupId, UserId) VALUES (-1, (select userId from core.users WHERE email='yourEmail@wisc.edu')
-- ;