/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

select
'Chemistry_' || testid as key,
testid,
name,
units,
alertOnAbnormal,
alertOnAny,
'Chemistry' as type,
sort_order

from chemistry_tests

union all

select
'Hematology_' || testid as key,
testid,
name,
units,
alertOnAbnormal,
alertOnAny,
'Hematology' as type,
sort_order

from hematology_tests

union all

select
'Immunology_' || testid as key,
testid,
name,
units,
alertOnAbnormal,
alertOnAny,
'Immunology' as type,
sort_order

from immunology_tests

union all

select
'Urinalysis_' || testid as key,
testid,
name,
units,
alertOnAbnormal,
alertOnAny,
'Urinalysis' as type,
sort_order

from urinalysis_tests

union all

select
'Virology_' || testid as key,
testid,
null as name,
null as units,
alertOnAbnormal,
alertOnAny,
'Virology' as type,
sort_order

from virology_tests

