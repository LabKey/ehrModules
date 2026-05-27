/*
 * Copyright (c) 2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
-- Dropping ix_ehr_lookups_request_priority_container [container] because it overlaps with uq_request_priority [container, priority]
DROP INDEX ehr_lookups.ix_ehr_lookups_request_priority_container;
-- Dropping ix_ehr_lookups_usda_levels_container [container] because it overlaps with uq_usda_levels [container, usda_level]
DROP INDEX ehr_lookups.ix_ehr_lookups_usda_levels_container;
-- Dropping ix_rooms_container [container] because it overlaps with uq_rooms [container, room]
DROP INDEX ehr_lookups.ix_rooms_container;
-- Dropping ix_ehr_lookups_cage_positions_container [container] because it overlaps with uq_cage_positions [container, cage]
DROP INDEX ehr_lookups.ix_ehr_lookups_cage_positions_container;
-- Dropping ix_ehr_lookups_blood_tube_volumes_container [container] because it overlaps with uq_blood_tube_volumes [container, volume]
DROP INDEX ehr_lookups.ix_ehr_lookups_blood_tube_volumes_container;
-- Dropping ix_ehr_lookups_areas_container [container] because it overlaps with uq_areas [container, area]
DROP INDEX ehr_lookups.ix_ehr_lookups_areas_container;
-- Dropping ix_ehr_lookups_source_container [container] because it overlaps with uq_source [container, code]
DROP INDEX ehr_lookups.ix_ehr_lookups_source_container;
-- Dropping ix_ehr_lookups_flag_categories_container [container] because it overlaps with uq_flag_categories [container, category]
DROP INDEX ehr_lookups.ix_ehr_lookups_flag_categories_container;
-- Dropping ix_ehr_lookups_routes_container [container] because it overlaps with uq_routes [container, route]
DROP INDEX ehr_lookups.ix_ehr_lookups_routes_container;
-- Dropping ix_ehr_lookups_cage_container [container] because it overlaps with uq_cage [container, location]
DROP INDEX ehr_lookups.ix_ehr_lookups_cage_container;
-- Dropping ix_ehr_lookups_blood_draw_services_container [container] because it overlaps with uq_blood_draw_services [container, service]
DROP INDEX ehr_lookups.ix_ehr_lookups_blood_draw_services_container;
-- Dropping ix_ehr_lookups_clinpath_tests_container [container] because it overlaps with uq_clinpath_tests [container, testname]
DROP INDEX ehr_lookups.ix_ehr_lookups_clinpath_tests_container;
-- Dropping ix_ehr_lookups_species_codes_container [container] because it overlaps with uq_species_codes [container, code]
DROP INDEX ehr_lookups.ix_ehr_lookups_species_codes_container;
-- Dropping ix_ehr_lookups_labwork_types_container [container] because it overlaps with uq_labwork_types [container, type]
DROP INDEX ehr_lookups.ix_ehr_lookups_labwork_types_container;
-- Dropping ix_ehr_lookups_death_remarks_container [container] because it overlaps with uq_death_remarks [container, title]
DROP INDEX ehr_lookups.ix_ehr_lookups_death_remarks_container;
-- Dropping ix_ehr_lookups_gender_codes_container [container] because it overlaps with uq_gender_codes [container, code]
DROP INDEX ehr_lookups.ix_ehr_lookups_gender_codes_container;
-- Dropping ix_buildings_container [container] because it overlaps with uq_buildings [container, name]
DROP INDEX ehr_lookups.ix_buildings_container;
-- Dropping ix_ehr_lookups_restraint_type_container [container] because it overlaps with uq_restraint_type [container, type]
DROP INDEX ehr_lookups.ix_ehr_lookups_restraint_type_container;
-- Dropping ix_ehr_lookups_conc_units_container [container] because it overlaps with uq_conc_units [container, unit]
DROP INDEX ehr_lookups.ix_ehr_lookups_conc_units_container;
-- Dropping ix_ehr_lookups_weight_ranges_container [container] because it overlaps with uq_weight_ranges [container, species]
DROP INDEX ehr_lookups.ix_ehr_lookups_weight_ranges_container;
-- Dropping ix_ehr_lookups_dosage_units_container [container] because it overlaps with uq_dosage_units [container, unit]
DROP INDEX ehr_lookups.ix_ehr_lookups_dosage_units_container;
-- Dropping ix_ehr_lookups_volume_units_container [container] because it overlaps with uq_volume_units [container, unit]
DROP INDEX ehr_lookups.ix_ehr_lookups_volume_units_container;
-- Dropping ix_ehr_lookups_blood_draw_tube_type_container [container] because it overlaps with uq_blood_draw_tube_type [container, type]
DROP INDEX ehr_lookups.ix_ehr_lookups_blood_draw_tube_type_container;
-- Dropping ix_ehr_lookups_cage_type_container [container] because it overlaps with uq_cage_type [container, cagetype]
DROP INDEX ehr_lookups.ix_ehr_lookups_cage_type_container;
-- Dropping ix_ehr_lookups_amount_units_container [container] because it overlaps with uq_amount_units [container, unit]
DROP INDEX ehr_lookups.ix_ehr_lookups_amount_units_container;
-- Dropping ix_treatment_codes_container [container] because it overlaps with uq_treatment_codes [container, meaning]
DROP INDEX ehr_lookups.ix_treatment_codes_container;
-- Dropping ix_ehr_lookups_calculated_status_codes_container [container] because it overlaps with uq_calculated_status_codes [container, code]
DROP INDEX ehr_lookups.ix_ehr_lookups_calculated_status_codes_container;
-- Dropping ix_ehr_lookups_species_container [container] because it overlaps with uq_species [container, common]
DROP INDEX ehr_lookups.ix_ehr_lookups_species_container;
-- Dropping ix_ehr_lookups_labwork_services_container [container] because it overlaps with uq_labwork_services [container, servicename]
DROP INDEX ehr_lookups.ix_ehr_lookups_labwork_services_container;
-- Dropping ix_ehr_lookups_parentagetypes_container [container] because it overlaps with uq_parentagetypes [container, label]
DROP INDEX ehr_lookups.ix_ehr_lookups_parentagetypes_container;
