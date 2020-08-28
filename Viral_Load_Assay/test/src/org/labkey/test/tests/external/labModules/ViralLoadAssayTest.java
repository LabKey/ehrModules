/*
 * Copyright (c) 2012-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.test.tests.external.labModules;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.jetbrains.annotations.Nullable;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.remoteapi.CommandException;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.query.Filter;
import org.labkey.remoteapi.query.InsertRowsCommand;
import org.labkey.remoteapi.query.SaveRowsResponse;
import org.labkey.remoteapi.query.SelectRowsCommand;
import org.labkey.remoteapi.query.SelectRowsResponse;
import org.labkey.test.Locator;
import org.labkey.test.Locators;
import org.labkey.test.WebTestHelper;
import org.labkey.test.categories.EHR;
import org.labkey.test.categories.External;
import org.labkey.test.categories.LabModule;
import org.labkey.test.components.domain.DomainFormPanel;
import org.labkey.test.pages.ReactAssayDesignerPage;
import org.labkey.test.params.FieldDefinition;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.TextSearcher;
import org.labkey.test.util.UIAssayHelper;
import org.labkey.test.util.ext4cmp.Ext4ComboRef;
import org.labkey.test.util.ext4cmp.Ext4FieldRef;
import org.labkey.test.util.ext4cmp.Ext4GridRef;
import org.labkey.test.util.external.labModules.LabModuleHelper;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;

import java.io.File;
import java.io.IOException;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

@Category({External.class, EHR.class, LabModule.class})
public class ViralLoadAssayTest extends AbstractLabModuleAssayTest
{
    private static final String ASSAY_NAME = "Viral Load Test";
    private static final String LC480 = "LC480";
    private static final String LC96 = "LC96";
    private String DETECTOR_NAME = "PIATAK SIVGAG";

    private static final String[][] TEMPLATE_DATA = new String[][]{
        {"well", "subjectId", "date", "category", "sampleVol"},
        {"A5", "LowQual1", "2012-02-01", "Unknown", "0.3"},
        {"A6", "LowQual1", "2012-02-01", "Unknown", "0.3"},
        {"A7", "LowQual2", "2012-06-01", "Unknown", "0.3"},
        {"A8", "LowQual2", "2012-06-01", "Unknown", "0.3"},
        {"A9", "Subject1", "2012-02-12", "Unknown", "0.3"},
        {"A10", "Subject1", "2012-02-12", "Unknown", "0.3"},
        {"A11", "Subject2", "2012-02-14", "Unknown", "0.3"},
        {"A12", "Subject2", "2012-02-14", "Unknown", "0.3"},
        {"B1", "Subject3", "2012-02-16", "Unknown", "0.3"},
        {"B2", "Subject3", "2012-02-16", "Unknown", "0.3"},
        {"B3", "Subject4", "2012-02-18", "Unknown", "0.3"},
        {"B4", "Subject4", "2012-02-18", "Unknown", "0.3"},
        {"B5", "Subject5", "2012-02-20", "Unknown", "0.3"},
        {"B6", "Subject5", "2012-02-20", "Unknown", "0.3"},
        {"B7", "Subject6", "2012-02-22", "Unknown", "0.3"},
        {"B8", "Subject6", "2012-02-22", "Unknown", "0.3"},
        {"B9", "Subject7", "2012-02-24", "Unknown", "0.3"},
        {"B10", "Subject7", "2012-02-24", "Unknown", "0.3"},
        {"B11", "Subject8", "2012-02-26", "Unknown", "0.3"},
        {"B12", "Subject8", "2012-02-26", "Unknown", "0.3"},
        {"C1", "Subject9", "2012-02-28", "Unknown", "0.3"},
        {"C2", "Subject9", "2012-02-28", "Unknown", "0.3"},
        {"C3", "Subject10", "2012-03-01", "Unknown", "0.3"},
        {"C4", "Subject10", "2012-03-01", "Unknown", "0.3"},
        {"C5", "Subject11", "2012-03-03", "Unknown", "0.3"},
        {"C6", "Subject11", "2012-03-03", "Unknown", "0.3"},
        {"C7", "Subject12", "2012-03-05", "Unknown", "0.3"},
        {"C8", "Subject12", "2012-03-05", "Unknown", "0.3"},
        {"C9", "Subject13", "2012-03-07", "Unknown", "0.3"},
        {"C10", "Subject13", "2012-03-07", "Unknown", "0.3"},
        {"C11", "Subject14", "2012-03-09", "Unknown", "0.3"},
        {"C12", "Subject14", "2012-03-09", "Unknown", "0.3"},
        {"D1", "Subject15", "2012-03-11", "Unknown", "0.3"},
        {"D2", "Subject15", "2012-03-11", "Unknown", "0.3"},
        {"D3", "Subject16", "2012-03-13", "Unknown", "0.3"},
        {"D4", "Subject16", "2012-03-13", "Unknown", "0.3"},
        {"D5", "Subject17", "2012-03-15", "Unknown", "0.3"},
        {"D6", "Subject17", "2012-03-15", "Unknown", "0.3"},
        {"D7", "Subject18", "2012-03-17", "Unknown", "0.3"},
        {"D8", "Subject18", "2012-03-17", "Unknown", "0.3"},
        {"D9", "Subject19", "2012-03-19", "Unknown", "0.3"},
        {"D10", "Subject19", "2012-03-19", "Unknown", "0.3"},
        {"D11", "Subject20", "2012-03-21", "Unknown", "0.3"},
        {"D12", "Subject20", "2012-03-21", "Unknown", "0.3"},
        {"E1", "Subject21", "2012-03-23", "Unknown", "0.3"},
        {"E2", "Subject21", "2012-03-23", "Unknown", "0.3"},
        {"E3", "Subject22", "2012-03-25", "Unknown", "0.3"},
        {"E4", "Subject22", "2012-03-25", "Unknown", "0.3"},
        {"E5", "Subject23", "2012-03-27", "Unknown", "0.3"},
        {"E6", "Subject23", "2012-03-27", "Unknown", "0.3"},
        {"E7", "Subject24", "2012-03-29", "Unknown", "0.3"},
        {"E8", "Subject24", "2012-03-29", "Unknown", "0.3"},
        {"E9", "Subject25", "2012-03-31", "Unknown", "0.3"},
        {"E10", "Subject25", "2012-03-31", "Unknown", "0.3"},
        {"E11", "Subject26", "2012-04-02", "Unknown", "0.3"},
        {"E12", "Subject26", "2012-04-02", "Unknown", "0.3"},
        {"F1", "Subject27", "2012-04-04", "Unknown", "0.3"},
        {"F2", "Subject27", "2012-04-04", "Unknown", "0.3"},
        {"F3", "Subject28", "2012-04-06", "Unknown", "0.3"},
        {"F4", "Subject28", "2012-04-06", "Unknown", "0.3"},
        {"F5", "Subject29", "2012-04-08", "Unknown", "0.3"},
        {"F6", "Subject29", "2012-04-08", "Unknown", "0.3"},
        {"F7", "Subject30", "2012-04-10", "Unknown", "0.3"},
        {"F8", "Subject30", "2012-04-10", "Unknown", "0.3"},
        {"F9", "Positive Control-1", "2012-04-12", "Pos Control", "0.3"},
        {"F10", "Positive Control-1", "2012-04-12", "Pos Control", "0.3"},
        {"F11", "Positive Control-2", "2012-04-14", "Pos Control", "0.3"},
        {"F12", "Positive Control-2", "2012-04-14", "Pos Control", "0.3"},
        {"G1", "NTC", "", "Neg Control", "0.3"},
        {"G2", "NTC", "", "Neg Control", "0.3"},
        {"G3", "STD_1000000", "", "Standard", "0.3"},
        {"G4", "STD_1000000", "", "Standard", "0.3"},
        {"G5", "STD_320000", "", "Standard", "0.3"},
        {"G6", "STD_320000", "", "Standard", "0.3"},
        {"G7", "STD_100000", "", "Standard", "0.3"},
        {"G8", "STD_100000", "", "Standard", "0.3"},
        {"G9", "STD_32000", "", "Standard", "0.3"},
        {"G10", "STD_32000", "", "Standard", "0.3"},
        {"G11", "STD_10000", "", "Standard", "0.3"},
        {"G12", "STD_10000", "", "Standard", "0.3"},
        {"H1", "STD_3200", "", "Standard", "0.3"},
        {"H2", "STD_3200", "", "Standard", "0.3"},
        {"H3", "STD_1000", "", "Standard", "0.3"},
        {"H4", "STD_1000", "", "Standard", "0.3"},
        {"H5", "STD_320", "", "Standard", "0.3"},
        {"H6", "STD_320", "", "Standard", "0.3"},
        {"H7", "STD_100", "", "Standard", "0.3"},
        {"H8", "STD_100", "", "Standard", "0.3"},
        {"H9", "STD_32", "", "Standard", "0.3"},
        {"H10", "STD_32", "", "Standard", "0.3"},
        {"H11", "STD_10", "", "Standard", "0.3"},
        {"H12", "STD_10", "", "Standard", "0.3"}
    };

    private static final String[][] WNPRC_TEMPLATE_DATA = new String[][]{
            {"well", "category", "subjectId", "date", "nucleicAcidVol", "sourceMaterial", "comment", "sampleVol", "uniqueSample"},
            {"A5", "Unknown", "LowQual1", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "PcYABMw4iIW4wS57qORr1Z"},
            {"A6", "Unknown", "LowQual1", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "nCmYQbLEikiQ73iDxmY33Y"},
            {"A7", "Unknown", "LowQual2", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "R9xM.9TriuaExOpndyGo2X"},
            {"A8", "Unknown", "LowQual2", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "J5gXlHcYh1WqFKXNp3,j0o"},
            {"A9", "Unknown", "Subject1", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "NTmiKt6kg3i0f4dB2VuZ3H"},
            {"A10", "Unknown", "Subject1", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "ERMObpbGgJ,NIB4RV9Uk2v"},
            {"A11", "Unknown", "Subject2", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "GVv2wR90hyyWrWmlYHZQ1C"},
            {"A12", "Unknown", "Subject2", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "qSuSKy5.guyeUO2Qgb5K1M"},
            {"B1", "Unknown", "Subject3", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "fg2aEmoaic,ykvyNBTcA3H"},
            {"B2", "Unknown", "Subject3", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "EjGJbY7OisCA6mgJ8Tuv02"},
            {"B3", "Unknown", "Subject4", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "zvkVnRFuhkWAa2QvLZXz2G"},
            {"B4", "Unknown", "Subject4", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "ahMiyqLBiduSCJQ,Ehvf3Z"},
            {"B5", "Unknown", "Subject5", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "U4zP.ntYjPOQ4BLo73jQ0B"},
            {"B6", "Unknown", "Subject5", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", ".sXZMhnmhG6pQ2DT,szM24"},
            {"B7", "Unknown", "Subject6", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "5jgf,BCJikupRYPZPjhZ2b"},
            {"B8", "Unknown", "Subject6", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "W,jAOvAGg7aScyq6H9jM2m"},
            {"B9", "Unknown", "Subject7", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "ZlRXVQiihbGVVOGc0loj1L"},
            {"B10", "Unknown", "Subject7", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "9cnm2nmRgyi9bAwqTcKR0j"},
            {"B11", "Unknown", "Subject8", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "UmLWM2r2gAuu8chpTLos3D"},
            {"B12", "Unknown", "Subject8", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "15I4KsOFiTakzH0pEer10y"},
            {"C1", "Unknown", "Subject9", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "S413KTjZgz6whm2qrMPb16"},
            {"C2", "Unknown", "Subject9", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "9fDACvZmiiawEJ1jqIxG12"},
            {"C3", "Unknown", "Subject10", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "vGh29D5EhqmtFoI5Xuwp29"},
            {"C4", "Unknown", "Subject10", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "rb65ZtanjGyIQexsQURK0z"},
            {"C5", "Unknown", "Subject11", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "MvZpL,0sjKSoG8yshMBz2y"},
            {"C6", "Unknown", "Subject11", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "VFb4BbLnh0iTRH2rpWfS0."},
            {"C7", "Unknown", "Subject12", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "SG1zaeXmj9WuXk0J.0t52H"},
            {"C8", "Unknown", "Subject12", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "iAJncCq8htifqllq2oSW1p"},
            {"C9", "Unknown", "Subject13", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "Hz.uBSS0jda0zvDBO,Ne05"},
            {"C10", "Unknown", "Subject13", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "Joj43YcejVy9R9yQbjbd1a"},
            {"C11", "Unknown", "Subject14", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "FFhmfuRegiOyv0fvAfGV0h"},
            {"C12", "Unknown", "Subject14", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "jlairkLYgmyfD2,xS3t92r"},
            {"D1", "Unknown", "Subject15", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "zL54,4JAgDusizgAY2TN31"},
            {"D2", "Unknown", "Subject15", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "ODw7ggxfhGe9cVYhk4rZ0."},
            {"D3", "Unknown", "Subject16", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "9lNedv4JjcudaVd5mox83k"},
            {"D4", "Unknown", "Subject16", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "RC6Nkl2Agribusk3rzSg13"},
            {"D5", "Unknown", "Subject17", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "Fgc9kM8FhjifV1dBH7u114"},
            {"D6", "Unknown", "Subject17", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "VlN0TAQFjGmvoejWpbXh1C"},
            {"D7", "Unknown", "Subject18", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "SQOe,ooGhaK1LllIBMNo3,"},
            {"D8", "Unknown", "Subject18", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "VtEwkC,2hvKw,zkd4z3N1H"},
            {"D9", "Unknown", "Subject19", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "bGDfZMoMi1,IzuN,T7hI18"},
            {"D10", "Unknown", "Subject19", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "tokW.oLsjzOsJOPx,qfm3s"},
            {"D11", "Unknown", "Subject20", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "h8F3yj7viwO6l5IaHNzD1l"},
            {"D12", "Unknown", "Subject20", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "NUgvOzGSgsyngjTB.2.n1u"},
            {"E1", "Unknown", "Subject21", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "5cJ9wzBmhYi0ZQYWHpge20"},
            {"E2", "Unknown", "Subject21", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "ouSpnxnugyaHWWrGibR43E"},
            {"E3", "Unknown", "Subject22", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "TaVdU,q1gsabUki,t8fS0L"},
            {"E4", "Unknown", "Subject22", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "fgSWPr3,gmyy0tv1gfSL2t"},
            {"E5", "Unknown", "Subject23", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "uF5NiJx7ieidyTcftw,D1C"},
            {"E6", "Unknown", "Subject23", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "vzeLEWw,ifmF9.GBUIyX3W"},
            {"E7", "Unknown", "Subject24", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "BX07u8FKjuenFXD1w7c51O"},
            {"E8", "Unknown", "Subject24", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "38u0EUMgihyOm.o811qu2b"},
            {"E9", "Unknown", "Subject25", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "IGb9Rh0Ki12.cZtE78xF1T"},
            {"E10", "Unknown", "Subject25", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "xseeKjrPgkSBagv.I4nT2f"},
            {"E11", "Unknown", "Subject26", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "irLzykuTi1GrIuVFislQ1P"},
            {"E12", "Unknown", "Subject26", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "wDMKC.nYhd,OCyZJv7.20E"},
            {"F1", "Unknown", "Subject27", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "I7S7yF.sidekqOA5WRw.2q"},
            {"F2", "Unknown", "Subject27", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "kgAtvMSvhZqbgY4uRNlN1J"},
            {"F3", "Unknown", "Subject28", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "CL5KMUsIhKqe4f8k6mQo1W"},
            {"F4", "Unknown", "Subject28", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "hXT2dz6widKRxPClPgj52N"},
            {"F5", "Unknown", "Subject29", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "Gu70UnuzgruOXVz51pBD0H"},
            {"F6", "Unknown", "Subject29", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "3KzBTqvLgu2aU.UWBO0Q1l"},
            {"F7", "Unknown", "Subject30", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "JA0WvgUrhxWD2pu9rc1q0H"},
            {"F8", "Unknown", "Subject30", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "LXqodPBpjDme2MZ.TIDG2X"},
            {"F9", "Pos Control", "Positive Control-1", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "0f7BlbOkh5SopKJ4BL4,05"},
            {"F10", "Pos Control", "Positive Control-1", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "YRL,Oec8iducoKOB1lOd3C"},
            {"F11", "Pos Control", "Positive Control-2", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "Rk1oO4cjgoiCTYhCui3z2x"},
            {"F12", "Pos Control", "Positive Control-2", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "1Uwe6MtZhYS78IFiKfc12F"},
            {"G1", "Neg Control", "NTC", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "mucqgx5xiBO8H5WTFmXm2v"},
            {"G2", "Neg Control", "NTC", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "qhPwle6DidKxz5yw03aM1a"},
            {"G3", "Standard", "STD_1000000", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "oe8u73LVjqi4gJbPKtLz2d"},
            {"G4", "Standard", "STD_1000000", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "T3isWmEPjZOzyJDC,lba25"},
            {"G5", "Standard", "STD_320000", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "6Cr3r9KuimKZKoONeDe71s"},
            {"G6", "Standard", "STD_320000", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "fyjFvEWhhR,TYxmL0kWV0S"},
            {"G7", "Standard", "STD_100000", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "fZ.q9Y.FhCaR9JIdDTVR3I"},
            {"G8", "Standard", "STD_100000", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "Fsn74,wqjCeBwA5WLx,D1,"},
            {"G9", "Standard", "STD_32000", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "CdvGPxK2hFSuBFc7oHZw08"},
            {"G10", "Standard", "STD_32000", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "ZA1sM7aagR,uYt5mpXPL3E"},
            {"G11", "Standard", "STD_10000", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "QtbNbZGkiQOhV7Y3GQeM3T"},
            {"G12", "Standard", "STD_10000", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "nll3Z5XIhNWAYpDNj.oP1M"},
            {"H1", "Standard", "STD_3200", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "N4gjMYkjhtCjO.Pxd.Rg0E"},
            {"H2", "Standard", "STD_3200", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "112X8WV5gdWwUT5j6Ijh1m"},
            {"H3", "Standard", "STD_1000", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "kd6PdK1zjvuDsTabA24x3v"},
            {"H4", "Standard", "STD_1000", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "3N04G0esjUmQzkm40hBC2N"},
            {"H5", "Standard", "STD_320", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "URDcemJIiR6HwFWLxo,g0E"},
            {"H6", "Standard", "STD_320", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "S8I,CajEjM6Wds7vJAX824"},
            {"H7", "Standard", "STD_100", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "pY1ISFpNhE,YaS.DSzTQ1Q"},
            {"H8", "Standard", "STD_100", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "7f8Xvcqhj0,1ZJ1dcQC01K"},
            {"H9", "Standard", "STD_32", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "5UdLi8bbhjCS3CLiYGkW3m"},
            {"H10", "Standard", "STD_32", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "EkzrU7hehnSYUMYhDDSc2G"},
            {"H11", "Standard", "STD_10", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "wUPszeEXiCCrnRpEtIbX3t"},
            {"H12", "Standard", "STD_10", "2018-02-20", "5", "TestMaterial", "test comment", "0.3", "u5OSfw3MjtqgWLbwhdhk3o"}
    };

    public ViralLoadAssayTest()
    {
        PROJECT_NAME = "VL_AssayVerifyProject" + TRICKY_CHARACTERS_FOR_PROJECT_NAMES;
    }

    @Override
    @Test
    public void testSteps() throws Exception
    {
        setUpTest();
        createPlateTemplate();
        importABI7500Results();
        createWNPRCPlateTemplate(LC480);
        importWNPRCResults(LC480);
        createWNPRCPlateTemplate(LC96);
        importWNPRCResults(LC96);
    }

    @Override
    protected void setUpTest() throws Exception
    {
        super.setUpTest();

        ensureABI7500Records();
        setUpLC480Assay();
        setUpLC96Assay();
    }

    private void setUpLC480Assay() throws Exception
    {
        Map<String, FieldDefinition.ColumnType> resultFields = new HashMap<>();
        resultFields.put("uniqueSample", FieldDefinition.ColumnType.String);
        resultFields.put("nucleicAcidVol", FieldDefinition.ColumnType.Decimal);
        defineViralAssayWithAdditionalFields("Viral Loads",  LC480 + " " + ASSAY_NAME, null, null, resultFields);
    }

    public void defineViralAssayWithAdditionalFields(String provider, String label, Map<String, FieldDefinition.ColumnType> batchFields, Map<String, FieldDefinition.ColumnType> runFields, Map<String, FieldDefinition.ColumnType> resultFields)
    {
        log("Defining a test assay at the project level");
        //define a new assay at the project level
        //the pipeline must already be setup
        goToProjectHome();

        //copied from old test
        goToManageAssays();
        ReactAssayDesignerPage designerPage = new UIAssayHelper(this).createAssayDesign(provider, label);

        addViralAssayFields(batchFields, designerPage.goToBatchFields());
        addViralAssayFields(runFields, designerPage.goToRunFields());
        // This assay uses "Result" instead of "Results" for its domain name
        addViralAssayFields(resultFields, designerPage.expandFieldsPanel("Result"));

        designerPage.clickFinish();
    }

    private void addViralAssayFields(Map<String, FieldDefinition.ColumnType> fields, DomainFormPanel section)
    {
        if (fields != null)
        {
            for (Map.Entry<String, FieldDefinition.ColumnType> entry : fields.entrySet())
            {
                section.addField(new FieldDefinition(entry.getKey(), entry.getValue()));
            }
        }
    }

    private void setUpLC96Assay()
    {
        Map<String, FieldDefinition.ColumnType> resultFields = new HashMap<>();
        resultFields.put("uniqueSample", FieldDefinition.ColumnType.String);
        resultFields.put("nucleicAcidVol", FieldDefinition.ColumnType.Decimal);
        resultFields.put("color", FieldDefinition.ColumnType.String);
        resultFields.put("geneName", FieldDefinition.ColumnType.String);
        resultFields.put("call", FieldDefinition.ColumnType.String);
        resultFields.put("excluded", FieldDefinition.ColumnType.String);
        resultFields.put("cqMean", FieldDefinition.ColumnType.Decimal);
        resultFields.put("cqError", FieldDefinition.ColumnType.Decimal);
        resultFields.put("concentrationMean", FieldDefinition.ColumnType.Decimal);
        resultFields.put("concentrationError", FieldDefinition.ColumnType.Decimal);
        resultFields.put("replicateGroup", FieldDefinition.ColumnType.String);
        resultFields.put("dye", FieldDefinition.ColumnType.String);
        resultFields.put("editedCall", FieldDefinition.ColumnType.String);
        resultFields.put("slope", FieldDefinition.ColumnType.Decimal);
        resultFields.put("epf", FieldDefinition.ColumnType.Decimal);
        resultFields.put("failure", FieldDefinition.ColumnType.String);
        resultFields.put("notes", FieldDefinition.ColumnType.String);
        resultFields.put("samplePrepNotes", FieldDefinition.ColumnType.String);
        resultFields.put("number", FieldDefinition.ColumnType.Integer);

        defineViralAssayWithAdditionalFields("Viral Loads", LC96 + " " + ASSAY_NAME, null, null, resultFields);
    }

    private void ensureABI7500Records() throws CommandException, IOException
    {
        String query = "abi7500_detectors";
        String schema = "viral_load_assay";
        String assayName = "SIVmac239-Gag";

        log("Inserting initial records into ABI7500 Detectors table");

        Connection cn = WebTestHelper.getRemoteApiConnection();

        SelectRowsCommand selectCmd = new SelectRowsCommand(schema, query);
        selectCmd.addFilter(new Filter("assayName", assayName));
        SelectRowsResponse resp = selectCmd.execute(cn, getProjectName());
        Long count = (Long)resp.getRowCount();
        if (count == 0)
        {
            log("Creating ABI7500 detector record");

            InsertRowsCommand insertCmd = new InsertRowsCommand(schema, query);
            Map<String,Object> rowMap = new HashMap<>();
            rowMap.put("assayName", assayName);
            rowMap.put("detector", DETECTOR_NAME);
            rowMap.put("reporter", "FAM");
            insertCmd.addRow(rowMap);
            SaveRowsResponse saveResp = insertCmd.execute(cn, getProjectName());
            assertEquals("Problem creating record", saveResp.getRowsAffected(), (long)1);
        }
        else
        {
            log("ABI7500 already exists, no action needed");
            Map<String, Object> row = resp.getRows().get(0);
            DETECTOR_NAME = (String)row.get("detector");
        }
    }
    private void createPlateTemplate()
    {
        _helper.goToLabHome();
        _helper.clickNavPanelItem(ASSAY_NAME + ":", IMPORT_DATA_TEXT);
        click(Ext4Helper.Locators.menuItem("Prepare Run"));
        waitForElement(Ext4Helper.Locators.window(IMPORT_DATA_TEXT));
        waitAndClickAndWait(Ext4Helper.Locators.ext4Button("Submit"));
        checkErrors();

        List<String> expectedCols = new ArrayList<>();
        expectedCols.add("well");
        expectedCols.add("category");
        expectedCols.add("subjectId");
        expectedCols.add("date");
        expectedCols.add("sampleVol");
        expectedCols.add("comment");
        expectedCols.add("sampleId");

        try
        {
            //this page fails to load on team city windows/sqlserver agents only?
            waitForElement(Locator.xpath("//span[contains(text(), 'Freezer Id') and contains(@class, 'x4-column-header-text')]"), WAIT_FOR_JAVASCRIPT * 2); //ensure grid loaded
        }
        catch (NoSuchElementException e)
        {
            checkErrors();

            throw e;
        }
        _helper.addRecordsToAssayTemplate(TEMPLATE_DATA, expectedCols);

        waitAndClick(Ext4Helper.Locators.ext4Button("Plate Layout"));
        waitForElement(Ext4Helper.Locators.window("Configure Plate"));
        waitForText("Group By Category");
        Ext4FieldRef.getForLabel(this, "Group By Category").setChecked(true);
        waitForText("Below are the sample categories");
        Ext4ComboRef ctlField = Ext4ComboRef.getForLabel(this, "Neg Control (2)");
        ctlField.setComboByDisplayValue("A8");
        waitAndClick(Ext4Helper.Locators.ext4Button("Submit"));
        assertAlert("Error: Neg Control conflicts with an existing sample in well: A8");

        ctlField.setValue(73); //corresponds to G1
        waitAndClick(Ext4Helper.Locators.ext4Button("Submit"));

        waitForElement(_helper.getAssayWell("G1", LabModuleHelper.NEG_COLOR));
        assertElementPresent(_helper.getAssayWell("G1", LabModuleHelper.NEG_COLOR));
        assertElementPresent(_helper.getAssayWell("F12", LabModuleHelper.POS_COLOR));
        assertElementPresent(_helper.getAssayWell("B5", LabModuleHelper.UNKNOWN_COLOR));
        assertElementPresent(_helper.getAssayWell("G3", LabModuleHelper.STD_COLOR));
        assertElementPresent(_helper.getAssayWell("H12", LabModuleHelper.STD_COLOR));

        Ext4FieldRef.getForLabel(this, "Run Name").setValue("TestRun");

        waitAndClick(Ext4Helper.Locators.ext4ButtonEnabled("Save and Close"));
        waitForText("Save Complete");
        waitAndClick(Ext4Helper.Locators.ext4Button("OK"));

        //verify template created
        _helper.clickNavPanelItem(ASSAY_NAME + ":", IMPORT_DATA_TEXT);
        clickAndWait(Ext4Helper.Locators.menuItem("View Planned Runs"));

        log("Reopening saved run plan");
        waitForElement(Locators.bodyTitle("Planned Assay Runs"), WAIT_FOR_PAGE);
        DataRegionTable dr = new DataRegionTable("query", this);

        dr.clickEditRow(0);

        //ensure previous run loads correctly
        waitForElement(_helper.getAssayWell("B2", LabModuleHelper.UNKNOWN_COLOR), WAIT_FOR_PAGE);
        assertElementPresent(_helper.getAssayWell("G1", LabModuleHelper.NEG_COLOR));
        assertElementPresent(_helper.getAssayWell("B5", LabModuleHelper.UNKNOWN_COLOR));
        assertElementPresent(_helper.getAssayWell("G3", LabModuleHelper.STD_COLOR));
        assertElementPresent(_helper.getAssayWell("H12", LabModuleHelper.STD_COLOR));

        //no duplicate wells allowed
        Ext4GridRef grid = _ext4Helper.queryOne("grid", Ext4GridRef.class);
        grid.setGridCell(1, "well", "H11");
        click(Ext4Helper.Locators.ext4Button("Save"));
        waitForElement(Ext4Helper.Locators.window("Error"));
        click(Ext4Helper.Locators.ext4Button("OK"));
        assertTextPresent("another sample is already present in well: H11");
        grid.setGridCell(1, "well", "A5");  //restore original contents

        //verify neg controls enforced
        grid.setGridCell(70, "category", "Unknown");
        click(Ext4Helper.Locators.ext4Button("Download"));
        waitForElement(Ext4Helper.Locators.window("Error"));
        click(Ext4Helper.Locators.ext4Button("OK"));
        assertTextPresent("Must provide at least 2 negative controls per run");
        grid.setGridCell(70, "category", "Neg Control");  //restore original contents

        //save valid data
        click(Ext4Helper.Locators.ext4Button("Save"));
        waitAndClick(Ext4Helper.Locators.ext4Button("OK"));
        assertTextNotPresent("Must provide at least 2 negative controls per run");

        //test download
        String url = getCurrentRelativeURL();
        beginAt(url);
        waitForElement(_helper.getAssayWell("G1", LabModuleHelper.NEG_COLOR), WAIT_FOR_PAGE);

        File export = doAndWaitForDownload(() -> waitAndClick(WAIT_FOR_JAVASCRIPT, Ext4Helper.Locators.ext4Button("Download"), 0));
        TextSearcher exportSearcher = new TextSearcher(export);

        int i = 1;

        Map<String, String> categoryMap = new HashMap<>();
        categoryMap.put("Unknown", "UNKN");
        categoryMap.put("Standard", "STND");
        categoryMap.put("Pos Control", "UNKN");
        categoryMap.put("Neg Control", "NTC");
        String delim = "\t";

        while (i < TEMPLATE_DATA.length)
        {
            String[] row = TEMPLATE_DATA[i];
            StringBuilder sb = new StringBuilder();
            sb.append(row[1]);
            if (row[3].equals("Unknown") || row[3].equals("Pos Control"))
            {
                sb.append("_").append(row[2]);
            }
            sb.append(delim);
            sb.append(DETECTOR_NAME);
            sb.append(delim);
            sb.append(categoryMap.get(row[3]));

            if (row[3].equalsIgnoreCase("Standard"))
            {
                String[] parts = row[1].split("_");
                sb.append(delim).append(parts[1]);
            }

            assertTextPresent(exportSearcher, sb.toString());

            i++;
        }

        i = 1;
        while (i < 5)
        {
            assertTextPresent(exportSearcher, i + delim + "empty");
            i++;
        }
    }

    private void createWNPRCPlateTemplate(String instrument)
    {
        String fullAssayName = instrument + " " + ASSAY_NAME;
        _helper.goToLabHome();
        _helper.clickNavPanelItem(fullAssayName + ":", IMPORT_DATA_TEXT);
        click(Ext4Helper.Locators.menuItem("Prepare Run"));
        waitForElement(Ext4Helper.Locators.window(IMPORT_DATA_TEXT));
        waitAndClickAndWait(Ext4Helper.Locators.ext4Button("Submit"));

        List<String> expectedCols = new ArrayList<>();
        expectedCols.add("well");
        expectedCols.add("category");
        expectedCols.add("subjectId");
        expectedCols.add("date");
        expectedCols.add("nucleicAcidVol");
        expectedCols.add("sourceMaterial");
        expectedCols.add("comment");
        expectedCols.add("sampleVol");
        expectedCols.add("uniqueSample");

        Ext4ComboRef.waitForField(this, "Import Method");
        Ext4ComboRef importMethodField = Ext4ComboRef.getForLabel(this, "Import Method");
        importMethodField.clickTrigger();
        getDriver().findElement(By.xpath("//li[text()='" + instrument + "']")).click();

        waitForElement(Locator.xpath("//span[contains(text(), 'Source Material') and contains(@class, 'x4-column-header-text')]")); //ensure grid loaded
        _helper.addRecordsToAssayTemplate(WNPRC_TEMPLATE_DATA, expectedCols);

        waitAndClick(Ext4Helper.Locators.ext4Button("Plate Layout"));
        waitForElement(Ext4Helper.Locators.window("Configure Plate"));
        waitForText("Group By Category");
        Ext4FieldRef.getForLabel(this, "Group By Category").setChecked(true);
        waitForText("Below are the sample categories");
        Ext4FieldRef ctlField = Ext4FieldRef.getForLabel(this, "Neg Control (2)");
        ctlField.setValue(8); //A8
        waitAndClick(Ext4Helper.Locators.ext4Button("Submit"));
        assertAlert("Error: Neg Control conflicts with an existing sample in well: A8");

        ctlField.setValue(73); //corresponds to G1
        waitAndClick(Ext4Helper.Locators.ext4Button("Submit"));

        waitForElement(_helper.getAssayWell("G1", LabModuleHelper.NEG_COLOR));
        assertElementPresent(_helper.getAssayWell("G1", LabModuleHelper.NEG_COLOR));
        assertElementPresent(_helper.getAssayWell("F12", LabModuleHelper.POS_COLOR));
        assertElementPresent(_helper.getAssayWell("B5", LabModuleHelper.UNKNOWN_COLOR));
        assertElementPresent(_helper.getAssayWell("G3", LabModuleHelper.STD_COLOR));
        assertElementPresent(_helper.getAssayWell("H12", LabModuleHelper.STD_COLOR));

        Ext4FieldRef.getForLabel(this, "Run Name").setValue("TestRun");

        waitAndClick(Ext4Helper.Locators.ext4ButtonEnabled("Save and Close"));
        waitForText("Save Complete");
        waitAndClick(Ext4Helper.Locators.ext4Button("OK"));

        //verify template created
        _helper.clickNavPanelItem(fullAssayName + ":", IMPORT_DATA_TEXT);
        click(Ext4Helper.Locators.menuItem("View Planned Runs"));

        log("Reopening saved run plan");
        waitForElement(Locator.tagContainingText("h3", "Planned Assay Runs"), WAIT_FOR_PAGE);
        DataRegionTable dr = new DataRegionTable("query", this);

        dr.clickEditRow(0);

        //ensure previous run loads correctly
        waitForElement(_helper.getAssayWell("G1", LabModuleHelper.NEG_COLOR), WAIT_FOR_PAGE);
        assertElementPresent(_helper.getAssayWell("G1", LabModuleHelper.NEG_COLOR));
        assertElementPresent(_helper.getAssayWell("B5", LabModuleHelper.UNKNOWN_COLOR));
        assertElementPresent(_helper.getAssayWell("G3", LabModuleHelper.STD_COLOR));
        assertElementPresent(_helper.getAssayWell("H12", LabModuleHelper.STD_COLOR));

        //no duplicate wells allowed
        Ext4GridRef grid = _ext4Helper.queryOne("grid", Ext4GridRef.class);
        grid.setGridCell(1, "well", "H11");
        click(Ext4Helper.Locators.ext4Button("Save"));
        waitForElement(Ext4Helper.Locators.window("Error"));
        click(Ext4Helper.Locators.ext4Button("OK"));
        assertTextPresent("another sample is already present in well: H11");
        grid.setGridCell(1, "well", "A5");  //restore original contents

        //save valid data
        click(Ext4Helper.Locators.ext4Button("Save"));
        waitAndClick(Ext4Helper.Locators.ext4Button("OK"));
        assertTextNotPresent("Must provide at least 2 negative controls per run");

        goToProjectHome();
    }

    /**
     * Imports results for the run created using createPlateTemplate().
     * Also verifies error messages and VL calculations
     */
    private void importABI7500Results() throws Exception
    {
        log("Verifying ABI7500 Import");
        _helper.goToLabHome();
        _helper.clickNavPanelItem(ASSAY_NAME + ":", IMPORT_DATA_TEXT);
        click(Ext4Helper.Locators.menuItem("View Planned Runs"));

        log("Entering results for saved run");
        waitForElement(Locators.bodyTitle("Planned Assay Runs"), WAIT_FOR_PAGE);
        DataRegionTable templates = new DataRegionTable("query", this);
        clickAndWait(templates.link(0, 0)); // the 'enter results' link

        //use the same data included with this assay
        Locator btn = Locator.linkContainingText("Download Example Data");
        waitForElement(btn);

        assertEquals("Incorrect value for field", "ABI 7500", Ext4FieldRef.getForLabel(this, "Instrument").getValue());
        assertEquals("Incorrect value for field", Long.valueOf(60), Ext4FieldRef.getForLabel(this, "Eluate Volume").getValue());
        assertEquals("Incorrect value for field", Long.valueOf(20), Ext4FieldRef.getForLabel(this, "Sample Vol Per Rxn").getValue());
        waitAndClick(btn);

        Ext4FieldRef textarea = _ext4Helper.queryOne("#fileContent", Ext4FieldRef.class);
        String text = _helper.getExampleData();

        log("Trying to save invalid data");
        String errorText = text.replaceAll("Subject1", "");
        errorText = errorText.replaceAll("Subject2\tDETECTOR1", "Subject2\tDETECTOR2");
        textarea.setValue(errorText);
        waitAndClick(WAIT_FOR_PAGE, Ext4Helper.Locators.ext4Button("Upload"), 0);
        waitForElement(Ext4Helper.Locators.window("Upload Failed"));
        click(Ext4Helper.Locators.ext4Button("OK"));
        assertTextPresent(
                "There were errors in the upload",
                "Missing sample name for row: 9",
                "Row 11: Unable to find detector information for detector: DETECTOR2",
                "Row 12: Unable to find detector information for detector: DETECTOR2");

        log("Saving valid data");
        textarea.setValue(text);
        waitAndClick(Ext4Helper.Locators.ext4Button("Upload"));
        waitForElement(Ext4Helper.Locators.window("Success"));
        clickAndWait(Ext4Helper.Locators.ext4Button("OK"));
        waitForText("Import Samples");

        log("Verifying results");
        _helper.clickNavPanelItemAndWait(ASSAY_NAME + " Runs:", 1);
        waitAndClickAndWait(Locator.linkContainingText("view results"));

        DataRegionTable results = new DataRegionTable("Data", this);

        int totalRows = 92;
        Map<String, String[]> expected = new LinkedHashMap<>();
        expected.put("0", new String[]{"LowQual1", "Unknown", "2012-02-01", "32360000"});
        expected.put("1", new String[]{"LowQual1", "Unknown", "2012-02-01", "4122000000"});
        expected.put("2", new String[]{"LowQual2", "Unknown", "2012-06-01", "0.07317"});
        expected.put("3", new String[]{"LowQual2", "Unknown", "2012-06-01", "599200"});
        expected.put("4", new String[]{"NTC", "Neg Control", "", "0"});
        expected.put("5", new String[]{"NTC", "Neg Control", "", "0"});
        expected.put("6", new String[]{"Positive Control-1", "Pos Control", "2012-04-12", "117800"});
        expected.put("7", new String[]{"Positive Control-1", "Pos Control", "2012-04-12", "140700"});
        expected.put("8", new String[]{"Positive Control-2", "Pos Control", "2012-04-14", "90090"});
        expected.put("9", new String[]{"Positive Control-2", "Pos Control", "2012-04-14", "128700"});
        expected.put("10", new String[]{"STD_10", "Standard", "", "111.5"});
        expected.put("11", new String[]{"STD_10", "Standard", "", "89.54"});
        expected.put("12", new String[]{"STD_32", "Standard", "", "349.5"});
        expected.put("13", new String[]{"STD_32", "Standard", "", "256"});
        expected.put("14", new String[]{"STD_100", "Standard", "", "847.9"});
        expected.put("15", new String[]{"STD_100", "Standard", "", "971.1"});
        expected.put("16", new String[]{"STD_320", "Standard", "", "3740"});
        expected.put("17", new String[]{"STD_320", "Standard", "", "4118"});
        expected.put("18", new String[]{"STD_1000", "Standard", "", "7519"});
        expected.put("19", new String[]{"STD_1000", "Standard", "", "11990"});
        expected.put("20", new String[]{"STD_3200", "Standard", "", "25930"});
        expected.put("21", new String[]{"STD_3200", "Standard", "", "30320"});
        expected.put("22", new String[]{"STD_10000", "Standard", "", "111300"});
        expected.put("23", new String[]{"STD_10000", "Standard", "", "120500"});
        expected.put("24", new String[]{"STD_32000", "Standard", "", "365300"});
        expected.put("25", new String[]{"STD_32000", "Standard", "", "301700"});
        expected.put("26", new String[]{"STD_100000", "Standard", "", "1152034"});
        expected.put("27", new String[]{"STD_100000", "Standard", "", "1168387"});
        expected.put("28", new String[]{"STD_320000", "Standard", "", "2529000"});
        expected.put("29", new String[]{"STD_320000", "Standard", "", "3637000"});
        expected.put("30", new String[]{"STD_1000000", "Standard", "", "8328000"});
        expected.put("31", new String[]{"STD_1000000", "Standard", "", "9216000"});
        expected.put("32", new String[]{"Subject1", "Unknown", "2012-02-12", "7187000"});
        expected.put("33", new String[]{"Subject1", "Unknown", "2012-02-12", "7999000"});
        expected.put("34", new String[]{"Subject2", "Unknown", "2012-02-14", "58730"});
        expected.put("35", new String[]{"Subject2", "Unknown", "2012-02-14", "86430"});
        expected.put("36", new String[]{"Subject3", "Unknown", "2012-02-16", "108300"});
        expected.put("37", new String[]{"Subject3", "Unknown", "2012-02-16", "79390"});
        expected.put("38", new String[]{"Subject4", "Unknown", "2012-02-18", "3376"});
        expected.put("39", new String[]{"Subject4", "Unknown", "2012-02-18", "3606"});
        expected.put("40", new String[]{"Subject5", "Unknown", "2012-02-20", "23760"});
        expected.put("41", new String[]{"Subject5", "Unknown", "2012-02-20", "25180"});
        expected.put("42", new String[]{"Subject6", "Unknown", "2012-02-22", "1066"});
        expected.put("43", new String[]{"Subject6", "Unknown", "2012-02-22", "1017"});
        expected.put("44", new String[]{"Subject7", "Unknown", "2012-02-24", "185300"});
        expected.put("45", new String[]{"Subject7", "Unknown", "2012-02-24", "143600"});
        expected.put("46", new String[]{"Subject8", "Unknown", "2012-02-26", "612.8"});
        expected.put("47", new String[]{"Subject8", "Unknown", "2012-02-26", "640.7"});
        expected.put("48", new String[]{"Subject9", "Unknown", "2012-02-28", "227.3"});
        expected.put("49", new String[]{"Subject9", "Unknown", "2012-02-28", "259.5"});
        expected.put("50", new String[]{"Subject10", "Unknown", "2012-03-01", "397300"});
        expected.put("51", new String[]{"Subject10", "Unknown", "2012-03-01", "396100"});
        expected.put("52", new String[]{"Subject11", "Unknown", "2012-03-03", "285100"});
        expected.put("53", new String[]{"Subject11", "Unknown", "2012-03-03", "312300"});
        expected.put("54", new String[]{"Subject12", "Unknown", "2012-03-05", "537900"});
        expected.put("55", new String[]{"Subject12", "Unknown", "2012-03-05", "616500"});
        expected.put("56", new String[]{"Subject13", "Unknown", "2012-03-07", "329.1"});
        expected.put("57", new String[]{"Subject13", "Unknown", "2012-03-07", "393.7"});
        expected.put("58", new String[]{"Subject14", "Unknown", "2012-03-09", "1253000"});
        expected.put("59", new String[]{"Subject14", "Unknown", "2012-03-09", "1568000"});
        expected.put("60", new String[]{"Subject15", "Unknown", "2012-03-11", "8382"});
        expected.put("61", new String[]{"Subject15", "Unknown", "2012-03-11", "11970"});
        expected.put("62", new String[]{"Subject16", "Unknown", "2012-03-13", "0"});
        expected.put("63", new String[]{"Subject16", "Unknown", "2012-03-13", "0"});
        expected.put("64", new String[]{"Subject17", "Unknown", "2012-03-15", "28890"});
        expected.put("65", new String[]{"Subject17", "Unknown", "2012-03-15", "36380"});
        expected.put("66", new String[]{"Subject18", "Unknown", "2012-03-17", "2291"});
        expected.put("67", new String[]{"Subject18", "Unknown", "2012-03-17", "2088"});
        expected.put("68", new String[]{"Subject19", "Unknown", "2012-03-19", "359200"});
        expected.put("69", new String[]{"Subject19", "Unknown", "2012-03-19", "301900"});
        expected.put("70", new String[]{"Subject20", "Unknown", "2012-03-21", "29820"});
        expected.put("71", new String[]{"Subject20", "Unknown", "2012-03-21", "29210"});
        expected.put("72", new String[]{"Subject21", "Unknown", "2012-03-23", "38790"});
        expected.put("73", new String[]{"Subject21", "Unknown", "2012-03-23", "30000"});
        expected.put("74", new String[]{"Subject22", "Unknown", "2012-03-25", "1852"});
        expected.put("75", new String[]{"Subject22", "Unknown", "2012-03-25", "2314"});
        expected.put("76", new String[]{"Subject23", "Unknown", "2012-03-27", "28090"});
        expected.put("77", new String[]{"Subject23", "Unknown", "2012-03-27", "27310"});
        expected.put("78", new String[]{"Subject24", "Unknown", "2012-03-29", "0"});
        expected.put("79", new String[]{"Subject24", "Unknown", "2012-03-29", "0"});
        expected.put("80", new String[]{"Subject25", "Unknown", "2012-03-31", "59640"});
        expected.put("81", new String[]{"Subject25", "Unknown", "2012-03-31", "58800"});
        expected.put("82", new String[]{"Subject26", "Unknown", "2012-04-02", "425100"});
        expected.put("83", new String[]{"Subject26", "Unknown", "2012-04-02", "740400"});
        expected.put("84", new String[]{"Subject27", "Unknown", "2012-04-04", "60650"});
        expected.put("85", new String[]{"Subject27", "Unknown", "2012-04-04", "56570"});
        expected.put("86", new String[]{"Subject28", "Unknown", "2012-04-06", "147100"});
        expected.put("87", new String[]{"Subject28", "Unknown", "2012-04-06", "107200"});
        expected.put("88", new String[]{"Subject29", "Unknown", "2012-04-08", "9362"});
        expected.put("89", new String[]{"Subject29", "Unknown", "2012-04-08", "10670"});
        expected.put("90", new String[]{"Subject30", "Unknown", "2012-04-10", "670300"});
        expected.put("91", new String[]{"Subject30", "Unknown", "2012-04-10", "569600"});

        verifyImportedVLs(totalRows, expected, results, null);

        //recreate DR in attempt to fix intermittent failure
        results = new DataRegionTable(results.getDataRegionName(), this);

        int j = 0;
        while (j < 4)
        {
            assertEquals("Incorrect QC Flag", "HIGH CV", results.getDataAsText(j, "QC Flags"));
            j++;
        }


        log("verifying run plan marked as complete");
        _helper.goToLabHome();
        _helper.clickNavPanelItem(ASSAY_NAME + ":", IMPORT_DATA_TEXT);
        click(Ext4Helper.Locators.menuItem("View Planned Runs"));
        waitForElement(Locators.bodyTitle("Planned Assay Runs"), WAIT_FOR_PAGE);

        DataRegionTable dr2 = new DataRegionTable("query", this);
        assertEquals("Run plan not marked completed", 0, dr2.getDataRowCount());
    }

////    private void importWNPRCResults(String instrument) throws Exception
////    {
////        String fullAssayName = instrument + " " + ASSAY_NAME;
////        log("Verifying " + instrument + " Import");
////        _helper.goToLabHome();
////        _helper.clickNavPanelItem(fullAssayName + ":", IMPORT_DATA_TEXT);
////        click(Ext4Helper.Locators.menuItem("View Planned Runs"));
////
////        log("Entering results for saved run");
////        waitForElement(Locator.tagContainingText("h3", "Planned Assay Runs"), WAIT_FOR_PAGE);
////        DataRegionTable templates = new DataRegionTable("query", this);
////        clickAndWait(Locator.linkWithText("Enter Results"));
////
////        //use the same data included with this assay
////        Locator btn = Locator.linkContainingText("Download Example Data");
////        waitForElement(btn);
////
////        assertEquals("Incorrect value for field", instrument, Ext4FieldRef.getForLabel(this, "Instrument").getValue());
////        assertEquals("Incorrect value for field", Long.valueOf(50), Ext4FieldRef.getForLabel(this, "Eluate Volume").getValue());
////        assertEquals("Incorrect value for field", Long.valueOf(5), Ext4FieldRef.getForLabel(this, "Sample Vol Per Rxn").getValue());
////        waitAndClick(btn);
////
////        Ext4FieldRef textarea = _ext4Helper.queryOne("#fileContent", Ext4FieldRef.class);
////        String text = _helper.getExampleData();
////
////        log("Trying to save invalid data");
////        String errorText = text.replace("NTmiKt6kg3i0f4dB2VuZ3H", "NTmiKt6kg3i0f4dB2VuZ3I");
////        errorText = errorText.replace("nCmYQbLEikiQ73iDxmY33Y", "");
////        textarea.setValue(errorText);
////        waitAndClick(Ext4Helper.Locators.ext4Button("Upload"));
////        waitForElement(Ext4Helper.Locators.window("Upload Failed"));
////        click(Ext4Helper.Locators.ext4Button("OK"));
////        assertTextPresent("There were errors in the upload", "Missing sample name for row: 17");
////
////        log("Saving valid data");
////        textarea.setValue(text);
////        waitAndClick(Ext4Helper.Locators.ext4Button("Upload"));
////        waitForElement(Ext4Helper.Locators.window("Success"));
////        waitAndClickAndWait(Ext4Helper.Locators.ext4Button("OK"));
////        waitForText("Import Samples");
////
////        log("Verifying results");
////        _helper.clickNavPanelItemAndWait(ASSAY_NAME + " Runs:", 1);
////        waitAndClickAndWait(Locator.linkContainingText("view results"));
////
////        DataRegionTable results = new DataRegionTable("Data", this);
////
////        int totalRows = 38;
////        Map<String, String[]> expected = new HashMap<>();
////        expected.put("STD_15000000", new String[]{"STD_15000000", "Standard", "", "176000000"});
////        expected.put("STD_5", new String[]{"STD_5", "Standard", "", "56.5"});
////        expected.put("STD_3", new String[]{"STD_3", "Standard", "", "30"});
////        expected.put("STD_0", new String[]{"STD_0", "Standard", "", "0"});
////        expected.put("sd0159", new String[]{"sd0159", "Unknown", "2010-04-19", "793000"});
////        expected.put("sd0160", new String[]{"sd0160", "Unknown", "2010-04-19", "0"});
////        expected.put("sd0338", new String[]{"sd0338", "Unknown", "2010-04-19", "0"});
////        expected.put("sd0339", new String[]{"sd0339", "Unknown", "2010-04-19", "0"});
////        expected.put("sd0340", new String[]{"sd0340", "Unknown", "2010-04-19", "0"});
////        expected.put("sd0341", new String[]{"sd0341", "Unknown", "2010-04-19", "0"});
////        expected.put("sd0345", new String[]{"sd0345", "Unknown", "2010-04-19", "0"});
////        expected.put("sd0346", new String[]{"sd0346", "Unknown", "2010-04-19", "0"});
////        expected.put("deAJ11", new String[]{"deAJ11", "Unknown", "2010-04-21", "0"});
////        expected.put("d90480", new String[]{"d90480", "Unknown", "2010-04-21", "0"});
////        expected.put("d95149", new String[]{"d95149", "Unknown", "2010-04-21", "12000"});
////        expected.put("d96061", new String[]{"d96061", "Unknown", "2010-04-21", "0"});
////        expected.put("d56053", new String[]{"d56053", "Unknown", "2010-04-21", "560000"});
////        expected.put("d28016", new String[]{"d28016", "Unknown", "2010-04-21", "4150"});
////        expected.put("d98037", new String[]{"d98037", "Unknown", "2010-04-21", "17300"});
////        expected.put("d96006", new String[]{"d96006", "Unknown", "2010-04-21", "301"});
////        expected.put("d95019", new String[]{"d95019", "Unknown", "2010-04-21", "396000"});
////        expected.put("d04032", new String[]{"d04032", "Unknown", "2010-04-21", "194000"});
////        expected.put("d03019", new String[]{"d03019", "Unknown", "2010-04-21", "0"});
////        expected.put("CTL_negative", new String[]{"CTL_negative", "Control", "", "0"});
////        expected.put("CTL_negative", new String[]{"CTL_negative", "Control", "", "0"});
////        expected.put("CTL_d02507", new String[]{"CTL_d02507", "Control", "", "10220"});
////        expected.put("CTL_negative", new String[]{"CTL_negative", "Control", "", "0"});
////        expected.put("CTL_r02007", new String[]{"CTL_r02007", "Control", "", "46600"});
////        expected.put("d02056", new String[]{"d02056", "Unknown", "2010-04-19", "102000"});
////        expected.put("d03830", new String[]{"d03830", "Unknown", "2010-04-19", "8500"});
////        expected.put("d04291", new String[]{"d04291", "Unknown", "2010-04-19", "252000"});
////        expected.put("d03504", new String[]{"d03504", "Unknown", "2010-04-19", "171000"});
////        expected.put("dh6U10", new String[]{"dh6U10", "Unknown", "2010-04-20", "1300"});
////        expected.put("d95067", new String[]{"d95067", "Unknown", "2010-04-20", "39.04"});
////        expected.put("d02088", new String[]{"d02088", "Unknown", "2010-04-20", "1200000"});
////        expected.put("d03037", new String[]{"d03037", "Unknown", "2010-04-20", "143.3"});
////        expected.put("d04145", new String[]{"d04145", "Unknown", "2010-04-20", "0"});
////        expected.put("d01599", new String[]{"d01599", "Unknown", "2010-04-20", "36.64"});
////
////        verifyImportedVLs(totalRows, expected, results, new String[]{"Subject Id"});
////    }
////
//    private void verifyImportedVLs(int totalRows, Map<String, String[]> expected, DataRegionTable results, @Nullable String[] keyFields) throws Exception
//    {
//        assertEquals("Incorrect row count", totalRows, results.getDataRowCount());
//        waitForText("SIVmac239-Gag"); //proxy for DR load
//
//        log("DataRegion column count was: " + results.getColumnCount());
//
//        //recreate the DR to see if this removes intermittent test failures
//        results = new DataRegionTable(results.getDataRegionName(), this);
//
//        log("DataRegion column count was: " + results.getColumnCount());
//
//        //recreate the DR to see if this removes intermittent test failures
//        results = new DataRegionTable(results.getDataRegionName(), this);
//
//        DecimalFormat formatter = new DecimalFormat("0.#E00");
//        int i = 0;
//        while (i < totalRows)
//        {
//            String subjectId = results.getDataAsText(i, "Subject Id");
//            String vl = results.getDataAsText(i, "Viral Load");
//            String dateString = StringUtils.trimToNull(results.getDataAsText(i, "Sample Date"));
//            String date = dateString == null ? null : _dateFormat.format(_dateTimeFormat.parse(dateString));
//            String category = results.getDataAsText(i, "Category");
//            String[] expectedVals;
//            StringBuilder sb = new StringBuilder();
//            if (keyFields == null)
//            {
//                expectedVals = expected.get(String.valueOf(i));
//            }
//            else
//            {
//                String delim = "";
//                for (String field : keyFields)
//                {
//                    sb.append(delim).append(results.getDataAsText(i, field));
//                    delim = "_";
//                }
//                expectedVals = expected.get(sb.toString());
//            }
//            assertNotNull("Unable to find expected values: " + sb.toString(), expectedVals);
//
//            assertEquals("Incorrect subjectId on row: " + i, expectedVals[0], subjectId);
//            assertEquals("Incorrect category on row: " + i, expectedVals[1], category);
//            assertEquals("Incorrect sample date on row: " + i, StringUtils.trimToNull(expectedVals[2]), date);
//
//            Double vl1 = Double.parseDouble(expectedVals[3]);
//            String vlFormatted = formatter.format(vl1);
//            assertEquals("Incorrect VL on row: " + i, vlFormatted, StringUtils.trimToNull(vl));
//
//            i++;
//        }
//    }

    private void importWNPRCResults(String instrument) throws Exception
    {
        String fullAssayName = instrument + " " + ASSAY_NAME;
        log("Verifying " + instrument + " Import");
        _helper.goToLabHome();
        _helper.clickNavPanelItem(fullAssayName + ":", IMPORT_DATA_TEXT);
        click(Ext4Helper.Locators.menuItem("View Planned Runs"));

        log("Entering results for saved run");
        waitForElement(Locator.tagContainingText("h3", "Planned Assay Runs"), WAIT_FOR_PAGE);
        DataRegionTable templates = new DataRegionTable("query", this);
        clickAndWait(Locator.linkWithText("Enter Results"));

        //use the same data included with this assay
        Locator btn = Locator.linkContainingText("Download Example Data");
        waitForElement(btn);

        assertEquals("Incorrect value for field", instrument, Ext4FieldRef.getForLabel(this, "Instrument").getValue());
        assertEquals("Incorrect value for field", Long.valueOf(50), Ext4FieldRef.getForLabel(this, "Eluate Volume").getValue());
        assertEquals("Incorrect value for field", Long.valueOf(5), Ext4FieldRef.getForLabel(this, "Sample Vol Per Rxn").getValue());
        waitAndClick(btn);

        Ext4FieldRef textarea = _ext4Helper.queryOne("#fileContent", Ext4FieldRef.class);
        String text = _helper.getExampleData();

        log("Trying to save invalid data");
        String errorText = text.replace("NTmiKt6kg3i0f4dB2VuZ3H", "NTmiKt6kg3i0f4dB2VuZ3I");
        errorText = errorText.replace("nCmYQbLEikiQ73iDxmY33Y", "");
        textarea.setValue(errorText);
        waitAndClick(WAIT_FOR_PAGE, Ext4Helper.Locators.ext4Button("Upload"), 0);
        waitForElement(Ext4Helper.Locators.window("Upload Failed"));
        click(Ext4Helper.Locators.ext4Button("OK"));
        assertTextPresent(
                "There were errors in the upload",
                "Missing sample name for row: 2",
                "Unable to find sample information to match well: NTmiKt6kg3i0f4dB2VuZ3I",
                "Template row with key NTmiKt6kg3i0f4dB2VuZ3H does not have a result",
                "Template row with key nCmYQbLEikiQ73iDxmY33Y does not have a result");

        log("Saving valid data");
        textarea.setValue(text);
        waitAndClick(Ext4Helper.Locators.ext4Button("Upload"));
        waitForElement(Ext4Helper.Locators.window("Success"));
        clickAndWait(Ext4Helper.Locators.ext4Button("OK"));
        waitForText("Import Samples");

        log("Verifying results");
        _helper.clickNavPanelItemAndWait(fullAssayName + " Runs:", 1);
        waitAndClickAndWait(Locator.linkContainingText("view results"));

        DataRegionTable results = new DataRegionTable("Data", this);

        int totalRows = 92;
        Map<String, String[]> expected = new LinkedHashMap<>();
        expected.put("0", new String[]{"LowQual1", "Unknown", "2018-02-20", "5.E+08"});
        expected.put("1", new String[]{"LowQual1", "Unknown", "2018-02-20", "5.3E+07"});
        expected.put("2", new String[]{"LowQual2", "Unknown", "2018-02-20", "5.2E+06"});
        expected.put("3", new String[]{"LowQual2", "Unknown", "2018-02-20", "4.9E+05"});
        expected.put("4", new String[]{"NTC", "Neg Control", "2018-02-20", "9.2E+05"});
        expected.put("5", new String[]{"NTC", "Neg Control", "2018-02-20", "9.5E+05"});
        expected.put("6", new String[]{"Positive Control-1", "Pos Control", "2018-02-20", "4.4E+04"});
        expected.put("7", new String[]{"Positive Control-1", "Pos Control", "2018-02-20", "3.4E+03"});
        expected.put("8", new String[]{"Positive Control-2", "Pos Control", "2018-02-20", "7.6E+02"});
        expected.put("9", new String[]{"Positive Control-2", "Pos Control", "2018-02-20", "6.2E+01"});
        expected.put("10", new String[]{"STD_10", "Standard", "2018-02-20", "4.4E+04"});
        expected.put("11", new String[]{"STD_10", "Standard", "2018-02-20", "3.4E+03"});
        expected.put("12", new String[]{"STD_32", "Standard", "2018-02-20", "5.E+06"});
        expected.put("13", new String[]{"STD_32", "Standard", "2018-02-20", "5.E+05"});
        expected.put("14", new String[]{"STD_100", "Standard", "2018-02-20", "5.3E+08"});
        expected.put("15", new String[]{"STD_100", "Standard", "2018-02-20", "5.E+07"});
        expected.put("16", new String[]{"STD_320", "Standard", "2018-02-20", "4.E+02"});
        expected.put("17", new String[]{"STD_320", "Standard", "2018-02-20", "1.9E+02"});
        expected.put("18", new String[]{"STD_1000", "Standard", "2018-02-20", "5.1E+04"});
        expected.put("19", new String[]{"STD_1000", "Standard", "2018-02-20", "5.1E+03"});
        expected.put("20", new String[]{"STD_3200", "Standard", "2018-02-20", "5.2E+06"});
        expected.put("21", new String[]{"STD_3200", "Standard", "2018-02-20", "4.9E+05"});
        expected.put("22", new String[]{"STD_10000", "Standard", "2018-02-20", "5.E+08"});
        expected.put("23", new String[]{"STD_10000", "Standard", "2018-02-20", "5.3E+07"});
        expected.put("24", new String[]{"STD_32000", "Standard", "2018-02-20", "1.E+06"});
        expected.put("25", new String[]{"STD_32000", "Standard", "2018-02-20", "1.7E+04"});
        expected.put("26", new String[]{"STD_100000", "Standard", "2018-02-20", "1.E+06"});
        expected.put("27", new String[]{"STD_100000", "Standard", "2018-02-20", "9.5E+05"});
        expected.put("28", new String[]{"STD_320000", "Standard", "2018-02-20", "1.3E+06"});
        expected.put("29", new String[]{"STD_320000", "Standard", "2018-02-20", "6.5E+05"});
        expected.put("30", new String[]{"STD_1000000", "Standard", "2018-02-20", "9.7E+05"});
        expected.put("31", new String[]{"STD_1000000", "Standard", "2018-02-20", "1.E+03"});
        expected.put("32", new String[]{"Subject1", "Unknown", "2018-02-20", "5.1E+04"});
        expected.put("33", new String[]{"Subject1", "Unknown", "2018-02-20", "5.1E+03"});
        expected.put("34", new String[]{"Subject2", "Unknown", "2018-02-20", "4.E+02"});
        expected.put("35", new String[]{"Subject2", "Unknown", "2018-02-20", "1.9E+02"});
        expected.put("36", new String[]{"Subject3", "Unknown", "2018-02-20", "5.3E+08"});
        expected.put("37", new String[]{"Subject3", "Unknown", "2018-02-20", "5.E+07"});
        expected.put("38", new String[]{"Subject4", "Unknown", "2018-02-20", "5.E+06"});
        expected.put("39", new String[]{"Subject4", "Unknown", "2018-02-20", "5.E+05"});
        expected.put("40", new String[]{"Subject5", "Unknown", "2018-02-20", "4.4E+04"});
        expected.put("41", new String[]{"Subject5", "Unknown", "2018-02-20", "3.4E+03"});
        expected.put("42", new String[]{"Subject6", "Unknown", "2018-02-20", "7.6E+02"});
        expected.put("43", new String[]{"Subject6", "Unknown", "2018-02-20", "6.2E+01"});
        expected.put("44", new String[]{"Subject7", "Unknown", "2018-02-20", "9.2E+05"});
        expected.put("45", new String[]{"Subject7", "Unknown", "2018-02-20", "9.5E+05"});
        expected.put("46", new String[]{"Subject8", "Unknown", "2018-02-20", "9.7E+05"});
        expected.put("47", new String[]{"Subject8", "Unknown", "2018-02-20", "1.E+03"});
        expected.put("48", new String[]{"Subject9", "Unknown", "2018-02-20", "1.3E+06"});
        expected.put("49", new String[]{"Subject9", "Unknown", "2018-02-20", "6.5E+05"});
        expected.put("50", new String[]{"Subject10", "Unknown", "2018-02-20", "1.E+06"});
        expected.put("51", new String[]{"Subject10", "Unknown", "2018-02-20", "9.5E+05"});
        expected.put("52", new String[]{"Subject11", "Unknown", "2018-02-20", "1.E+06"});
        expected.put("53", new String[]{"Subject11", "Unknown", "2018-02-20", "1.7E+04"});
        expected.put("54", new String[]{"Subject12", "Unknown", "2018-02-20", "5.E+08"});
        expected.put("55", new String[]{"Subject12", "Unknown", "2018-02-20", "5.3E+07"});
        expected.put("56", new String[]{"Subject13", "Unknown", "2018-02-20", "5.2E+06"});
        expected.put("57", new String[]{"Subject13", "Unknown", "2018-02-20", "4.9E+05"});
        expected.put("58", new String[]{"Subject14", "Unknown", "2018-02-20", "5.1E+04"});
        expected.put("59", new String[]{"Subject14", "Unknown", "2018-02-20", "5.1E+03"});
        expected.put("60", new String[]{"Subject15", "Unknown", "2018-02-20", "4.E+02"});
        expected.put("61", new String[]{"Subject15", "Unknown", "2018-02-20", "1.9E+02"});
        expected.put("62", new String[]{"Subject16", "Unknown", "2018-02-20", "5.3E+08"});
        expected.put("63", new String[]{"Subject16", "Unknown", "2018-02-20", "5.E+07"});
        expected.put("64", new String[]{"Subject17", "Unknown", "2018-02-20", "5.E+06"});
        expected.put("65", new String[]{"Subject17", "Unknown", "2018-02-20", "5.E+05"});
        expected.put("66", new String[]{"Subject18", "Unknown", "2018-02-20", "4.4E+04"});
        expected.put("67", new String[]{"Subject18", "Unknown", "2018-02-20", "3.4E+03"});
        expected.put("68", new String[]{"Subject19", "Unknown", "2018-02-20", "7.6E+02"});
        expected.put("69", new String[]{"Subject19", "Unknown", "2018-02-20", "6.2E+01"});
        expected.put("70", new String[]{"Subject20", "Unknown", "2018-02-20", "9.2E+05"});
        expected.put("71", new String[]{"Subject20", "Unknown", "2018-02-20", "9.5E+05"});
        expected.put("72", new String[]{"Subject21", "Unknown", "2018-02-20", "9.7E+05"});
        expected.put("73", new String[]{"Subject21", "Unknown", "2018-02-20", "1.E+03"});
        expected.put("74", new String[]{"Subject22", "Unknown", "2018-02-20", "1.3E+06"});
        expected.put("75", new String[]{"Subject22", "Unknown", "2018-02-20", "6.5E+05"});
        expected.put("76", new String[]{"Subject23", "Unknown", "2018-02-20", "1.E+06"});
        expected.put("77", new String[]{"Subject23", "Unknown", "2018-02-20", "9.5E+05"});
        expected.put("78", new String[]{"Subject24", "Unknown", "2018-02-20", "1.E+06"});
        expected.put("79", new String[]{"Subject24", "Unknown", "2018-02-20", "1.7E+04"});
        expected.put("80", new String[]{"Subject25", "Unknown", "2018-02-20", "5.E+08"});
        expected.put("81", new String[]{"Subject25", "Unknown", "2018-02-20", "5.3E+07"});
        expected.put("82", new String[]{"Subject26", "Unknown", "2018-02-20", "5.2E+06"});
        expected.put("83", new String[]{"Subject26", "Unknown", "2018-02-20", "4.9E+05"});
        expected.put("84", new String[]{"Subject27", "Unknown", "2018-02-20", "5.1E+04"});
        expected.put("85", new String[]{"Subject27", "Unknown", "2018-02-20", "5.1E+03"});
        expected.put("86", new String[]{"Subject28", "Unknown", "2018-02-20", "4.E+02"});
        expected.put("87", new String[]{"Subject28", "Unknown", "2018-02-20", "1.9E+02"});
        expected.put("88", new String[]{"Subject29", "Unknown", "2018-02-20", "5.3E+08"});
        expected.put("89", new String[]{"Subject29", "Unknown", "2018-02-20", "5.E+07"});
        expected.put("90", new String[]{"Subject30", "Unknown", "2018-02-20", "5.E+06"});
        expected.put("91", new String[]{"Subject30", "Unknown", "2018-02-20", "5.E+05"});

        verifyImportedVLs(totalRows, expected, results, null);

        log("verifying run plan marked as complete");
        _helper.goToLabHome();
        _helper.clickNavPanelItem(fullAssayName + ":", IMPORT_DATA_TEXT);
        click(Ext4Helper.Locators.menuItem("View Planned Runs"));
        waitForElement(Locator.tagContainingText("h3", "Planned Assay Runs"), WAIT_FOR_PAGE);

        DataRegionTable dr2 = new DataRegionTable("query", this);
        assertEquals("Run plan not marked completed", 0, dr2.getDataRowCount());
    }

    private void verifyImportedVLs(int totalRows, Map<String, String[]> expected, DataRegionTable results, @Nullable String[] keyFields) throws Exception
    {
        assertEquals("Incorrect row count", totalRows, results.getDataRowCount());
        waitForText("SIVmac239-Gag"); //proxy for DR load

        log("DataRegion column count was: " + results.getColumnCount());

        //recreate the DR to see if this removes intermittent test failures
        results = new DataRegionTable(results.getDataRegionName(), this);

        log("DataRegion column count was: " + results.getColumnCount());

        //recreate the DR to see if this removes intermittent test failures
        results = new DataRegionTable(results.getDataRegionName(), this);

        DecimalFormat formatter = new DecimalFormat("0.#E00");
        int i = 0;
        while (i < totalRows)
        {
            String subjectId = results.getDataAsText(i, "Subject Id");
            String vl = results.getDataAsText(i, "Viral Load");
            String dateString = StringUtils.trimToNull(results.getDataAsText(i, "Sample Date"));
            String date = dateString == null ? null : _dateFormat.format(_dateTimeFormat.parse(dateString));
            String category = results.getDataAsText(i, "Category");
            String[] expectedVals;
            StringBuilder sb = new StringBuilder();
            if (keyFields == null)
            {
                expectedVals = expected.get(String.valueOf(i));
            }
            else
            {
                String delim = "";
                for (String field : keyFields)
                {
                    sb.append(delim).append(results.getDataAsText(i, field));
                    delim = "_";
                }
                expectedVals = expected.get(sb.toString());
            }
            assertNotNull("Unable to find expected values: " + sb.toString(), expectedVals);

            assertEquals("Incorrect subjectId on row: " + i, expectedVals[0], subjectId);
            assertEquals("Incorrect category on row: " + i, expectedVals[1], category);
            assertEquals("Incorrect sample date on row: " + i, StringUtils.trimToNull(expectedVals[2]), date);

            Double vl1 = Double.parseDouble(expectedVals[3]);
            String vlFormatted = formatter.format(vl1);
            assertEquals("Incorrect VL on row: " + i, vlFormatted, StringUtils.trimToNull(vl));

            i++;
        }
    }

    @Override
    protected List<Pair<String, String>> getAssaysToCreate()
    {
        List<Pair<String, String>> assays = new ArrayList<>();
        assays.add(Pair.of("Viral Loads", ASSAY_NAME));

        return assays;
    }

    @Override
    protected List<String> getEnabledModules()
    {
        List<String> modules = new ArrayList<>();
        modules.add("Viral_Load_Assay");
        return modules;
    }

    @Override
    public void checkViews()
    {
        //the module contains an R report tied to a specific assay name, so view check fails when an assay of that name isnt present
        //when module-based assays can supply reports this should be corrected
    }
}
