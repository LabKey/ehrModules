SELECT concat(room, "-", cage) AS roomCage, room, cage, note, FixDateTime(date, time) as date, userid FROM cagenotes c
