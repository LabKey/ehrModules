EXEC core.fn_dropifexists 'fGetAllSuperPkgs', 'snd', 'function';
go

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
