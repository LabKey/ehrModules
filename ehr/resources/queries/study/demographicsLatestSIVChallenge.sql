/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.Id,

max(d.date) as Date,

min(d.WeeksSinceChallenge) as WeeksSinceChallenge,

d.Challenge_Type,

d.pathogen,

FROM study.demographicsViralChallenge d

WHERE d.pathogen = 'SIV' AND d.challenge_Type = 'Challenge'

GROUP BY d.Id, d.pathogen, d.challenge_Type