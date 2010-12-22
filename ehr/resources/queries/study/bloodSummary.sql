/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
	bq.lsid,
	bq.id,
	bq.date,
	bq.lastWeighDate,
	bq.minDate,
	bq.weight,
	bq.BloodLast30,
	round(bq.weight*0.2*60, 1) AS MaxBlood,
	round((bq.weight*0.2*60) - bq.BloodLast30, 1) AS AvailBlood
FROM
(
	SELECT
	  b.lsid,
	  b.id,
	  b.date,
	  b.quantity,
	  b.lastWeighDate,
	  timestampadd('SQL_TSI_DAY', -30, b.date) as minDate,
	  (
	    CONVERT (
	    	(SELECT AVG(w.weight) AS _expr
	    	FROM study.weight w
		    WHERE w.id=b.id AND w.date=b.lastWeighDate
		   ), double )
	  ) AS weight,
	  b.BloodLast30
	FROM
	 	(
			 SELECT bi.*
	 		    , ( CONVERT(
                      (SELECT MAX(w.date) as _expr
                        FROM study.weight w
                        WHERE w.id = bi.id AND w.date <= bi.date
                      ), timestamp )
                  ) AS lastWeighDate
	 		    , ( CONVERT(
	    			(SELECT SUM(draws.quantity) AS _expr
	    		      FROM study.blood draws
	    			  WHERE draws.id=bi.id
                          AND draws.date BETWEEN TIMESTAMPADD('SQL_TSI_DAY', -30, bi.date) AND bi.date
                     ), double )
	  		      ) AS BloodLast30
	     	FROM study.blood bi
	    	) b
	) bq
WHERE bq.date >= TIMESTAMPADD('SQL_TSI_DAY', -180, now())
