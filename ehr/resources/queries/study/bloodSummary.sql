/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
	b.lsid,
	b.id,
	b.date,
	b.minDate,
	b.maxDate,
	b.id.dataset.demographics.weight,
	b.id.dataset.demographics.wdate,
	b.BloodLast30,
	b.BloodNext30,
	round(b.id.dataset.demographics.weight*0.2*60, 1) AS MaxBlood,
	round((b.id.dataset.demographics.weight*0.2*60) - b.BloodLast30 - b.BloodNext30, 1) AS AvailBlood
-- FROM
-- (
-- 	SELECT
-- 	  b.lsid,
-- 	  b.id,
-- 	  b.date,
-- 	  b.quantity,
-- 	  b.lastWeighDate,
-- 	  timestampadd('SQL_TSI_DAY', -30, b.date) as minDate,
-- 	  (
-- 	    CONVERT (
-- 	    	(SELECT AVG(w.weight) AS _expr
-- 	    	FROM study.weight w
-- 		    WHERE w.id=b.id AND w.date=b.lastWeighDate
-- 		    AND w.qcstate.publicdata = true
-- 		   ), double )
-- 	  ) AS weight,
-- 	  b.BloodLast30,
-- 	  b.BloodNext30
	FROM
	 	(
			 SELECT bi.*
			    ,timestampadd('SQL_TSI_DAY', -30, bi.date) as minDate
			    ,timestampadd('SQL_TSI_DAY', 30, bi.date) as maxDate
-- 	 		    , ( CONVERT(
--                       (SELECT MAX(w.date) as _expr
--                         FROM study.weight w
--                         WHERE w.id = bi.id AND w.date <= bi.date
--                         AND w.qcstate.publicdata = true
--                       ), timestamp )
--                   ) AS lastWeighDate
	 		    , ( COALESCE (
	    			(SELECT SUM(draws.quantity) AS _expr
	    		      FROM study."Blood Draws" draws
	    			  WHERE draws.id=bi.id
                          AND draws.date BETWEEN TIMESTAMPADD('SQL_TSI_DAY', -30, bi.date) AND bi.date
                          AND (draws.qcstate.metadata.DraftData = true OR draws.qcstate.publicdata = true)
                     ), 0 )
	  		      ) AS BloodLast30
	 		    , ( COALESCE (
	    			(SELECT SUM(draws.quantity) AS _expr
	    		      FROM study."Blood Draws" draws
	    			  WHERE draws.id=bi.id
                          AND draws.date BETWEEN TIMESTAMPADD('SQL_TSI_DAY', 30, bi.date) AND bi.date
                          AND (draws.qcstate.metadata.DraftData = true OR draws.qcstate.publicdata = true)
                     ), 0 )
	  		      ) AS BloodNext30
	     	FROM study.blood bi
	     	--WHERE (bi.qcstate.metadata.DraftData = true OR bi.qcstate.publicdata = true)
	    	) b
-- 	) bq
WHERE b.date >= TIMESTAMPADD('SQL_TSI_DAY', -180, now())
