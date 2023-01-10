/*
 * Copyright (c) 2015-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

    d1.id,

    CASE
        WHEN (ISEQUAL(d1.sire, d2.sire) AND ISEQUAL(d1.dam, d2.dam))
            THEN 'Full Sib'
        WHEN (ISEQUAL(d1.sire, d2.sire) AND NOT ISEQUAL(d1.dam, d2.dam))
            THEN 'Half-Sib Paternal'
        WHEN (NOT ISEQUAL(d1.sire, d2.sire) AND ISEQUAL(d1.dam, d2.dam))
            THEN 'Half-Sib Maternal'
        WHEN (NOT ISEQUAL(d1.sire, d2.sire) AND NOT ISEQUAL(d1.dam, d2.dam))
            THEN 'ERROR'
        END AS Relationship,

    d2.id  AS Sibling,

    d2.id.parents.dam AS SiblingDam,
    d2.id.parents.sire AS SiblingSire,
    d1.qcstate

FROM study.Demographics d1
JOIN study.Demographics d2 ON ((d2.id.parents.sire = d1.id.parents.sire OR d2.id.parents.dam = d1.id.parents.dam) AND d1.id != d2.id)
WHERE d2.id is not null
