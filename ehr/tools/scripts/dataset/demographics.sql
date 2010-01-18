SELECT id, FixDate(birth) AS Date, (sex) AS sex, (status) AS status, (avail) AS avail, 
(hold) AS hold, (dam) AS dam, (sire) AS sire, (origin) AS origin, FixDate(birth) AS birth, FixDate(death) AS death, FixDate(arrivedate) AS arrivedate, 
(arrivetime) AS arrivetime, (departdate) AS departdate, (departtime) AS departtime, (room) AS room, (cage) AS cage, (cond) AS cond, 
(weight) AS weight, FixDate(wdate) AS wdate, Timestamp(Date('1970-01-01'), wtime) AS wtime, FixDate(tbdate) AS tbdate, (medical) AS medical, (purchasedby) AS purchasedby, (v_status) AS v_status FROM abstract


