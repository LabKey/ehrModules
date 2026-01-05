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

**All Records Mode:**
9. Click "All Records" button and verify reports show all animals
10. Verify no ID limit applies in All Records mode
11. Verify URL bookmarking works for All Records mode

**Alive at Center Mode:**
12. Click "Alive at Center" on a report with `supportsNonIdFilters = true`
13. Verify reports show only animals with `calculated_status = 'Alive'`
14. Verify "Alive at Center" button is disabled on report with `supportsNonIdFilters = false`
15. Switch to a different report and verify button state updates based on new report's `supportsNonIdFilters` value

**URL Params Mode (Read-Only):**
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

**Filter Mode Switching:**
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
   - Increment schema version in module.properties
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

20. Integration Test Plan

21. Integration Test Plan Review

22. Integration tests implementation

23. Code review

24. Review risks and update risk assessment

25. Feature verification

26. TeamCity review and merge

27. Docs handoff

28. Metrics handoff 

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

**ID Search Mode:**
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

**All Records Mode:**
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

**Alive at Center Mode:**
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

**URL Params Mode (Read-Only):**
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

**Filter Mode Switching:**
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

**Cross-Report Consistency:**
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

**ID Resolution Errors:**
* All IDs invalid/not found - verify "Not Found" section only, no reports data
* Network error during resolution - verify error message displayed, user can retry
* Timeout during long-running alias query (e.g., 100 IDs) - verify timeout error with retry option
* Permission denied to demographics/alias tables - verify appropriate error message
* Malformed IDs with special characters (e.g., "###", "***") - verify treated as literal ID string, appears in "Not Found" section
* IDs with SQL injection patterns (e.g., "'; DROP TABLE--") - verify treated as literal string, no security issue

**Validation Errors:**
* Empty ID input - verify validation message: "Please enter at least one animal ID"
* Whitespace-only input - verify treated as empty, validation error shown
* 101+ IDs entered - verify limit error and disabled button

**Report Loading Errors:**
* Report query fails - verify error message in report panel, other tabs still accessible
* No data for selected animals - verify "No data found" message
* Report doesn't support filter mode - verify appropriate message or disabled state

**URL/Navigation Errors:**
* URL with `readOnly=true` but no subjects - verify defaults to All Records mode or shows error
* Malformed URL hash - verify defaults to ID Search mode with no subjects
* URL with conflicting parameters (e.g., `readOnly=true` AND `filterType=all`) - verify `readOnly` takes priority, switches to urlParams mode
* URL hash exceeds browser limit (~2000 chars with many subjects) - verify graceful degradation or error
* Browser back/forward with filter changes - verify state maintained correctly

**Permission Errors:**
* User lacks folder read permission - verify redirect to permission denied page
* User lacks dataset permissions - verify reports show "permission denied" for those datasets
* Shared URL accessed by user without permissions - verify appropriate error message

### Accessibility Scenarios

**Keyboard Navigation:**
26. **Keyboard-Only Operation**
    - Navigate Animal History page using only keyboard (Tab, Enter, Space)
    - Verify all filter buttons accessible via Tab
    - Verify textarea accessible and functional
    - Verify "Update Report" button activates with Enter/Space
    - Verify focus indicators clearly visible
    - Verify logical tab order through interface

**Screen Reader Compatibility:**
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

**Browser Coverage:**
* Chrome (primary) - All scenarios
* Firefox - Core scenarios (ID Search, All Records, Alive at Center, URL Params)
* Safari (Mac) - Core scenarios
* Edge - Core scenarios

**Mobile Browsers (if supported):**
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

**New Test Methods:**

**ID Search Mode Tests:**

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

**All Records Mode Tests:**

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

**Alive at Center Mode Tests:**

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

**URL Params Mode Tests:**

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

**Filter Mode Switching Tests:**

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

**Performance Tests:**

15. **`testAnimalHistorySearchById_LargeDataset()`**
    - Note: Requires test environment with sufficient animal data
    - Enter maximum IDs supported (or realistic large number like 50)
    - Click "Update Report"
    - Measure and verify: Resolution completes within acceptable time (< 10 seconds)
    - Verify: Report rendering doesn't hang
    - Verify: Browser remains responsive
    - Switch to different report tab
    - Verify: Tab switching completes promptly

**Accessibility Tests:**

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

**Test Constants to Add:**

```java
// Add to EHR_AppTest class constants section
private static final String DEAD_ANIMAL_ID = "<specific_dead_animal_id>";  // TODO: Set based on test data
```

**Helper Methods to Add:**

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

**Test Data Setup:**

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

**Test Data Requirements:**
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

[image1]: <data:image/png;base64,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>