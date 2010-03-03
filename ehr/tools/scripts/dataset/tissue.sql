/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDateTime(date, time) AS Date, (sex) AS sex, (livedead) AS livedead, (wbo) AS wbo, (tissue) AS tissue, (source) AS source, (dest) AS dest, (recip) AS recip, (affil) AS affil, FixNewlines(remark) AS remark,
( CONCAT_WS(',\n',
     CONCAT('Sex: ', sex),
     CONCAT('Live/Dead: ', livedead), 
     CONCAT('WBO: ', wbo),
     CONCAT('Tissue: ', tissue),
     CONCAT('Source: ', source),
     CONCAT('Dest: ', dest),
     CONCAT('Recipient: ', recip),
     CONCAT('Affiliation: ', affil)
) ) AS Description
FROM tissue

