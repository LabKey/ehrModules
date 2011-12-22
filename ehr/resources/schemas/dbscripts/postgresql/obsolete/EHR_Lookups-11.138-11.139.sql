/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


alter table ehr_lookups.treatment_codes
  drop column frequency
  ;

alter table ehr_lookups.treatment_codes
  add column frequency integer
  ;

delete from ehr_lookups.treatment_codes;


INSERT INTO ehr_lookups.treatment_codes
(category,meaning,code,qualifier,route,concentration,conc_units,dosage,dosage_units,volume,vol_units,amount,amount_units,frequency)
values
('Analgesic' ,'Acetaminophen (Tylenol)' ,'c-60130' ,'' ,'oral' ,100 ,'mg/mL', 6, 'mg/kg', null, 'mL', null, 'mg', 4),
('Analgesic' ,'Aspirin' ,'c-60320' ,'' ,'oral' ,81 ,'mg/tablet', 20, 'mg/kg', null, 'tablet(s)', null, 'mg', 4),
('Analgesic' ,'Buprenorphine' ,'c-60a11' ,'' ,'IM' ,0.3 ,'mg/mL', 0.01, 'mg/kg', null, 'mL', null, 'mg', 4),
('Analgesic' ,'Carprofen (Rimadyl)' ,'c-60187' ,'Rimadyl' ,'oral' ,25 ,'mg/tablet', 2, 'mg/kg', null, 'tablet(s)', null, 'mg', 4),
('Analgesic' ,'Flunixin Meglumine (Banamine)' ,'c-d1467' ,'Flunixin Meglumine (Banamine)' ,'IM' ,50 ,'mg/mL', 2, 'mg/kg', null, 'mL', null, 'mg', 4),
('Analgesic' ,'Ketoprofen' ,'c-603e0' ,'' ,'IM' ,100 ,'mg/mL', 5, 'mg/kg', null, 'mL', null, 'mg', 4),
('Analgesic' ,'Meloxicam (injectable) (Metacam)' ,'c-60431' ,'' ,'SQ' ,5 ,'mg/mL', 0.1, 'mg/kg', null, 'mL', null, 'mg', 1),
('Analgesic' ,'Meloxicam (oral suspension) (Metacam)' ,'c-60432' ,'' ,'oral' ,1.5 ,'mg/mL', 0.1, 'mg/kg', null, 'mL', null, 'mg', 1),
('Analgesic' ,'Tramadol' ,'c-60111' ,'Tramadol' ,'oral' ,50 ,'mg/tablet', null, 'mg/kg', null, 'tablet(s)', null, 'mg', null),
('Antibiotic' ,'Amoxicillin' ,'c-54620' ,'' ,'oral' , null,'', null, '', null, '', null, '', null),
('Antibiotic' ,'Azithromycin (Zithromax)' ,'c-52a20' ,'' ,'oral' ,40 ,'mg/mL', 20, 'mg/kg', null, 'mL', null, 'mg', 1),
('Antibiotic' ,'Cefazolin' ,'c-53120' ,'' ,'IM' ,330 ,'mg/mL', 25, 'mg/kg', null, 'mL', null, 'mg', 4),
('Antibiotic' ,'Ceftriaxone' ,'c-53560' ,'' ,'IM' , null,'mg/mL', 350, 'mg/kg', null, 'mL', null, 'mg', 1),
('Antibiotic' ,'Ceftriaxone sodium' ,'c-53561' ,'' ,'' , null,'', null, '', null, '', null, '', null),
('Antibiotic' ,'Cephalexin' ,'c-53130' ,'' ,'oral' ,50 ,'mg/mL', 25, 'mg/kg', null, 'mL', null, 'mg', 4),
('Antibiotic' ,'Clarithromycin' ,'c-52a10' ,'' ,'' , null,'', null, '', null, '', null, '', null),
('Antibiotic' ,'Clavulanic Acid/Amoxicillin trihydrate (Clavamox)' ,'w-10226' ,'' ,'oral' ,50 ,'mg/tablet', 10, 'mg/kg', null, 'tablet(s)', null, 'mg', 6),
('Antibiotic' ,'Enrofloxacin (Baytril)' ,'c-d1507' ,'' ,'IM' ,22.7 ,'mg/mL', 5, 'mg/kg', null, 'mL', null, 'mg', 1),
('Antibiotic' ,'Erythromycin' ,'c-52a00' ,'' ,'IM' ,200 ,'mg/mL', 20, 'mg/kg', null, 'mL', null, 'mg', null),
('Antibiotic' ,'Penicillin' ,'c-54221' ,'Penicillin' ,'IM' ,300000 ,'units/mL', 50000, 'units/kg', null, 'mL', null, 'units', 1),
('Antibiotic' ,'Sulfamethoxazole + trimethorprim (TMS) 400mg/80mg tablet' ,'c-55638' ,'' ,'oral' , null,'', null, '', null, '', null, '', null),
('Antibiotic' ,'Sulfamethoxazole + trimethoprim (TMS) 200mg/40mg' ,'c-55635' ,'' ,'oral' , null,'', null, '', null, '', null, '', null),
('Antibiotic' ,'Sulfamethoxazole + trimethorprim (TMS) 80mg/16mg injectable' ,'c-55639' ,'' ,'SQ' , null,'', null, '', null, '', null, '', null),
('Antibiotic' ,'Tetracycline HCl' ,'c-55001' ,'' ,'' , null,'', null, '', null, '', null, '', null),
('Antibiotic' ,'Tylosin tartrate (Tylan)' ,'c-52340' ,'Tylosin tartrate (Tylan)' ,'oral' , null,'', 0.125, 'tsp/animal', 0.125, 'tsp', null, '', 1),
('Antiparasitic' ,'Fenbendazole (Panacur)' ,'c-d4657' ,'' ,'oral' ,100 ,'mg/mL', 50, 'mg/kg', null, 'mL', null, 'mg', 1),
('Antiparasitic' ,'Ivermectin (Ivomec)' ,'c-d3739' ,'' ,'SQ' ,10 ,'mg/mL', 0.2, 'mg/kg', null, 'mL', null, 'mg', 1),
('Antiparasitic' ,'Metronidazole (Flagyl)' ,'c-52040' ,'' ,'oral' ,100 ,'mg/mL', 50, 'mg/kg', null, 'mL', null, 'mg', 1),
('GI' ,'Bismuth Subsalicylate (Pepto Bismol)' ,'c-93040' ,'' ,'oral' ,17.5 ,'mg/mL', 2.33, 'mg/kg', null, 'mL', null, 'mg', 4),
('GI' ,'Cisapride' ,'c-84990' ,'' ,'' , null,'', null, '', null, '', null, '', null),
('GI' ,'Famotidine' ,'c-84020' ,'' ,'oral' ,10 ,'mg/tablet', null, 'mg/kg', null, 'tablet(s)', null, 'mg', null),
('GI' ,'Inulin (Fiber Bites) ' ,'r-f94e9' ,'' ,'oral' ,2 ,'g/piece', 1, 'piece', null, 'piece(s)', null, 'g', 1),
('GI' ,'Inulin (Fiber Choice)' ,'c-b0158' ,'' ,'oral' , null,'', null, '', null, '', null, '', null),
('GI' ,'Lactobacillus acidophilus/reuteri/rhomnosus (Primadophilus)' ,'w-10222' ,'' ,'oral' , null,'', null, '', null, '', null, '', null),
('GI' ,'Loperamide hydrochloride (Immodium)' ,'c-84540' ,'Immodium' ,'oral' , null,'', null, '', null, '', null, '', null),
('GI' ,'Metoclopramide' ,'c-84040' ,'' ,'SQ' ,5 ,'mg/mL', 0.2, 'mg/kg', null, 'mL', null, 'mg', 4),
('GI' ,'Omeprazole (Prilosec)' ,'c-c22fa' ,'' ,'oral' , null,'', null, '', null, '', null, '', null),
('GI' ,'orallycharbophil (Fiberlax)' ,'c-84560' ,'' ,'oral' , null,'', null, '', null, '', null, '', null),
('GI' ,'Probiotic (Primadophilus chewable tablet)' ,'f-61e1f' ,'Primadophilus chewable tablet' ,'oral' , null,'', null, '', null, '', null, '', null),
('GI' ,'Probiotic (Primadophilus oralwder)' ,'f-61e1f' ,'Primadophilus oralwder' ,'oral' , null,'', null, '', null, '', null, '', null),
('GI' ,'Probiotic (Yakult)' ,'f-61e1f' ,'Yakult' ,'oral' , null,'', null, '', null, '', null, '', null),
('GI' ,'Psyllium (Metamucil)' ,'@e-82870' ,'' ,'oral' , null,'', null, '', null, '', null, '', null),
('Hormone' ,'Cloprostenol sodium (Estrumate)' ,'c-d2985' ,'' ,'IM' , null,'', null, '', null, '', null, '', null),
('Hormone' ,'Dexamethasone SP ' ,'c-913a4' ,'' ,'IM' ,4 ,'mg/mL', 0.5, 'mg/kg', null, 'mL', null, 'mg', 1),
('Hormone' ,'FSH (Follicle Stimulating Hormone)' ,'c-a1580' ,'' ,'' , null,'', null, '', null, '', null, '', null),
('Hormone' ,'hCG (human chorionic gonadotropin)' ,'c-a1010' ,'' ,'' , null,'', null, '', null, '', null, '', null),
('Hormone' ,'hCG Recombinant' ,'w-10030' ,'' ,'' , null,'', null, '', null, '', null, '', null),
('Hormone' ,'Human FSH Recombinant' ,'w-10011' ,'' ,'' , null,'', null, '', null, '', null, '', null),
('Hormone' ,'Insulin Glargine' ,'c-a2206' ,'' ,'IM' , null,'', null, '', null, '', null, '', null),
('Hormone' ,'Medroxyprogesterone Acetate (Deoral-provera)' ,'c-a1221' ,'' ,'IM' ,150 ,'mg/mL', 150, 'mg/animal', null, 'mL', null, 'mg', 8),
('Hormone' ,'Oxytocin' ,'c-a0d05' ,'' ,'IM' ,20 ,'mg/mL', null, 'mg/kg', null, 'mL', null, 'mg', null),
('Hormone' ,'Pioglitazone hcl (Actos)' ,'w-10053' ,'' ,'oral' ,45 ,'mg/tablet', null, 'mg/kg', null, 'tablet(s)', null, 'mg', null),
('Hormone' ,'Progesterone preparation' ,'c-a1210' ,'Progesterone preparation' ,'' , null,'', null, '', null, '', null, '', null),
('Hormone' ,'Prostaglandin F2Alpha tromethamine (Prostamate)' ,'f-ba150' ,'' ,'' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'Clomipramine (Clomicalm)' ,'c-622b0' ,'Clomicalm' ,'oral' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'Diazepam (injectable) (Valium)' ,'c-64555' ,'' ,'IM' ,5 ,'mg/mL', 0.05, 'mg/kg', null, 'mL', null, 'mg', null),
('Miscellaneous' ,'Diazepam (oral) (Valium)' ,'c-64555' ,'' ,'oral' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'Diphenhydramine hydrochloride (Benadryl)' ,'c-51451' ,'' ,'oral' ,25 ,'mg/tablet', null, 'mg/kg', null, 'tablet(s)', null, 'mg', null),
('Miscellaneous' ,'Enalapril maleate' ,'c-803c1' ,'' ,'oral' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'Epinephrine' ,'c-680d0' ,'Epinephrine' ,'IV' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'Furosemide (Lasix)' ,'c-72040' ,'' ,'IM' ,20 ,'mg/mL', 2, 'mg/kg', null, 'mL', null, 'mg', 6),
('Miscellaneous' ,'Gabapentin (Neurontin Gabarone)' ,'c-61002' ,'' ,'oral' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'Ketoconazole oral suspension ' ,'c-52b50' ,'' ,'oral' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'Multivitamin w/ Iron (Animal Parade Gummi)' ,'w-10068' ,'Animal Parade Gummi' ,'oral' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'Multivitamin w/ Iron (Solaray Chewable)' ,'w-10068' ,'Solaray Chewable' ,'oral' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'Multivitamin with Iron' ,'w-10068' ,'' ,'oral' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'Multivitamin without Iron' ,'w-10067' ,'' ,'oral' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'oraltassium chloride (oral solution)' ,'c-71063' ,'' ,'oral' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'oraltassium Gluconate (tumil-K)' ,'c-71064' ,'tumil-K' ,'oral' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'Supplemental Enrichment' ,'w-10192' ,'Supplemental Enrichment' ,'' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'Soak chow in ensure' ,'c-f0000' ,'Soak chow in ensure' ,'oral' , null,'', null, '', 1, '', null, '', 4),
('Miscellaneous' ,'Soak chow in water' ,'c-f0000' ,'Soak chow in water' ,'oral' , null,'', null, '', 1, '', null, '', 4),
('Miscellaneous' ,'Supp Food - 1 cup softies' ,'c-f0000' ,'softies' ,'oral' , null,'', null, '', 1, 'cup', null, '', 1),
('Miscellaneous' ,'Supp Food - 1 oz. Zupreem' ,'c-f0000' ,'1 oz. Zupreem' ,'oral' , null,'', null, '', 1, 'ounce(s)', null, '', null),
('Miscellaneous' ,'Supp Food - 1/2 cup softies' ,'c-f0000' ,'softies' ,'oral' , null,'', null, '', 0.5, 'cup', null, '', null),
('Miscellaneous' ,'Supp Food - 1/2 cup yogurt' ,'c-f0000' ,'yogurt' ,'oral' , null,'', null, '', 0.5, 'cup', null, '', null),
('Miscellaneous' ,'Supp Food - Fruit' ,'c-f0000' ,'Fruit' ,'oral' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'Supp Food - PB Sand' ,'c-f0000' ,'PB Sand' ,'oral' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'Supp Food - PB Sand / Fig Newton' ,'c-f0000' ,'PB Sand or Fig Newton' ,'oral' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'Supp Food - PB Sand / Fig Newton / Fruit' ,'c-f0000' ,'PB Sand or Fig Newton or Fruit' ,'oral' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'Supp Food - PB Sand / Yogurt Sand' ,'c-f0000' ,'PB Sand or Yogurt Sand' ,'oral' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'Supplemental Food' ,'c-f0000' ,'' ,'oral' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'Supplemental Liquid Diet' ,'c-f2300' ,'' ,'oral' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'Supplemental Liquid Diet - Ensure' ,'c-f2300' ,'Ensure' ,'oral' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'Tacrolimus (dilution to 0.3 mg/ml with .9% NaCl) (FK506)' ,'w-10137' ,'' ,'' , null,'', null, '', null, '', null, '', null),
('Sedative' ,'Fluoxetine (Prozac)' ,'c-62290' ,'' ,'oral' , null,'', null, '', null, '', null, '', null),
('Topical' ,'1% Silver sulfadiazine (Silvadine)' ,'c-902b0' ,'' ,'' , null,'', null, '', null, '', null, '', null),
('Topical' ,'2% Miconazole Nitrate' ,'c-52b62' ,'' ,'' , null,'', null, '', null, '', null, '', null),
('Topical' ,'Panalog ointment' ,'c-d4673' ,'' ,'' , null,'', null, '', null, '', null, '', null),
('Topical' ,'orallymyxin B/Bacitracin/Neomycin (Triple Antibiotic Ointment)' ,'c-d1451' ,'' ,'' , null,'', null, '', null, '', null, '', null),
('Topical' ,'orallymyxin B/Bacitracin/Neomycin (Triple Antibiotic Ophthalmic Ointment)' ,'w-10031' ,'' ,'' , null,'', null, '', null, '', null, '', null),
('Topical' ,'Tolnaftate oralwder (Tinactin)' ,'f-61a58' ,'' ,'' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'Fish Oil' ,'c-8060a' ,'' ,'oral' , null,'', null, '', null, '', null, '', null),
('Hormone' ,'Insulin-NPH-Humulin N' ,'c-a2220' ,'' ,'IM' , null,'', null, '', null, '', null, '', null),
('Miscellaneous' ,'Water' ,'c-10120' ,'' ,'' , null,'', null, '', null, '', null, '', null)
;