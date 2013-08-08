ALTER TABLE viral_load_assay.abi7500_detectors ADD reporter varchar(200);
ALTER TABLE viral_load_assay.abi7500_detectors ADD quencher varchar(200);
UPDATE viral_load_assay.abi7500_detectors SET reporter = fluor;
ALTER TABLE viral_load_assay.abi7500_detectors DROP COLUMN fluor;