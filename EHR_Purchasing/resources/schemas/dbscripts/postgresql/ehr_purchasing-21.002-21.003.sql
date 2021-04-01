ALTER TABLE ehr_purchasing.purchasingRequests DROP assignedTo;
ALTER TABLE ehr_purchasing.purchasingRequests ADD assignedTo USERID;