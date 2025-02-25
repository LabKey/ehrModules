/*
 * Copyright (c) 2017-2018 LabKey Corporation
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
package org.labkey.snd.pipeline;

import org.apache.commons.io.FileUtils;
import org.apache.logging.log4j.Logger;
import org.apache.xmlbeans.XmlException;
import org.apache.xmlbeans.XmlOptions;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.exp.ExperimentException;
import org.labkey.api.exp.Lsid;
import org.labkey.api.exp.XarContext;
import org.labkey.api.exp.api.AbstractExperimentDataHandler;
import org.labkey.api.exp.api.DataType;
import org.labkey.api.exp.api.ExpData;
import org.labkey.api.exp.api.ExpRun;
import org.labkey.api.exp.property.DefaultPropertyValidator;
import org.labkey.api.gwt.client.model.GWTPropertyDescriptor;
import org.labkey.api.gwt.client.model.GWTPropertyValidator;
import org.labkey.api.gwt.client.model.PropertyValidatorType;
import org.labkey.api.security.User;
import org.labkey.api.snd.Package;
import org.labkey.api.snd.SNDService;
import org.labkey.api.snd.SuperPackage;
import org.labkey.api.util.FileType;
import org.labkey.api.util.XmlBeansUtil;
import org.labkey.api.util.XmlValidationException;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.ViewBackgroundInfo;
import org.labkey.data.xml.ColumnType;
import org.labkey.data.xml.ValidatorType;
import org.labkey.data.xml.ValidatorsType;
import org.txbiomed.snd.AttributesType;
import org.txbiomed.snd.ChildType;
import org.txbiomed.snd.ExportDocument;
import org.txbiomed.snd.PackageType;
import org.txbiomed.snd.PackagesType;
import org.txbiomed.snd.SuperPackageType;
import org.txbiomed.snd.SuperPackagesType;
import org.txbiomed.snd.USDACategoryType;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 * Created by Binal on 8/7/2017.
 */
public class SNDDataHandler extends AbstractExperimentDataHandler
{
    private static final FileType SND_INPUT = new FileType(".snd.xml");

    @Override
    public @Nullable DataType getDataType()
    {
        return null;
    }

    @Override
    public void importFile(@NotNull ExpData data, File dataFile, @NotNull ViewBackgroundInfo info, @NotNull Logger log, @NotNull XarContext context) throws ExperimentException
    {
        ExportDocument exportDocument;
        String inputFileName = dataFile.getName();

        if (SND_INPUT.isType(dataFile))
        {
            ExpRun run = data.getRun();
            if (null == run)
            {
                throw new ExperimentException("Experiment run was null for data file '" + dataFile.getName() +"'");
            }
        }

        //read xml data
        try(FileInputStream in = FileUtils.openInputStream(dataFile))
        {
            XmlOptions options = XmlBeansUtil.getDefaultParseOptions();
            options.setValidateStrict();

            //parse xml tags and get tokens/auto-generated pojos
            exportDocument = ExportDocument.Factory.parse(in, options);

            log.info("Starting xml Validation");
            XmlBeansUtil.validateXmlDocument(exportDocument, "Validating " + inputFileName + " against schema.");
            log.info("End xml Validation");
        }
        catch (IOException e)
        {
            throw new ExperimentException("Error reading input file '" + inputFileName +"'", e);
        }
        catch (XmlException e)
        {
            throw new ExperimentException("Could not parse input file '" + inputFileName +"'", e);
        }
        catch (XmlValidationException e)
        {
            throw new ExperimentException("Invalid XML file " + inputFileName, e);
        }

        ExportDocument.Export export = exportDocument.getExport();

        if(null != export)
        {
            // CONSIDER: merging these two functions into a single function

            parseAndSavePackages(export, info, log);
            parseAndSaveSuperPackages(export, info, log);
        }
    }

    private void parseAndSavePackages(@NotNull ExportDocument.Export export, @NotNull ViewBackgroundInfo info, Logger log)
    {
        //get Package nodes
        PackagesType packages = export.getPackages();
        PackageType[] packageArray = packages.getPackageArray();

        SNDService sndService = SNDService.get();

        if (null == sndService)
            throw new IllegalStateException("No SNDService!");

        for (PackageType packageType : packageArray)
        {
            Package pkg = parsePackage(packageType, info); //convert auto-generated objects/tokens to SND's Package objects
            sndService.savePackage(info.getContainer(), info.getUser(), pkg, null,false, true); //save to db
            log.info("Saving package: " + packageType.getId() + "-" + packageType.getDescription());
        }
    }

    private Package parsePackage(PackageType packageType, @NotNull ViewBackgroundInfo info)
    {
        Package pkg = new Package();

        //Id
        pkg.setPkgId(packageType.getId());

        //description
        pkg.setDescription(packageType.getDescription());

        //repeatable
        pkg.setRepeatable(packageType.getRepeatable());

        //displayable
        pkg.setActive(packageType.getDisplayable());

        /* extra field(s)*/
        USDACategoryType.Enum usdaCategoryVal = packageType.getUsdaCategory();
        Map<GWTPropertyDescriptor, Object> extraFields = new HashMap<>();

        //usda-category
        GWTPropertyDescriptor gwtpd = new GWTPropertyDescriptor();
        gwtpd.setName("usdaCode");
        gwtpd.setRangeURI("http://www.w3.org/2001/XMLSchema#string");
        extraFields.put(gwtpd, usdaCategoryVal);
        pkg.setExtraFields(extraFields);

        //narrative
        pkg.setNarrative(packageType.getNarrative());

        //attributes
        pkg.setAttributes(getAttributes(packageType, info));

        return pkg;
    }

    private List<GWTPropertyDescriptor> getAttributes(PackageType packageType, @NotNull ViewBackgroundInfo info)
    {
        AttributesType attributes = packageType.getAttributes();
        ColumnType[] attributeArray = attributes.getAttributeArray();

        List<GWTPropertyDescriptor> attributesList = new LinkedList<>();
        for (ColumnType ct : attributeArray)
        {
            GWTPropertyDescriptor gwtpd = new GWTPropertyDescriptor();

            //columnName
            gwtpd.setName(ct.getColumnName());

            //rangeURI
            String rangeURI = ct.getRangeURI();
            if (null != rangeURI)
                gwtpd.setRangeURI(rangeURI);
            else
                gwtpd.setRangeURI("http://www.w3.org/2001/XMLSchema#" + ct.getDatatype());

            //nullable
            gwtpd.setRequired(ct.getNullable());

            //columnTitle
            gwtpd.setLabel(ct.getColumnTitle());

            // format for decimals
            gwtpd.setFormat(ct.getFormatString());

            //fk
            ColumnType.Fk fk = ct.getFk();
            if (null != fk)
            {
                //defaultValue
                if (ct.getDefaultValue() != null)
                {
                    Object defaultValue = SNDService.get().normalizeLookupValue(info.getUser(), info.getContainer(),
                            fk.getFkDbSchema(), fk.getFkTable(), ct.getDefaultValue());
                    if (defaultValue != null)
                    {
                        gwtpd.setDefaultValue(defaultValue.toString());
                    }
                }
                else
                {
                    gwtpd.setDefaultValue(ct.getDefaultValue());
                }

                gwtpd.setLookupQuery(fk.getFkTable());
                gwtpd.setLookupSchema(fk.getFkDbSchema());
            }
            else {
                gwtpd.setDefaultValue(ct.getDefaultValue());
            }

            //scale
            gwtpd.setScale(ct.getScale());

            //redactedText
            gwtpd.setRedactedText(ct.getRedactedText());

            //precision
            int precision = ct.getPrecision();
            if (precision >= 1)
            {
                StringBuilder pr = new StringBuilder("0.");
                for (int i = 0; i < precision; i++)
                    pr.append("#");

                gwtpd.setFormat(pr.toString());
            }

            //validators
            ValidatorsType validators = ct.getValidators();
            if (null != validators)
            {
                List<GWTPropertyValidator> gwtPropertyValidatorList = new LinkedList<>();

                for (ValidatorType validator : validators.getValidatorArray())
                {
                    GWTPropertyValidator gwtPropertyValidator = new GWTPropertyValidator();
                    gwtPropertyValidator.setName(validator.getName()); //name
                    gwtPropertyValidator.setExpression(validator.getExpression()); //expression

                    // Length typeUri has been deprecated, these should be saved as textlength
                    String typeUri = validator.getTypeURI();
                    if ("urn:lsid:labkey.com:PropertyValidator:length".equals(typeUri))
                        typeUri = DefaultPropertyValidator.createValidatorURI(PropertyValidatorType.TextLength).toString();

                    Lsid lsid = new Lsid(typeUri);
                    gwtPropertyValidator.setType(org.labkey.api.gwt.client.model.PropertyValidatorType.getType(lsid.getObjectId()));//typeURI

                    gwtPropertyValidatorList.add(gwtPropertyValidator);
                }

                gwtpd.setPropertyValidators(gwtPropertyValidatorList);
            }
            attributesList.add(gwtpd);
        }
        return attributesList;
    }

    private void parseAndSaveSuperPackages(@NotNull ExportDocument.Export export, @NotNull ViewBackgroundInfo info, Logger log)
    {
        log.info("Saving super packages");
        SuperPackagesType superPackagesType = export.getSuperPackages();
        SuperPackageType[] superPackageArray = superPackagesType.getSuperPackageArray();
        SNDService sndService = SNDService.get();
        if (null == sndService)
            throw new IllegalStateException("No SNDService!");

        List<SuperPackage> superPackages = new LinkedList<>();
        for(SuperPackageType superPackageType : superPackageArray)
        {
            SuperPackage superPackage = parseSuperPackage(superPackageType);
            superPackages.add(superPackage);
        }
        sndService.saveSuperPackages(info.getContainer(), info.getUser(), superPackages);
    }

    private SuperPackage parseSuperPackage(SuperPackageType superPackageType)
    {
        SuperPackage superPackage = new SuperPackage();
        superPackage.setSuperPkgId(superPackageType.getSuperPkgId());
        superPackage.setPkgId(superPackageType.getPkgId());
        superPackage.setRequired(false);  // xml pathway does not currently ever include this field

        List<SuperPackage> children = new ArrayList<>();
        SuperPackage child;
        int order = 0;  // subpackages ordered by sort order
        for (ChildType childType : superPackageType.getChildren().getChildArray())
        {
            child = new SuperPackage();
            child.setPkgId(childType.getPkgId());
            child.setParentSuperPkgId(superPackage.getSuperPkgId());
            child.setSuperPkgId(childType.getSuperPkgId());
            child.setSortOrder(order++);
            child.setRequired(false);  // xml pathway does not currently ever include this field
            children.add(child);
        }
        superPackage.setChildPackages(children);

        return  superPackage;
    }

    @Override
    public Priority getPriority(ExpData data)
    {
        return (null != data && null != data.getDataFileUrl() && SND_INPUT.isType(data.getDataFileUrl()) ? Priority.MEDIUM : null);
    }

    @Override
    public @Nullable ActionURL getContentURL(ExpData data)
    {
        return null;
    }

    @Override
    public void deleteData(ExpData data, Container container, User user)
    {

    }

    @Override
    public void runMoved(ExpData newData, Container container, Container targetContainer, String oldRunLSID, String newRunLSID, User user, int oldDataRowID)
    {

    }
}
