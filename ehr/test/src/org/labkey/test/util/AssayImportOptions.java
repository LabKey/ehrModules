package org.labkey.test.util;

import org.labkey.test.Locator;

/**
 * Created by klum on 2/28/14.
 */
public class AssayImportOptions
{
    public enum VisitResolverType
    {
        ParticipantVisit,
        ParticipantDate,
        ParticipantVisitDate,
        SpecimenID,
        SpecimenIDParticipantVisit
    }

    private String assayId;
    private String cutoff1;
    private String cutoff2;
    private String cutoff3;
    private String virusName;
    private String virusId;
    private String curveFitMethod;
    private String filePath;
    private String[] ptids;
    private String[] visits;
    private String[] initialDilutions;
    private String[] dilutionFactors;
    private String[] methods;
    private String[] sampleIds;
    private String[] dates;
    private VisitResolverType visitResolver;

    private AssayImportOptions(ImportOptionsBuilder builder)
    {
        this.assayId = builder.assayId;
        this.cutoff1 = builder.cutoff1;
        this.cutoff2 = builder.cutoff2;
        this.cutoff3 = builder.cutoff3;
        this.virusName = builder.virusName;
        this.virusId = builder.virusId;
        this.curveFitMethod = builder.curveFitMethod;
        this.filePath = builder.filePath;
        this.ptids = builder.ptids;
        this.visits = builder.visits;
        this.initialDilutions = builder.initialDilutions;
        this.dilutionFactors = builder.dilutionFactors;
        this.methods = builder.methods;
        this.sampleIds = builder.sampleIds;
        this.dates = builder.dates;
        this.visitResolver = builder.visitResolver;
    }

    public String getAssayId()
    {
        return assayId;
    }

    public String getCutoff1()
    {
        return cutoff1;
    }

    public String getCutoff2()
    {
        return cutoff2;
    }

    public String getCutoff3()
    {
        return cutoff3;
    }

    public String getVirusName()
    {
        return virusName;
    }

    public String getVirusId()
    {
        return virusId;
    }

    public String getCurveFitMethod()
    {
        return curveFitMethod;
    }

    public String getFilePath()
    {
        return filePath;
    }

    public String[] getPtids()
    {
        return ptids;
    }

    public String[] getVisits()
    {
        return visits;
    }

    public String[] getInitialDilutions()
    {
        return initialDilutions;
    }

    public String[] getDilutionFactors()
    {
        return dilutionFactors;
    }

    public String[] getMethods()
    {
        return methods;
    }

    public String[] getSampleIds()
    {
        return sampleIds;
    }

    public String[] getDates()
    {
        return dates;
    }

    public VisitResolverType getVisitResolver()
    {
        return visitResolver;
    }

    public static class ImportOptionsBuilder
    {
        private String assayId;
        private String cutoff1;
        private String cutoff2;
        private String cutoff3;
        private String virusName;
        private String virusId;
        private String curveFitMethod;
        private String filePath;
        private String[] ptids = new String[0];
        private String[] visits = new String[0];
        private String[] initialDilutions = new String[0];
        private String[] dilutionFactors = new String[0];
        private String[] methods = new String[0];
        private String[] sampleIds = new String[0];
        private String[] dates = new String[0];
        private VisitResolverType visitResolver = VisitResolverType.ParticipantVisit;

        public ImportOptionsBuilder assayId(String assayId)
        {
            this.assayId = assayId;
            return this;
        }

        public ImportOptionsBuilder cutoff1(String cutoff1)
        {
            this.cutoff1 = cutoff1;
            return this;
        }

        public ImportOptionsBuilder cutoff2(String cutoff2)
        {
            this.cutoff2 = cutoff2;
            return this;
        }

        public ImportOptionsBuilder cutoff3(String cutoff3)
        {
            this.cutoff3 = cutoff3;
            return this;
        }

        public ImportOptionsBuilder virusName(String virusName)
        {
            this.virusName = virusName;
            return this;
        }

        public ImportOptionsBuilder virusId(String virusId)
        {
            this.virusId = virusId;
            return this;
        }

        public ImportOptionsBuilder curveFitMethod(String curveFitMethod)
        {
            this.curveFitMethod = curveFitMethod;
            return this;
        }

        public ImportOptionsBuilder filePath(String filePath)
        {
            this.filePath = filePath;
            return this;
        }

        public ImportOptionsBuilder ptids(String[] ptids)
        {
            this.ptids = ptids;
            return this;
        }

        public ImportOptionsBuilder visits(String[] visits)
        {
            this.visits = visits;
            return this;
        }

        public ImportOptionsBuilder initialDilutions(String[] initialDilutions)
        {
            this.initialDilutions = initialDilutions;
            return this;
        }

        public ImportOptionsBuilder dilutionFactors(String[] dilutionFactors)
        {
            this.dilutionFactors = dilutionFactors;
            return this;
        }

        public ImportOptionsBuilder methods(String[] methods)
        {
            this.methods = methods;
            return this;
        }

        public ImportOptionsBuilder sampleIds(String[] sampleIds)
        {
            this.sampleIds = sampleIds;
            return this;
        }

        public ImportOptionsBuilder dates(String[] dates)
        {
            this.dates = dates;
            return this;
        }

        public ImportOptionsBuilder visitResolver(VisitResolverType visitResolver)
        {
            this.visitResolver = visitResolver;
            return this;
        }

        public AssayImportOptions build()
        {
            return new AssayImportOptions(this);
        }
    }
}
