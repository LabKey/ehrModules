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

/*==============================================================*/
/* Table: Pkgs                                                  */
/*==============================================================*/
CREATE TABLE snd.Pkgs (
   PkgId                INTEGER              NOT NULL,
   Description          VARCHAR(4000)        NOT NULL,
   Narrative            TEXT                 NULL,
   Active               BOOLEAN,
   Repeatable           BOOLEAN,
   QcState              INTEGER,
   ObjectId             ENTITYID             NOT NULL DEFAULT gen_random_uuid(),
   Container            ENTITYID             NOT NULL,
   CreatedBy            USERID,
   Created              TIMESTAMP,
   ModifiedBy           USERID,
   Modified             TIMESTAMP,
   Lsid                 LSIDType,

   CONSTRAINT PK_SND_PKGS PRIMARY KEY (PkgId),
   CONSTRAINT FK_SND_PKGS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId),
   CONSTRAINT FK_SND_PKGS_QCSTATE FOREIGN KEY (QcState) REFERENCES core.DataStates (RowId)
);

CREATE INDEX IDX_SND_PKGS_CONTAINER ON snd.Pkgs(Container);
CREATE INDEX IDX_SND_PKGS_QCSTATE ON snd.Pkgs(QcState);
CREATE INDEX IDX_SND_PKGS_LSID ON snd.Pkgs(Lsid);

/*==============================================================*/
/* Table: SuperPkgs                                             */
/*==============================================================*/
CREATE TABLE snd.SuperPkgs (
   SuperPkgId           INTEGER              NOT NULL,
   ParentSuperPkgId     INTEGER,
   PkgId                INTEGER              NOT NULL,
   SuperPkgPath         VARCHAR(900)         NOT NULL,
   SortOrder            INTEGER,
   Required             BOOLEAN              NOT NULL DEFAULT FALSE,
   Container            ENTITYID             NOT NULL,
   CreatedBy            USERID,
   Created              TIMESTAMP,
   ModifiedBy           USERID,
   Modified             TIMESTAMP,
   Lsid                 LSIDType,

   CONSTRAINT PK_SND_SUPERPKGS PRIMARY KEY (SuperPkgId),
   CONSTRAINT FK_SND_SUPERPKGS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId),
   CONSTRAINT FK_SND_SUPERPKGS_PKGID FOREIGN KEY (PkgId) REFERENCES snd.Pkgs (PkgId)
);

CREATE INDEX IDX_SND_SUPERPKGS_CONTAINER ON snd.SuperPkgs(Container);
CREATE INDEX IDX_SND_SUPERPKGS_PKGID ON snd.SuperPkgs(PkgId);
CREATE INDEX IDX_SND_SUPERPKGS_LSID ON snd.SuperPkgs(Lsid);

/*==============================================================*/
/* Table: PkgCategories                                         */
/*==============================================================*/
CREATE TABLE snd.PkgCategories (
   CategoryId           INTEGER              NOT NULL,
   Description          VARCHAR(4000)        NOT NULL,
   Comment              VARCHAR(4000),
   Active               BOOLEAN              NOT NULL,
   SortOrder            INTEGER,
   ObjectId             ENTITYID             NOT NULL DEFAULT gen_random_uuid(),
   Container            ENTITYID             NOT NULL,
   CreatedBy            USERID,
   Created              TIMESTAMP,
   ModifiedBy           USERID,
   Modified             TIMESTAMP,
   Lsid                 LSIDType,

   CONSTRAINT PK_SND_PKGCATEGORIES PRIMARY KEY (CategoryId),
   CONSTRAINT FK_SND_PKGCATEGORIES_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX IDX_SND_PKGCATEGORIES_CONTAINER ON snd.PkgCategories(Container);
CREATE INDEX IDX_SND_PKGCATEGORIES_LSID ON snd.PkgCategories(Lsid);

/*==============================================================*/
/* Table: PkgCategoryJunction                                   */
/*==============================================================*/
CREATE TABLE snd.PkgCategoryJunction (
   PkgId                INTEGER              NOT NULL,
   CategoryId           INTEGER              NOT NULL,
   ObjectId             ENTITYID             NOT NULL DEFAULT gen_random_uuid(),
   Container            ENTITYID             NOT NULL,
   CreatedBy            USERID,
   Created              TIMESTAMP,
   ModifiedBy           USERID,
   Modified             TIMESTAMP,
   Lsid                 LSIDType,

   CONSTRAINT PK_SND_PKGCATEGORYJUNCTION PRIMARY KEY (PkgId, CategoryId),
   CONSTRAINT FK_SND_PKGCATEGORYJUNCTION_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId),
   CONSTRAINT FK_SND_PKGCATEGORYJUNCTION_PKGID FOREIGN KEY (PkgId) REFERENCES snd.Pkgs (PkgId),
   CONSTRAINT FK_SND_PKGCATEGORYJUNCTION_CATEGORYID FOREIGN KEY (CategoryId) REFERENCES snd.PkgCategories (CategoryId)
);

CREATE INDEX IDX_SND_PKGCATEGORYJUNCTION_CONTAINER ON snd.PkgCategoryJunction(Container);
CREATE INDEX IDX_SND_PKGCATEGORYJUNCTION_PKGID ON snd.PkgCategoryJunction(PkgId);
CREATE INDEX IDX_SND_PKGCATEGORYJUNCTION_CATEGORYID ON snd.PkgCategoryJunction(CategoryId);
CREATE INDEX IDX_SND_PKGCATEGORYJUNCTION_LSID ON snd.PkgCategoryJunction(Lsid);

/*==============================================================*/
/* Table: Projects                                              */
/*==============================================================*/
CREATE TABLE snd.Projects (
   ProjectId            INTEGER              NOT NULL,
   RevisionNum          INTEGER              NOT NULL,
   ReferenceId          INTEGER              NOT NULL,
   StartDate            DATE                 NOT NULL,
   EndDate              DATE,
   Description          VARCHAR(4000)        NOT NULL,
   Active               BOOLEAN              NOT NULL,
   ObjectId             ENTITYID             NOT NULL DEFAULT gen_random_uuid(),
   Container            ENTITYID             NOT NULL,
   CreatedBy            USERID,
   Created              TIMESTAMP,
   ModifiedBy           USERID,
   Modified             TIMESTAMP,
   Lsid                 LSIDType,

   CONSTRAINT PK_SND_PROJECTS PRIMARY KEY (ObjectId),
   CONSTRAINT FK_SND_PROJECTS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX IDX_SND_PROJECTS_CONTAINER ON snd.Projects(Container);
CREATE UNIQUE INDEX IDX_SND_PROJECTS_PROJECTID_REVNUM ON snd.Projects(ProjectId, RevisionNum);

/*==============================================================*/
/* Table: ProjectItems                                          */
/*==============================================================*/
CREATE TABLE snd.ProjectItems (
   ProjectItemId        SERIAL,
   ParentObjectId       ENTITYID,
   SuperPkgId           INTEGER              NOT NULL,
   Active               BOOLEAN              NOT NULL DEFAULT TRUE,
   ObjectId             ENTITYID             NOT NULL DEFAULT gen_random_uuid(),
   Container            ENTITYID             NOT NULL,
   CreatedBy            USERID,
   Created              TIMESTAMP,
   ModifiedBy           USERID,
   Modified             TIMESTAMP,
   Lsid                 LSIDType,

   CONSTRAINT PK_SND_PROJECTITEMS PRIMARY KEY (ProjectItemId),
   CONSTRAINT FK_SND_PROJECTITEMS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId),
   CONSTRAINT FK_SND_PROJECTITEMS_SUPERPKGID FOREIGN KEY (SuperPkgId) REFERENCES snd.SuperPkgs (SuperPkgId),
   CONSTRAINT FK_SND_PROJECTITEMS_PARENTOBJECTID FOREIGN KEY (ParentObjectId) REFERENCES snd.Projects (ObjectId)
);

CREATE INDEX IDX_SND_PROJECTITEMS_CONTAINER ON snd.ProjectItems(Container);
CREATE INDEX IDX_SND_PROJECTITEMS_SUPERPKGID ON snd.ProjectItems(SuperPkgId);
CREATE INDEX IDX_SND_PROJECTITEMS_PARENTOBJECTID ON snd.ProjectItems(ParentObjectId);
CREATE INDEX IDX_SND_PROJECTITEMS_LSID ON snd.ProjectItems(Lsid);

/*==============================================================*/
/* Table: Events                                                */
/*==============================================================*/
CREATE TABLE snd.Events (
   EventId              INTEGER              NOT NULL,
   SubjectId            VARCHAR(32)          NOT NULL,
   ParentObjectId       ENTITYID,
   Date                 TIMESTAMP            NOT NULL,
   QcState              INTEGER,
   ObjectId             ENTITYID             NOT NULL DEFAULT gen_random_uuid(),
   Container            ENTITYID             NOT NULL,
   CreatedBy            USERID,
   Created              TIMESTAMP,
   ModifiedBy           USERID,
   Modified             TIMESTAMP,
   Lsid                 LSIDType,

   CONSTRAINT PK_SND_EVENTS PRIMARY KEY (EventId),
   CONSTRAINT FK_SND_EVENTS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId),
   CONSTRAINT FK_SND_EVENTS_QCSTATE FOREIGN KEY (QcState) REFERENCES core.DataStates (RowId),
   CONSTRAINT FK_SND_EVENTS_PARENTOBJECTID FOREIGN KEY (ParentObjectId) REFERENCES snd.Projects (ObjectId)
);

CREATE INDEX IDX_SND_EVENTS_CONTAINER ON snd.Events(Container);
CREATE INDEX IDX_SND_EVENTS_QCSTATE ON snd.Events(QcState);
CREATE INDEX IDX_SND_EVENTS_PARENTOBJECTID ON snd.Events(ParentObjectId);
CREATE INDEX IDX_SND_EVENTS_LSID ON snd.Events(Lsid);
CREATE INDEX IDX_SND_EVENTS_SUBJECTID_DATE ON snd.Events (SubjectId ASC, Date DESC);

/*==============================================================*/
/* Table: EventNotes                                            */
/*==============================================================*/
CREATE TABLE snd.EventNotes (
   EventNoteId          SERIAL               NOT NULL,
   EventId              INTEGER,
   Note                 TEXT                 NOT NULL,
   Container            ENTITYID             NOT NULL,
   CreatedBy            USERID,
   Created              TIMESTAMP,
   ModifiedBy           USERID,
   Modified             TIMESTAMP,
   Lsid                 LSIDType,

   CONSTRAINT PK_SND_EVENTNOTES PRIMARY KEY (EventNoteId),
   CONSTRAINT FK_SND_EVENTNOTES_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId),
   CONSTRAINT FK_SND_EVENTNOTES_EVENTID FOREIGN KEY (EventId) REFERENCES snd.Events (EventId)
);

CREATE INDEX IDX_SND_EVENTNOTES_CONTAINER ON snd.EventNotes(Container);
CREATE INDEX IDX_SND_EVENTNOTES_EVENTNOTEID ON snd.EventNotes(EventNoteId);

/*==============================================================*/
/* Table: LookupSets                                            */
/*==============================================================*/
CREATE TABLE snd.LookupSets (
   LookupSetId          SERIAL               NOT NULL,
   SetName              VARCHAR(128)         NOT NULL,
   Label                VARCHAR(128),
   Description          VARCHAR(900),
   ObjectId             ENTITYID             NOT NULL DEFAULT gen_random_uuid(),
   Container            ENTITYID             NOT NULL,
   CreatedBy            USERID,
   Created              TIMESTAMP,
   ModifiedBy           USERID,
   Modified             TIMESTAMP,
   Lsid                 LSIDType,

   CONSTRAINT PK_SND_LOOKUPSETS PRIMARY KEY (LookupSetId),
   CONSTRAINT FK_SND_LOOKUPSETS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX IDX_SND_LOOKUPSETS_CONTAINER ON snd.LookupSets(Container);
CREATE UNIQUE INDEX idx_snd_lookupSets_objectid ON snd.LookupSets(ObjectId);
CREATE UNIQUE INDEX IDX_LookupSets_SetName ON snd.LookupSets(SetName);

/*==============================================================*/
/* Table: Lookups                                               */
/*==============================================================*/
CREATE TABLE snd.Lookups (
   LookupId             SERIAL               NOT NULL,
   LookupSetId          INTEGER              NOT NULL,
   Value                VARCHAR(446)         NOT NULL,
   Displayable          BOOLEAN              NOT NULL,
   SortOrder            INTEGER,
   ObjectId             ENTITYID             NOT NULL DEFAULT gen_random_uuid(),
   Container            ENTITYID             NOT NULL,
   CreatedBy            USERID,
   Created              TIMESTAMP,
   ModifiedBy           USERID,
   Modified             TIMESTAMP,
   Lsid                 LSIDType,

   CONSTRAINT PK_SND_LOOKUPS PRIMARY KEY (LookupId),
   CONSTRAINT FK_SND_LOOKUPS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId),
   CONSTRAINT FK_SND_LOOKUPS_LOOKUPSETID FOREIGN KEY (LookupSetId) REFERENCES snd.LookupSets (LookupSetId)
);

CREATE INDEX IDX_SND_LOOKUPS_CONTAINER ON snd.Lookups(Container);
CREATE INDEX IDX_SND_LOOKUPS_LOOKUPSETID ON snd.Lookups(LookupSetId);
CREATE UNIQUE INDEX IDX_SND_LOOKUPS_LOOKUPSETID_VALUE ON snd.Lookups(LookupSetId, Value);
CREATE UNIQUE INDEX idx_snd_lookups_objectid ON snd.Lookups(ObjectId);

/*==============================================================*/
/* Table: EventData                                             */
/*==============================================================*/
CREATE TABLE snd.EventData (
   EventDataId          INTEGER              NOT NULL,
   EventId              INTEGER              NOT NULL,
   SuperPkgId           INTEGER              NOT NULL,
   ObjectURI            LSIDType             NOT NULL,
   ParentEventDataId    INTEGER,
   SortOrder            INTEGER              NULL,
   Container            ENTITYID             NOT NULL,
   Lsid                 LSIDType,

   CONSTRAINT PK_SND_EVENTDATA PRIMARY KEY (EventDataId),
   CONSTRAINT FK_SND_EVENTDATA_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId),
   CONSTRAINT FK_SND_EVENTDATA_EVENTID FOREIGN KEY (EventId) REFERENCES snd.Events (EventId),
   CONSTRAINT FK_SND_EVENTDATA_SUPERPKGID FOREIGN KEY (SuperPkgId) REFERENCES snd.SuperPkgs (SuperPkgId)
);

CREATE INDEX IDX_SND_EVENTDATA_SUPERPKGID ON snd.EventData(SuperPkgId);
CREATE INDEX IDX_SND_EVENTDATA_EVENTID ON snd.EventData(EventId);

/*==============================================================*/
/* Table: EventsCache                                           */
/*==============================================================*/
CREATE TABLE snd.EventsCache (
   EventId              INTEGER              NOT NULL,
   HtmlNarrative        TEXT,
   Container            ENTITYID,

   CONSTRAINT PK_SND_EVENTS_CACHE PRIMARY KEY (EventId),
   CONSTRAINT FK_EVENTSCACHE_EVENTID FOREIGN KEY (EventId) REFERENCES snd.Events (EventId),
   CONSTRAINT FK_SND_EVENTSCACHE_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX IDX_SND_EVENTSCACHE_CONTAINER ON snd.EventsCache(Container);

-- ==========================================================================================
-- Function: fGetSuperPkg
-- Author:       Terry Hawkins
-- Creation date: 9/22/2017
-- Description:  Table valued function to return hierarchical view of a superPkg
-- ==========================================================================================
-- NOTE: ROW_NUMBER() OVER (...) cannot be used in the recursive term of WITH RECURSIVE in
-- PostgreSQL. The TreePath is computed using SortOrder directly, which preserves ordering
-- semantics while remaining compatible with PostgreSQL's recursive CTE restrictions.
-- ==========================================================================================
CREATE FUNCTION snd.fGetSuperPkg(_pkgId INT)
RETURNS TABLE (
    TopLevelPkgId   INTEGER,
    SuperPkgId      INTEGER,
    ParentSuperPkgId INTEGER,
    PkgId           INTEGER,
    TreePath        VARCHAR,
    SuperPkgPath    VARCHAR,
    SortOrder       INTEGER,
    Required        BOOLEAN,
    Description     VARCHAR,
    Narrative       TEXT,
    Active          BOOLEAN,
    Repeatable      BOOLEAN,
    Level           INTEGER
)
LANGUAGE sql AS $$
    WITH RECURSIVE CTE1 (TopLevelPkgId, SuperPkgId, ParentSuperPkgId, PkgId, TreePath, SuperPkgPath, SortOrder, Required, Description, Narrative, Active, Repeatable, Level) AS (

        -- anchor member
        SELECT _pkgId::INTEGER                                                         AS TopLevelPkgId,
               sp.SuperPkgId,
               sp.ParentSuperPkgId,
               sp.PkgId,
               RIGHT(REPEAT(' ', 3) || COALESCE(sp.SortOrder, 0)::VARCHAR, 3)         AS TreePath,
               sp.SuperPkgPath,
               sp.SortOrder,
               sp.Required,
               p.Description,
               p.Narrative,
               p.Active,
               p.Repeatable,
               1                                                                       AS Level
        FROM   snd.SuperPkgs sp
                   INNER JOIN snd.Pkgs p ON sp.PkgId = p.PkgId
        WHERE  sp.PkgId = _pkgId
          AND  sp.ParentSuperPkgId IS NULL

        UNION ALL

        -- recursive member
        SELECT _pkgId::INTEGER                                                         AS TopLevelPkgId,
               sp.SuperPkgId,
               c.SuperPkgId                                                            AS ParentSuperPkgId,
               sp.PkgId,
               c.TreePath || '/' || RIGHT(REPEAT(' ', 3) || COALESCE(sp.SortOrder, 0)::VARCHAR, 3) AS TreePath,
               sp.SuperPkgPath,
               sp.SortOrder,
               sp.Required,
               p.Description,
               p.Narrative,
               p.Active,
               p.Repeatable,
               c.Level + 1                                                             AS Level
        FROM   snd.SuperPkgs AS sp
                   INNER JOIN CTE1 AS c ON
                           sp.ParentSuperPkgId = c.SuperPkgId
                       OR  sp.ParentSuperPkgId IN (
                               SELECT sp2.SuperPkgId
                               FROM   snd.SuperPkgs AS sp2
                               WHERE  c.PkgId = sp2.PkgId
                                 AND  sp2.ParentSuperPkgId IS NULL)
                   INNER JOIN snd.Pkgs AS p ON sp.PkgId = p.PkgId
    )
    SELECT _pkgId::INTEGER AS TopLevelPkgId,
           c.SuperPkgId,
           c.ParentSuperPkgId,
           c.PkgId,
           c.TreePath,
           c.SuperPkgPath,
           c.SortOrder,
           c.Required,
           c.Description,
           c.Narrative,
           c.Active,
           c.Repeatable,
           c.Level
    FROM   CTE1 c;
$$;

-- ==========================================================================================
-- Function: fGetProjectItems
-- Author:       Terry Hawkins
-- Creation date: 12/14/2017
-- Description:  Returns the list of ProjectItems for a Project/Revision along with
--               sub packages for each ProjectItem
-- ==========================================================================================
CREATE FUNCTION snd.fGetProjectItems(_projectId INT, _revisionNum INT)
RETURNS TABLE (
    ProjectId       INTEGER,
    RevisionNum     INTEGER,
    ProjectItemId   INTEGER,
    SuperPkgId      INTEGER,
    PkgId           INTEGER,
    TreePath        VARCHAR,
    Level           INTEGER,
    ProjectActive   BOOLEAN,
    Active          BOOLEAN,
    Description     VARCHAR
)
LANGUAGE sql AS $$
    WITH RECURSIVE CTE1 (ProjectId, RevisionNum, ProjectItemId, ParentObjectId, ParentSuperPkgId, SuperPkgId, PkgId, ProjectActive, Active, TreePath, Level, Description) AS (

        -- anchor member
        SELECT _projectId::INTEGER                                                          AS ProjectId,
               _revisionNum::INTEGER                                                        AS RevisionNum,
               pi.ProjectItemId,
               pi.ParentObjectId,
               sp.ParentSuperPkgId,
               sp.SuperPkgId,
               sp.PkgId,
               p.Active                                                                     AS ProjectActive,
               pi.Active,
               RIGHT(REPEAT(' ', 3) || COALESCE(sp.SuperPkgId, 0)::VARCHAR, 3)             AS TreePath,
               1                                                                            AS Level,
               pkg.Description
        FROM   snd.ProjectItems AS pi
                   INNER JOIN snd.Projects AS p  ON pi.ParentObjectId = p.ObjectId
                   INNER JOIN snd.SuperPkgs AS sp ON pi.SuperPkgId = sp.SuperPkgId
                   INNER JOIN snd.Pkgs pkg        ON sp.PkgId = pkg.PkgId
        WHERE  p.ProjectId = _projectId
          AND  p.RevisionNum = _revisionNum

        UNION ALL

        -- recursive member
        SELECT c.ProjectId,
               c.RevisionNum,
               c.ProjectItemId,
               c.ParentObjectId,
               sp.ParentSuperPkgId,
               sp.SuperPkgId,
               sp.PkgId,
               c.ProjectActive,
               c.Active,
               c.TreePath || '/' || RIGHT(REPEAT(' ', 3) || COALESCE(sp.SortOrder, 0)::VARCHAR, 3) AS TreePath,
               c.Level + 1                                                                 AS Level,
               pkg.Description
        FROM   snd.SuperPkgs AS sp
                   INNER JOIN snd.Pkgs AS pkg ON sp.PkgId = pkg.PkgId
                   INNER JOIN CTE1 AS c ON
                           sp.ParentSuperPkgId = c.SuperPkgId
                       OR  sp.ParentSuperPkgId IN (
                               SELECT sp2.SuperPkgId
                               FROM   snd.SuperPkgs AS sp2
                               WHERE  c.PkgId = sp2.PkgId
                                 AND  sp2.ParentSuperPkgId IS NULL)
    )
    SELECT _projectId::INTEGER  AS ProjectId,
           _revisionNum::INTEGER AS RevisionNum,
           c.ProjectItemId,
           c.SuperPkgId,
           c.PkgId,
           c.TreePath,
           c.Level,
           c.ProjectActive,
           c.Active,
           c.Description
    FROM   CTE1 c;
$$;

-- ==========================================================================================
-- Function: fGetAllSuperPkgs
-- Description: Returns the full expanded super-package hierarchy for all top-level packages.
--              Uses CROSS JOIN LATERAL instead of a cursor loop for idiomatic PostgreSQL.
-- ==========================================================================================
CREATE FUNCTION snd.fGetAllSuperPkgs()
RETURNS TABLE (
    TopLevelPkgId   INTEGER,
    SuperPkgId      INTEGER,
    ParentSuperPkgId INTEGER,
    PkgId           INTEGER,
    TreePath        VARCHAR,
    SuperPkgPath    VARCHAR,
    SortOrder       INTEGER,
    Required        BOOLEAN,
    Description     VARCHAR,
    Narrative       TEXT,
    Active          BOOLEAN,
    Repeatable      BOOLEAN,
    Level           INTEGER
)
LANGUAGE sql AS $$
    SELECT g.*
    FROM   snd.SuperPkgs AS tl
               CROSS JOIN LATERAL snd.fGetSuperPkg(tl.PkgId) AS g
    WHERE  tl.ParentSuperPkgId IS NULL;
$$;

-- ==========================================================================================
-- Trigger: ti_after_events
-- Description: On INSERT, sets QcState to the container-scoped 'Completed' state when
--              QcState is not supplied. Implemented as a BEFORE INSERT trigger so that
--              NEW can be modified before the row is written.
-- ==========================================================================================
CREATE FUNCTION snd.ti_after_events_fn()
    RETURNS trigger
    LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.QcState IS NULL THEN
        NEW.QcState := (
            SELECT q.RowId
            FROM   core.DataStates AS q
            WHERE  q.Label     = 'Completed'
              AND  q.Container = NEW.Container
            ORDER BY q.RowId
            LIMIT 1
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER ti_after_events
    BEFORE INSERT ON snd.Events
    FOR EACH ROW EXECUTE PROCEDURE snd.ti_after_events_fn();
