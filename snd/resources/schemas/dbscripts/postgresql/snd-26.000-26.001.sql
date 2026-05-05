-- Dropping idx_snd_lookups_lookupsetid [LookupSetId] because it overlaps with idx_snd_lookups_lookupsetid_value [LookupSetId, Value]
DROP INDEX snd.idx_snd_lookups_lookupsetid;
-- Dropping idx_snd_pkgcategoryjunction_pkgid [PkgId] because it overlaps with pk_snd_pkgcategoryjunction [PkgId, CategoryId]
DROP INDEX snd.idx_snd_pkgcategoryjunction_pkgid;
-- Dropping idx_snd_eventnotes_eventnoteid [EventNoteId] because it overlaps with pk_snd_eventnotes [EventNoteId]
DROP INDEX snd.idx_snd_eventnotes_eventnoteid;
