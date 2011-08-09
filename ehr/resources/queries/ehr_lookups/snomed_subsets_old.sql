/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

DISTINCT s.primaryCategory as primaryCategory

FROM snomed_subset_codes s

GROUP BY s.primaryCategory