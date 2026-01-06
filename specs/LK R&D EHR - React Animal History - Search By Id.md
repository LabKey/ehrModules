# LK R\&D EHR \- React Animal History \- Search By Id

Author(s): Marty Pradere  
Spec start date: 12/29/2025  
Harvest: LabKey R\&D \- EHR \- React Animal History \- Animal History Search By Id  
Github Issue/Epic: 

## Modules/Distributions information

Modules involved:  
Base branch: develop  
Feature branch(es): fb\_xx

# Feature Summary
Implement a React Animal History using the React Participant View and a new Search by Id filter. Supports single and multi-animal selection and reports.

## User Value Statement

*Provide a simple statement that summarizes why a customer would need this feature. What will we tell a customer about this feature? What problem are we solving and how will we solve it?*

Replacing and refining the existing ExtJS animal history with more modern React animal history to reduce technical debt and provide a better framework for future development. Combine and simplify single and multi animal Id search.

## Success Metrics

*Success metrics drive the understanding if something we have released has been successful or not. The success metric captures what we need to observe and monitor once the product has been released. For example, **reduce support queries on updated login page by 15%***

Full feature replacement for single and multi animal search by Id. This is not yet at the MVP, so metrics for adoption or usage are not realistic at this point.

## Background

Migrating EHR to React has been prioritized as a long term effort starting in 2023\. There are a variety of reasons for migrating away from ExtJS, which has not been supported for a long time. React is the framework used within LabKey for modern UI design and is the most widely supported modern web framework.

Animal History was chosen as the first UI to redesign due to its broad applicability across centers and across users within each center.

Beyond migrating to a new framework, this will be an opportunity to rethink and improve the design of Animal History. User feedback will be key to determining the use cases that need to be supported and the ease of use supporting those use cases.

## Related Document Links:

* [Animal History Epic](https://docs.google.com/document/d/1JtPpSJnqvA_lLsttmnb5rtfvagvdcpzpEoXYiGv-GlM/edit?tab=t.0#heading=h.4rg4h5vuek0)  
* [Figma Mockups](https://www.figma.com/design/0T8LiMSQoqZWiFq3n5Nwqw/EHR-Animal-History?node-id=46-964)

## User Stories

*How will a user incorporate this into their broader workflow? What types of users exist, and how does their usage differ? Include the **why**. Try using the format: As a \<user\> I want to … so that….*

1. As a member of clinical, behavioral, research or colony management teams, I want to view animal history reports for a single animal.  
2. As a member of clinical, behavioral, research or colony management teams, I want to view animal history reports for multiple animals. I may type in the Ids or copy and paste them in.  
3. As a member of clinical, behavioral, research or colony management teams, I want to find animals by alias.  
4. As a member of clinical, behavioral, research or colony management teams, I want to view all animal history reports with the filters above applied, including single and multiple animal variations of the reports.

# Requirements

1. Full database search  
2. Alive, at center search  
3. Single animal search  
4. Multi-animal search  
5. Resolve Aliases  
6. Clear messaging if id not found or found by alias  
7. All reports displayed in tabs

*Move any of the following boilerplate requirements that do not apply to this story to the Non-requirements section..*

8. Permissions: Folder Read Permission and dataset read permissions  
9. Metrics: Report and filter usage.

# Non-requirements

*What is out of scope for this iteration of work? Call out explicitly if Permissions, Auditing and/or Metrics will not be changed.*

1. The following are already handled or non-requirements for these reports  
   1. Cloud considerations:  
   2. Cross-folder considerations:  
   3. Performance considerations:  
   4. Audit logging:

# Open Questions

1. 

# Risk Assessment

*identify potential risks and propose mitigation strategies. Each team member should contribute by highlighting any risks they foresee, considering business, user, project management, technical, and quality assurance aspects.*

1. Risk: Incorrect search results  
   1. Impact: High  
   2. Likelihood: Medium  
   3. Mitigation:   
      1. Id resolution feedback for in UI.  
      2. Implemented as experimental feature to be able to view old and new animal history results side-by-side.   
      3. Manual testing with test data.  
      4. Regression test coverage.  
2. Risk: Incorrect data sent to reports  
   1. Impact: High  
   2. Likelihood: Medium  
   3. Mitigation:   
      1. Implemented as experimental feature to be able to view old and new animal history reports side-by-side.   
      2. Manual testing with test data.  
      3. Regression test coverage across all reports for each center.

# Detailed Functional Design

![][image1]

The snapshot above is not a redline design but the features and layout represent what will be implemented in this story. The tabbed view of reports below the filters is already implemented for participant view, this new view will use the same component.

1. Single animal search: This will use the same data entry as the multi-animal search. Copy/type in a single Id and click Update Report. The single Id will be added to the selected list as the only id.  
2. Multi-animal search: Using the same text area as single animal search. Type or copy in multiple animal Ids. The animal Ids can have letters, numbers, special characters, and spaces in the names. Separators between animal Ids are newlines, tabs, commas and semicolons. Maximum of 100 animal IDs per search. If more than 100 IDs are entered, a validation error will be displayed and the search will not execute.  
3. Resolve by Alias: Animals can have a number of aliases \- nicknames, tattoos, chip numbers, etc. The animal Id search will resolve the animals by these aliases and provide feedback in the Id Resolution section when an alias is used to find an animal Id. ID matching is case-insensitive, so searching for "id123", "ID123", or "Id123" will all match the same animal. The Id Resolution section will only appear when there are aliases or Ids not found in the search field. The Id Resolution section will have two sections, "Resolved" for the Ids found as they are entered or Ids found by alias lookup; and a "Not Found" section for Ids that don't resolve.   
4. All Records: This will provide two options, “All Records” and “Alive, at Center”. These operate independently of any other filter, so clicking them will clear any other filters.  
   1. All Records: No filters applied. All current and historical animals will be included.  
   2. Alive, at Center: This will apply only one filter “Alive, at Center” on the animal status. Otherwise there will be no filters applied.  
5. All reports displayed in tabs: Single animal reports should already be tested in the previous story for Participant View. Many of these reports have a different view for multiple animals over a certain limit. These can go from a more detailed JS report for 1-5 animals to more of a grid view if more animals are selected in the filter. The multiple animal reports in particular will need to be tested and ensure all necessary data is being passed to the reports.  
6. Metrics: Add metrics to determine which filters and which reports are being used.

# Detailed Developer Design

*What are the implementation details?*  
*Think about the complexity of the code in the affected area(s) as this will impact tasks & their estimates.*

## Overview

This feature implements a React-based Animal History page with Search By Id functionality. The implementation extends the existing `ParticipantReports` component and `TabbedReportPanel` infrastructure to support single and multi-animal search with alias resolution.

### Component Architecture

```
AnimalHistoryPage.tsx
├── SearchByIdPanel (new component)
│   ├── FilterOptionsToggle (ID Search / All Records / Alive at Center)
│   ├── IdInputArea (textarea for single/multi ID entry - visible in ID Search mode)
│   ├── UpdateReportButton (visible in ID Search mode)
│   └── IdResolutionFeedback (child component - visible in ID Search mode when needed)
│       ├── ResolvedIdsList
│       └── NotFoundIdsList
└── ParticipantReports.tsx (existing)
    └── TabbedReportPanel.tsx (existing)
        ├── Category tabs (primary navigation)
        ├── Report tabs (secondary navigation)
        └── Report renderers (JSReportWrapper, QueryReportWrapper, OtherReportWrapper)
```

## New Components

### 1. SearchByIdPanel

**Location:** `labkey-ui-ehr/src/ParticipantHistory/SearchByIdPanel/SearchByIdPanel.tsx`

**Props Interface:**
```typescript
interface SearchByIdPanelProps {
    onFilterChange: (filterType: 'idSearch' | 'all' | 'aliveAtCenter' | 'urlParams', subjects?: string[]) => void;
    initialSubjects?: string[];
    initialFilterType?: 'idSearch' | 'all' | 'aliveAtCenter' | 'urlParams';
    activeReportSupportsNonIdFilters: boolean; // From ehr.reports.supportsNonIdFilters field
}
```

**State:**
- `inputValue: string` - Raw text from textarea
- `filterType: 'idSearch' | 'all' | 'aliveAtCenter' | 'urlParams'` - Current filter selection
- `isResolving: boolean` - Loading state during ID resolution
- `resolutionResult: IdResolutionResult` - Results of alias resolution
- `validationError: string | null` - Error message if validation fails (e.g., exceeds 100 ID limit)

**Behavior:**
- **ID Search Mode (`filterType === 'idSearch'`):**
  - Accepts single or multiple animal IDs in a textarea
  - Parses input using separators: newlines (`\n`), tabs (`\t`), commas (`,`), semicolons (`;`)
  - Handles IDs with letters, numbers, special characters, and spaces in names
  - Validates that no more than 100 unique IDs are entered (after parsing and de-duplication)
  - Displays validation error if limit exceeded; prevents calling `onFilterChange` until resolved
  - Calls ID resolution service when "Update Report" button is clicked
  - Displays `IdResolutionFeedback` component with resolution results (child component)
  - Calls `onFilterChange` with resolved subjects after successful resolution
- **All Records Mode (`filterType === 'all'`):**
  - No ID input required; clears any entered IDs
  - No ID limit applies
  - Reports show all animals (no filters on IDs or status)
  - Hides `IdResolutionFeedback` component
  - Calls `onFilterChange` immediately when button clicked
- **Alive at Center Mode (`filterType === 'aliveAtCenter'`):**
  - Button disabled if `activeReportSupportsNonIdFilters === false`
  - No ID input required; clears any entered IDs
  - No ID limit applies
  - Reports filter on `calculated_status = 'Alive'` in `study.demographics`
  - Hides `IdResolutionFeedback` component
  - Calls `onFilterChange` immediately when button clicked
- **URL Params Mode (`filterType === 'urlParams'`):**
  - Activated when URL contains `readOnly=true` parameter (for shared/bookmarked links)
  - **Hides all filter toggle buttons** (ID Search / All Records / Alive at Center)
  - **Hides ID input textarea and Update Report button**
  - Shows read-only summary: "Viewing {count} animal(s): {subject1}, {subject2}, ..."
  - Shows "Modify Search" button that switches to ID Search mode with current subjects pre-populated
  - Reports filter by URL subjects without requiring ID resolution
  - No ID limit applies (URL-provided subjects are assumed already validated/resolved)
  - Hides `IdResolutionFeedback` component

**Internal Structure:**
- `SearchByIdPanel` internally manages `IdResolutionFeedback` component
- Resolution results are managed as internal state, not passed to parent
- Parent component (`ParticipantReports`) only receives final resolved subject IDs
- URL Params mode provides a read-only view for shared/bookmarked links

### 2. IdResolutionFeedback

**Location:** `labkey-ui-ehr/src/ParticipantHistory/SearchByIdPanel/IdResolutionFeedback.tsx`

**Props Interface:**
```typescript
interface IdResolutionResult {
    resolved: Array<{
        inputId: string;
        resolvedId: string;
        resolvedBy: 'direct' | 'alias';
        aliasType?: string; // e.g., 'tattoo', 'chip', 'nickname'
    }>;
    notFound: string[];
}

interface IdResolutionFeedbackProps {
    resolutionResult: IdResolutionResult;
    isVisible: boolean; // Only show when there are aliases or not-found IDs
}
```

**Display Logic:**
- Component only renders when `resolutionResult.resolved.some(r => r.resolvedBy === 'alias') || resolutionResult.notFound.length > 0`
- "Resolved" section shows IDs found directly and IDs found via alias lookup (with indication of alias type)
- "Not Found" section lists IDs that couldn't be resolved

## Modified Components

### 1. ParticipantReports.tsx

**Changes Required:**
- Add `SearchByIdPanel` above `TabbedReportPanel`
- Manage `subjects` and `filterType` state locally instead of only from URL
- Update URL hash when filter changes
- Pass filter information to `TabbedReportPanel` via `filters` prop
- Provide `activeReportSupportsNonIdFilters` to `SearchByIdPanel` from active report metadata
- `SearchByIdPanel` internally manages ID resolution and displays `IdResolutionFeedback` (not managed by parent)

**Updated Structure:**
```typescript
export const ParticipantReports: FC = memo(() => {
    const urlFilters = useMemo(() => getFiltersFromUrl(), []);
    const [subjects, setSubjects] = useState<string[]>(urlFilters.subjects || []);

    // Determine initial filter type based on URL parameters
    const initialFilterType = useMemo(() => {
        if (urlFilters.readOnly && urlFilters.subjects?.length > 0) {
            return 'urlParams'; // Read-only mode for shared links
        }
        return urlFilters.filterType || 'idSearch';
    }, [urlFilters]);

    const [filterType, setFilterType] = useState<'idSearch' | 'all' | 'aliveAtCenter' | 'urlParams'>(initialFilterType);
    const [activeReport, setActiveReport] = useState(urlFilters.activeReport);

    // Query active report metadata to get supportsNonIdFilters field
    const activeReportSupportsNonIdFilters = useMemo(() => {
        // Query ehr.reports for activeReport and return supportsNonIdFilters value
        // Returns false if no active report or report doesn't support non-ID filters
    }, [activeReport]);

    const handleFilterChange = useCallback((
        newFilterType: 'idSearch' | 'all' | 'aliveAtCenter' | 'urlParams',
        newSubjects?: string[]
    ) => {
        setFilterType(newFilterType);
        setSubjects(newSubjects || []);
        // When switching from urlParams to idSearch (via "Modify Search"), remove readOnly parameter
        const isLeavingReadOnly = filterType === 'urlParams' && newFilterType !== 'urlParams';
        updateUrlHash(newFilterType, newSubjects, !isLeavingReadOnly && urlFilters.readOnly);
    }, [filterType, urlFilters.readOnly]);

    const filters = useMemo(() => ({
        filterType,
        subjects: (filterType === 'idSearch' || filterType === 'urlParams') ? subjects : undefined,
        ...urlFilters,
    }), [filterType, subjects, urlFilters]);

    return (
        <div>
            <SearchByIdPanel
                onFilterChange={handleFilterChange}
                initialSubjects={subjects}
                initialFilterType={filterType}
                activeReportSupportsNonIdFilters={activeReportSupportsNonIdFilters}
            />
            <TabbedReportPanel
                activeReport={activeReport}
                filters={filters}
                onTabChange={(newReport) => setActiveReport(newReport)}
                reportNamespace="EHR.reports"
                reportsQuery="reports"
                reportsSchema="ehr"
                showReport={urlFilters.showReport}
            />
        </div>
    );
});
```

**Key Points:**
- `ParticipantReports` no longer manages `resolutionResult` state
- `IdResolutionFeedback` is rendered inside `SearchByIdPanel`, not here
- Simplified state management - parent only tracks final resolved subjects, not resolution details
- URL Params mode (`readOnly=true`) enables read-only view for shared/bookmarked links
- "Modify Search" button in URL Params mode removes `readOnly` parameter and switches to ID Search mode

### 2. AnimalHistoryPage.tsx

**Changes Required:**
- Remove placeholder text "This is Animal History"
- Component serves as entry point wrapping `ParticipantReports`

## API Integration

### Id Resolution Service

**New File:** `labkey-ui-ehr/src/ParticipantHistory/services/idResolutionService.ts`

```typescript
interface ResolveIdsParams {
    inputIds: string[];
}

export async function resolveAnimalIds(params: ResolveIdsParams): Promise<IdResolutionResult> {
    // Step 1: Query study.demographics for direct ID matches
    // Step 2: Query study.alias for alias matches on unresolved IDs
    // Step 3: Return consolidated results
}
```

**Database Queries:**

The two-query approach correctly handles multiple aliases per animal ID by filtering to only aliases that match the user's input. Queries use LabKey SQL, which is database-agnostic and supports case-insensitive matching via the `lower()` function.

1. **Direct ID Lookup:**
```sql
SELECT Id as resolvedId, Id as inputId, 'direct' as resolvedBy, NULL as aliasType
FROM study.demographics
WHERE lower(Id) IN (${lowercaseInputIds})
```

2. **Alias Lookup (for unresolved IDs only):**
```sql
SELECT
    a.Id as resolvedId,
    a.alias as inputId,
    'alias' as resolvedBy,
    a.aliasType
FROM study.alias a
INNER JOIN study.demographics d ON a.Id = d.Id
WHERE lower(a.alias) IN (${lowercaseUnresolvedInputIds})
```

**Key Points:**
- Queries use LabKey SQL (database-agnostic) rather than database-specific SQL dialects
- Case-insensitive matching via `lower()` function on both input IDs and database values
- Query 2 only runs with IDs not found in Query 1, avoiding unnecessary lookups
- The `WHERE lower(a.alias) IN (...)` clause ensures we only return aliases that were actually in the user's input, even if an animal has many other aliases in the database
- Each query returns the input-to-resolved-ID mapping needed for the IdResolutionFeedback display
- The application layer de-duplicates resolved IDs when passing to reports (multiple inputs may resolve to the same animal ID)

## URL Hash Format

The URL hash format follows the existing pattern in `ParticipantReports.tsx`:

**ID Search mode:**
```
#subjects:{id1};{id2};{id3}&filterType:idSearch&activeReport:{reportId}&showReport:1
```

**All Records mode:**
```
#filterType:all&activeReport:{reportId}&showReport:1
```

**Alive at Center mode:**
```
#filterType:aliveAtCenter&activeReport:{reportId}&showReport:1
```

**URL Params mode (shared/bookmarked link - read-only):**
```
#subjects:{id1};{id2};{id3}&readOnly:true&activeReport:{reportId}&showReport:1
```

**Parameters:**
- `subjects` - Semicolon-separated list of resolved animal IDs (present for `idSearch` and `urlParams` modes)
- `filterType` - `idSearch`, `all`, or `aliveAtCenter` (not used for `urlParams` mode)
- `readOnly` - `true` to enable URL Params mode (read-only view with no search UI)
- `activeReport` - Currently selected report ID
- `showReport` - Whether to show report content (1 = true)

**URL Params Mode Notes:**
- When `readOnly=true` is present with subjects, automatically activates URL Params mode
- Used for sharing specific animal results or bookmarking
- Subjects are assumed to be already resolved/validated (no ID resolution performed)
- "Modify Search" button removes `readOnly` parameter and switches to ID Search mode

## Report Schema Changes

### New Field in ehr.reports Table

A new boolean field must be added to the `ehr.reports` table to indicate report support for non-ID filters:

**Field:** `supportsNonIdFilters` (boolean, default: false)

**Purpose:** Indicates whether a report can handle the "Alive at Center" filter mode which filters by status without requiring specific subject IDs.

**Usage:**
- Reports with `supportsNonIdFilters = true` can filter by `calculated_status = 'Alive'` across all animals
- Reports with `supportsNonIdFilters = false` will have only the "Alive at Center" button disabled
- All reports support "All Records" (no filters) and "ID Search" (specific IDs) modes regardless of this field
- Most legacy single/multi-animal reports will default to `false` and require migration to support status filtering

## Filter Integration with TabbedReportPanel

The `TabbedReportPanel` needs updates to handle four filter modes:

**Updated `ReportTab` component:**
```typescript
newTab.getFilterArray = () => {
    const filterArray = { removable: [], nonRemovable: [] };
    const subjectFieldName = report.subjectFieldName || 'Id';

    // ID Search mode: Filter by specific subject IDs
    if (filters && filters.filterType === 'idSearch' && filters.subjects && filters.subjects.length) {
        const subjects = filters.subjects;
        if (subjects.length === 1) {
            filterArray.nonRemovable.push(Filter.create(subjectFieldName, subjects[0], Filter.Types.EQUAL));
        } else {
            filterArray.nonRemovable.push(
                Filter.create(subjectFieldName, subjects.join(';'), Filter.Types.EQUALS_ONE_OF)
            );
        }
    }

    // URL Params mode: Filter by URL-provided subject IDs (same as ID Search)
    if (filters && filters.filterType === 'urlParams' && filters.subjects && filters.subjects.length) {
        const subjects = filters.subjects;
        if (subjects.length === 1) {
            filterArray.nonRemovable.push(Filter.create(subjectFieldName, subjects[0], Filter.Types.EQUAL));
        } else {
            filterArray.nonRemovable.push(
                Filter.create(subjectFieldName, subjects.join(';'), Filter.Types.EQUALS_ONE_OF)
            );
        }
    }

    // Alive at Center mode: Filter by calculated_status
    if (filters && filters.filterType === 'aliveAtCenter') {
        filterArray.nonRemovable.push(
            Filter.create('calculated_status', 'Alive', Filter.Types.EQUAL)
        );
    }

    // All Records mode: No filters applied (filterType === 'all')

    return filterArray;
};
```

**Key Points:**
- ID Search mode applies subject ID filters after user-initiated resolution
- URL Params mode applies subject ID filters from URL without resolution
- Alive at Center mode applies `calculated_status = 'Alive'` filter on `study.demographics`
- All Records mode applies no filters (shows all animals)
- The 100 ID limit only applies to ID Search mode
- Non-ID filter modes (all, aliveAtCenter, urlParams) have no ID limits and don't go through ID resolution

## Edge Cases

### ID Search Mode Only:

1. **Empty Input:** Display validation message; do not call API
2. **Whitespace-only Input:** Treat as empty input after trimming
3. **Duplicate IDs:** De-duplicate before resolution; show each unique ID once in results
4. **Mixed Valid/Invalid IDs:** Resolve valid IDs; show invalid in "Not Found" section
5. **All IDs Not Found:** Display "Not Found" section only; reports panel shows no data message
6. **Alias Resolves to Same ID:** If multiple input values resolve to the same animal ID, show all in "Resolved" section but pass de-duplicated list to reports
7. **Special Characters in IDs:** Support IDs with hyphens, underscores, and other special characters
8. **Case Sensitivity:** ID matching is case-insensitive for both direct ID and alias lookups, implemented using LabKey SQL's `lower()` function
9. **ID Limit Exceeded:** Hard limit of 100 unique IDs (after parsing and de-duplication). Display clear validation error: "Maximum of 100 animal IDs allowed. You entered {count} IDs." Disable "Update Report" button until input is reduced.

### All Filter Modes:

10. **Report Doesn't Support Non-ID Filters:** If `activeReportSupportsNonIdFilters === false`, disable only the "Alive at Center" button. "ID Search" and "All Records" modes remain available.
11. **Switching Filter Modes:** When switching from ID Search to All Records or Alive at Center, clear the ID input textarea and resolution results.
12. **No Active Report Selected:** Default behavior - may need to handle gracefully or default to first available report.

### URL Params Mode Only:

13. **No Subjects in URL:** If `readOnly=true` but no subjects parameter, default to "All Records" mode and ignore `readOnly`.
14. **Invalid Subject IDs:** URL subjects are assumed valid; if reports show no data, display message indicating subjects may not exist or user lacks permissions.
15. **Modify Search Button:** Clicking "Modify Search" switches to ID Search mode with subjects pre-populated in textarea, removes `readOnly` parameter from URL.
16. **Direct URL Navigation:** When user shares URL with `readOnly=true`, recipient sees read-only view immediately on page load without search UI.
17. **URL with Both filterType and readOnly:** If URL has `readOnly=true`, ignore `filterType` parameter and use URL Params mode.
18. **Excessive Subject Count in URL:** No limit enforced on URL Params mode subjects (assumed to be curated/valid from previous search); browser URL length limits (~2,000 chars) are the only practical constraint.

## Permissions

- **Required Permission:** Folder Read Permission
- **Dataset Permissions:** Read permission on `study.demographics` and `study.alias` datasets
- Reports inherit existing dataset-level permissions through `TabbedReportPanel`

## Metrics

Add tracking for:
1. **Filter Usage:**
   - `animalHistory.filter.idSearch` - ID Search mode used (include count of IDs)
   - `animalHistory.filter.idSearch.single` - Single ID search performed
   - `animalHistory.filter.idSearch.multi` - Multi ID search performed (include count)
   - `animalHistory.filter.all` - "All Records" filter selected
   - `animalHistory.filter.aliveAtCenter` - "Alive at Center" filter selected

2. **Resolution Stats (ID Search mode only):**
   - `animalHistory.search.aliasResolved` - Count of IDs resolved via alias
   - `animalHistory.search.notFound` - Count of IDs not found

3. **Report Usage:**
   - Existing report tab tracking in `TabbedReportPanel` via `onTabChange`
   - Track which reports are viewed with each filter mode

## Testing Considerations

### Unit Tests

1. **ID Parsing:**
   - Test separator handling (newlines, tabs, commas, semicolons)
   - Test whitespace trimming
   - Test de-duplication
   - Test special character preservation
   - Test 100 ID limit validation (exactly 100, 101+)

2. **IdResolutionFeedback:**
   - Test visibility logic (show only when aliases or not-found exist)
   - Test correct categorization of resolved vs not-found

3. **SearchByIdPanel:**
   - Test input state management for ID Search mode
   - Test filter mode toggle behavior (idSearch, all, aliveAtCenter)
   - Test URL Params mode hides filter toggle buttons and shows read-only summary
   - Test "Modify Search" button switches from URL Params to ID Search mode
   - Test "Update Report" button callback for each mode
   - Test validation error display when exceeding 100 ID limit (ID Search mode only)
   - Test "Update Report" button disabled state when validation fails
   - Test "Alive at Center" button disabled when `activeReportSupportsNonIdFilters === false`
   - Test clearing input when switching to All Records or Alive at Center modes

### Integration Tests

1. **ID Resolution Service:**
   - Mock API calls for demographics and alias queries
   - Test direct match scenario
   - Test alias resolution scenario
   - Test mixed valid/invalid IDs
   - Test case-insensitive matching

2. **Filter Mode Integration:**
   - Test ID Search mode applies subject ID filters correctly
   - Test All Records mode applies no filters
   - Test Alive at Center mode applies `calculated_status = 'Alive'` filter
   - Test URL Params mode applies subject ID filters from URL without resolution
   - Test switching between filter modes updates reports correctly
   - Test report metadata query for `supportsNonIdFilters` field

3. **URL Hash Sync:**
   - Test initial load from URL hash for all filter types (idSearch, all, aliveAtCenter, urlParams)
   - Test URL Params mode activated when `readOnly=true` in URL
   - Test URL update on filter mode change
   - Test `readOnly` parameter removed when switching from URL Params to ID Search mode
   - Test navigation/bookmark scenarios for each mode

### Manual Test Scenarios

**ID Search Mode:**
1. Single animal ID search (direct match)
2. Single animal ID search (alias match)
3. Multiple animal IDs (all direct matches)
4. Multiple animal IDs (mixed direct and alias)
5. Multiple animal IDs (some not found)
6. Enter exactly 100 IDs (should succeed)
7. Enter 101+ IDs (should show validation error and prevent search)
8. Verify report data matches selected animals for ID Search

#### All Records Mode

9. Click "All Records" button and verify reports show all animals
10. Verify no ID limit applies in All Records mode
11. Verify URL bookmarking works for All Records mode

#### Alive at Center Mode

12. Click "Alive at Center" on a report with `supportsNonIdFilters = true`
13. Verify reports show only animals with `calculated_status = 'Alive'`
14. Verify "Alive at Center" button is disabled on report with `supportsNonIdFilters = false`
15. Switch to a different report and verify button state updates based on new report's `supportsNonIdFilters` value

#### URL Params Mode (Read-Only)

16. Navigate to URL with `readOnly=true` and subjects parameter
17. Verify no filter toggle buttons shown
18. Verify no ID input textarea or Update Report button shown
19. Verify read-only summary displays subject count and IDs
20. Verify reports are filtered by URL subjects
21. Click "Modify Search" button and verify:
    - Switches to ID Search mode
    - Subjects pre-populated in textarea
    - `readOnly` removed from URL
    - Filter toggle buttons now visible
22. Test URL with `readOnly=true` but no subjects (should default to All Records)
23. Test URL with both `filterType` and `readOnly=true` (should use URL Params mode)

#### Filter Mode Switching

24. Switch from ID Search to All Records (verify input cleared)
25. Switch from ID Search to Alive at Center (verify input cleared)
26. Switch from All Records to ID Search (verify input textarea available)
27. Switch from Alive at Center to ID Search (verify input textarea available)

## Configuration Considerations

- **Center-specific Alias Types:** Different centers may have different alias categories. The alias resolution should query all alias types from `study.alias` without hardcoding specific types.
- **Demographics Status Field:** The "Alive at Center" filter relies on `calculated_status` field in demographics. Verify this field exists and is populated correctly across all center implementations.

## What Might Go Wrong

1. **Performance with Large ID Lists:** Addressed with hard limit of 100 IDs maximum for ID Search mode. This prevents slow queries while supporting typical use cases.
2. **Performance with "All Records" Mode:** No ID limit on All Records and Alive at Center modes could cause performance issues with very large datasets. Reports need to handle pagination or lazy loading.
3. **Alias Table Not Populated:** Some centers may not use aliases extensively. Handle gracefully with direct matches only.
4. **Inconsistent Demographics Data:** The `calculated_status` field may have different values across centers. Document expected values.
5. **Report Schema Migration:** Adding `supportsNonIdFilters` field to `ehr.reports` requires database migration. Existing reports default to `false`, so "Alive at Center" will be disabled until reports are updated.
6. **ExtJS Report Compatibility:** Some JS reports may expect specific filter formats. Test all report types with new filter structure and all three filter modes.
7. **URL Length Limits:** Mitigated by 100 ID limit for ID Search mode. Even with maximum-length IDs, 100 subjects should stay within browser URL limits (~2,000 characters). Monitor in testing if approaching limits with long ID names.
8. **Report Tab Changes:** When user switches between report tabs, the `activeReportSupportsNonIdFilters` value changes, which could enable/disable the "Alive at Center" button mid-session. Ensure UI clearly indicates why button state changed.

## Dev Review

*Evaluate the design for clarity, completeness, technical soundness, and alignment with our standards. Suggest improvements or raise concerns where needed.* 

## Test Review

*Assess the design for test coverage needed, edge case handling, and clarity of expected behaviors. Document any test considerations or gaps you identify.*

# Tasks

*Remember to think about test data creation & QA for test data.*  
*Format: Each task listed should be usable as a task in scrumwise; include implementation details & notes as sub-bullets to the task name (avoid having full paragraphs as the task).*  
*Granularity: Tasks should be at the level of steps that will be done relatively independently when possible. Try to keep task sizes to work that can be done in about a day or less (\<= 5 hours).*

## Backend/Database Tasks

1. Add `supportsNonIdFilters` field to ehr.reports table
   - Create SQL migration scripts for PostgreSQL and SQL Server
   - Add column: `supportsNonIdFilters BOOLEAN DEFAULT FALSE`
   - Increment schema version in EHRModule.java
   - Test migration on both database platforms

2. Update select reports to support non-ID filters
   - Identify candidate reports that can support "Alive at Center" mode
   - Update report queries to handle no subject filter (when filterType = 'aliveAtCenter' or 'all')
   - Set `supportsNonIdFilters = true` for updated reports
   - Verify reports handle large datasets with pagination/performance

## Frontend - Core Components

3. Implement ID resolution service
   - Create `idResolutionService.ts` in `labkey-ui-ehr/src/ParticipantHistory/services/`
   - Implement `resolveAnimalIds()` function with LabKey SQL queries
   - Query 1: Direct ID lookup with case-insensitive matching
   - Query 2: Alias lookup for unresolved IDs
   - Return `IdResolutionResult` with resolved and notFound arrays
   - Handle API errors gracefully

4. Implement IdResolutionFeedback component
   - Create `IdResolutionFeedback.tsx` in `labkey-ui-ehr/src/ParticipantHistory/SearchByIdPanel/`
   - Implement visibility logic (show only when aliases or not-found exist)
   - Display "Resolved" section with direct and alias matches
   - Display "Not Found" section for unresolved IDs
   - Show alias type for alias-resolved IDs
   - Style component for clear user feedback

5. Implement SearchByIdPanel component - Part 1 (ID Search mode)
   - Create `SearchByIdPanel.tsx` in `labkey-ui-ehr/src/ParticipantHistory/SearchByIdPanel/`
   - Implement filter mode toggle buttons (ID Search / All Records / Alive at Center)
   - Implement ID textarea with multi-separator parsing (newlines, tabs, commas, semicolons)
   - Implement 100 ID limit validation with error display
   - Implement "Update Report" button with loading state
   - Call ID resolution service on button click
   - Display IdResolutionFeedback as child component
   - Handle special characters and case-insensitive input

6. Implement SearchByIdPanel component - Part 2 (Other filter modes)
   - Implement All Records mode (clear input, hide resolution feedback)
   - Implement Alive at Center mode (clear input, disable if not supported)
   - Implement URL Params mode (read-only view with "Modify Search" button)
   - Handle filter mode switching and state clearing
   - Implement conditional rendering based on `activeReportSupportsNonIdFilters` prop

7. Update ParticipantReports component
   - Add SearchByIdPanel above TabbedReportPanel
   - Implement filter state management (filterType, subjects)
   - Implement URL hash detection for initial filter type (including readOnly detection)
   - Query ehr.reports for activeReport's `supportsNonIdFilters` field
   - Implement `handleFilterChange` callback
   - Update URL hash when filter changes
   - Pass filters to TabbedReportPanel

8. Update TabbedReportPanel filter integration
   - Update `ReportTab.getFilterArray()` to handle four filter modes
   - Add ID Search mode filter logic (subject ID filters)
   - Add URL Params mode filter logic (same as ID Search)
   - Add Alive at Center mode filter logic (`calculated_status = 'Alive'`)
   - Add All Records mode (no filters)
   - Test filter application with all report types

## Frontend - URL and Navigation

9. Implement URL hash management
   - Create/update `updateUrlHash()` function for four filter modes
   - Handle `readOnly` parameter for URL Params mode
   - Parse URL hash on page load to determine initial filter type
   - Handle browser back/forward navigation
   - Test URL bookmarking for all modes

10. Update AnimalHistoryPage component
    - Remove placeholder text
    - Wrap ParticipantReports component
    - Handle any page-level initialization

## Metrics and Monitoring

11. Implement metrics tracking
    - Add filter usage metrics (idSearch, all, aliveAtCenter, urlParams)
    - Track single vs multi ID searches
    - Track alias resolution stats (resolved, not found)
    - Track report usage by filter mode
    - Integrate with existing metrics infrastructure

## Testing

12. Unit tests - ID resolution service
    - Test direct ID match scenario
    - Test alias resolution scenario
    - Test mixed valid/invalid IDs
    - Test case-insensitive matching
    - Test empty results
    - Mock LabKey SQL queries

13. Unit tests - SearchByIdPanel component
    - Test ID parsing with all separator types
    - Test 100 ID limit validation
    - Test filter mode toggle behavior
    - Test URL Params mode read-only view
    - Test "Modify Search" button
    - Test "Alive at Center" button disabled state
    - Test input clearing on mode switch

14. Unit tests - IdResolutionFeedback component
    - Test visibility logic
    - Test resolved vs not-found categorization
    - Test alias type display

15. Integration tests - Filter mode integration
    - Test ID Search mode applies correct filters
    - Test All Records mode applies no filters
    - Test Alive at Center mode applies status filter
    - Test URL Params mode applies URL subjects filter
    - Test mode switching updates reports correctly
    - Test report metadata query

16. Integration tests - URL hash sync
    - Test initial load for all filter types
    - Test URL Params mode activation with readOnly parameter
    - Test URL update on filter change
    - Test readOnly parameter removal on mode switch

17. Manual test plan
    - Document test scenarios for all four filter modes
    - Document filter switching scenarios
    - Document edge cases to verify
    - Create test data for various scenarios

18. Manual testing - ID Search mode
    - Single animal (direct and alias)
    - Multiple animals (various combinations)
    - 100 ID limit validation
    - Report data verification

19. Manual testing - Other filter modes
    - All Records mode functionality
    - Alive at Center mode with supported/unsupported reports
    - URL Params mode (shared links, modify search)
    - Filter mode switching

# Testing

## Manual Test Plan

### Related Areas

* **Animal History Reports** - All existing animal history reports must function with new filter modes
* **URL Sharing/Bookmarking** - URLs with subjects and readOnly parameter must work across sessions and users
* **Demographics and Alias Data** - ID resolution depends on study.demographics and study.alias tables
* **Report Metadata** - ehr.reports.supportsNonIdFilters field affects "Alive at Center" button state
* **Permissions** - Report access controlled by folder and dataset permissions
* **ExtJS Reports** - Legacy JavaScript reports must receive correct filter data
* **React Reports** - QueryReportWrapper and JSReportWrapper must handle all filter modes
* **TabbedReportPanel** - Existing report tab navigation and filter application

### User Scenarios

#### ID Search Mode

1. **Single Animal Search (Direct ID)**
   - Navigate to Animal History page
   - Verify default state: ID Search mode active with empty textarea
   - Enter single animal ID in textarea
   - Click "Update Report"
   - Verify ID resolves and reports display for that animal
   - Verify no "ID Resolution" feedback section appears (all direct matches)

2. **Single Animal Search (Alias)**
   - Enter animal alias (tattoo, chip number, etc.) in textarea
   - Click "Update Report"
   - Verify ID Resolution feedback section appears
   - Verify "Resolved" section shows: input alias → resolved ID (alias type)
     Example: "test123 → ID12345 (tattoo)"
   - Verify correct animal ID is displayed and reports load

3. **Multi-Animal Search (Various Separators)**
   - Enter 5 animal IDs separated by newlines
   - Click "Update Report", verify all resolved
   - Clear and re-enter same 5 IDs separated by commas
   - Click "Update Report", verify same results
   - Repeat with tab-separated and semicolon-separated lists

4. **Multi-Animal Search (Mixed Separators)**
   - Enter IDs using multiple separators in single input: "ID1, ID2\nID3;ID4\tID5"
   - Click "Update Report"
   - Verify all 5 IDs parsed correctly
   - Verify reports show all 5 animals

5. **Mixed Direct and Alias IDs**
   - Enter 3 direct IDs and 2 aliases in textarea
   - Click "Update Report"
   - Verify ID Resolution feedback section appears (contains aliases)
   - Verify "Resolved" section shows:
     - Direct matches without arrow: "ID123"
     - Alias matches with arrow and type: "alias456 → ID789 (tattoo)"
   - Verify all 5 animals appear in reports

6. **IDs Not Found**
   - Enter mix of valid direct IDs and invalid/non-existent IDs
   - Click "Update Report"
   - Verify ID Resolution feedback section appears (contains not-found IDs)
   - Verify "Resolved" section shows valid IDs without arrow: "ID123"
   - Verify "Not Found" section lists invalid IDs
   - Verify reports only show data for valid IDs

7. **Duplicate IDs**
   - Enter "ID123, ID456, ID123, ID456" (duplicates)
   - Click "Update Report"
   - Verify de-duplication occurs
   - Verify only 2 unique IDs used in resolution
   - Verify reports show 2 animals (not 4)

8. **100 ID Limit**
   - Enter exactly 100 unique IDs
   - Verify no validation error, "Update Report" enabled
   - Click "Update Report", verify all resolve
   - Add 1 more ID (101 total)
   - Verify validation error appears: "Maximum of 100 animal IDs allowed. You entered 101 IDs."
   - Verify "Update Report" button is disabled
   - Remove one ID to get back to 100
   - Verify error clears and "Update Report" button re-enables

9. **Case Insensitivity**
   - Enter animal ID in lowercase
   - Verify resolution finds ID regardless of stored casing
   - Enter same ID in uppercase, verify same result

### All Records Mode

10. **View All Animals**
    - Click "All Records" button
    - Verify ID input textarea is cleared and hidden
    - Verify reports display data for all animals in database
    - Verify no ID filters applied
    - Test with multiple report tabs

11. **URL Bookmarking - All Records**
    - While in All Records mode, copy URL
    - Open URL in new browser tab
    - Verify All Records mode is active
    - Verify all animals shown

### Alive at Center Mode

12. **View Alive Animals (Supported Report)**
    - Navigate to report with `supportsNonIdFilters = true`
    - Verify "Alive at Center" button is enabled
    - Click "Alive at Center"
    - Verify reports show only animals with `calculated_status = 'Alive'`
    - Verify ID input is cleared/hidden

13. **Disabled for Unsupported Reports**
    - Navigate to report with `supportsNonIdFilters = false`
    - Verify "Alive at Center" button is disabled/grayed out
    - Hover over button, verify tooltip explains why disabled
    - Switch to another report with `supportsNonIdFilters = true`
    - Verify button becomes enabled

14. **Report Tab Switching**
    - Start in Alive at Center mode on supported report
    - Switch to report tab with `supportsNonIdFilters = false`
    - Verify "Alive at Center" button becomes disabled
    - Verify filter mode stays as "Alive at Center" (selected)
    - Verify error message appears: "This report does not support Alive at Center filtering"
    - Verify report shows unfiltered data (all animals, not just alive)
    - Switch back to supported report tab
    - Verify error message clears
    - Verify "Alive at Center" button becomes enabled again
    - Verify alive-only filter reapplies

### URL Params Mode (Read-Only)

15. **Shared Link with Subjects**
    - Perform ID search for 3 animals, get results
    - Generate shareable URL with `readOnly=true` parameter
    - Open URL in incognito/private browser window
    - Verify no filter toggle buttons visible
    - Verify no ID input textarea visible
    - Verify read-only summary shows resolved animal IDs with count (e.g., "Viewing 3 animal(s): ID123, ID456, ID789")
    - Verify "Modify Search" button is visible
    - Verify reports display data for the 3 animals

16. **Modify Shared Link**
    - From URL Params mode (shared link)
    - Click "Modify Search" button
    - Verify switches to ID Search mode
    - Verify filter toggle buttons now visible
    - Verify subjects pre-populated in textarea
    - Verify URL no longer contains `readOnly=true`
    - Modify ID list, click "Update Report"
    - Verify new IDs resolve and reports update

17. **Bookmark with Many Subjects**
    - Create URL Params mode link with 50 animal IDs
    - Bookmark the URL
    - Close browser, reopen bookmark
    - Verify exactly 50 animals display correctly
    - Verify no ID limit validation (URL Params mode bypasses 100 limit)
    - Verify URL hash length doesn't cause browser issues

18. **URL with Subjects but No readOnly Flag**
    - Build URL with subjects in hash but without `readOnly=true` parameter
    - Navigate to URL
    - Verify ID Search mode active (not URL Params mode)
    - Verify subjects pre-populated in textarea (editable)
    - Verify filter toggle buttons visible

### Filter Mode Switching

19. **ID Search → All Records**
    - Enter 5 animal IDs, click "Update Report"
    - Verify reports show 5 animals
    - Click "All Records" button
    - Verify ID textarea is cleared
    - Verify reports now show all animals

20. **All Records → ID Search**
    - While in All Records mode showing all animals
    - Click "ID Search" button
    - Verify empty ID textarea appears
    - Verify filter toggle buttons visible
    - Enter animal IDs and proceed with search

21. **ID Search → Alive at Center**
    - From ID Search with 5 animals
    - Click "Alive at Center" button (on supported report)
    - Verify ID textarea cleared
    - Verify reports now show only alive animals (not just the 5)

22. **Alive at Center → ID Search**
    - From Alive at Center mode
    - Click "ID Search" button
    - Verify empty ID textarea appears
    - Enter IDs and verify can return to ID search

23. **Browser Back/Forward Navigation**
    - Perform ID search for 3 animals
    - Click "All Records"
    - Click browser back button
    - Verify returns to ID Search with 3 animals
    - Click browser forward button
    - Verify returns to All Records mode
    - Verify state and URL hash sync correctly

### Cross-Report Consistency

24. **Data Consistency Across Report Types**
    - Search for 3 animals
    - Navigate through all report tabs (Demographics, Weight, Housing, etc.)
    - Verify all reports show same 3 animals
    - Verify filter is maintained across tabs

25. **Single vs Multi-Animal Report Variants**
    - Search for 1 animal
    - Verify reports using single-animal view layout
    - Search for 10 animals
    - Verify same reports switch to multi-animal grid layout
    - Verify data correctness in both views

### Error Cases

#### ID Resolution Errors

* All IDs invalid/not found - verify "Not Found" section only, no reports data
* Network error during resolution - verify error message displayed, user can retry
* Timeout during long-running alias query (e.g., 100 IDs) - verify timeout error with retry option
* Permission denied to demographics/alias tables - verify appropriate error message
* Malformed IDs with special characters (e.g., "###", "***") - verify treated as literal ID string, appears in "Not Found" section
* IDs with SQL injection patterns (e.g., "'; DROP TABLE--") - verify treated as literal string, no security issue

#### Validation Errors

* Empty ID input - verify validation message: "Please enter at least one animal ID"
* Whitespace-only input - verify treated as empty, validation error shown
* 101+ IDs entered - verify limit error and disabled button

#### Report Loading Errors

* Report query fails - verify error message in report panel, other tabs still accessible
* No data for selected animals - verify "No data found" message
* Report doesn't support filter mode - verify appropriate message or disabled state

#### URL/Navigation Errors

* URL with `readOnly=true` but no subjects - verify defaults to All Records mode or shows error
* Malformed URL hash - verify defaults to ID Search mode with no subjects
* URL with conflicting parameters (e.g., `readOnly=true` AND `filterType=all`) - verify `readOnly` takes priority, switches to urlParams mode
* URL hash exceeds browser limit (~2000 chars with many subjects) - verify graceful degradation or error
* Browser back/forward with filter changes - verify state maintained correctly

#### Permission Errors

* User lacks folder read permission - verify redirect to permission denied page
* User lacks dataset permissions - verify reports show "permission denied" for those datasets
* Shared URL accessed by user without permissions - verify appropriate error message

### Accessibility Scenarios

#### Keyboard Navigation

26. **Keyboard-Only Operation**
    - Navigate Animal History page using only keyboard (Tab, Enter, Space)
    - Verify all filter buttons accessible via Tab
    - Verify textarea accessible and functional
    - Verify "Update Report" button activates with Enter/Space
    - Verify focus indicators clearly visible
    - Verify logical tab order through interface

#### Screen Reader Compatibility

27. **Screen Reader Accessibility**
    - Use screen reader (NVDA/JAWS) to navigate page
    - Verify filter mode changes announced
    - Verify textarea has descriptive label
    - Verify validation errors announced via role="alert"
    - Verify ID Resolution feedback sections have proper headings
    - Verify report data accessible and properly labeled

### Performance Scenarios

28. **ID Resolution Performance**
    - Enter 100 animal IDs (maximum)
    - Click "Update Report"
    - Verify ID resolution completes in < 5 seconds
    - Verify UI remains responsive during resolution

29. **Report Rendering Performance**
    - After resolving 100 animals
    - Verify reports render in < 10 seconds
    - Switch between report tabs
    - Verify tab switching completes in < 2 seconds

30. **Filter Mode Switching Performance**
    - Switch between filter modes (ID Search, All Records, Alive at Center)
    - Verify mode transitions complete in < 200ms
    - Verify no UI lag or freezing

### Cross-Browser Testing

#### Browser Coverage

* Chrome (primary) - All scenarios
* Firefox - Core scenarios (ID Search, All Records, Alive at Center, URL Params)
* Safari (Mac) - Core scenarios
* Edge - Core scenarios

#### Mobile Browsers (if supported)

* Chrome Mobile (Android) - ID Search and URL Params scenarios
* Safari Mobile (iOS) - ID Search and URL Params scenarios

## Automated Test Plan

### Unit Tests (Jest)

**File: `idResolutionService.test.ts`**
* Test `resolveAnimalIds()` with direct ID matches
* Test `resolveAnimalIds()` with alias matches
* Test `resolveAnimalIds()` with mixed valid/invalid IDs
* Test case-insensitive matching with `lower()` function
* Test empty input handling
* Test de-duplication of input IDs
* Test multiple aliases resolving to same animal ID (ensure no duplicate results)
* Test 100+ IDs to verify no client-side limit in service
* Test special characters in IDs/aliases (spaces, dashes, underscores)
* Test response timing/performance expectations with large datasets
* Test API error handling (network, permissions, timeouts)
* Test LabKey API returns 500 error - verify error handling
* Test LabKey API returns empty result set - verify handled gracefully
* Test LabKey API returns malformed response - verify doesn't crash
* Mock LabKey.Query.selectRows calls

**File: `SearchByIdPanel.test.tsx`**
* Test ID parsing with newline separators
* Test ID parsing with comma separators
* Test ID parsing with tab separators
* Test ID parsing with semicolon separators
* Test ID parsing with mixed separators
* Test whitespace trimming
* Test duplicate ID de-duplication across different separators
* Test empty input shows validation error: "Please enter at least one animal ID"
* Test whitespace-only input treated as empty (shows validation error)
* Test input with empty strings filtered out: ["ID1", "", "ID2"] → ["ID1", "ID2"]
* Test 100 ID limit validation - exactly 100 IDs
* Test 100 ID limit validation - 101 IDs shows error
* Test validation error clears when IDs reduced below limit
* Test component behavior when `initialSubjects` prop provided (URL Params → ID Search transition)
* Test filter mode toggle buttons render correctly
* Test switching between filter modes updates state
* Test ID textarea visible only in ID Search mode
* Test "Update Report" button visible only in ID Search mode
* Test "Update Report" button disabled when validation fails
* Test "Update Report" button re-enables after fixing validation error
* Test "Alive at Center" button disabled when `activeReportSupportsNonIdFilters = false`
* Test "Alive at Center" button enabled when `activeReportSupportsNonIdFilters = true`
* Test "Alive at Center" selected but on unsupported report shows error message
* Test URL Params mode hides filter buttons
* Test URL Params mode shows read-only summary
* Test "Modify Search" button switches to ID Search mode
* Test input cleared when switching to All Records or Alive at Center
* Test accessibility: ARIA labels on textarea and buttons
* Test accessibility: keyboard navigation works correctly
* Test IDs with SQL injection patterns treated as literal strings (security test)

**File: `IdResolutionFeedback.test.tsx`**
* Test component hidden when all IDs are direct matches (no aliases, no not-found)
* Test component visible when aliases present
* Test component visible when not-found IDs present
* Test component visible when both aliases and not-found IDs present
* Test "Resolved" section displays direct matches without arrow: "ID123"
* Test "Resolved" section displays alias matches with arrow and type: "alias456 → ID123 (tattoo)"
* Test "Not Found" section displays unresolved IDs
* Test multiple inputs resolving to same ID displayed correctly

**File: `ParticipantReports.test.tsx`**
* Test initial filter type determined from URL hash
* Test `readOnly=true` in URL activates URL Params mode
* Test filter state management (subjects, filterType)
* Test `handleFilterChange` callback updates state and URL
* Test `activeReportSupportsNonIdFilters` queried from report metadata
* Test switching filter modes updates URL hash
* Test switching from URL Params mode removes `readOnly` parameter
* Test race condition: rapid filter mode changes before state updates
* Test initial load with malformed URL hash (fallback behavior)
* Test `activeReportSupportsNonIdFilters` updates when switching report tabs

**File: `TabbedReportPanel.test.tsx`**
* Test ID Search mode creates subject ID filters
* Test URL Params mode creates subject ID filters
* Test All Records mode creates no filters
* Test Alive at Center mode creates `calculated_status = 'Alive'` filter
* Test filter switching updates report filters correctly
* Test filter structure matches LabKey Filter.create() API format
* Test empty subjects array in ID Search mode shows validation error (not passed to reports)
* Test report with `supportsNonIdFilters = false` in Alive at Center mode shows error message

**File: `urlHashUtils.test.ts`**
* Test `updateUrlHash()` for ID Search mode
* Test `updateUrlHash()` for All Records mode
* Test `updateUrlHash()` for Alive at Center mode
* Test `updateUrlHash()` for URL Params mode with `readOnly=true`
* Test `getFiltersFromUrl()` parses all filter types
* Test URL with conflicting parameters resolved correctly
* Test URL hash with 100+ subjects (ensure no truncation)
* Test special character encoding in subject IDs (spaces, semicolons)
* Test `updateUrlHash()` doesn't create duplicate history entries

### Integration Tests (Selenium - Java)

**Add to existing test class: `EHR_AppTest`**

Location: `server/modules/ehrModules/ehr_app/test/src/org/labkey/test/tests/ehr_app/EHR_AppTest.java`

#### New Test Methods

#### ID Search Mode Tests

1. **`testAnimalHistorySearchById_SingleDirect()`**
   - Navigate to Animal History page in EHR_App
   - Enter single animal ID from test data
   - Click "Update Report" button
   - Assert report loads with animal data
   - Assert no ID Resolution feedback visible (all direct matches, no aliases/not-found)

2. **`testAnimalHistorySearchById_SingleAlias()`**
   - Set up alias in test data (if not already present)
   - Enter alias (e.g., tattoo number) in search field
   - Click "Update Report"
   - Assert ID Resolution feedback section visible
   - Assert "Resolved" section shows alias → ID with type (e.g., "TATTOO_001 → ID123 (tattoo)")
   - Assert correct animal displayed in reports

3. **`testAnimalHistorySearchById_MultiAnimal()`**
   - Build comma-separated list of 3-5 direct test animal IDs
   - Enter in search textarea
   - Click "Update Report"
   - Assert no ID Resolution feedback visible (all direct matches)
   - Assert all animals appear in first visible report
   - Navigate to different report tabs: Demographics, Weight, Housing
   - For each tab, assert all 3-5 animals shown

4. **`testAnimalHistorySearchById_NotFound()`**
   - Enter mix of valid direct test IDs and "INVALID_ID_999"
   - Click "Update Report"
   - Assert ID Resolution feedback section visible
   - Assert "Resolved" section shows valid IDs without arrow
   - Assert "Not Found" section contains "INVALID_ID_999"
   - Assert reports show only valid IDs

5. **`testAnimalHistorySearchById_100IdLimit()`**
   - Generate 100 unique test IDs (or mock if needed)
   - Enter in textarea
   - Assert no validation error
   - Add 101st ID
   - Assert validation error visible: "Maximum of 100 animal IDs allowed. You entered 101 IDs."
   - Assert "Update Report" button disabled
   - Remove one ID
   - Assert error clears

6. **`testAnimalHistorySearchById_CaseInsensitive()`**
   - Enter animal ID in lowercase
   - Click "Update Report"
   - Assert resolves correctly
   - Clear and enter same ID in uppercase
   - Click "Update Report"
   - Assert same result

#### All Records Mode Tests

7. **`testAnimalHistorySearchById_AllRecords()`**
   - Navigate to Animal History
   - Click "All Records" button
   - Assert ID textarea not visible or disabled
   - Assert reports load without subject filters
   - Verify multiple animals displayed (more than test subset)

8. **`testAnimalHistorySearchById_AllRecordsUrl()`**
   - Click "All Records" button
   - Capture URL containing `filterType:all`
   - Navigate away, then to captured URL
   - Assert All Records mode active
   - Assert reports show all animals

#### Alive at Center Mode Tests

9. **`testAnimalHistorySearchById_AliveAtCenter()`**
   - Navigate to report supporting non-ID filters (verify in test setup)
   - Assert "Alive at Center" button enabled
   - Click button
   - Assert reports filter to animals with `calculated_status = 'Alive'`
   - Verify DEAD_ANIMAL_ID not included in results
   - Verify at least one alive animal is shown

10. **`testAnimalHistorySearchById_AliveAtCenterDisabled()`**
    - Navigate to report with `supportsNonIdFilters = true` and click "Alive at Center"
    - Verify alive filter active
    - Switch to report tab with `supportsNonIdFilters = false`
    - Assert "Alive at Center" button disabled (but still selected)
    - Assert error message visible: "This report does not support Alive at Center filtering"
    - Assert report shows unfiltered data (all animals, not just alive)
    - Switch back to supported report tab
    - Assert error message clears
    - Assert button becomes enabled again
    - Assert alive filter reapplies

#### URL Params Mode Tests

11. **`testAnimalHistorySearchById_UrlParamsReadOnly()`**
    - Build URL with 2-3 test animal IDs and `readOnly=true` parameter
    - Navigate to URL
    - Assert filter toggle buttons not visible
    - Assert ID textarea not visible
    - Assert read-only summary displays animal count
    - Assert reports show specified animals

12. **`testAnimalHistorySearchById_ModifySharedLink()`**
    - Navigate to URL Params mode URL (with `readOnly=true`)
    - Click "Modify Search" button
    - Assert switches to ID Search mode
    - Assert filter buttons visible
    - Assert subjects pre-populated in textarea
    - Assert URL no longer contains `readOnly=true`

#### Filter Mode Switching Tests

13. **`testAnimalHistorySearchById_SwitchModes()`**
    - Start with ID search for 3 animals
    - Assert 3 animals in reports
    - Click "All Records"
    - Assert reports now show all animals
    - Click "ID Search"
    - Assert empty textarea visible
    - Click "Alive at Center" (on supported report)
    - Assert reports show only alive animals

14. **`testAnimalHistorySearchById_MultipleTransitions()`**
    - ID Search with 3 IDs → verify reports show 3 animals
    - Switch to All Records → verify shows all animals
    - Switch to Alive at Center → verify shows only alive animals
    - Switch back to ID Search → verify empty textarea
    - Enter 5 different IDs and click "Update Report" → verify reports update to 5 animals
    - Verify state maintained correctly through all transitions
    - Verify URL hash updates at each step

#### Performance Tests

15. **`testAnimalHistorySearchById_LargeDataset()`**
    - Note: Requires test environment with sufficient animal data
    - Enter maximum IDs supported (or realistic large number like 50)
    - Click "Update Report"
    - Measure and verify: Resolution completes within acceptable time (< 10 seconds)
    - Verify: Report rendering doesn't hang
    - Verify: Browser remains responsive
    - Switch to different report tab
    - Verify: Tab switching completes promptly

#### Accessibility Tests

16. **`testAnimalHistorySearchById_KeyboardNavigation()`**
    - Navigate to Animal History page
    - Use keyboard only (Tab, Enter keys) to:
      - Focus on ID textarea
      - Enter animal IDs
      - Tab to "Update Report" button
      - Press Enter to submit
    - Verify reports load correctly
    - Tab to filter mode buttons and activate with keyboard
    - Verify filter modes switch correctly via keyboard

#### Test Constants to Add

```java
// Add to EHR_AppTest class constants section
private static final String DEAD_ANIMAL_ID = "<specific_dead_animal_id>";  // TODO: Set based on test data
```

#### Helper Methods to Add

```java
private void navigateToAnimalHistorySearchById()
{
    // Handle different navigation contexts - ensure we can reach the page
    if (!isElementPresent(Locator.css(".search-by-id-panel")))
    {
        goToProjectHome(); // Or goToEHRFolder() if needed
        clickAndWait(Locator.linkWithText("Animal History")); // Parent menu
        clickAndWait(Locator.linkWithText("Search By Id")); // Submenu if needed
    }
    waitForElement(Locator.css(".search-by-id-panel"));
}

private void enterAnimalIds(String... ids)
{
    if (ids == null || ids.length == 0)
        throw new IllegalArgumentException("Must provide at least one ID");

    Locator textarea = Locator.css("textarea.animal-id-input");
    waitForElement(textarea); // Ensure visible before interacting
    setFormElement(textarea, String.join(",", ids));
}

private void clickUpdateReport()
{
    clickButton("Update Report");

    // Wait for loading indicator to appear then disappear (if present)
    Locator loadingIndicator = Locator.css(".loading-indicator");
    if (isElementPresent(loadingIndicator))
    {
        waitForElementToDisappear(loadingIndicator, WAIT_FOR_PAGE);
    }

    // Then wait for content
    waitForElement(Locator.css(".report-content"));
}

private void clickFilterButton(String buttonText)
{
    clickButton(buttonText); // "All Records", "Alive at Center", or "ID Search"
    sleep(500); // Allow mode transition
}

private void assertIdResolutionVisible(boolean shouldBeVisible)
{
    if (shouldBeVisible)
        assertElementPresent(Locator.css(".id-resolution-feedback"));
    else
        assertElementNotPresent(Locator.css(".id-resolution-feedback"));
}

private void assertNotFoundContains(String id)
{
    assertElementPresent(Locator.css(".not-found-section").containing(id));
}

private void assertValidationError(String expectedMessage)
{
    // Allow partial match for flexibility
    Locator validationError = Locator.css(".validation-error").containing(expectedMessage);
    assertElementPresent(validationError);

    // Also verify error is visible (not just present in DOM)
    assertTrue("Validation error should be visible",
               validationError.findElement(getDriver()).isDisplayed());
}

private void assertReportContainsAnimal(String animalId)
{
    assertTextPresent(animalId);
}

private void assertFilterButtonState(String buttonText, boolean shouldBeEnabled)
{
    Locator button = Locator.button(buttonText);
    assertElementPresent(button);

    if (shouldBeEnabled)
        assertElementPresent(button.notWithClass("disabled"));
    else
        assertElementPresent(button.withClass("disabled"));
}

private void assertUrlContains(String paramName, String paramValue)
{
    String currentUrl = getDriver().getCurrentUrl();
    assertTrue("URL should contain " + paramName + ":" + paramValue,
               currentUrl.contains(paramName + ":" + paramValue));
}

private void assertUrlDoesNotContain(String paramName)
{
    String currentUrl = getDriver().getCurrentUrl();
    assertFalse("URL should not contain " + paramName,
                currentUrl.contains(paramName + ":"));
}

private void assertReadOnlySummaryText(int expectedCount)
{
    String expectedText = String.format("Viewing %d animal(s)", expectedCount);
    assertElementPresent(Locator.css(".read-only-summary").containing(expectedText));
}

private void assertTextareaVisible(boolean shouldBeVisible)
{
    Locator textarea = Locator.css("textarea.animal-id-input");
    if (shouldBeVisible)
    {
        assertElementPresent(textarea);
        assertTrue("Textarea should be visible",
                   textarea.findElement(getDriver()).isDisplayed());
    }
    else
    {
        // Either not present or not visible
        if (isElementPresent(textarea))
        {
            assertFalse("Textarea should not be visible",
                       textarea.findElement(getDriver()).isDisplayed());
        }
    }
}

private void assertUpdateReportButtonEnabled(boolean shouldBeEnabled)
{
    Locator button = Locator.button("Update Report");
    assertElementPresent(button);

    boolean isDisabled = button.findElement(getDriver()).getAttribute("disabled") != null;

    if (shouldBeEnabled)
    {
        assertFalse("Update Report button should not be disabled", isDisabled);
    }
    else
    {
        assertTrue("Update Report button should be disabled", isDisabled);
    }
}

private String buildUrlWithParams(String filterType, String[] subjects, boolean readOnly)
{
    StringBuilder url = new StringBuilder(getProjectHome() + "/ehr-animalHistory.view");
    url.append("#filterType:").append(filterType);

    if (subjects != null && subjects.length > 0)
        url.append("&subjects:").append(String.join(";", subjects));

    if (readOnly)
        url.append("&readOnly:true");

    return url.toString();
}
```

#### Test Data Setup

**IMPORTANT:** Before running these tests, implement the stub methods below. Alternatively, mark tests requiring this data as `@Ignore` until data setup is complete.

Add to `EHR_AppTest` setup methods:

```java
@Override
protected void doCreateSteps()
{
    super.doCreateSteps();

    // Ensure test subjects exist (existing method)
    createTestSubjects();

    // NEW: Create alias test data
    setupAliasTestData();

    // NEW: Configure report metadata
    configureTestReportMetadata();

    // NEW: Ensure mix of alive/dead animals
    ensureStatusVariety();
}

private void setupAliasTestData()
{
    // Create aliases for first 3 test animals
    String[] tattoos = {"TATTOO_001", "TATTOO_002", "TATTOO_003"};
    String[] chips = {"CHIP_12345", "CHIP_67890", "CHIP_11111"};

    for (int i = 0; i < 3 && i < MORE_ANIMAL_IDS.length; i++)
    {
        // Insert tattoo alias
        insertAlias(MORE_ANIMAL_IDS[i], tattoos[i], "tattoo");

        // Insert chip alias
        insertAlias(MORE_ANIMAL_IDS[i], chips[i], "chip");
    }
}

private void insertAlias(String animalId, String alias, String aliasType)
{
    InsertRowsCommand cmd = new InsertRowsCommand("study", "alias");
    Map<String, Object> row = new HashMap<>();
    row.put("Id", animalId);
    row.put("alias", alias);
    row.put("aliasType", aliasType);
    cmd.addRow(row);
    cmd.execute(createDefaultConnection(), getProjectName());
}

private void configureTestReportMetadata()
{
    // TODO: Implement this method before running tests 9, 10, 13, 14
    // Mark "Demographics" report as supporting non-ID filters
    // Mark "Blood Draws" report (or similar) as NOT supporting non-ID filters
    // Implementation approaches:
    // 1. Update ehr.reports table directly via SQL
    // 2. Use LabKey API to update supportsNonIdFilters field
    // 3. Ensure test reports are already configured in test database

    // Example (adjust based on actual implementation):
    // executeQuery("UPDATE ehr.reports SET supportsNonIdFilters = true WHERE reportId = 'demographics'");
    // executeQuery("UPDATE ehr.reports SET supportsNonIdFilters = false WHERE reportId = 'blood_draws'");
}

private void ensureStatusVariety()
{
    // TODO: Implement this method before running tests 9, 10
    // Ensure at least one animal has calculated_status = 'Alive'
    // Ensure at least one animal has calculated_status = 'Dead'
    // Implementation depends on how calculated_status is computed

    // Options:
    // 1. Update demographics records directly
    // 2. Ensure test data already has variety
    // 3. Trigger calculation if it's computed field

    // Example (adjust based on actual schema):
    // Use existing test data or update demographics for specific test animals
    // DEAD_ANIMAL_ID should be defined as constant and used in tests
}
```

#### Test Data Requirements

- Minimum 5-10 test animal IDs (use existing `MORE_ANIMAL_IDS` array)
- For 100 ID limit test: Either generate 100 test IDs programmatically or use realistic count (e.g., 20-50) and adjust test expectations
- At least 3 animals with aliases (tattoos, chips) for alias resolution testing - configured by `setupAliasTestData()`
- Mix of alive and dead animals for Alive at Center testing - ensured by `ensureStatusVariety()`
  - Define test constant: `private static final String DEAD_ANIMAL_ID = "<specific_dead_animal_id>";`
  - Use in test 9 to verify exclusion from Alive at Center results
- At least two test reports: one supporting non-ID filters, one not supporting - configured by `configureTestReportMetadata()`

# User Education Handoff 

Release:  
Products/Tiers:

## Headline

*A one-sentence description of the feature for a release note or newsletter.*

* 

## Bulleted list of user-facing relevant changes

*What change(s) might a user notice? What does a user need to know to use this feature?*

* 

## Recommendation on the best user education method

[*See here for more details*](https://docs.google.com/document/d/1_jAojHrSUKKEWzaDCeu-AzN9xmGoSc5TthPts0cJvcM/edit?tab=t.n2ref0601pcy#heading=h.tut9ohtozksi)*. Make a recommendation and, if needed, provide a brief comment about your recommendation*

|  | Method | Comments | Deliverables |
| :---- | :---- | :---- | :---- |
|  | Release note |  |  |
|  | Video |  |  |
|  | User-facing Doc |  |  |
|  | Internal-facing Doc |  |  |
|  | Other: |  |  |

## Metrics

*Provide the name of the metric(s) being created as part of this feature or write N/A. Please check if off the metric once it has been verified and annotated.*

- [ ] Metric name   
- [ ] Metric name  
- [ ] Metric name

[image1]: images/animal-history-search-by-id-mockup.png "Animal History Search By Id Interface"