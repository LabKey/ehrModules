/*
 * Copyright (c) 2017 LabKey Corporation
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

CREATE SCHEMA snd;
GO

/*==============================================================*/
/* Table: Pkgs                                                  */
/*==============================================================*/
CREATE TABLE snd.Pkgs (
   PkgId                INTEGER              NOT NULL,
   Description          NVARCHAR(4000)       NOT NULL,
   Narrative            NVARCHAR(MAX)        NULL,
   Active               BIT,
   Repeatable           BIT,
   QcState              INTEGER,
   ObjectId             UNIQUEIDENTIFIER     NOT NULL DEFAULT newid(),
   Container            ENTITYID             NOT NULL,
   CreatedBy            USERID,
   Created              DATETIME,
   ModifiedBy           USERID,
   Modified             DATETIME,
   Lsid                 LSIDType,

   CONSTRAINT PK_SND_PKGS PRIMARY KEY (PkgId),
   CONSTRAINT FK_SND_PKGS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId),
   CONSTRAINT FK_SND_PKGS_QCSTATE FOREIGN KEY (QcState) REFERENCES core.DataStates (RowId)
);
GO

CREATE INDEX IDX_SND_PKGS_CONTAINER ON snd.Pkgs(Container);
CREATE INDEX IDX_SND_PKGS_QCSTATE ON snd.Pkgs(QcState);
CREATE INDEX IDX_SND_PKGS_LSID ON snd.Pkgs(Lsid);
GO

/*==============================================================*/
/* Table: SuperPkgs                                             */
/*==============================================================*/
CREATE TABLE snd.SuperPkgs (
   SuperPkgId           INTEGER              NOT NULL,
   ParentSuperPkgId     INTEGER,
   PkgId                INTEGER              NOT NULL,
   SuperPkgPath         VARCHAR(900)         NOT NULL,
   SortOrder            INTEGER,
   Required             BIT                  NOT NULL DEFAULT 0,
   Container            ENTITYID             NOT NULL,
   CreatedBy            USERID,
   Created              DATETIME,
   ModifiedBy           USERID,
   Modified             DATETIME,
   Lsid                 LSIDType,

   CONSTRAINT PK_SND_SUPERPKGS PRIMARY KEY (SuperPkgId),
   CONSTRAINT FK_SND_SUPERPKGS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId),
   CONSTRAINT FK_SND_SUPERPKGS_PKGID FOREIGN KEY (PkgId) REFERENCES snd.Pkgs (PkgId)
);
GO

CREATE INDEX IDX_SND_SUPERPKGS_CONTAINER ON snd.SuperPkgs(Container);
CREATE INDEX IDX_SND_SUPERPKGS_PKGID ON snd.SuperPkgs(PkgId);
CREATE INDEX IDX_SND_SUPERPKGS_LSID ON snd.SuperPkgs(Lsid);
GO

/*==============================================================*/
/* Table: PkgCategories                                         */
/*==============================================================*/
CREATE TABLE snd.PkgCategories (
   CategoryId           INTEGER              NOT NULL,
   Description          NVARCHAR(4000)       NOT NULL,
   Comment              NVARCHAR(4000),
   Active               BIT                  NOT NULL,
   SortOrder            INTEGER,
   ObjectId             UNIQUEIDENTIFIER     NOT NULL DEFAULT NEWID(),
   Container            ENTITYID             NOT NULL,
   CreatedBy            USERID,
   Created              DATETIME,
   ModifiedBy           USERID,
   Modified             DATETIME,
   Lsid                 LSIDType,

   CONSTRAINT PK_SND_PKGCATEGORIES PRIMARY KEY (CategoryId),
   CONSTRAINT FK_SND_PKGCATEGORIES_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);
GO

CREATE INDEX IDX_SND_PKGCATEGORIES_CONTAINER ON snd.PkgCategories(Container);
CREATE INDEX IDX_SND_PKGCATEGORIES_LSID ON snd.PkgCategories(Lsid);
GO

/*==============================================================*/
/* Table: PkgCategoryJunction                                   */
/*==============================================================*/
CREATE TABLE snd.PkgCategoryJunction (
   PkgId                INTEGER              NOT NULL,
   CategoryId           INTEGER              NOT NULL,
   ObjectId             UNIQUEIDENTIFIER     NOT NULL DEFAULT NEWID(),
   Container            ENTITYID             NOT NULL,
   CreatedBy            USERID,
   Created              DATETIME,
   ModifiedBy           USERID,
   Modified             DATETIME,
   Lsid                 LSIDType,

   CONSTRAINT PK_SND_PKGCATEGORYJUNCTION PRIMARY KEY (PkgId, CategoryId),
   CONSTRAINT FK_SND_PKGCATEGORYJUNCTION_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId),
   CONSTRAINT FK_SND_PKGCATEGORYJUNCTION_PKGID FOREIGN KEY (PkgId) REFERENCES snd.Pkgs (PkgId),
   CONSTRAINT FK_SND_PKGCATEGORYJUNCTION_CATEGORYID FOREIGN KEY (CategoryId) REFERENCES snd.PkgCategories (CategoryId)
);
GO

CREATE INDEX IDX_SND_PKGCATEGORYJUNCTION_CONTAINER ON snd.PkgCategoryJunction(Container);
CREATE INDEX IDX_SND_PKGCATEGORYJUNCTION_PKGID ON snd.PkgCategoryJunction(PkgId);
CREATE INDEX IDX_SND_PKGCATEGORYJUNCTION_CATEGORYID ON snd.PkgCategoryJunction(CategoryId);
CREATE INDEX IDX_SND_PKGCATEGORYJUNCTION_LSID ON snd.PkgCategoryJunction(Lsid);
GO

/*==============================================================*/
/* Table: Projects                                              */
/*==============================================================*/
CREATE TABLE snd.Projects (
   ProjectId            INTEGER              NOT NULL,
   RevisionNum          INTEGER              NOT NULL,
   ReferenceId          INTEGER              NOT NULL,
   StartDate            date                 NOT NULL,
   EndDate              date,
   Description          NVARCHAR(4000)       NOT NULL,
   Active               BIT                  NOT NULL,
   ObjectId             UNIQUEIDENTIFIER     NOT NULL DEFAULT newid(),
   Container            ENTITYID             NOT NULL,
   CreatedBy            USERID,
   Created              DATETIME,
   ModifiedBy           USERID,
   Modified             DATETIME,
   Lsid                 LSIDType,

   CONSTRAINT PK_SND_PROJECTS PRIMARY KEY NONCLUSTERED (ObjectId),
   CONSTRAINT FK_SND_PROJECTS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);
GO

CREATE INDEX IDX_SND_PROJECTS_CONTAINER ON snd.Projects(Container);
CREATE UNIQUE CLUSTERED INDEX IDX_SND_PROJECTS_PROJECTID_REVNUM ON snd.Projects(ProjectId, RevisionNum);
GO

/*==============================================================*/
/* Table: ProjectItems                                          */
/*==============================================================*/
CREATE TABLE snd.ProjectItems (
   ProjectItemId        INTEGER              IDENTITY,
   ParentObjectId       UNIQUEIDENTIFIER,
   SuperPkgId           INTEGER              NOT NULL,
   Active               BIT                  NOT NULL DEFAULT 1,
   ObjectId             UNIQUEIDENTIFIER     NOT NULL DEFAULT NEWID(),
   Container            ENTITYID             NOT NULL,
   CreatedBy            USERID,
   Created              DATETIME,
   ModifiedBy           USERID,
   Modified             DATETIME,
   Lsid                 LSIDType,

   CONSTRAINT PK_SND_PROJECTITEMS PRIMARY KEY (ProjectItemId),
   CONSTRAINT FK_SND_PROJECTITEMS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId),
   CONSTRAINT FK_SND_PROJECTITEMS_SUPERPKGID FOREIGN KEY (SuperPkgId) REFERENCES snd.SuperPkgs (SuperPkgId),
   CONSTRAINT FK_SND_PROJECTITEMS_PARENTOBJECTID FOREIGN KEY (ParentObjectId) REFERENCES snd.Projects (ObjectId)
);
GO

CREATE INDEX IDX_SND_PROJECTITEMS_CONTAINER ON snd.ProjectItems(Container);
CREATE INDEX IDX_SND_PROJECTITEMS_SUPERPKGID ON snd.ProjectItems(SuperPkgId);
CREATE INDEX IDX_SND_PROJECTITEMS_PARENTOBJECTID ON snd.ProjectItems(ParentObjectId);
CREATE INDEX IDX_SND_PROJECTITEMS_LSID ON snd.ProjectItems(Lsid);
GO

/*==============================================================*/
/* Table: Events                                                */
/*==============================================================*/
CREATE TABLE snd.Events (
   EventId              INTEGER              NOT NULL,
   SubjectId            NVARCHAR(32)         NOT NULL,
   ParentObjectId       UNIQUEIDENTIFIER,
   Date                 DATETIME             NOT NULL,
   QcState              int,
   ObjectId             UNIQUEIDENTIFIER     NOT NULL DEFAULT newid(),
   Container            ENTITYID             NOT NULL,
   CreatedBy            USERID,
   Created              DATETIME,
   ModifiedBy           USERID,
   Modified             DATETIME,
   Lsid                 LSIDType,

   CONSTRAINT PK_SND_EVENTS PRIMARY KEY NONCLUSTERED (EventId),
   CONSTRAINT FK_SND_EVENTS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId),
   CONSTRAINT FK_SND_EVENTS_QCSTATE FOREIGN KEY (QcState) REFERENCES core.DataStates (RowId),
   CONSTRAINT FK_SND_EVENTS_PARENTOBJECTID FOREIGN KEY (ParentObjectId) REFERENCES snd.Projects (ObjectId)
);
GO

CREATE INDEX IDX_SND_EVENTS_CONTAINER ON snd.Events(Container);
CREATE INDEX IDX_SND_EVENTS_QCSTATE ON snd.Events(QcState);
CREATE INDEX IDX_SND_EVENTS_PARENTOBJECTID ON snd.Events(ParentObjectId);
CREATE INDEX IDX_SND_EVENTS_LSID ON snd.Events(Lsid);
CREATE CLUSTERED INDEX IDX_SND_EVENTS_SUBJECTID_DATE ON snd.Events
    (
     SubjectId ASC,
     Date DESC
    ) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON);
GO

/*==============================================================*/
/* Table: EventNotes                                            */
/*==============================================================*/
CREATE TABLE snd.EventNotes (
   EventNoteId          INT                  IDENTITY(1, 1) NOT NULL,
   EventId              INTEGER,
   Note                 NVARCHAR(MAX)        NOT NULL,
   Container            ENTITYID             NOT NULL,
   CreatedBy            USERID,
   Created              DATETIME,
   ModifiedBy           USERID,
   Modified             DATETIME,
   Lsid                 LSIDType,

   CONSTRAINT PK_SND_EVENTNOTES PRIMARY KEY (EventNoteId),
   CONSTRAINT FK_SND_EVENTNOTES_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId),
   CONSTRAINT FK_SND_EVENTNOTES_EVENTID FOREIGN KEY (EventId) REFERENCES snd.Events (EventId)
);
GO

CREATE INDEX IDX_SND_EVENTNOTES_CONTAINER ON snd.EventNotes(Container);
CREATE INDEX IDX_SND_EVENTNOTES_EVENTNOTEID ON snd.EventNotes(EventNoteId);
GO

/*==============================================================*/
/* Table: LookupSets                                            */
/*==============================================================*/
CREATE TABLE snd.LookupSets (
   LookupSetId          INTEGER IDENTITY(1,1)     NOT NULL,
   SetName              NVARCHAR(128)             NOT NULL,
   Label                NVARCHAR(128),
   Description          NVARCHAR(900),
   ObjectId             UNIQUEIDENTIFIER          NOT NULL DEFAULT NEWID(),
   Container            ENTITYID                  NOT NULL,
   CreatedBy            USERID,
   Created              DATETIME,
   ModifiedBy           USERID,
   Modified             DATETIME,
   Lsid                 LSIDType,

   CONSTRAINT PK_SND_LOOKUPSETS PRIMARY KEY (LookupSetId),
   CONSTRAINT FK_SND_LOOKUPSETS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);
GO

CREATE INDEX IDX_SND_LOOKUPSETS_CONTAINER ON snd.LookupSets(Container);
CREATE UNIQUE INDEX idx_snd_lookupSets_objectid ON snd.LookupSets(ObjectId);
CREATE UNIQUE INDEX IDX_LookupSets_SetName ON snd.LookupSets(SetName);
GO

/*==============================================================*/
/* Table: Lookups                                               */
/*==============================================================*/
CREATE TABLE snd.Lookups (
   LookupId             INT                       IDENTITY(1,1) NOT NULL,
   LookupSetId          INTEGER                   NOT NULL,
   Value                NVARCHAR(446)             NOT NULL,
   Displayable          BIT                       NOT NULL,
   SortOrder            INTEGER,
   ObjectId             UNIQUEIDENTIFIER          NOT NULL DEFAULT NEWID(),
   Container            ENTITYID                  NOT NULL,
   CreatedBy            USERID,
   Created              DATETIME,
   ModifiedBy           USERID,
   Modified             DATETIME,
   Lsid                 LSIDType,

   CONSTRAINT PK_SND_LOOKUPS PRIMARY KEY (LookupId),
   CONSTRAINT FK_SND_LOOKUPS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId),
   CONSTRAINT FK_SND_LOOKUPS_LOOKUPSETID FOREIGN KEY (LookupSetId) REFERENCES snd.LookupSets (LookupSetId)
);
GO

CREATE INDEX IDX_SND_LOOKUPS_CONTAINER ON snd.Lookups(Container);
CREATE INDEX IDX_SND_LOOKUPS_LOOKUPSETID ON snd.Lookups(LookupSetId);
CREATE UNIQUE INDEX IDX_SND_LOOKUPS_LOOKUPSETID_VALUE ON snd.Lookups(LookupSetId, Value);
CREATE UNIQUE INDEX idx_snd_lookups_objectid ON snd.Lookups(ObjectId);
GO

/*==============================================================*/
/* Table: EventData                                             */
/*==============================================================*/
CREATE TABLE snd.EventData (
   EventDataId          INTEGER              NOT NULL,
   EventId              INTEGER              NOT NULL,
   SuperPkgId           INTEGER              NOT NULL,
   ObjectURI            LsidType             NOT NULL,
   ParentEventDataId    INT,
   SortOrder            INTEGER              NULL,
   Container            ENTITYID             NOT NULL,
   Lsid                 LSIDType,

   CONSTRAINT PK_SND_EVENTDATA PRIMARY KEY (EventDataId),
   CONSTRAINT FK_SND_EVENTDATA_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId),
   CONSTRAINT FK_SND_EVENTDATA_EVENTID FOREIGN KEY (EventId) REFERENCES snd.Events (EventId),
   CONSTRAINT FK_SND_EVENTDATA_SUPERPKGID FOREIGN KEY (SuperPkgId) REFERENCES snd.SuperPkgs (SuperPkgId)
);
GO

CREATE INDEX IDX_SND_EVENTDATA_SUPERPKGID ON snd.EventData(SuperPkgId);
CREATE INDEX IDX_SND_EVENTDATA_EVENTID ON snd.EventData(EventId);
GO

/*==============================================================*/
/* Table: EventsCache                                           */
/*==============================================================*/
CREATE TABLE snd.EventsCache (
   EventId              INTEGER              NOT NULL,
   HtmlNarrative        NVARCHAR(MAX),
   Container            ENTITYID,

   CONSTRAINT PK_SND_EVENTS_CACHE PRIMARY KEY (EventId),
   CONSTRAINT FK_EVENTSCACHE_EVENTID FOREIGN KEY (EventId) REFERENCES snd.Events (EventId),
   CONSTRAINT FK_SND_EVENTSCACHE_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);
GO

CREATE INDEX IDX_SND_EVENTSCACHE_CONTAINER ON snd.EventsCache(Container);
GO

CREATE FUNCTION snd.fGetSuperPkg ( @TopLevelPkgId INT )
RETURNS TABLE
AS

-- ==========================================================================================
-- Author:          Terry Hawkins
-- Creation date: 9/22/2017
-- Description:  Table valued function to return hierarchical view of a superPkg
-- ==========================================================================================
RETURN
    (
   WITH    CTE1 ( TopLevelPkgId, SuperPkgId, ParentSuperPkgId, PkgId, TreePath, SuperPkgPath, SortOrder, Required, DESCRIPTION, Narrative, Active, Repeatable, Level )
              AS (

   -- anchor member definition
                   SELECT   @TopLevelPkgId AS TopLevelPkgId ,
                            sp.SuperPkgId AS SuperPkgId ,
                            sp.ParentSuperPkgId AS ParentSuperPkgId ,
                            sp.PkgId AS PkgId ,
                            RIGHT(SPACE(3)
                                  + CONVERT(VARCHAR(MAX), ROW_NUMBER() OVER ( ORDER BY sp.SortOrder )),
                                  3) AS TreePath ,
                            sp.SuperPkgPath AS SuperPkgPath ,
                            sp.SortOrder AS SortOrder ,
                            sp.Required AS Required ,
                            p.Description AS Description ,
                            p.Narrative AS Narrative ,
                            p.Active AS Active ,
                            p.Repeatable AS Repeatable ,
                            1 AS Level
                   FROM     snd.SuperPkgs sp
                            INNER JOIN snd.Pkgs p ON sp.PkgId = p.PkgId
                   WHERE    sp.PkgId = @TopLevelPkgId
                            AND sp.ParentSuperPkgId IS NULL
                   UNION ALL
                   SELECT   @TopLevelPkgId AS TopLevelPkgId ,
                            sp.SuperPkgId AS SuperPkgId ,
                            c.SuperPkgId AS ParentSuperPkgId ,
                            sp.PkgId AS PkgId ,
                            c.TreePath + '/' + RIGHT(SPACE(3)
                                                     + CONVERT(VARCHAR(MAX), RIGHT(ROW_NUMBER() OVER ( ORDER BY sp.SortOrder ),
                                                              10)), 3) AS TreePath ,
                            sp.SuperPkgPath AS SuperPkgPath ,
                            sp.SortOrder AS SortOrder ,
                            sp.Required AS Required ,
                            p.Description AS Description ,
                            p.Narrative AS Narrative ,
                            p.Active AS Active ,
                            p.Repeatable AS Repeatable ,
                            c.Level + 1 AS Level
                   FROM     snd.SuperPkgs AS sp
                            INNER JOIN CTE1 AS c ON
                        -- add subpackages
                        sp.ParentSuperPkgId = c.SuperPkgId
                        -- add children of subpackages
                                OR sp.ParentSuperPkgId IN (SELECT  sp2.SuperPkgId FROM snd.SuperPkgs AS sp2 WHERE c.PkgId = sp2.PkgId AND sp2.ParentSuperPkgId IS NULL )

                            INNER JOIN snd.Pkgs AS p ON sp.PkgId = p.PkgId
                 )
    SELECT  @TopLevelPkgId AS TopLevelPkgId ,
            c.SuperPkgId AS SuperPkgId ,
            c.ParentSuperPkgId AS ParentSuperPkgId ,
            c.PkgId AS PkgId ,
            c.TreePath AS TreePath ,
            c.SuperPkgPath AS SuperPkgPath ,
            c.SortOrder AS SortOrder ,
            c.Required AS Required ,
            c.DESCRIPTION AS Description ,
            c.Narrative AS Narrative ,
            c.Active AS Active ,
            c.Repeatable AS Repeatable ,
            c.Level AS Level
    FROM    CTE1 c

);
GO

CREATE FUNCTION [snd].[fGetProjectItems]
    (
      @projectId INT ,
      @revisionNum INT
    )
RETURNS TABLE
AS

-- ==========================================================================================
-- Author:			Terry Hawkins
-- Creation date:	12/14/2017
-- Description:		Returns the list of ProjectItems for a Project/Revision along with
--                  sub packages for each ProjectItem
-- ==========================================================================================
RETURN
    (
WITH    CTE1 ( ProjectId, RevisionNum, ProjectItemId, ParentObjectId, ParentSuperPkgId, SuperPkgId, PkgId, ProjectActive, Active, TreePath, Level, Description )
          AS ( SELECT   @projectId AS ProjectId ,
                        @revisionNum AS RevisionNum ,
                        pi.ProjectItemId ,
                        pi.ParentObjectId AS ParentObjectId ,
                        sp.ParentSuperPkgId AS ParentSuperPkgId ,
                        sp.SuperPkgId AS SuperPkgId ,
                        sp.PkgId AS PkgId ,
                        p.Active as ProjectActive,
                        pi.Active,
                        RIGHT(SPACE(3)
                              + CONVERT(VARCHAR(MAX), ROW_NUMBER() OVER ( ORDER BY pi.ProjectItemId, sp.SuperPkgId )),
                              3) AS TreePath ,
                        1 AS Level ,
                        pkg.Description
               FROM     snd.ProjectItems AS pi
                        INNER JOIN snd.Projects AS p ON pi.ParentObjectId = p.ObjectId
                        INNER JOIN snd.SuperPkgs AS sp ON pi.SuperPkgId = sp.SuperPkgId
                        INNER JOIN snd.Pkgs pkg ON sp.PkgId = pkg.PkgId
               WHERE    p.ProjectId = @projectId
                        AND p.RevisionNum = @revisionNum
               UNION ALL
               SELECT   c.ProjectId AS ProjectId ,
                        c.RevisionNum AS RevisionNum ,
                        c.ProjectItemId ,
                        c.ParentObjectId AS ParentObjectId ,
                        sp.ParentSuperPkgId AS ParentSuperPkgId ,
                        sp.SuperPkgId AS SuperPkgId ,
                        sp.PkgId AS PkgId ,
                        c.ProjectActive ,
                        c.Active ,
                        c.TreePath + '/' + RIGHT(SPACE(3)
                                                 + CONVERT(VARCHAR(MAX), RIGHT(ROW_NUMBER() OVER ( ORDER BY sp.SortOrder ),
                                                              10)), 3) AS TreePath ,
                        c.Level + 1 AS Level ,
                        pkg.Description
               FROM     snd.SuperPkgs AS sp
                        INNER JOIN snd.Pkgs AS pkg ON sp.PkgId = pkg.PkgId
                        INNER JOIN CTE1 AS c ON sp.ParentSuperPkgId = c.SuperPkgId
											-- get the sub-pkg hierarchy from the top-level super pkg definition
                                                OR sp.ParentSuperPkgId IN (
                                                SELECT  sp2.SuperPkgId
                                                FROM    snd.SuperPkgs AS sp2
                                                WHERE   c.PkgId = sp2.PkgId
                                                        AND sp2.ParentSuperPkgId IS NULL)
             )
    SELECT  @projectId AS ProjectId ,
            @revisionNum AS RevisionNum ,
            c.ProjectItemId ,
            c.SuperPkgId AS SuperPkgId ,
            c.PkgId AS PkgId ,
            c.TreePath AS TreePath ,
            c.Level AS Level ,
            c.ProjectActive ,
            c.Active ,
            c.Description
    FROM    CTE1 c

);
GO

CREATE FUNCTION snd.fGetAllSuperPkgs
()
RETURNS @expandedSuperPackages TABLE
(
    TopLevelPkgId INTEGER NOT NULL,
    SuperPkgId INTEGER NOT NULL,
    ParentSuperPkgId INTEGER NULL,
    PkgId INTEGER NOT NULL,
    TreePath VARCHAR(MAX) NOT NULL,
    SuperPkgPath INTEGER NOT NULL,
    SortOrder INTEGER NULL,
    Required INTEGER NULL,
    DESCRIPTION VARCHAR(MAX) NOT NULL,
    Narrative VARCHAR(MAX) NOT NULL,
    Active INTEGER NOT NULL,
    Repeatable INTEGER NOT NULL,
    Level INTEGER NOT NULL
)
AS
BEGIN
    DECLARE @loopCursor CURSOR;
    DECLARE @topLevelPkgId INTEGER;

    SET @loopCursor = CURSOR LOCAL FOR
SELECT PkgId AS topLevelPackageId
FROM snd.SuperPkgs AS tl
WHERE ParentSuperPkgId IS NULL
    FOR READ ONLY;

OPEN @loopCursor;
FETCH @loopCursor
    INTO @topLevelPkgId;

WHILE (@@FETCH_STATUS = 0)
BEGIN
INSERT INTO @expandedSuperPackages
(
    TopLevelPkgId,
    SuperPkgId,
    ParentSuperPkgId,
    PkgId,
    TreePath,
    SuperPkgPath,
    SortOrder,
    Required,
    DESCRIPTION,
    Narrative,
    Active,
    Repeatable,
    Level
)
    (SELECT TopLevelPkgId,
            SuperPkgId,
            ParentSuperPkgId,
            PkgId,
            TreePath,
            SuperPkgPath,
            SortOrder,
            Required,
            Description,
            Narrative,
            Active,
            Repeatable,
            Level
     FROM snd.fGetSuperPkg(@topLevelPkgId) );

FETCH NEXT FROM @loopCursor
    INTO @topLevelPkgId;

END; -- WHILE LOOP

CLOSE @loopCursor;
DEALLOCATE @loopCursor;

       RETURN;
END;
GO

CREATE TRIGGER snd.ti_after_Events ON snd.Events FOR INSERT AS
BEGIN
    SET NOCOUNT ON;
    DECLARE
        @Container ENTITYID

    SELECT @Container = INSERTED.[Container] FROM INSERTED
    UPDATE snd.Events
    SET QcState = (SELECT TOP(1) q.rowId FROM core.DataStates AS q WHERE q.Label = 'Completed' AND q.Container = @Container ORDER BY q.rowId)
        FROM INSERTED AS i
                 INNER JOIN snd.Events AS e ON i.EventId = e.EventId
    WHERE i.QcState IS NULL
END
GO
