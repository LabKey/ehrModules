/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

cd.id,

cd.year,

y.rowid as monthNum,
y.month,
convert((cd.year||'-'||y.rowid||'-01'), date) as date,

max(e."1") as "1",
max(e."2") as "2",
max(e."3") as "3",
max(e."4") as "4",
max(e."5") as "5",
max(e."6") as "6",
max(e."7") as "7",
max(e."8") as "8",
max(e."9") as "9",
max(e."10") as "10",
max(e."11") as "11",
max(e."12") as "12",
max(e."13") as "13",
max(e."14") as "14",
max(e."15") as "15",
max(e."16") as "16",
max(e."17") as "17",
max(e."18") as "18",
max(e."19") as "19",
max(e."20") as "20",
max(e."21") as "21",
max(e."22") as "22",
max(e."23") as "23",
max(e."24") as "24",
max(e."25") as "25",
max(e."26") as "26",
max(e."27") as "27",
max(e."28") as "28",
max(e."29") as "29",
max(e."30") as "30",
max(e."31") as "31",

FROM ehr_lookups.months y

LEFT OUTER JOIN study.clintremDiarrhea cd

LEFT JOIN study.clintremDiarrheaSummary e

ON cd.id = e.id AND cd.year = e.year AND y.rowid = e.monthNum

group by cd.id, cd.year, y.rowid, y.month

order by cd.id, cd.year, y.rowid