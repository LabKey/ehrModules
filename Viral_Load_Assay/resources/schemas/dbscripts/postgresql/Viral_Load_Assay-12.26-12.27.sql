INSERT INTO viral_load_assay.vl_instrument (instrument)
  SELECT 'LC96'
  WHERE
    NOT EXISTS (
        SELECT instrument FROM viral_load_assay.vl_instrument WHERE instrument = 'LC96'
    );