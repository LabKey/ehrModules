/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


INSERT INTO ehr_lookups.dental_jaw VALUES ('Both');
INSERT INTO ehr_lookups.dental_side VALUES ('Both');
INSERT INTO ehr_lookups.dental_status VALUES ('Pulpotomized');
INSERT INTO ehr_lookups.dental_status VALUES ('Retained Deciduous');

INSERT INTO ehr_lookups.condition_codes VALUES ('gmaf', 'in a group with the mother and adopted father');

DROP TABLE IF EXISTS ehr_lookups.blood_code_prefixes;
CREATE TABLE ehr_lookups.blood_code_prefixes (
prefix varchar(10) NOT NULL,

CONSTRAINT PK_blood_code_prefixes PRIMARY KEY (prefix)
)
WITH (OIDS=FALSE)

;

insert into ehr_lookups.blood_code_prefixes
(prefix) values
('a'),
('aa'),
('ab'),
('ac'),
('ad'),
('ae'),
('ag'),
('al'),
('am'),
('ap'),
('ar'),
('as'),
('aw'),
('b1'),
('b2'),
('b3'),
('b4'),
('b5'),
('b6'),
('b7'),
('b8'),
('b9'),
('ba'),
('bb'),
('bc'),
('bd'),
('bh'),
('bm'),
('br'),
('c1'),
('c2'),
('c3'),
('c4'),
('c5'),
('c6'),
('c7'),
('c8'),
('c9'),
('ca'),
('cb'),
('cc'),
('ct'),
('d'),
('da'),
('dh'),
('dr'),
('ds'),
('dy'),
('e-'),
('e1'),
('e2'),
('e3'),
('e4'),
('e5'),
('e6'),
('e7'),
('e8'),
('e9'),
('ec'),
('et'),
('f'),
('fb'),
('fm'),
('g'),
('gc'),
('gm'),
('gs'),
('gv'),
('he'),
('i'),
('ia'),
('iu'),
('j'),
('jd'),
('je'),
('jk'),
('jr'),
('jt'),
('jv'),
('k'),
('kr'),
('ks'),
('l'),
('la'),
('lc'),
('le'),
('lf'),
('lh'),
('lj'),
('m'),
('mb'),
('mh'),
('mm'),
('mo'),
('mp'),
('ms'),
('mw'),
('n'),
('nd'),
('nh'),
('ni'),
('ns'),
('o-'),
('o'),
('p'),
('pf'),
('pg'),
('pk'),
('po'),
('pw'),
('q'),
('r'),
('rf'),
('rg'),
('rh'),
('rr'),
('rs'),
('rt'),
('s-'),
('s'),
('sa'),
('sb'),
('sc'),
('si'),
('sm'),
('sp'),
('sw'),
('t-'),
('t'),
('t@'),
('tc'),
('th'),
('tm'),
('tr'),
('ts'),
('tz'),
('u'),
('v'),
('va'),
('vb'),
('vc'),
('vd'),
('ve'),
('vf'),
('vg'),
('vh'),
('vj'),
('vr'),
('vt'),
('vv'),
('w'),
('wb'),
('wm'),
('ws'),
('y'),
('ys'),
('z'),
('zz')
;

DROP TABLE IF EXISTS ehr_lookups.snomed_qualifiers;
CREATE TABLE ehr_lookups.snomed_qualifiers (
qualifier varchar(100) NOT NULL,

CONSTRAINT PK_snomed_qualifiers PRIMARY KEY (qualifier)
)
WITH (OIDS=FALSE)

;

insert into ehr_lookups.snomed_qualifiers
(qualifier) values
('right'),
('left'),
('proximal'),
('middle'),
('distal'),
('both'),
('entire')
;

INSERT INTO ehr_lookups.necropsy_perfusion VALUES ('PBS');


DROP TABLE IF EXISTS ehr_lookups.preservation_solutions;
CREATE TABLE ehr_lookups.preservation_solutions (
solution varchar(100) NOT NULL,

CONSTRAINT PK_preservation_solutions PRIMARY KEY (solution)
)
WITH (OIDS=FALSE)

;

insert into ehr_lookups.preservation_solutions
(solution) values
('10% Formalin'),
('4% PFA'),
('2% PFA'),
('RPMI'),
('PBS'),
('RNA Later'),
('OCT'),
('Liquid Nitrogen'),
('Dry Ice'),
('Foil'),
('Fresh')
;