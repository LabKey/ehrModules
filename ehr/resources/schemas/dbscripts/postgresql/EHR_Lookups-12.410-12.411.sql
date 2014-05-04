ALTER TABLE ehr_lookups.labwork_services ADD datedisabled timestamp;

UPDATE ehr_lookups.divider_types SET divider = 'Cage Wall (Solid)' WHERE divider = 'Cage Well (Solid)';

insert into ehr_lookups.divider_types (divider, countAsSeparate, countAsPaired, displaychar, bgcolor, border_style, short_description, isMoveable)
select 'Feeder Slide', countAsSeparate, countAsPaired, displaychar, bgcolor, border_style, short_description, true from ehr_lookups.divider_types where divider = 'Solid Divider';