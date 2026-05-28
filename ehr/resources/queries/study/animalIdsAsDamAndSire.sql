/*
 * Copyright (c) 2023-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT Id.parents.dam AS parent,
       gender,
       species
FROM demographics
WHERE Id.parents.dam IN (SELECT Id.parents.sire FROM demographics)
