# LK R\&D EHR \- React Animal History \- Search By Id

Author(s): Marty Pradere  
Spec start date: 12/29/2025  
Harvest: LabKey R\&D \- EHR \- React Animal History \- Animal History Search By Id  
Github Issue/Epic: 

## Modules/Distributions information

Modules involved:  
Base branch: develop  
Feature branch(es): fb_ehr_an_hist_id_search

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
      2. Implemented as admin feature initially to be able to view old and new animal history results side-by-side.   
      3. Manual testing with test data.  
      4. Regression test coverage.  
2. Risk: Incorrect data sent to reports  
   1. Impact: High  
   2. Likelihood: Medium  
   3. Mitigation:   
      1. Implemented as admin feature initially to be able to view old and new animal history reports side-by-side.   
      2. Manual testing with test data.  
      3. Regression test coverage across all reports for each center.

# Detailed Functional Design

![][image1]

The snapshot above is not a redline design but the features and layout represent what will be implemented in this story. The tabbed view of reports below the filters is already implemented for participant view, this new view will use the same component.

1. Single animal search: This will use the same data entry as the multi-animal search. Copy/type in a single Id and click Search By Ids. The single Id will be added to the selected list as the only id.  
2. Multi-animal search: Using the same text area as single animal search. Type or copy in multiple animal Ids. The animal Ids can have letters, numbers, special characters, and spaces in the names. Separators between animal Ids are newlines, tabs, commas and semicolons. Maximum of 100 animal IDs per search. If more than 100 IDs are entered, a validation error will be displayed and the search will not execute.  
3. Resolve by Alias: Animals can have a number of aliases \- nicknames, tattoos, chip numbers, etc. The animal Id search will resolve the animals by these aliases and provide feedback in the Id Resolution section when an alias is used to find an animal Id. ID matching is case-insensitive, so searching for "id123", "ID123", or "Id123" will all match the same animal. The Id Resolution section will only appear when there are aliases or Ids not found in the search field. The Id Resolution section will have two sections, "Resolved" for the Ids found as they are entered or Ids found by alias lookup; and a "Not Found" section for Ids that don't resolve.   
4. Filter Actions: The interface provides three action buttons: "Search By Ids", "All Animals", and "All Alive at Center".
   1. Search By Ids: Triggers ID Search mode with the IDs entered in the textarea. The textarea is always visible for entering animal IDs.
   2. All Animals: No filters applied. All current and historical animals will be included. Clears any previously entered IDs.
   3. All Alive at Center: Applies the "Id/Demographics/calculated_status = 'Alive'" filter. Otherwise no filters applied. Clears any previously entered IDs.  
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
├── ParticipantReports.tsx (existing)
│   ├── SearchByIdPanel (conditionally rendered - hidden in URL Params/readOnly mode)
│   │   ├── IdInputArea
│   │   │   ├── Label: "Enter Animal IDs"
│   │   │   └── Textarea (for single/multi ID entry)
│   │   ├── Validation Error Display (conditional - shown when validation fails)
│   │   ├── FilterToggleButtons
│   │   │   ├── Search By Ids button (triggers ID Search, shows "Searching..." during resolution)
│   │   │   ├── All Animals button (clears filters, shows all animals)
│   │   │   └── All Alive at Center button (filters by Id/Demographics/calculated_status = 'Alive')
│   │   └── IdResolutionFeedback (shows feedback when aliases resolved or IDs not found)
│   │       ├── ResolvedIdsList
│   │       └── NotFoundIdsList
│   └── TabbedReportPanel.tsx (existing)
│       ├── Category tabs (primary navigation)
│       ├── Report tabs (secondary navigation)
│       └── Report wrappers (each internally uses useReportTab hook)
│           ├── QueryReportWrapper (filters, report) → useReportTab → ExtJS ldk-querycmp
│           ├── JSReportWrapper (filters, report) → useReportTab → JS function call
│           └── OtherReportWrapper (filters, report) → useReportTab → LABKEY.WebPart
```

**URL Params/ReadOnly Mode:** When URL contains `readOnly=true` with subjects, ParticipantReports hides SearchByIdPanel entirely and displays reports directly using filters derived from URL.

### Styling Architecture

All inline styles have been refactored to SCSS modules located in `labkey-ui-ehr/src/theme/`:

**SCSS Files:**
- `SearchByIdPanel.scss` - Styles for search panel, buttons, input fields, validation errors
- `IdResolutionFeedback.scss` - Styles for ID resolution feedback component
- `ParticipantReports.scss` - Styles for filter error messages
- `TabbedReportPanel.scss` - Styles for report tabs, empty state placeholder
- `OtherReportWrapper.scss` - Styles for other report wrapper component
- `index.scss` - Main entry point that imports all component styles

**Benefits:**
- Centralized styling makes maintenance and theming easier
- Improved performance by leveraging CSS classes instead of inline styles
- Better code organization and separation of concerns
- Easier to apply consistent styling across components
- **Robust selectors:** All layout-dependent selectors (like `nth-child`) have been replaced with semantic class-based selectors for better maintainability and resilience to layout changes

**CSS Classes:**
Components now use semantic CSS classes that map to their functionality:
- `.search-by-id-panel` - Main panel container
- `.panel-container` - Input section wrapper
- `.button-container` - Button group wrapper
- `.search-button` - ID search button with `.active` and `.inactive` states
- `.filter-button` - Filter buttons (All Animals, Alive at Center)
  - `.all-animals` - Specific class for All Animals button
  - `.alive-at-center` - Specific class for Alive at Center button
- `.id-resolution-feedback` - Feedback component container
- `.filter-not-supported-error` - Error message styling
- `.empty-state-placeholder` - Empty state message

**Selector Architecture:**
All button styles use semantic class combinations instead of position-based selectors:
- Search button: `.search-button.active` (blue), `.search-button.inactive` (gray)
- All Animals button: `.filter-button.all-animals.active` (green), `.filter-button.all-animals.inactive` (gray)
- Alive at Center button: `.filter-button.alive-at-center.active` (teal), `.filter-button.alive-at-center.inactive` (gray)

This approach ensures styles remain stable even if button order changes in the DOM.

### Component Modularity

**useReportTab Hook:**

ExtJS tab lifecycle management is handled by the `useReportTab` custom hook, which each report wrapper calls internally. This replaces an earlier `ReportTab` render-props component with a simpler hook-based approach.

**Location:** `labkey-ui-ehr/src/ParticipantHistory/TabbedReportPanel/useReportTab.ts`

**Signature:**
```typescript
function useReportTab(
    report: ReportConfig,
    filters: ReportFilters
): { tab: ExtReportTab | null; targetRef: React.RefObject<HTMLDivElement> }
```

**Usage in Report Wrappers:**
Each wrapper calls the hook directly and renders its own report content:

```tsx
// Inside QueryReportWrapper, JSReportWrapper, or OtherReportWrapper
const { tab, targetRef } = useReportTab(report, filters);
```

TabbedReportPanel renders wrappers directly without an intermediary component:

```tsx
{currentActiveReport.reportType === 'query' && (
    <QueryReportWrapper filters={filters} report={currentActiveReport} />
)}
{currentActiveReport.reportType === 'js' && (
    <JSReportWrapper filters={filters} report={currentActiveReport} />
)}
{currentActiveReport.reportType === 'report' && (
    <OtherReportWrapper filters={filters} report={currentActiveReport} />
)}
```

**Benefits:**
- Simpler composition: each wrapper is self-contained with its own tab lifecycle
- No render-props indirection; wrappers receive `filters` and `report` directly
- Hook is independently testable (29 unit tests in `useReportTab.test.tsx`)
- Reduced coupling between TabbedReportPanel and report wrappers

**Centralized Type Definitions (Updated 2026-01-21):**

All commonly used interfaces have been centralized into a dedicated models directory for better code organization and reusability:

**Location:** `labkey-ui-ehr/src/ParticipantHistory/models/index.ts`

**Exported Types and Interfaces:**
- `ReportConfig` - Discriminated union of all report configuration types
- `QueryReportConfig` - Configuration for query-based reports
- `JsReportConfig` - Configuration for JavaScript function reports
- `OtherReportConfig` - Configuration for saved LabKey reports (R, chart, etc.)
- `FilterArray` - Removable and non-removable filters
- `QueryWebPartConfig` - LabKey Query WebPart configuration
- `ExtReportTab` - Extended ExtJS Container for report tabs
- `FilterType` - Filter mode types (aliveAtCenter, all, idSearch, urlParams)
- `ReportFilters` - Filters passed to TabbedReportPanel for filtering report data
- `UrlFilters` - URL hash filter parameters
- `IdResolutionResult` - Animal ID resolution results
- `ResolveIdsParams` - Parameters for ID resolution

**Import Pattern:**
All components that need these types now import from the centralized models directory:
```typescript
import { ReportConfig, QueryReportConfig, JsReportConfig, OtherReportConfig, FilterType } from '../models';
```

**Benefits of Centralization:**
- Single source of truth for all shared type definitions
- Eliminates circular dependencies and import confusion
- Easier to locate and maintain type definitions
- Consistent import pattern across all ParticipantHistory components
- Better separation between component logic and type definitions
- Improved IDE autocomplete and type checking

**Affected Files (12 files updated):**
- `TabbedReportPanel/useReportTab.ts` - Imports from models, implements ExtJS tab lifecycle and filter/config methods
- `TabbedReportPanel/TabbedReportPanel.tsx` - Imports `ReportConfig` union from models
- `TabbedReportPanel/QueryReportWrapper.tsx` - Imports `QueryReportConfig` variant from models
- `TabbedReportPanel/JSReportWrapper.tsx` - Imports `JsReportConfig` variant from models
- `TabbedReportPanel/OtherReportWrapper.tsx` - Imports `OtherReportConfig` variant from models
- `utils/urlHashUtils.ts` - Imports from models
- `APIWrapper.ts` - Imports from models, exports `FetchReportsFn` type, provides `ParticipantHistoryAPIWrapper` interface
- `ParticipantReports.tsx` - Imports `ReportConfig` union from models, imports `fetchReports` from APIWrapper
- `SearchByIdPanel/SearchByIdPanel.tsx` - Imports from models
- `SearchByIdPanel/IdResolutionFeedback.tsx` - Imports from models
- All corresponding test files (.test.tsx) - Imports from models

**Test Coverage:**
- `useReportTab.test.tsx` - 29 unit tests covering ExtJS tab creation, lifecycle, getFilterArray, getQWPConfig, and filter mode handling

### Type System

**TypeScript Type Definitions:**

The codebase uses strongly-typed interfaces for all configuration objects, improving type safety and developer experience. All shared type definitions are centralized in `src/ParticipantHistory/models/index.ts` (see Component Modularity section above).

**Key Interfaces:**

**ExtReportTab** - Extended ExtJS Container interface (defined in `models/index.ts`):
```typescript
export interface ExtReportTab {
    // ExtJS Container base properties
    isDestroyed?: boolean;
    renderTo?: HTMLElement;

    // ExtJS Container methods
    add: (config: any) => void;
    removeAll: () => void;
    destroy: () => void;

    // Custom properties added to tab
    report: ReportConfig;
    filters: ReportFilters;

    // Custom methods added to tab
    getFilterArray: () => FilterArray;
    getQWPConfig: () => QueryWebPartConfig;
}
```

**ReportConfig** - Discriminated union for report configuration (defined in `models/index.ts`):

The `ReportConfig` type uses a discriminated union pattern based on `reportType` to provide type-safe access to report-specific properties:

```typescript
// Literal type for report types
export type ReportType = 'js' | 'query' | 'report';

// Base configuration shared by all report types
interface ReportConfigBase {
    id: string;
    title: string;
    category: null | string;           // Always present from API, may be null
    containerPath: null | string;      // Always present from API, may be null
    subjectIdFieldName: null | string; // Always present from API, may be null
    supportsnonidfilters: boolean | null; // Always present from API, may be null
    viewName: null | string;           // Always present from API, may be null
}

// Query reports - display LabKey query results
export interface QueryReportConfig extends ReportConfigBase {
    reportType: 'query';
    schemaName: string;
    queryName: string;
}

// JS reports - rendered by JavaScript functions
export interface JsReportConfig extends ReportConfigBase {
    reportType: 'js';
    queryName: string;  // Function name to invoke
}

// Other reports - saved LabKey reports (R, chart, etc.)
export interface OtherReportConfig extends ReportConfigBase {
    reportType: 'report';
    schemaName: string;
    queryName: string;
    reportId: string;
}

// Discriminated union of all report types
export type ReportConfig = JsReportConfig | OtherReportConfig | QueryReportConfig;
```

**Benefits of Discriminated Union:**
- TypeScript enforces required properties per report type at compile time
- Component props can accept specific variants (e.g., `QueryReportWrapper` only accepts `QueryReportConfig`)
- Eliminates runtime null reference errors for type-specific properties
- Self-documenting which fields each report type requires

**Component Type Usage:**
- `QueryReportWrapper` - accepts `QueryReportConfig` and `ReportFilters`
- `JSReportWrapper` - accepts `JsReportConfig` and `ReportFilters`
- `OtherReportWrapper` - accepts `OtherReportConfig` and `ReportFilters`
- `TabbedReportPanel` - accepts the full `ReportConfig` union

**Report Wrapper Props** - All three wrappers follow the same pattern (each defined in its own `.tsx` file):
```typescript
// QueryReportWrapperProps / JSReportWrapperProps / OtherReportWrapperProps
interface <Wrapper>Props {
    filters: ReportFilters;
    report: QueryReportConfig | JsReportConfig | OtherReportConfig; // specific variant per wrapper
}
```

Each wrapper internally calls `useReportTab(report, filters)` to create and manage its ExtJS tab, rather than receiving a `tab` prop from a parent component.

**JSReportPanel** - Panel object interface for JavaScript report functions (defined in `JSReportWrapper.tsx`):
```typescript
export interface JSReportPanel {
    getFilterArray: () => FilterArray;
    getQWPConfig: () => QueryWebPartConfig;
    getTitleSuffix: () => string;
    resolveSubjectsFromHousing?: (
        tab: ExtReportTab,
        callback: (subjects: string[], tab: ExtReportTab) => void,
        scope?: unknown
    ) => void;
}
```

This interface defines the contract for the panel object passed to legacy JavaScript report functions, providing access to:
- Filter data via `getFilterArray()`
- Query configuration via `getQWPConfig()`
- Formatted subject titles via `getTitleSuffix()`
- Housing location resolution via `resolveSubjectsFromHousing()` (optional)

**Note:** The report namespace for JS function resolution (e.g., `"EHR.reports"`) is defined as a constant (`EHR_REPORT_NAMESPACE`) inside `JSReportWrapper.tsx`, not passed as a prop.

**Test Coverage for Report Wrappers and Hook:**

- `useReportTab.test.tsx` - 29 unit tests covering ExtJS tab creation, lifecycle, getFilterArray for all filter modes, getQWPConfig, custom subjectIdFieldName, edge cases, and FilterArray structure validation

- `JSReportWrapper.test.tsx` - 14 unit tests covering function resolution, panel delegation methods, error handling, and cleanup

- `OtherReportWrapper.test.tsx` - 12 unit tests covering LABKEY.WebPart integration, filter handling, title suffix generation, and error scenarios

- `QueryReportWrapper.test.tsx` - 6 unit tests covering ExtJS ldk-querycmp integration, query configuration, lifecycle management, and error handling

**FilterArray** - Standardized filter structure:
```typescript
export interface FilterArray {
    nonRemovable: Filter.IFilter[];  // Filters from @labkey/api
    removable: Filter.IFilter[];      // Filters from @labkey/api
}
```

**QueryWebPartConfig** - Query WebPart configuration:
```typescript
export interface QueryWebPartConfig {
    // Core properties
    partName?: string;
    schemaName?: string;
    queryName?: string;
    viewName?: string;
    title?: string;

    // Filter properties (from @labkey/api)
    filters?: Filter.IFilter[];
    removeableFilters?: Filter.IFilter[];

    // Display options
    showInsertNewButton?: boolean;
    showDeleteButton?: boolean;
    showDetailsColumn?: boolean;
    showUpdateColumn?: boolean;
    showRecordSelectors?: boolean;
    allowChooseQuery?: boolean;
    allowChooseView?: boolean;
    allowHeaderLock?: boolean;

    // Layout properties
    frame?: string;
    buttonBarPosition?: string;
    linkTarget?: string;
    renderTo?: string;

    // Callbacks
    success?: () => void;
    failure?: (error: any) => void;

    // Additional properties
    tab?: any;  // ExtJS tab object
    containerPath?: string;
    timeout?: number;
    suppressRenderErrors?: boolean;
    partConfig?: any;
    [key: string]: any;  // Allow additional report config properties
}
```

**Benefits:**
- Compile-time type checking prevents runtime errors
- IntelliSense support in IDEs for better developer experience
- Self-documenting code through explicit type definitions
- Easier refactoring with TypeScript's type safety
- Standardized interface shared across QueryReportWrapper, OtherReportWrapper, and TabbedReportPanel

### React Component Display Names

All exported React components now have explicit `displayName` properties for improved debugging and error stack traces:

**Components with Display Names:**
- `JSReportWrapper` - Wrapper for JavaScript-based report functions
- `OtherReportWrapper` - Wrapper for LABKEY.WebPart report integration
- `QueryReportWrapper` - Wrapper for ExtJS ldk-querycmp integration
- `TabbedReportPanel` - Main tabbed panel component
- `ParticipantReports` - Top-level participant reports container

**Pattern Used:**
```typescript
const ComponentNameComponent: FC<Props> = ({ props }) => {
    // Component logic
};
ComponentNameComponent.displayName = 'ComponentName';
export const ComponentName = memo(ComponentNameComponent);
```

**Benefits:**
- Better debugging experience in React DevTools
- Clearer error messages with component names in stack traces
- Improved component identification during development
- Compliance with ESLint react/display-name rule

### Optional Chaining Improvements

Optional chaining (`?.`) has been implemented throughout the codebase to replace verbose null checks, making the code more concise and readable:

**JSReportWrapper.tsx:**
- `tab?.filters` - Safe access to tab filters
- `ns?.[handlerName]` - Safe property access on namespace object

**OtherReportWrapper.tsx:**
- `tab?.filters` - Safe access to tab filters
- `subjects?.length` - Safe length check on subjects array
- `filters?.length` - Safe length check on filters array

**TabbedReportPanel.tsx:**
- `categoryReports?.length` - Safe length check on category reports
- `activeCategoryReports?.length` - Safe length check in JSX rendering

**Benefits:**
- More concise code compared to `variable && variable.property` patterns
- Prevents runtime errors from accessing properties on null/undefined
- Improved readability and maintainability
- Modern TypeScript/JavaScript best practice

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
- **ID Input Area (Always Visible):**
  - Textarea is always visible, regardless of filter mode
  - Accepts single or multiple animal IDs
  - Parses input using separators: newlines (`\n`), tabs (`\t`), commas (`,`), semicolons (`;`)
  - Handles IDs with letters, numbers, special characters, and spaces in names
  - Validates that no more than 100 unique IDs are entered (after parsing and de-duplication)
  - Displays validation error if limit exceeded; prevents calling `onFilterChange` until resolved
  - Search By Ids button shows "Searching..." text while ID resolution is in progress
  - Search By Ids button is disabled only during resolution (not for validation errors)

- **Search By Ids Button (Triggers ID Search Mode):**
  - When clicked, immediately sets `filterType` to 'idSearch' (making button blue and other buttons gray), then performs ID resolution
  - This means the button turns blue and becomes the active mode even if validation errors occur
  - Button text changes to "Searching..." during resolution
  - Button is disabled only while resolving (not when validation errors exist)
  - Button styling: Shows blue (#0066cc) when active (filterType === 'idSearch'), gray (#6c757d) when inactive, disabled gray (#ccc) when resolving
  - If validation fails (e.g., no IDs or >100 IDs), the button stays enabled and blue, but ID resolution doesn't proceed
  - Updates `IdResolutionFeedback` component with resolution results
  - Calls `onFilterChange('idSearch', resolvedSubjects)` with resolved subjects after successful resolution

- **All Animals Button:**
  - When clicked, activates All Animals mode
  - Clears any entered IDs in the textarea
  - Clears any validation errors that were displayed
  - Reports show all animals (no filters on IDs or status)
  - Button styling: Shows green (#28a745) when active (filterType === 'all'), gray (#6c757d) when inactive
  - Calls `onFilterChange('all', undefined)` immediately when button clicked

- **All Alive at Center Button:**
  - When clicked, activates Alive at Center mode
  - Button disabled if `activeReportSupportsNonIdFilters === false`
  - Clears any entered IDs in the textarea
  - Clears any validation errors that were displayed
  - Reports filter on `Id/Demographics/calculated_status = 'Alive'` (lookup to demographics table)
  - Button styling: Shows cyan (#17a2b8) when active (filterType === 'aliveAtCenter'), gray (#6c757d) when inactive, disabled gray (#ccc) when report doesn't support non-ID filters
  - Calls `onFilterChange('aliveAtCenter', undefined)` immediately when button clicked
- **URL Params Mode (`filterType === 'urlParams'`):**
  - Activated when URL contains `readOnly=true` parameter with subjects (for shared/bookmarked links)
  - **SearchByIdPanel component is completely hidden** - no textarea, buttons, or summary shown
  - Filters are derived directly from URL subjects and passed to TabbedReportPanel
  - Reports display immediately (showReport defaults to true in readOnly mode)
  - No ID resolution or validation is performed - URL subjects are passed directly as filters
  - No ID limit applies (URL-provided subjects are assumed already validated/resolved)

**IdResolutionFeedback:**
- Conditionally rendered by `SearchByIdPanel` (only when aliases exist or IDs not found)
- Component has no visibility prop - `SearchByIdPanel` decides when to render it
- Shows feedback when aliases are resolved or IDs are not found
- Rendered when: `resolutionResult.resolved.some(r => r.resolvedBy === 'alias') || resolutionResult.notFound.length > 0`

**Internal Structure:**
- `SearchByIdPanel` internally manages `IdResolutionFeedback` component
- Resolution results are managed as internal state, not passed to parent
- Parent component (`ParticipantReports`) only receives final resolved subject IDs
- Textarea and filter buttons are visible in normal modes (idSearch, all, aliveAtCenter)
- In URL Params mode (readOnly=true), the entire SearchByIdPanel is hidden by ParticipantReports

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
}
```

**Display Logic:**
- Component always renders its content when mounted
- Visibility controlled by `SearchByIdPanel` which conditionally renders the component using: `resolutionResult.resolved.some(r => r.resolvedBy === 'alias') || resolutionResult.notFound.length > 0`
- "Resolved" section (shown when `resolved.length > 0`):
  - Direct matches displayed as: `ID123` (just the resolved ID)
  - Alias matches displayed as: `TATTOO_001 → ID123 (tattoo)` (inputId → resolvedId (aliasType))
  - Direct matches listed first, followed by alias matches
  - Uses semantic `<ul>` and `<li>` markup for accessibility
- "Not Found" section (shown when `notFound.length > 0`):
  - Lists unresolved IDs that couldn't be found directly or via alias
  - Uses semantic `<ul>` and `<li>` markup for accessibility
- Uses proper heading hierarchy: `<h2>` for "ID Resolution", `<h3>` for section headings

## Modified Components

### 1. ParticipantReports.tsx

**Changes Required:**
- Add `SearchByIdPanel` above `TabbedReportPanel`
- Manage `subjects` and `filterType` state locally instead of only from URL
- Update URL hash when filter changes
- Pass filter information to `TabbedReportPanel` via `filters` prop
- Fetch reports once on mount using `APIWrapper.fetchReports()` and cache in state
- Look up `activeReportSupportsNonIdFilters` from cached reports (no separate query)
- Provide `activeReportSupportsNonIdFilters` to `SearchByIdPanel` from cached report metadata
- `SearchByIdPanel` internally manages ID resolution and displays `IdResolutionFeedback` (not managed by parent)
- Accept `fetchReports` prop for dependency injection (testability)

**Updated Structure:**
```typescript
interface ParticipantReportsProps {
    fetchReports?: FetchReportsFn;
}

const ParticipantReportsComponent: FC<ParticipantReportsProps> = ({
    fetchReports = getDefaultParticipantHistoryAPIWrapper().fetchReports,
}) => {
    const urlFilters = useMemo(() => getFiltersFromUrl(), []);
    const [subjects, setSubjects] = useState<string[]>(urlFilters.subjects || []);

    // Determine if we're in read-only mode from URL (for shared/bookmarked links)
    const isReadOnly = useMemo(() => {
        return urlFilters.readOnly && (urlFilters.subjects?.length ?? 0) > 0;
    }, [urlFilters]);

    // Lazy initializer for filterType - only runs on first render
    const [filterType, setFilterType] = useState<FilterType>(() => {
        if (isReadOnly) {
            return FILTER_TYPE_URL_PARAMS; // Read-only mode for shared links
        }
        return urlFilters.filterType || FILTER_TYPE_ID_SEARCH;
    });
    const [activeReport, setActiveReport] = useState(urlFilters.activeReport);
    const [filterNotSupportedError, setFilterNotSupportedError] = useState<null | string>(null);
    // In readOnly mode, always show reports immediately
    const [showReport, setShowReport] = useState<boolean>(isReadOnly || (urlFilters.showReport ?? false));
    const [reports, setReports] = useState<ReportConfig[]>([]);
    const [reportsLoading, setReportsLoading] = useState(true);

    // Fetch all visible reports once on mount
    // This consolidates the query that was previously in TabbedReportPanel
    useEffect(() => {
        fetchReports().then(({ reports: loadedReports, error }) => {
            if (error) {
                console.error('Failed to load reports:', error);
            }
            setReports(loadedReports);
            setReportsLoading(false);
        });
    }, [fetchReports]);

    // Look up supportsnonidfilters from cached reports instead of making a separate query
    // Note: Use lowercase 'supportsnonidfilters' to match the database column name
    const activeReportSupportsNonIdFilters = useMemo(() => {
        if (!activeReport || reports.length === 0) return true;
        const report = reports.find(r => r.id === activeReport);
        return report?.supportsnonidfilters ?? true;
    }, [activeReport, reports]);

    // Override filter to 'all' when aliveAtCenter not supported
    // Compute effectiveFilterType: if filterType is 'aliveAtCenter' and
    // activeReportSupportsNonIdFilters is false, override to 'all'
    // Display error message when override occurs
    // Pass effectiveFilterType to TabbedReportPanel filters

    const handleFilterChange = useCallback((
        newFilterType: FilterType,
        newSubjects?: string[],
        clearError = true
    ) => {
        setFilterType(newFilterType);
        setSubjects(newSubjects || []);
        if (clearError) {
            setFilterNotSupportedError(null); // Clear any previous error
        }

        // Determine if report should be shown
        // Show report for 'all' and 'aliveAtCenter' modes always
        // Show report for 'idSearch' and 'urlParams' only when subjects exist
        const shouldShowReport =
            newFilterType === FILTER_TYPE_ALL ||
            newFilterType === FILTER_TYPE_ALIVE_AT_CENTER ||
            ((newFilterType === FILTER_TYPE_ID_SEARCH || newFilterType === FILTER_TYPE_URL_PARAMS) &&
                (newSubjects?.length ?? 0) > 0);
        setShowReport(shouldShowReport);

        // When switching from urlParams to idSearch (via "Modify Search"), remove readOnly parameter
        const isLeavingReadOnly = filterType === FILTER_TYPE_URL_PARAMS && newFilterType !== FILTER_TYPE_URL_PARAMS;
        const readOnly = newFilterType === FILTER_TYPE_URL_PARAMS && !isLeavingReadOnly;
        updateUrlHash(newFilterType, newSubjects, readOnly, shouldShowReport, activeReport);
    }, [filterType, activeReport]);

    const handleTabChange = useCallback((reportId: string) => {
        setActiveReport(reportId);
        // Update URL hash with new activeReport
        updateUrlHash(filterType, subjects, filterType === FILTER_TYPE_URL_PARAMS, showReport, reportId);
    }, [filterType, subjects, showReport]);

    const filters: ReportFilters = useMemo(() => ({
        filterType: effectiveFilterType,
        subjects: (effectiveFilterType === FILTER_TYPE_ID_SEARCH || effectiveFilterType === FILTER_TYPE_URL_PARAMS)
            ? subjects
            : undefined,
    }), [effectiveFilterType, subjects]);

    return (
        <div className="participant-reports">
            {!isReadOnly && (
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={activeReportSupportsNonIdFilters}
                    initialFilterType={filterType}
                    initialSubjects={subjects}
                    onFilterChange={handleFilterChange}
                />
            )}
            {filterNotSupportedError && (
                <div className="filter-not-supported-error" role="alert">
                    {filterNotSupportedError}
                </div>
            )}
            <TabbedReportPanel
                activeReport={activeReport}
                filters={filters}
                onTabChange={handleTabChange}
                reports={reportsLoading ? undefined : reports}
                showReport={showReport}
            />
        </div>
    );
};

ParticipantReportsComponent.displayName = 'ParticipantReports';

export const ParticipantReports = memo(ParticipantReportsComponent);
```

**Key Points:**
- `ParticipantReports` no longer manages `resolutionResult` state
- `IdResolutionFeedback` is rendered inside `SearchByIdPanel`, not here
- Simplified state management - parent only tracks final resolved subjects, not resolution details
- URL Params mode (`readOnly=true`) completely hides SearchByIdPanel for a clean shared/bookmarked link view
- To modify the search from a readOnly URL, users must manually edit the URL (remove `readOnly:true`)
- `showReport` state controls report visibility:
  - Defaults to `false` on initial page load (shows placeholder message)
  - Set to `true` for 'all' and 'aliveAtCenter' modes always
  - Set to `true` for 'idSearch' and 'urlParams' modes only when subjects exist
  - Synced to URL hash (showReport:1 when true, omitted when false)
- **Reports fetching**: Uses `APIWrapper.fetchReports()` to load all visible reports once on mount
  - Cached in `reports` state, passed to `TabbedReportPanel` as prop
  - `reportsLoading` state ensures undefined is passed until reports are loaded
  - `activeReportSupportsNonIdFilters` is computed from cached reports (no separate query)
- **Dependency injection**: Accepts optional `fetchReports` prop for unit testing
- **Lazy initializer**: Uses `useState(() => ...)` for `filterType` initial value computation

### 2. AnimalHistoryPage.tsx

**Changes Required:**
- Remove placeholder text "This is Animal History"
- Component serves as entry point wrapping `ParticipantReports`

## API Integration

### APIWrapper

**File:** `labkey-ui-ehr/src/ParticipantHistory/APIWrapper.ts`

The `APIWrapper` provides a unified interface for all server API calls used by the ParticipantHistory feature. It uses dependency injection for testability and encapsulates both ID resolution and report fetching functionality.

```typescript
export interface ParticipantHistoryAPIWrapper {
    fetchReports: () => Promise<FetchReportsResult>;
    resolveAnimalIds: (params: ResolveIdsParams) => Promise<IdResolutionResult>;
}

export class ServerAPIWrapper implements ParticipantHistoryAPIWrapper {
    resolveAnimalIds = async (params: ResolveIdsParams): Promise<IdResolutionResult> => {
        // Step 1: Query study.directIdMatches for direct ID matches
        // Step 2: Query study.aliasIdMatches for alias matches on unresolved IDs
        // Step 3: Return consolidated results
    };

    fetchReports = async (): Promise<FetchReportsResult> => {
        // Query ehr.reports for all visible reports
    };
}

export const getDefaultParticipantHistoryAPIWrapper = (): ParticipantHistoryAPIWrapper => {
    // Returns singleton instance of ServerAPIWrapper
};
```

### Id Resolution

**Database Queries:**

The two-query approach correctly handles multiple aliases per animal ID by filtering to only aliases that match the user's input. The service uses pre-defined LabKey queries in `server/modules/ehrModules/ehr/resources/queries/study/` that provide case-insensitive matching via computed lowercase columns.

1. **Direct ID Lookup:**

Query: `study.directIdMatches`

This query is defined in `directIdMatches.sql` and returns:
```sql
SELECT
    Id as resolvedId,
    Id as inputId,
    'direct' as resolvedBy,
    NULL as aliasType,
    LOWER(Id) as lowerIdForMatching
FROM study.demographics
```

Filter on `lowerIdForMatching` column using lowercase input IDs:
```typescript
Filter.create('lowerIdForMatching', lowercaseInputIds, Filter.Types.IN)
```

2. **Alias Lookup (for unresolved IDs only):**

Query: `study.aliasIdMatches`

This query is defined in `aliasIdMatches.sql` and returns:
```sql
SELECT
    a.Id as resolvedId,
    a.alias as inputId,
    'alias' as resolvedBy,
    a.aliasType,
    LOWER(a.alias) as lowerAliasForMatching
FROM study.alias a
INNER JOIN study.demographics d ON a.Id = d.Id
```

Filter on `lowerAliasForMatching` column using lowercase unresolved input IDs:
```typescript
Filter.create('lowerAliasForMatching', lowercaseUnresolvedInputIds, Filter.Types.IN)
```

**Key Points:**
- Uses pre-defined LabKey query definitions (`study.directIdMatches` and `study.aliasIdMatches`) rather than raw SQL
- Case-insensitive matching via computed `lowerIdForMatching` and `lowerAliasForMatching` columns
- Query 2 only runs with IDs not found in Query 1, avoiding unnecessary lookups
- The filter on lowercase columns ensures we only return IDs/aliases that match the user's input (case-insensitive)
- Each query returns the input-to-resolved-ID mapping needed for the IdResolutionFeedback display
- The application layer de-duplicates resolved IDs when passing to reports (multiple inputs may resolve to the same animal ID)
- Using pre-defined queries ensures consistency across the EHR module and simplifies maintenance

### Reports Fetching

The `fetchReports` method in `APIWrapper.ts` handles fetching report configurations from the `ehr.reports` table. This consolidates report fetching that was previously done in `TabbedReportPanel` and provides dependency injection support for testing via the `ParticipantHistoryAPIWrapper` interface.

```typescript
export interface FetchReportsResult {
    error?: string;
    reports: ReportConfig[];
}

export type FetchReportsFn = () => Promise<FetchReportsResult>;

// fetchReports is an instance method of ServerAPIWrapper (not a standalone export).
// ParticipantReports accesses it via getDefaultParticipantHistoryAPIWrapper().fetchReports.
export class ServerAPIWrapper implements ParticipantHistoryAPIWrapper {
    fetchReports = (): Promise<FetchReportsResult> => {
        return new Promise(resolve => {
            Query.selectRows({
                schemaName: 'ehr',
                queryName: 'reports',
                filterArray: [Filter.create('visible', true, Filter.Types.EQUAL)],
                sort: 'category,sort_order,reporttitle,reportstatus',
                success: (data: any) => {
                    const loadedReports: ReportConfig[] = data.rows.map((row: any) => {
                        const report: ReportConfig = {
                            id: row.reportname,
                            title: row.reporttitle,
                            reportType: row.reporttype,
                            schemaName: row.schemaname,
                            queryName: row.queryname,
                            viewName: row.viewname,
                            reportId: row.report,
                            ...row,
                        };

                        if (row.jsonConfig) {
                            try {
                                const json = JSON.parse(row.jsonConfig);
                                Object.assign(report, json);
                            } catch (e) {
                                console.error('Failed to parse jsonConfig for report: ' + row.reportname, e);
                            }
                        }
                        return report;
                    });
                    resolve({ reports: loadedReports });
                },
                failure: (error: any) => {
                    console.error('Failed to load reports', error);
                    resolve({ reports: [], error: error?.message || 'Failed to load reports' });
                },
            });
        });
    };

    // ... resolveAnimalIds also an instance method ...
}
```

**Key Points:**
- Fetches all visible reports with a single query on component mount
- Returns both reports and optional error for graceful error handling
- Parses `jsonConfig` field to merge additional configuration into report objects
- Sorts reports by category, sort_order, title, and status for consistent display order
- Exported `FetchReportsFn` type enables dependency injection for testing

**Benefits of Centralization:**
- Single source of truth for report fetching logic
- Enables dependency injection in `ParticipantReports` for unit testing
- Reports are fetched once and cached in state, eliminating redundant queries
- `supportsnonidfilters` field lookup uses cached reports instead of separate query

## URL Hash Format

The URL hash format follows the existing pattern in `ParticipantReports.tsx`:

**Initial Page Load (no filters active):**
```
#filterType:idSearch
```
(No showReport parameter - reports hidden, placeholder message shown)

**ID Search mode (with subjects):**
```
#subjects:{id1};{id2};{id3}&filterType:idSearch&activeReport:{reportId}&showReport:1
```

**Show All mode:**
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
- `showReport` - Whether to show report content (1 = true). Omitted when reports should not be displayed (initial page load, ID Search with no subjects)

**URL Params Mode Notes:**
- When `readOnly=true` is present with subjects, automatically activates URL Params mode
- SearchByIdPanel is completely hidden for a clean, shareable presentation
- Used for sharing specific animal results or bookmarking
- Subjects are assumed to be already resolved/validated (no ID resolution performed)
- To exit readOnly mode, user must manually edit URL to remove `readOnly:true` parameter

## Report Schema Changes

### New Field in ehr.reports Table

A new boolean field must be added to the `ehr.reports` table to indicate report support for non-ID filters:

**Field:** `supportsNonIdFilters` (boolean, default: false)

**Purpose:** Indicates whether a report can handle the "Alive, at Center" filter mode which filters by status without requiring specific subject IDs.

**Usage:**
- Reports with `supportsNonIdFilters = true` can filter by `Id/Demographics/calculated_status = 'Alive'` across all animals
- Reports with `supportsNonIdFilters = false` will have only the "Alive, at Center" button disabled
- All reports support "All Records" (no filters) and "ID Search" (specific IDs) modes regardless of this field
- Most legacy single/multi-animal reports will default to `false` and require migration to support status filtering

## Filter Integration with TabbedReportPanel

The `useReportTab` hook handles four filter modes via its `getFilterArray()` method:

**`useReportTab` hook — `getFilterArray` implementation:**
```typescript
newTab.getFilterArray = () => {
    const filterArray = { removable: [], nonRemovable: [] };

    if (!filters) {
        return filterArray;
    }

    const subjectIdFieldName = report.subjectIdFieldName || 'Id';
    const hasSubjects = filters.subjects?.length > 0;

    // ID Search mode: Filter by specific subject IDs
    if (filters.filterType === 'idSearch' && hasSubjects) {
        const subjects = filters.subjects;
        if (subjects.length === 1) {
            filterArray.nonRemovable.push(Filter.create(subjectIdFieldName, subjects[0], Filter.Types.EQUAL));
        } else {
            filterArray.nonRemovable.push(
                Filter.create(subjectIdFieldName, subjects.join(';'), Filter.Types.EQUALS_ONE_OF)
            );
        }
    }

    // URL Params mode: Filter by URL-provided subject IDs (same as ID Search)
    if (filters.filterType === 'urlParams' && hasSubjects) {
        const subjects = filters.subjects;
        if (subjects.length === 1) {
            filterArray.nonRemovable.push(Filter.create(subjectIdFieldName, subjects[0], Filter.Types.EQUAL));
        } else {
            filterArray.nonRemovable.push(
                Filter.create(subjectIdFieldName, subjects.join(';'), Filter.Types.EQUALS_ONE_OF)
            );
        }
    }

    // Alive at Center mode: Filter by calculated_status
    if (filters.filterType === 'aliveAtCenter') {
        filterArray.nonRemovable.push(
            Filter.create('Id/Demographics/calculated_status', 'Alive', Filter.Types.EQUAL)
        );
    }

    // Show All mode: No filters applied (filterType === 'all')

    return filterArray;
};
```

**Key Points:**
- ID Search mode applies subject ID filters after user-initiated resolution
- URL Params mode applies subject ID filters from URL without resolution
- Alive at Center mode applies `Id/Demographics/calculated_status = 'Alive'` filter (lookup to demographics)
- All Animals mode applies no filters (shows all animals)
- The 100 ID limit only applies to ID Search mode
- Non-ID filter modes (all, aliveAtCenter, urlParams) have no ID limits and don't go through ID resolution

## Empty State Placeholder

When `showReport` prop is false (initial page load, ID Search with no subjects), TabbedReportPanel displays a centered placeholder message instead of report content:

```tsx
<div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '300px',
    padding: '40px',
    color: '#666',
    fontSize: '16px',
    fontWeight: '500',
}}>
    Select Filter to View Reports
</div>
```

**When Placeholder is Shown:**
- Initial page load (no URL hash or filterType:idSearch with no subjects)
- ID Search mode active but no subjects entered
- User cleared search without selecting another filter mode

**When Reports are Shown:**
- User clicks "Search By Ids" with valid subjects
- User clicks "All Animals"
- User clicks "All Alive at Center"
- URL contains `showReport:1` parameter (bookmarked/shared links)

## Edge Cases

### ID Search Mode Only:

1. **Empty Input:** Display validation message; do not call API; pass empty array to reports to show no records
2. **Whitespace-only Input:** Treat as empty input after trimming; display validation message; pass empty array to reports to show no records
3. **Duplicate IDs:** De-duplicate before resolution; show each unique ID once in results
4. **Mixed Valid/Invalid IDs:** Resolve valid IDs; show invalid in "Not Found" section
5. **All IDs Not Found:** Display "Not Found" section only; reports panel shows no data message
6. **Alias Resolves to Same ID:** If multiple input values resolve to the same animal ID, show all in "Resolved" section but pass de-duplicated list to reports
7. **Special Characters in IDs:** Support IDs with hyphens, underscores, and other special characters
8. **Case Sensitivity:** ID matching is case-insensitive for both direct ID and alias lookups, implemented using LabKey SQL's `lower()` function
9. **ID Limit Exceeded:** Hard limit of 100 unique IDs (after parsing and de-duplication). Display clear validation error: "Maximum of 100 animal IDs allowed. You entered {count} IDs." Button remains enabled but ID resolution will not proceed until input is reduced. Pass empty array to reports to show no records.

### All Filter Modes:

10. **Report Doesn't Support Non-ID Filters:** If `activeReportSupportsNonIdFilters === false`, disable only the "All Alive at Center" button. "ID Search" and "All Animals" modes remain available.
11. **Switching Filter Modes:** When switching from ID Search to All Animals or All Alive at Center, clear the ID input textarea, resolution results, and any validation errors. The textarea remains visible across all modes (except URL Params).
12. **Search By Ids with Validation Error:** When "Search By Ids" is clicked with a validation error (e.g., no IDs entered or >100 IDs), the button immediately sets the filter mode to ID Search (turns blue, grays out other buttons) but does not proceed with ID resolution. The validation error remains displayed until resolved. An empty array is passed to reports to show no records.
13. **No Active Report Selected:** Default behavior - may need to handle gracefully or default to first available report.

### URL Params Mode Only:

14. **No Subjects in URL:** If `readOnly=true` but no subjects parameter, ignore `readOnly` and show normal SearchByIdPanel.
15. **Invalid Subject IDs:** URL subjects are assumed valid; if reports show no data, display message indicating subjects may not exist or user lacks permissions.
16. **Direct URL Navigation:** When user shares URL with `readOnly=true`, recipient sees reports immediately on page load without SearchByIdPanel (clean presentation).
17. **URL with Both filterType and readOnly:** If URL has `readOnly=true`, ignore `filterType` parameter and use URL Params mode.
18. **Excessive Subject Count in URL:** No limit enforced on URL Params mode subjects (assumed to be curated/valid from previous search); browser URL length limits (~2,000 chars) are the only practical constraint.
19. **Modifying a ReadOnly URL:** To modify the search, user must manually edit the URL to remove `readOnly:true` parameter, which will restore the SearchByIdPanel with the subjects pre-populated.

## Permissions

- **Required Permission:** Folder Read Permission
- **Dataset Permissions:** Read permission on `study.demographics` and `study.alias` datasets
- Reports inherit existing dataset-level permissions through `TabbedReportPanel`

## Metrics

Add tracking for:
1. **Filter Usage:**
   - Feature Area: `ehrParticipantHistoryFilter`
   - Metrics (using FilterType values directly):
     - `idSearch` - ID Search mode used (tracked when search successfully resolves IDs)
     - `all` - "All Animals" filter selected (tracked when button clicked)
     - `aliveAtCenter` - "All Alive at Center" filter selected (tracked when button clicked)
     - `urlParams` - URL Parameters mode (tracked when filter mode changes to urlParams)
   - Implementation: Uses `incrementClientSideMetricCount('ehrParticipantHistoryFilter', filterType)` from `@labkey/components`
   - Location: `SearchByIdPanel.tsx` in `handleUpdateReport` (after successful ID resolution) and `handleFilterModeChange`

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
   - Test correct categorization of resolved vs not-found
   - Test display formatting (direct matches, alias matches with arrow and type)

3. **SearchByIdPanel:**
   - Test input state management for ID Search mode
   - Test filter mode toggle behavior (idSearch, all, aliveAtCenter)
   - Test conditional rendering: ID Search section visible only in idSearch mode
   - Test conditional rendering: Filter Mode section visible in all modes except urlParams
   - Test conditional rendering: Resolution feedback visible only in idSearch mode
   - Test loading state: Search By Ids button shows "Searching..." during resolution
   - Test loading state: Search By Ids button disabled only during resolution (not for validation errors)
   - Test "Search By Ids" button immediately sets filter mode to idSearch when clicked (even with validation errors)
   - Test button turns blue and other buttons turn gray when clicked with validation error
   - Test URL Params mode (readOnly=true) hides SearchByIdPanel entirely (handled by ParticipantReports)
   - Test "Search By Ids" button callback for each mode
   - Test validation error display when exceeding 100 ID limit (ID Search mode only)
   - Test validation errors cleared when switching to All Animals mode
   - Test validation errors cleared when switching to All Alive at Center mode
   - Test "Alive, at Center" button disabled when `activeReportSupportsNonIdFilters === false`
   - Test clearing input when switching to All Animals or All Alive at Center modes

### Integration Tests

1. **ID Resolution Service:**
   - Mock API calls for demographics and alias queries
   - Test direct match scenario
   - Test alias resolution scenario
   - Test mixed valid/invalid IDs
   - Test case-insensitive matching

2. **Filter Mode Integration:**
   - Test ID Search mode applies subject ID filters correctly
   - Test Show All mode applies no filters
   - Test Alive, at Center mode applies `Id/Demographics/calculated_status = 'Alive'` filter
   - Test URL Params mode applies subject ID filters from URL without resolution
   - Test switching between filter modes updates reports correctly
   - Test ID Search section hidden when switching to Show All or Alive, at Center modes
   - Test report metadata query for `supportsNonIdFilters` field

3. **URL Hash Sync:**
   - Test initial load from URL hash for all filter types (idSearch, all, aliveAtCenter, urlParams)
   - Test URL Params mode activated when `readOnly=true` in URL
   - Test URL update on filter mode change
   - Test `readOnly` parameter removed when switching from URL Params to ID Search mode
   - Test navigation/bookmark scenarios for each mode
   - **Note:** LabKey DataRegion table operations (setFilter, clearFilter) may modify the URL hash. In Selenium tests, URL state assertions should be performed BEFORE interacting with DataRegion tables to avoid false failures.

### Manual Test Scenarios

**Initial Page Load:**
1. Navigate to Animal History page (no URL hash)
   - Verify ID Search mode is active (button highlighted)
   - Verify empty textarea is shown
   - Verify placeholder message displayed: "Select Filter to View Reports"
   - Verify no reports are rendered
   - Verify all filter buttons are visible and enabled

**ID Search Mode:**
2. Single animal ID search (direct match)
3. Single animal ID search (alias match)
4. Multiple animal IDs (all direct matches)
5. Multiple animal IDs (mixed direct and alias)
6. Multiple animal IDs (some not found)
7. Enter exactly 100 IDs (should succeed)
8. Enter 101+ IDs (should show validation error and prevent search)
9. Verify report data matches selected animals for ID Search

#### Show All Mode

10. Click "Show All" button and verify reports show all animals
11. Verify ID Search section (textarea + Search By Ids button) is hidden
12. Verify no ID limit applies in Show All mode
13. Verify URL bookmarking works for Show All mode

#### Alive, at Center Mode

14. Click "Alive, at Center" on a report with `supportsNonIdFilters = true`
15. Verify reports show only animals with `Id/Demographics/calculated_status = 'Alive'`
16. Verify ID Search section (textarea + Search By Ids button) is hidden
17. Verify "Alive, at Center" button is disabled on report with `supportsNonIdFilters = false`
18. Switch to a different report and verify button state updates based on new report's `supportsNonIdFilters` value

#### URL Params Mode (Read-Only)

19. Navigate to URL with `readOnly=true` and subjects parameter
20. Verify SearchByIdPanel is completely hidden (no filter buttons, no ID textarea, no summary)
21. Verify reports are displayed immediately and filtered by URL subjects
22. Test URL with `readOnly=true` but no subjects (should show normal SearchByIdPanel, ignore readOnly)
23. Test URL with both `filterType` and `readOnly=true` (should use URL Params mode, hide SearchByIdPanel)
24. Manually edit URL to remove `readOnly:true` and verify SearchByIdPanel appears with subjects pre-populated

#### Filter Mode Switching

26. Switch from ID Search to Show All (verify ID Search section hidden, input cleared)
27. Switch from ID Search to Alive, at Center (verify ID Search section hidden, input cleared)
28. Switch from Show All to ID Search (verify ID Search section visible, empty textarea)
29. Switch from Alive, at Center to ID Search (verify ID Search section visible, empty textarea)

## Configuration Considerations

- **Center-specific Alias Types:** Different centers may have different alias categories. The alias resolution should query all alias types from `study.alias` without hardcoding specific types.
- **Demographics Status Field:** The "Alive, at Center" filter relies on `Id/Demographics/calculated_status` field (lookup to demographics table). Verify this field exists and is populated correctly across all center implementations.

## What Might Go Wrong

1. **Performance with Large ID Lists:** Addressed with hard limit of 100 IDs maximum for ID Search mode. This prevents slow queries while supporting typical use cases.
2. **Performance with "All Records" Mode:** No ID limit on All Records and Alive at Center modes could cause performance issues with very large datasets. Reports need to handle pagination or lazy loading.
3. **Alias Table Not Populated:** Some centers may not use aliases extensively. Handle gracefully with direct matches only.
4. **Inconsistent Demographics Data:** The `calculated_status` field may have different values across centers. Document expected values.
5. **Report Schema Migration:** Adding `supportsNonIdFilters` field to `ehr.reports` requires database migration. Existing reports default to `false`, so "Alive, at Center" will be disabled until reports are updated.
6. **ExtJS Report Compatibility:** Some JS reports may expect specific filter formats. Test all report types with new filter structure and all three filter modes.
7. **URL Length Limits:** Mitigated by 100 ID limit for ID Search mode. Even with maximum-length IDs, 100 subjects should stay within browser URL limits (~2,000 characters). Monitor in testing if approaching limits with long ID names.
8. **Report Tab Changes:** When user switches between report tabs, the `activeReportSupportsNonIdFilters` value changes, which could enable/disable the "Alive, at Center" button mid-session. Ensure UI clearly indicates why button state changed.

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
   - Identify candidate reports that can support "Alive, at Center" mode
   - Update report queries to handle no subject filter (when filterType = 'aliveAtCenter' or 'all')
   - Set `supportsNonIdFilters = true` for updated reports
   - Verify reports handle large datasets with pagination/performance

## Frontend - Core Components

3. Implement APIWrapper
   - Create `APIWrapper.ts` in `labkey-ui-ehr/src/ParticipantHistory/`
   - Define `ParticipantHistoryAPIWrapper` interface for dependency injection
   - Implement `ServerAPIWrapper` class with `resolveAnimalIds()` and `fetchReports()` methods
   - `resolveAnimalIds()`: Query 1 for direct ID lookup, Query 2 for alias lookup on unresolved IDs
   - `fetchReports()`: Query ehr.reports for all visible reports with sorting
   - Export `getDefaultParticipantHistoryAPIWrapper()` singleton accessor
   - Handle API errors gracefully

4. Implement IdResolutionFeedback component
   - Create `IdResolutionFeedback.tsx` in `labkey-ui-ehr/src/ParticipantHistory/SearchByIdPanel/`
   - Display "Resolved" section with direct and alias matches
   - Display "Not Found" section for unresolved IDs
   - Show alias type for alias-resolved IDs
   - Style component for clear user feedback
   - Note: Visibility logic implemented in `SearchByIdPanel` (conditionally renders this component)

5. Implement SearchByIdPanel component - Part 1 (ID Search mode)
   - Create `SearchByIdPanel.tsx` in `labkey-ui-ehr/src/ParticipantHistory/SearchByIdPanel/`
   - Implement filter mode toggle buttons (Search By Ids / All Animals / All Alive at Center)
   - Implement ID textarea with multi-separator parsing (newlines, tabs, commas, semicolons)
   - Implement 100 ID limit validation with error display
   - Implement "Search By Ids" button with loading state
   - Call ID resolution service on button click
   - Display IdResolutionFeedback as child component
   - Handle special characters and case-insensitive input

6. Implement SearchByIdPanel component - Part 2 (Other filter modes)
   - Implement All Animals mode (hides ID Search section, shows all animals)
   - Implement All Alive at Center mode (hides ID Search section, filters by status)
   - Note: URL Params mode (readOnly) is handled by ParticipantReports hiding SearchByIdPanel entirely
   - Handle filter mode switching and state clearing
   - Implement conditional rendering based on `activeReportSupportsNonIdFilters` prop
   - Implement loading state: Search By Ids button shows "Searching..." during ID resolution
   - Add CSS styling in `src/theme/SearchByIdPanel.scss` with ref.jsx color scheme

7. Update ParticipantReports component
   - Add SearchByIdPanel above TabbedReportPanel
   - Implement filter state management (filterType, subjects, showReport)
   - Implement URL hash detection for initial filter type (including readOnly detection)
   - Query ehr.reports for activeReport's `supportsNonIdFilters` field (filter by reportname field)
   - Implement `handleFilterChange` callback with showReport logic:
     - Show reports for 'all' and 'aliveAtCenter' modes always
     - Show reports for 'idSearch' and 'urlParams' only when subjects exist
   - Update URL hash when filter changes (include showReport parameter)
   - Pass filters and showReport to TabbedReportPanel

8. Update TabbedReportPanel filter integration
   - Update `useReportTab` hook's `getFilterArray()` to handle four filter modes
   - Add ID Search mode filter logic (subject ID filters)
   - Add URL Params mode filter logic (same as ID Search)
   - Add Alive, at Center mode filter logic (`Id/Demographics/calculated_status = 'Alive'`)
   - Add Show All mode (no filters)
   - Update JSReportWrapper to include `resolveSubjectsFromHousing` function in panel object (queries study.demographicsCurLocation)
   - Update `initializeActiveTab` to call `onTabChange` for initial report (ensures ParticipantReports can query initial report metadata)
   - Add empty state placeholder: Display "Select Filter to View Reports" when showReport is false
   - Conditionally render reports based on showReport prop (ternary instead of &&)
   - Test filter application with all report types

## Frontend - URL and Navigation

9. Implement URL hash management
   - Create/update `updateUrlHash()` function for four filter modes
   - Handle `readOnly` parameter for URL Params mode
   - Handle `showReport` parameter (include when true, omit when false)
   - Parse URL hash on page load to determine initial filter type and showReport state
   - Handle browser back/forward navigation
   - Test URL bookmarking for all modes

10. Update AnimalHistoryPage component
    - Remove placeholder text
    - Wrap ParticipantReports component
    - Handle any page-level initialization

## Metrics and Monitoring

11. Implement metrics tracking
    - **Filter usage metrics** (Feature Area: `ehrParticipantHistoryFilter`):
      - Metrics use FilterType values directly: `idSearch`, `all`, `aliveAtCenter`, `urlParams`
      - `idSearch` - Tracked when search successfully resolves IDs
      - `all` - Tracked when user clicks "All Animals" button
      - `aliveAtCenter` - Tracked when user clicks "All Alive at Center" button
      - `urlParams` - Tracked when filter mode changes to URL Params mode
    - Track single vs multi ID searches
    - Track alias resolution stats (resolved, not found)
    - Track report usage by filter mode
    - Implementation: Uses `incrementClientSideMetricCount('ehrParticipantHistoryFilter', filterType)` from `@labkey/components` in `SearchByIdPanel.tsx`

## Testing

### Unit Tests (Jest/React Testing Library)

12. Unit tests - APIWrapper and utilities
    - APIWrapper.ts: Direct/alias resolution, case-insensitive matching, de-duplication, special characters, error handling, report fetching, visible filter, sorting, jsonConfig parsing, FetchReportsFn type export, API mocking
    - urlHashUtils.ts: URL hash generation/parsing for all filter modes, special character encoding, conflict resolution

13. Unit tests - SearchByIdPanel and IdResolutionFeedback components
    - SearchByIdPanel: ID parsing (all separators), 100 ID limit validation, filter mode toggles, "Alive, at Center" button state, input clearing, accessibility (ARIA, keyboard)
    - IdResolutionFeedback: Resolved/not-found categorization, alias type display, section headings

14. Unit tests - Report integration components
    - ParticipantReports.tsx: URL hash detection, filter state management, `activeReportSupportsNonIdFilters` lookup from cached reports, mode switching, race conditions, fetchReports dependency injection, reportsLoading state
    - TabbedReportPanel.tsx: Tab rendering, category navigation, report selection, onTabChange callbacks, empty state
    - useReportTab.ts: Filter creation for all modes (ID Search, URL Params, All Records, Alive at Center), getQWPConfig, custom subjectIdFieldName, filter structure validation, edge cases
    - Report wrappers (QueryReportWrapper, JSReportWrapper, OtherReportWrapper): ExtJS integration, error handling, panel delegation, cleanup

### Integration Tests (Selenium - Java)

15. Selenium test setup and test data
    - **Page wrapper:** `ReactAnimalHistoryPage` in `EHR_App/test/src/org/labkey/test/pages/`
      - Extends `LabKeyPage<ElementCache>` following standard LabKey test patterns
      - Static `beginAt()` methods for navigation (with optional URL hash support)
      - Fluent API methods: `enterAnimalIds()`, `clickSearchByIds()`, `clickAllAnimals()`, `clickAliveAtCenter()`, etc.
      - Category/report navigation: `clickCategoryTab()`, `clickDemographicsTab()`, `clickReportTab()`
      - Data region methods: `getActiveReportDataRegion()`, `waitForDataRegionToLoad()`, `getDemographicsRowCount()`
      - State check methods: `isAliveAtCenterEnabled()`, `isSearchByIdsActive()`, etc.
      - Assertion methods: `assertReportContainsAnimal()`, `assertValidationErrorShown()`, `assertUrlContains()`, etc.
      - Demographics assertions: `assertDemographicsContainsId()`, `assertDemographicsDoesNotContainId()`, `assertDemographicsRowCountGreaterThan()`, `assertDemographicsAllRowsHaveStatus()`, `assertDemographicsNoRowsHaveStatus()`
      - Inner `Locators` class with CSS selectors for React components (includes `CATEGORY_TAB`)
      - Inner `ElementCache` class with cached WebElements
    - **Test class:** `EHR_AppTest` uses `ReactAnimalHistoryPage` via fluent API
    - **Test data:** Uses `datasetDemographics.tsv` with mix of Alive/Dead animals
      - Dead animals: `TEST1020148`, `TEST1099252`, `44445`, etc.
      - Alive animals: `44444`, `TEST1112911`, etc.
    - **Case sensitivity:** Filters are case-sensitive. Tests use hardcoded IDs with exact casing from test data (e.g., `"TEST1020148"`) instead of `MORE_ANIMAL_IDS` which gets lowercased by `getExpectedAnimalIDCasing()`
    - Configure report metadata: set `supportsNonIdFilters` for test reports

16. Selenium tests - ID Search and All Animals modes
    - ID Search: Single animal (direct and alias), multi-animal, mixed valid/invalid IDs, 100 ID limit, case-insensitive matching
    - All Animals mode (`testAnimalHistoryAllAnimalsMode`):
      1. Search for single Dead animal (`TEST1020148`)
      2. Navigate to Demographics tab, record initial row count
      3. Click "All Animals" button
      4. Verify Demographics row count increased (more animals than searched)
      5. Verify an Alive animal NOT in original search (`44444`) now appears in Demographics
      6. Verify URL contains `filterType:all`
    - Tests implemented in `EHR_AppTest`: `testAnimalHistoryIdSearchModes()`, `testAnimalHistoryIdSearchValidation()`, `testAnimalHistoryAllAnimalsMode()`

17. Selenium tests - Alive at Center and URL Params modes
    - Alive at Center mode (`testAnimalHistoryAliveAtCenterMode`):
      1. Search for Dead animal (`TEST1020148`)
      2. Navigate to Demographics tab, verify Dead animal is shown
      3. Click "All Alive at Center" button
      4. Verify Demographics contains Alive animal (`44444`)
      5. Verify Demographics does NOT contain Dead animal (`TEST1020148`)
      6. Verify all Status column values are "Alive" (no "Dead" values)
      7. Verify URL contains `filterType:aliveAtCenter`
    - URL Params: Navigate to readOnly URL, verify SearchByIdPanel hidden, verify reports displayed
    - Tests implemented in `EHR_AppTest`: `testAnimalHistoryAliveAtCenterMode()`, `testAnimalHistoryUrlParamsMode()`

18. Selenium tests - Filter mode switching and performance
    - Mode switching: Test all transitions (ID Search ↔ All Animals ↔ Alive at Center), multi-step transitions
    - Performance: Large dataset handling, keyboard navigation
    - Tests implemented in `EHR_AppTest`: `testAnimalHistoryFilterModeSwitching()`, `testAnimalHistoryKeyboardNavigation()`

### Manual Testing

19. Manual test execution - All filter modes and switching
    - Execute scenarios 1-23: ID Search (single/multi-animal, direct/alias, duplicates, limit, case), All Records, Alive at Center (supported/unsupported reports, tab switching), URL Params (shared links, modify search)
    - Filter mode transitions and browser navigation

20. Manual test execution - Cross-report consistency and error cases
    - Scenarios 24-25: Data consistency across report types, single vs multi-animal report variants
    - Error cases: ID resolution errors, validation errors, report loading errors, URL/navigation errors, permission errors

21. Manual test execution - Accessibility, performance, and cross-browser
    - Scenarios 26-27: Keyboard-only operation, screen reader compatibility
    - Scenarios 28-30: ID resolution performance, report rendering performance, filter mode switching performance
    - Cross-browser testing: Chrome (all scenarios), Firefox/Safari/Edge (core scenarios), mobile browsers if supported

# Testing

## Manual Test Plan

### Related Areas

* **Animal History Reports** - All existing animal history reports must function with new filter modes
* **URL Sharing/Bookmarking** - URLs with subjects and readOnly parameter must work across sessions and users
* **Demographics and Alias Data** - ID resolution depends on study.demographics and study.alias tables
* **Report Metadata** - ehr.reports.supportsNonIdFilters field affects "Alive, at Center" button state
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
   - Click "Search By Ids"
   - Verify ID resolves and reports display for that animal
   - Verify no "ID Resolution" feedback section appears (all direct matches)

2. **Single Animal Search (Alias)**
   - Enter animal alias (tattoo, chip number, etc.) in textarea
   - Click "Search By Ids"
   - Verify ID Resolution feedback section appears
   - Verify "Resolved" section shows: input alias → resolved ID (alias type)
     Example: "test123 → ID12345 (tattoo)"
   - Verify correct animal ID is displayed and reports load

3. **Multi-Animal Search (Various Separators)**
   - Enter 5 animal IDs separated by newlines
   - Click "Search By Ids", verify all resolved
   - Clear and re-enter same 5 IDs separated by commas
   - Click "Search By Ids", verify same results
   - Repeat with tab-separated and semicolon-separated lists

4. **Multi-Animal Search (Mixed Separators)**
   - Enter IDs using multiple separators in single input: "ID1, ID2\nID3;ID4\tID5"
   - Click "Search By Ids"
   - Verify all 5 IDs parsed correctly
   - Verify reports show all 5 animals

5. **Mixed Direct and Alias IDs**
   - Enter 3 direct IDs and 2 aliases in textarea
   - Click "Search By Ids"
   - Verify ID Resolution feedback section appears (contains aliases)
   - Verify "Resolved" section shows:
     - Direct matches without arrow: "ID123"
     - Alias matches with arrow and type: "alias456 → ID789 (tattoo)"
   - Verify all 5 animals appear in reports

6. **IDs Not Found**
   - Enter mix of valid direct IDs and invalid/non-existent IDs
   - Click "Search By Ids"
   - Verify ID Resolution feedback section appears (contains not-found IDs)
   - Verify "Resolved" section shows valid IDs without arrow: "ID123"
   - Verify "Not Found" section lists invalid IDs
   - Verify reports only show data for valid IDs

7. **Duplicate IDs**
   - Enter "ID123, ID456, ID123, ID456" (duplicates)
   - Click "Search By Ids"
   - Verify de-duplication occurs
   - Verify only 2 unique IDs used in resolution
   - Verify reports show 2 animals (not 4)

8. **100 ID Limit**
   - Enter exactly 100 unique IDs
   - Verify no validation error, "Search By Ids" enabled
   - Click "Search By Ids", verify all resolve
   - Add 1 more ID (101 total)
   - Verify validation error appears: "Maximum of 100 animal IDs allowed. You entered 101 IDs."
   - Verify "Search By Ids" button remains enabled (not disabled)
   - Click "Search By Ids" button
   - Verify button turns blue, other buttons turn gray (filter mode set to idSearch)
   - Verify validation error still displayed (ID resolution doesn't proceed)
   - Remove one ID to get back to 100
   - Verify error clears

9. **Empty Input Validation**
   - Start on Animal History page with empty textarea
   - Verify default state: no validation error visible
   - Click "Search By Ids" button with empty textarea
   - Verify validation error appears: "Please enter at least one animal ID."
   - Verify "Search By Ids" button is now blue (active mode)
   - Verify "All Animals" and "All Alive at Center" buttons are now gray (inactive)
   - Verify button remains enabled (not disabled)

10. **Validation Error Cleared When Switching Modes**
    - Enter 101 IDs to trigger validation error
    - Verify validation error displayed
    - Click "All Animals" button
    - Verify validation error is cleared
    - Verify textarea is cleared
    - Click back to "Search By Ids" mode (textarea now empty)
    - Enter 101 IDs again to trigger validation error
    - Click "All Alive at Center" button
    - Verify validation error is cleared
    - Verify textarea is cleared

11. **Case Insensitivity**
    - Enter animal ID in lowercase
    - Verify resolution finds ID regardless of stored casing
    - Enter same ID in uppercase, verify same result

12. **Very Long IDs**
    - Enter a single ID with 500+ characters
    - Click "Search By Ids"
    - Verify ID is processed without truncation or error
    - Verify ID appears in "Not Found" section (assuming no match)
    - Enter a single ID with 2000+ characters
    - Verify no browser/UI freeze or crash
    - Verify appropriate handling (either processed or reasonable error)
    - Enter 50 IDs where each ID is 100 characters long
    - Verify all IDs are parsed and processed correctly
    - Verify URL hash doesn't exceed browser limits when bookmarking

13. **Special Characters in IDs (Beyond Separators)**
    - **URL-sensitive characters:** Enter IDs containing `&`, `=`, `?`, `#`, `%`, `+`
      - Example: "ID&123", "ID=456", "ID?789", "ID#ABC", "ID%20DEF", "ID+GHI"
      - Verify characters are preserved literally, not interpreted as URL parameters
      - Verify URL hash encoding works correctly when bookmarking
    - **Quote characters:** Enter IDs containing single quotes, double quotes, backticks
      - Example: "ID'123", "ID\"456", "ID\`789"
      - Verify no JavaScript errors or injection issues
      - Verify IDs appear in "Not Found" section (assuming no match)
    - **HTML/XSS characters:** Enter IDs containing `<`, `>`, `&`, script tags
      - Example: "ID<123>", "ID&amp;456", "<script>alert(1)</script>"
      - Verify characters are escaped in display, no XSS execution
      - Verify feedback section renders safely
    - **Regex metacharacters:** Enter IDs containing `*`, `.`, `[`, `]`, `^`, `$`, `(`, `)`, `{`, `}`, `|`, `\`
      - Example: "ID*123", "ID.456", "ID[789]", "ID^ABC", "ID$DEF", "ID(GHI)", "ID\\JKL"
      - Verify characters are treated literally, not as regex patterns
      - Verify no regex evaluation errors
    - **Unicode and international characters:** Enter IDs with accented letters, CJK characters, emoji
      - Example: "IDéàü123", "ID中文456", "ID🐒789"
      - Verify characters are preserved and displayed correctly
      - Verify encoding works in URL hash
    - **Whitespace variations:** Enter IDs with leading/trailing spaces, multiple spaces, non-breaking spaces
      - Example: " ID123 ", "ID  456", "ID\u00A0789" (non-breaking space)
      - Verify trimming behavior is consistent
      - Verify non-breaking spaces are handled appropriately
    - **Null and control characters:** Enter IDs with embedded null bytes or control characters
      - Example: "ID\x00123", "ID\x01456"
      - Verify no crash or security issue
      - Verify sanitization removes or escapes dangerous characters

### All Animals Mode

14. **View All Animals**
    - Click "All Animals" button
    - Verify ID input textarea is cleared and hidden
    - Verify reports display data for all animals in database
    - Verify no ID filters applied
    - Test with multiple report tabs

15. **URL Bookmarking - All Animals**
    - While in All Animals mode, copy URL
    - Open URL in new browser tab
    - Verify All Animals mode is active
    - Verify all animals shown

### All Alive at Center Mode

16. **View Alive Animals (Supported Report)**
    - Navigate to report with `supportsNonIdFilters = true`
    - Verify "All Alive at Center" button is enabled
    - Click "All Alive at Center"
    - Verify reports show only animals with `Id/Demographics/calculated_status = 'Alive'`
    - Verify ID input is cleared/hidden

17. **Disabled for Unsupported Reports**
    - Navigate to report with `supportsNonIdFilters = false`
    - Verify "All Alive at Center" button is disabled/grayed out
    - Hover over button, verify tooltip explains why disabled
    - Switch to another report with `supportsNonIdFilters = true`
    - Verify button becomes enabled

18. **Report Tab Switching**
    - Start in All Alive at Center mode on supported report
    - Switch to report tab with `supportsNonIdFilters = false`
    - Verify "All Alive at Center" button becomes disabled
    - Verify filter mode automatically switches to "All Animals"
    - Verify error message appears: "Filter type unsupported for this report. Switched to All Animals."
    - Verify report shows unfiltered data (all animals, not just alive)
    - Switch back to supported report tab
    - Verify error message clears
    - Verify "All Alive at Center" button becomes enabled again
    - Verify alive-only filter reapplies

### URL Params Mode (Read-Only)

19. **Shared Link with Subjects**
    - Perform ID search for 3 animals, get results
    - Generate shareable URL with `readOnly=true` parameter
    - Open URL in incognito/private browser window
    - Verify SearchByIdPanel is completely hidden (no filter buttons, no textarea, no summary)
    - Verify reports display data for the 3 animals immediately
    - Verify clean presentation suitable for sharing

20. **Exit ReadOnly Mode via URL Edit**
    - From URL Params mode (shared link with readOnly=true)
    - Manually edit URL to remove `readOnly:true` from hash
    - Verify SearchByIdPanel now visible
    - Verify filter toggle buttons visible
    - Verify subjects pre-populated in textarea
    - Modify ID list, click "Search By Ids"
    - Verify new IDs resolve and reports update

21. **Bookmark with Many Subjects**
    - Create URL Params mode link with 50 animal IDs
    - Bookmark the URL
    - Close browser, reopen bookmark
    - Verify exactly 50 animals display correctly
    - Verify no ID limit validation (URL Params mode bypasses 100 limit)
    - Verify URL hash length doesn't cause browser issues

22. **URL with Subjects but No readOnly Flag**
    - Build URL with subjects in hash but without `readOnly=true` parameter
    - Navigate to URL
    - Verify ID Search mode active (not URL Params mode)
    - Verify SearchByIdPanel visible with subjects pre-populated in textarea (editable)
    - Verify filter toggle buttons visible

### Filter Mode Switching

23. **ID Search → All Animals**
    - Enter 5 animal IDs, click "Search By Ids"
    - Verify reports show 5 animals
    - Click "All Animals" button
    - Verify ID textarea is cleared
    - Verify reports now show all animals

24. **All Animals → ID Search**
    - While in All Animals mode showing all animals
    - Enter animal IDs in textarea and click "Search By Ids"
    - Verify ID resolution occurs
    - Verify reports update to show only entered animals

25. **ID Search → All Alive at Center**
    - From ID Search with 5 animals
    - Click "All Alive at Center" button (on supported report)
    - Verify ID textarea cleared
    - Verify reports now show only alive animals (not just the 5)

26. **All Alive at Center → ID Search**
    - From All Alive at Center mode
    - Enter animal IDs in textarea and click "Search By Ids"
    - Verify can return to ID search with specified animals

27. **Browser Back/Forward Navigation**
    - Perform ID search for 3 animals
    - Click "All Animals"
    - Click browser back button
    - Verify returns to ID Search with 3 animals
    - Click browser forward button
    - Verify returns to All Animals mode
    - Verify state and URL hash sync correctly

### Cross-Report Consistency

28. **Data Consistency Across Report Types**
    - Search for 3 animals
    - Navigate through all report tabs (Demographics, Weight, Housing, etc.)
    - Verify all reports show same 3 animals
    - Verify filter is maintained across tabs

29. **Single vs Multi-Animal Report Variants**
    - Search for 1 animal
    - Verify reports using single-animal view layout
    - Search for 10 animals
    - Verify same reports switch to multi-animal grid layout
    - Verify data correctness in both views

### Error Cases

#### ID Resolution Errors

* All IDs invalid/not found - verify "Not Found" section only, reports show no data (empty array passed to filters)
* Network error during resolution - verify error message displayed, user can retry, reports show no data (empty array passed to filters)
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

* URL with `readOnly=true` but no subjects - verify defaults to All Animals mode or shows error
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

28. **Keyboard-Only Operation**
    - Navigate Animal History page using only keyboard (Tab, Enter, Space)
    - Verify all filter buttons accessible via Tab
    - Verify textarea accessible and functional
    - Verify "Search By Ids" button activates with Enter/Space
    - Verify focus indicators clearly visible
    - Verify logical tab order through interface

#### Screen Reader Compatibility

29. **Screen Reader Accessibility**
    - Use screen reader (NVDA/JAWS) to navigate page
    - Verify filter mode changes announced
    - Verify textarea has descriptive label
    - Verify validation errors announced via role="alert"
    - Verify ID Resolution feedback sections have proper headings
    - Verify report data accessible and properly labeled

### Performance Scenarios

30. **ID Resolution Performance**
    - Enter 100 animal IDs (maximum)
    - Click "Search By Ids"
    - Verify ID resolution completes in < 5 seconds
    - Verify UI remains responsive during resolution

31. **Report Rendering Performance**
    - After resolving 100 animals
    - Verify reports render in < 10 seconds
    - Switch between report tabs
    - Verify tab switching completes in < 2 seconds

32. **Filter Mode Switching Performance**
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

**File: `APIWrapper.test.ts`**
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
* Test `fetchReports()` returns reports from ehr.reports table
* Test `fetchReports()` filters by visible=true
* Test `fetchReports()` sorts by category, sort_order, reporttitle, reportstatus
* Test `fetchReports()` maps row fields to ReportConfig interface
* Test `fetchReports()` parses jsonConfig field and merges into report
* Test `fetchReports()` handles malformed jsonConfig gracefully (logs warning, continues)
* Test `fetchReports()` returns empty array with error on API failure
* Test `fetchReports()` returns error message from API response
* Test FetchReportsFn type can be used for dependency injection
* Mock @labkey/api Query.selectRows calls

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
* Test validation error cleared when switching to All Animals mode
* Test validation error cleared when switching to All Alive at Center mode
* Test "Search By Ids" button sets filter mode to idSearch even with validation error
* Test button turns blue when clicked with empty input (validation error)
* Test component behavior when `initialSubjects` prop provided (URL Params → ID Search transition)
* Test filter mode toggle buttons render correctly
* Test switching between filter modes updates state
* Test ID textarea always visible (except URL Params mode)
* Test "Search By Ids" button always visible (except URL Params mode)
* Test "Search By Ids" button remains enabled when validation fails
* Test "Search By Ids" button disabled only during resolution
* Test "Alive, at Center" button disabled when `activeReportSupportsNonIdFilters = false`
* Test "Alive, at Center" button enabled when `activeReportSupportsNonIdFilters = true`
* Test "Alive, at Center" selected but on unsupported report shows error message
* Test input cleared when switching to All Records or Alive at Center
* Test accessibility: ARIA labels on textarea and buttons
* Test accessibility: keyboard navigation works correctly
* Test IDs with SQL injection patterns treated as literal strings (security test)

**File: `IdResolutionFeedback.test.tsx`**
* Test "Resolved" section displays direct matches without arrow: "ID123"
* Test "Resolved" section displays alias matches with arrow and type: "alias456 → ID123 (tattoo)"
* Test "Resolved" section displays multiple alias matches with different types
* Test "Resolved" section displays mixed direct and alias matches correctly
* Test "Not Found" section displays unresolved IDs
* Test multiple inputs resolving to same ID displayed correctly
* Test empty results renders container with title but no sections
* Test section headings have proper structure
* Test accessibility: resolved and not-found items have proper CSS classes
* Test special characters in IDs handled correctly

Note: Visibility tests are in `SearchByIdPanel.test.tsx` under "resolution feedback visibility" describe block, since `SearchByIdPanel` controls when `IdResolutionFeedback` is rendered.

**File: `ParticipantReports.test.tsx`**
* Test initial filter type determined from URL hash
* Test `readOnly=true` in URL activates URL Params mode
* Test SearchByIdPanel hidden when `readOnly=true` with subjects in URL
* Test SearchByIdPanel shown in normal mode (not readOnly)
* Test `readOnly=true` ignored when no subjects in URL (shows SearchByIdPanel)
* Test filter state management (subjects, filterType, showReport)
* Test `handleFilterChange` callback updates state and URL
* Test `activeReportSupportsNonIdFilters` queried from report metadata
* Test switching filter modes updates URL hash (including showReport parameter)
* Test race condition: rapid filter mode changes before state updates
* Test initial load with malformed URL hash (fallback behavior)
* Test `activeReportSupportsNonIdFilters` updates when switching report tabs
* Test showReport state: false on initial page load
* Test showReport state: true for 'all' and 'aliveAtCenter' modes
* Test showReport state: true for 'idSearch' and 'urlParams' modes only when subjects exist
* Test showReport state: true in readOnly mode (defaults to true)
* Test showReport state: false for 'idSearch' mode with no subjects
* Test showReport prop passed to TabbedReportPanel correctly

*Dependency injection tests:*
* Test accepts fetchReports prop for dependency injection
* Test uses default fetchReports when prop not provided
* Test injected fetchReports handles errors
* Test injected fetchReports can return multiple categories
* Test reportsLoading state: passes undefined to TabbedReportPanel while loading
* Test reportsLoading state: passes reports array after loading completes
* Test activeReportSupportsNonIdFilters computed from cached reports (no separate query)
* Test activeReportSupportsNonIdFilters defaults to true when report not found

**File: `TabbedReportPanel.test.tsx`** (34 tests)

*Basic rendering tests:*
* Test renders query report tab and displays QueryReportWrapper
* Test renders js report tab and displays JSReportWrapper
* Test renders other report tab and displays OtherReportWrapper
* Test renders category tabs and allows switching between categories
* Test allows switching between reports in the same category
* Test displays loading state when no reports provided initially
* Test displays message when reports array is empty
* Test calls onTabChange when switching tabs
* Test selects the specified active report on initial render
* Test empty state placeholder shown when showReport is false

**File: `useReportTab.test.tsx`** (29 tests)

*Filter modes integration - ID Search mode:*
* Test creates subject ID filter for single subject
* Test creates subject ID filter for multiple subjects
* Test uses EQUALS_ONE_OF filter type for multiple subjects

*Filter modes integration - URL Params mode:*
* Test creates subject ID filter from URL-provided subjects
* Test handles single subject from URL params

*Filter modes integration - All Records mode:*
* Test creates no filters when filterType is all
* Test ignores subjects when filterType is all

*Filter modes integration - Alive at Center mode:*
* Test creates calculated_status = Alive filter
* Test does not create subject filters in Alive at Center mode

*Filter modes integration - filter switching:*
* Test updates report filters when switching from ID Search to All Records
* Test updates report filters when switching from All Records to Alive at Center
* Test updates report filters when switching from Alive at Center to ID Search

*Filter modes integration - empty subjects validation:*
* Test creates no subject filters when ID Search mode has empty subjects array

*Filter modes integration - report supportsNonIdFilters field:*
* Test applies Alive at Center filter regardless of supportsnonidfilters setting (parent component handles error display)
* Test applies Alive at Center filter when report supports non-ID filters

*Filter modes integration - LabKey Filter API format:*
* Test creates filters in correct LabKey Filter.create() format for single subject
* Test creates filters in correct LabKey Filter.create() format for multiple subjects

*Filter modes integration - custom subjectIdFieldName handling:*
* Test uses custom subjectIdFieldName from report config
* Test defaults to Id when subjectIdFieldName not specified
* Test defaults to Id when subjectIdFieldName is null

*Filter modes integration - edge cases for filter modes:*
* Test handles undefined filterType gracefully
* Test handles null filters gracefully
* Test handles empty filterType string

*Filter modes integration - FilterArray structure validation:*
* Test getFilterArray returns correct structure with nonRemovable filters
* Test getFilterArray returns empty arrays for All Records mode

**File: `QueryReportWrapper.test.tsx`** (6 tests)

* Test creates Ext4 container and adds ldk-querycmp to tab
* Test cleanup removes all from tab on unmount
* Test adds error HTML when query config failure callback fires
* Test adds error HTML when Ext4 tab.add throws exception
* Test encodes HTML in error messages for XSS prevention
* Test key prop forces remount when switching reports

**File: `JSReportWrapper.test.tsx`** (14 tests)

* Test calls JS function from window namespace when available
* Test resolves function from report namespace
* Test shows error when JS function is not found
* Test shows error when JS function throws
* Test encodes HTML in error messages for XSS prevention
* Test panel getFilterArray delegates to tab
* Test panel getQWPConfig delegates to tab
* Test panel getTitleSuffix returns formatted subject string
* Test cleanup destroys tab on unmount
* Test key prop forces remount when switching reports

**File: `OtherReportWrapper.test.tsx`** (12 tests)

* Test renders LABKEY.WebPart with correct config
* Test applies filter parameters to partConfig
* Test includes containerPath when present
* Test includes viewName as showSection when present
* Test generates unique DOM element ID for render target
* Test shows error when WebPart render throws
* Test encodes HTML in error messages for XSS prevention
* Test cleanup clears innerHTML on unmount
* Test title includes subject suffix

**File: `urlHashUtils.test.ts`**
* Test `updateUrlHash()` for ID Search mode
* Test `updateUrlHash()` for All Animals mode
* Test `updateUrlHash()` for Alive at Center mode
* Test `updateUrlHash()` for URL Params mode with `readOnly=true`
* Test `getFiltersFromUrl()` parses all filter types
* Test URL with conflicting parameters resolved correctly
* Test URL hash with 100+ subjects (ensure no truncation)
* Test special character encoding in subject IDs (spaces, semicolons)
* Test `updateUrlHash()` doesn't create duplicate history entries
* Test `showReport` parameter included when true (showReport:1)
* Test `showReport` parameter omitted when false or undefined
* Test `getFiltersFromUrl()` parses showReport correctly (true/false/undefined)

### Integration Tests (Selenium - Java)

**Add to existing test class: `EHR_AppTest`**

Location: `server/modules/ehrModules/EHR_App/test/src/org/labkey/test/tests/EHR_AppTest.java`

#### Selenium Test Implementation Notes (Updated 2026-01-14)

**CSS Selectors Used in Tests:**
The following Locator constants are defined in `EHR_AppTest.java` for interacting with the React components:

```java
// Panel and input selectors
private static final Locator SEARCH_BY_ID_PANEL = Locator.css(".search-by-id-panel");
private static final Locator ANIMAL_ID_TEXTAREA = Locator.css(".animal-id-input");
private static final Locator VALIDATION_ERROR = Locator.css(".search-by-id-panel .validation-error");

// Button selectors
private static final Locator SEARCH_BY_IDS_BUTTON = Locator.css(".search-button");
private static final Locator ALL_ANIMALS_BUTTON = Locator.css(".filter-button.all-animals");
private static final Locator ALIVE_AT_CENTER_BUTTON = Locator.css(".filter-button.alive-at-center");

// Report panel selectors
private static final Locator REPORT_TARGET = Locator.css(".tabbed-report-panel .report-target");
private static final Locator REPORT_TAB = Locator.css(".tabbed-report-panel .report-tab");
private static final Locator EMPTY_STATE_PLACEHOLDER = Locator.css(".tabbed-report-panel .empty-state-placeholder");

// ID Resolution feedback selectors
private static final Locator ID_RESOLUTION_FEEDBACK = Locator.css(".id-resolution-feedback");
private static final Locator RESOLVED_SECTION_TITLE = Locator.css(".id-resolution-feedback .section-title.resolved");
private static final Locator NOT_FOUND_SECTION_TITLE = Locator.css(".id-resolution-feedback .section-title.not-found");
private static final Locator RESOLVED_ITEMS = Locator.css(".id-resolution-feedback .section .items .resolved-item");
private static final Locator NOT_FOUND_ITEMS = Locator.css(".id-resolution-feedback .section .items .not-found-item");
```

**Test Data:**
Tests use `MORE_ANIMAL_IDS` array from `AbstractEHRTest` base class, which contains test animal IDs such as `TEST1020148`, `TEST1099252`, etc.

**Current Implementation Status (Updated 2026-01-14):**

All 7 Selenium tests have been implemented and are passing:

| Test Method | Status | Duration | Notes |
|-------------|--------|----------|-------|
| `testAnimalHistoryIdSearchModes()` | ✅ Passing | ~7s | Covers: Initial page load, single direct ID, multi-animal search, not-found feedback, case-insensitive matching. Alias testing deferred - requires test data setup |
| `testAnimalHistoryIdSearchValidation()` | ✅ Passing | ~4s | Covers: Empty input validation, validation error clearing |
| `testAnimalHistoryAllAnimalsMode()` | ✅ Passing | ~6s | Covers: Mode activation, textarea clearing, URL state |
| `testAnimalHistoryAliveAtCenterMode()` | ✅ Passing | ~3s | Covers: Mode activation when supported, graceful skip when button disabled |
| `testAnimalHistoryUrlParamsMode()` | ✅ Passing | ~4s | Covers: URL with subjects parameter, subject loading |
| `testAnimalHistoryFilterModeSwitching()` | ✅ Passing | ~7s | Covers: ID Search ↔ All Animals transitions, URL state verification |
| `testAnimalHistoryKeyboardNavigation()` | ✅ Passing | ~4s | Covers: Basic keyboard input and search activation |

**Note:** The `testAnimalHistoryLargeDataset()` test from the spec is not implemented as it requires more test data than currently available

#### Test Design: Hybrid Approach

These tests use a **hybrid approach** that balances test isolation with execution efficiency:

| Strategy | Rationale |
|----------|-----------|
| **Combine related scenarios** | Reduces setup overhead (login, navigation, page load) for tests that share the same feature area |
| **Keep isolated scenarios separate** | Error states, performance tests, and accessibility tests remain independent for clear failure isolation |
| **Progressive complexity within combined tests** | Each combined test builds from simple to complex scenarios, failing fast on basic issues |

**Benefits:**
- Faster total test execution (fewer browser startups, page navigations)
- Clear failure isolation for distinct feature areas
- Realistic user flow testing (users naturally perform multiple searches per session)
- Easier maintenance than 16+ individual micro-tests

**Tradeoffs:**
- If step 3 of a combined test fails, steps 4+ won't execute
- Slightly harder to pinpoint exact failure location (mitigated by descriptive log messages)

#### New Test Methods (8 tests total)

#### 1. **`testAnimalHistoryIdSearchModes()`**
Combines: Single direct ID, single alias, multi-animal, not found, and case-insensitive searches.

```java
@Test
public void testAnimalHistoryIdSearchModes()
{
    // Setup once - navigate to Animal History
    navigateToAnimalHistorySearchById();

    // Scenario 1: Single direct ID match
    log("Testing single direct ID search");
    enterAnimalIds(TEST_ANIMAL_ID_1);
    clickSearchByIds();
    assertReportContainsAnimal(TEST_ANIMAL_ID_1);
    assertIdResolutionVisible(false); // No aliases or not-found

    // Scenario 2: Single alias match (reuses same page)
    log("Testing single alias search");
    clearIdInput();
    enterAnimalIds(TEST_ALIAS_TATTOO); // e.g., "TATTOO_001"
    clickSearchByIds();
    assertIdResolutionVisible(true);
    assertResolvedContains(TEST_ALIAS_TATTOO, TEST_ANIMAL_ID_2, "tattoo");
    assertReportContainsAnimal(TEST_ANIMAL_ID_2);

    // Scenario 3: Multi-animal direct search
    log("Testing multi-animal search");
    clearIdInput();
    enterAnimalIds(TEST_ANIMAL_ID_1, TEST_ANIMAL_ID_2, TEST_ANIMAL_ID_3);
    clickSearchByIds();
    assertIdResolutionVisible(false); // All direct matches
    assertReportContainsAnimal(TEST_ANIMAL_ID_1);
    assertReportContainsAnimal(TEST_ANIMAL_ID_2);
    assertReportContainsAnimal(TEST_ANIMAL_ID_3);

    // Verify across multiple report tabs
    clickReportTab("Weight");
    assertReportContainsAnimal(TEST_ANIMAL_ID_1);
    assertReportContainsAnimal(TEST_ANIMAL_ID_2);
    clickReportTab("Housing");
    assertReportContainsAnimal(TEST_ANIMAL_ID_1);

    // Scenario 4: Mixed valid/invalid IDs (not found)
    log("Testing not found IDs");
    clearIdInput();
    enterAnimalIds(TEST_ANIMAL_ID_1, "INVALID_ID_999");
    clickSearchByIds();
    assertIdResolutionVisible(true);
    assertResolvedContains(TEST_ANIMAL_ID_1);
    assertNotFoundContains("INVALID_ID_999");
    assertReportContainsAnimal(TEST_ANIMAL_ID_1);
    assertReportDoesNotContainAnimal("INVALID_ID_999");

    // Scenario 5: Case-insensitive matching
    log("Testing case-insensitive search");
    clearIdInput();
    String lowercaseId = TEST_ANIMAL_ID_1.toLowerCase();
    enterAnimalIds(lowercaseId);
    clickSearchByIds();
    assertReportContainsAnimal(TEST_ANIMAL_ID_1); // Should resolve regardless of case
}
```

**Covered scenarios:** Single direct, single alias, multi-animal, not found, case-insensitive

---

#### 2. **`testAnimalHistoryIdSearchValidation()`**
Isolated test for 100 ID limit validation (error state testing).

```java
@Test
public void testAnimalHistoryIdSearchValidation()
{
    navigateToAnimalHistorySearchById();

    // Scenario 1: Exactly 100 IDs should succeed
    log("Testing 100 ID limit - at limit");
    String[] hundredIds = generateTestIds(100);
    enterAnimalIds(hundredIds);
    assertNoValidationError();
    assertSearchByIdsButtonEnabled(true);

    // Scenario 2: 101 IDs should show validation error
    log("Testing 100 ID limit - exceeds limit");
    clearIdInput();
    String[] tooManyIds = generateTestIds(101);
    enterAnimalIds(tooManyIds);
    assertValidationError("Maximum of 100 animal IDs allowed");

    // Scenario 3: Reducing back to 100 clears error
    log("Testing validation error clears when reduced");
    clearIdInput();
    enterAnimalIds(hundredIds); // Back to 100
    assertNoValidationError();

    // Scenario 4: Empty input validation
    log("Testing empty input validation");
    clearIdInput();
    clickSearchByIds();
    assertValidationError("Please enter at least one animal ID");
}
```

**Why isolated:** Tests error/validation states that should fail fast and provide clear diagnostics.

---

#### 3. **`testAnimalHistoryAllAnimalsMode()`**
Combines: All Animals mode functionality and URL bookmarking.

```java
@Test
public void testAnimalHistoryAllAnimalsMode()
{
    navigateToAnimalHistorySearchById();

    // Scenario 1: Activate All Animals mode
    log("Testing All Animals mode activation");
    clickFilterButton("All Animals");
    assertTextareaCleared();
    assertFilterButtonActive("All Animals");
    assertReportShowsMultipleAnimals(); // More than just test subset

    // Scenario 2: URL bookmarking works
    log("Testing All Animals URL bookmarking");
    String currentUrl = getCurrentUrl();
    assertUrlContains("filterType", "all");

    // Navigate away and back via URL
    goToProjectHome();
    navigateToUrl(currentUrl);

    // Verify state restored from URL
    assertFilterButtonActive("All Animals");
    assertReportShowsMultipleAnimals();
}
```

**Covered scenarios:** All Animals activation, URL persistence

---

#### 4. **`testAnimalHistoryAliveAtCenterMode()`**
Combines: Alive at Center functionality and disabled state on unsupported reports.

```java
@Test
public void testAnimalHistoryAliveAtCenterMode()
{
    navigateToAnimalHistorySearchById();

    // Ensure we're on a report that supports non-ID filters
    clickReportTab(REPORT_SUPPORTS_NON_ID_FILTERS);

    // Scenario 1: Alive at Center mode works on supported report
    log("Testing Alive at Center mode on supported report");
    assertFilterButtonState("All Alive at Center", true); // Enabled
    clickFilterButton("All Alive at Center");
    assertFilterButtonActive("All Alive at Center");
    assertTextareaCleared();
    assertReportDoesNotContainAnimal(DEAD_ANIMAL_ID);
    assertReportContainsAnimal(ALIVE_ANIMAL_ID);

    // Scenario 2: Button disabled on unsupported report
    log("Testing Alive at Center disabled on unsupported report");
    clickReportTab(REPORT_NO_NON_ID_FILTER_SUPPORT);
    assertFilterButtonState("All Alive at Center", false); // Disabled
    assertFilterButtonActive("All Animals"); // Auto-switched
    assertErrorMessage("Filter type unsupported for this report");

    // Scenario 3: Switching back re-enables and reapplies filter
    log("Testing filter reapplies when switching back to supported report");
    clickReportTab(REPORT_SUPPORTS_NON_ID_FILTERS);
    assertFilterButtonState("All Alive at Center", true); // Re-enabled
    assertNoErrorMessage();
    assertFilterButtonActive("All Alive at Center"); // Filter reapplied
    assertReportDoesNotContainAnimal(DEAD_ANIMAL_ID);
}
```

**Covered scenarios:** Alive at Center activation, disabled state, auto-switch behavior

---

#### 5. **`testAnimalHistoryUrlParamsMode()`**
Combines: Read-only URL params mode (hidden SearchByIdPanel) and manual URL editing to exit read-only.

```java
@Test
public void testAnimalHistoryUrlParamsMode()
{
    // Scenario 1: Navigate directly to read-only URL
    log("Testing URL Params read-only mode");
    String readOnlyUrl = buildUrlWithParams("idSearch",
        new String[]{TEST_ANIMAL_ID_1, TEST_ANIMAL_ID_2}, true);
    navigateToUrl(readOnlyUrl);

    // Verify read-only state - SearchByIdPanel completely hidden
    assertSearchByIdPanelVisible(false);
    assertReportContainsAnimal(TEST_ANIMAL_ID_1);
    assertReportContainsAnimal(TEST_ANIMAL_ID_2);

    // Scenario 2: Manually remove readOnly from URL to enable editing
    log("Testing manual URL edit to exit read-only mode");
    String editableUrl = buildUrlWithParams("idSearch",
        new String[]{TEST_ANIMAL_ID_1, TEST_ANIMAL_ID_2}, false);
    navigateToUrl(editableUrl);

    // Verify SearchByIdPanel is now visible with subjects pre-populated
    assertSearchByIdPanelVisible(true);
    assertTextareaContains(TEST_ANIMAL_ID_1);
    assertTextareaContains(TEST_ANIMAL_ID_2);

    // Scenario 3: Can modify and re-search
    log("Testing search after removing readOnly");
    clearIdInput();
    enterAnimalIds(TEST_ANIMAL_ID_3);
    clickSearchByIds();
    assertReportContainsAnimal(TEST_ANIMAL_ID_3);
    assertReportDoesNotContainAnimal(TEST_ANIMAL_ID_1);
}
```

**Covered scenarios:** Read-only URL navigation (hidden SearchByIdPanel), manual URL edit to exit read-only, editing after exiting read-only

---

#### 6. **`testAnimalHistoryFilterModeSwitching()`**
Combines: Mode switching and multiple transitions with URL verification.

```java
@Test
public void testAnimalHistoryFilterModeSwitching()
{
    navigateToAnimalHistorySearchById();

    // Ensure we're on a report that supports all filter modes
    clickReportTab(REPORT_SUPPORTS_NON_ID_FILTERS);

    // Scenario 1: ID Search → All Animals
    log("Testing ID Search to All Animals transition");
    enterAnimalIds(TEST_ANIMAL_ID_1, TEST_ANIMAL_ID_2, TEST_ANIMAL_ID_3);
    clickSearchByIds();
    assertReportContainsAnimal(TEST_ANIMAL_ID_1);

    clickFilterButton("All Animals");
    assertTextareaCleared();
    assertReportShowsMultipleAnimals();
    assertUrlContains("filterType", "all");

    // Scenario 2: All Animals → Alive at Center
    log("Testing All Animals to Alive at Center transition");
    clickFilterButton("All Alive at Center");
    assertReportDoesNotContainAnimal(DEAD_ANIMAL_ID);
    assertUrlContains("filterType", "aliveAtCenter");

    // Scenario 3: Alive at Center → ID Search (empty)
    log("Testing Alive at Center to ID Search transition");
    clickFilterButton("Search By Ids"); // Switch mode without searching
    assertTextareaVisible(true);
    assertTextareaEmpty();

    // Scenario 4: New ID search after mode switches
    log("Testing new search after multiple transitions");
    enterAnimalIds(TEST_ANIMAL_ID_4, TEST_ANIMAL_ID_5);
    clickSearchByIds();
    assertReportContainsAnimal(TEST_ANIMAL_ID_4);
    assertReportContainsAnimal(TEST_ANIMAL_ID_5);
    assertUrlContains("filterType", "idSearch");

    // Scenario 5: Verify URL updates correctly through transitions
    log("Verifying final URL state");
    String finalUrl = getCurrentUrl();
    assertTrue("URL should contain subjects", finalUrl.contains("subjects:"));
}
```

**Covered scenarios:** All mode transitions, URL hash updates, state persistence

---

#### 7. **`testAnimalHistoryLargeDataset()`**
Isolated performance test.

```java
@Test
public void testAnimalHistoryLargeDataset()
{
    // Note: Requires test environment with sufficient animal data
    navigateToAnimalHistorySearchById();

    // Enter large number of IDs (50 realistic, or max supported)
    log("Testing large dataset performance");
    String[] manyIds = getTestAnimalIds(50); // Get 50 real test IDs

    long startTime = System.currentTimeMillis();
    enterAnimalIds(manyIds);
    clickSearchByIds();
    long resolutionTime = System.currentTimeMillis() - startTime;

    // Verify resolution completes within acceptable time
    log("ID resolution completed in " + resolutionTime + "ms");
    assertTrue("ID resolution should complete within 10 seconds",
               resolutionTime < 10000);

    // Verify UI remains responsive
    assertElementPresent(Locator.css(".report-content"));

    // Test tab switching performance
    long tabStartTime = System.currentTimeMillis();
    clickReportTab("Weight");
    long tabSwitchTime = System.currentTimeMillis() - tabStartTime;

    log("Tab switch completed in " + tabSwitchTime + "ms");
    assertTrue("Tab switching should complete within 5 seconds",
               tabSwitchTime < 5000);
}
```

**Why isolated:** Performance tests have different assertions (timing) and may need different environments.

---

#### 8. **`testAnimalHistoryKeyboardNavigation()`**
Isolated accessibility test.

```java
@Test
public void testAnimalHistoryKeyboardNavigation()
{
    navigateToAnimalHistorySearchById();

    // Scenario 1: Navigate and search using keyboard only
    log("Testing keyboard-only ID search");

    // Tab to textarea
    pressTab();
    assertFocusedElement(Locator.css("textarea.animal-id-input"));

    // Type animal IDs
    sendKeys(TEST_ANIMAL_ID_1);

    // Tab to Search By Ids button
    pressTab();
    assertFocusedElement(Locator.css(".search-button"));

    // Press Enter to submit
    pressEnter();
    waitForElement(Locator.css(".report-content"));
    assertReportContainsAnimal(TEST_ANIMAL_ID_1);

    // Scenario 2: Navigate filter buttons with keyboard
    log("Testing keyboard filter mode switching");

    // Tab to All Animals button
    pressTab();
    assertFocusedElement(Locator.css(".filter-button.all-animals"));

    // Activate with Space
    pressSpace();
    assertFilterButtonActive("All Animals");

    // Tab to Alive at Center button
    pressTab();
    assertFocusedElement(Locator.css(".filter-button.alive-at-center"));

    // Verify focus indicators are visible
    assertElementHasClass(getFocusedElement(), "focus-visible");
}
```

**Why isolated:** Accessibility tests use different interaction patterns (keyboard vs mouse) and have specific WCAG compliance assertions.

---

#### Test Summary

| Test Method | Scenarios Covered | Isolation Reason |
|-------------|-------------------|------------------|
| `testAnimalHistoryIdSearchModes()` | Single direct, alias, multi-animal, not found, case-insensitive | Combined - same feature area |
| `testAnimalHistoryIdSearchValidation()` | 100 ID limit, empty input | Isolated - error state testing |
| `testAnimalHistoryAllAnimalsMode()` | Activation, URL bookmarking | Combined - same filter mode |
| `testAnimalHistoryAliveAtCenterMode()` | Activation, disabled state, auto-switch | Combined - same filter mode |
| `testAnimalHistoryUrlParamsMode()` | Read-only URL, modify search | Combined - same entry point |
| `testAnimalHistoryFilterModeSwitching()` | All mode transitions, URL updates | Combined - related user flow |
| `testAnimalHistoryLargeDataset()` | Performance assertions | Isolated - different assertions |
| `testAnimalHistoryKeyboardNavigation()` | Keyboard-only operation | Isolated - different interaction model |

**Total: 8 tests** (reduced from 16 individual tests)

#### Test Constants to Add

```java
// Add to EHR_AppTest class constants section

// Animal IDs for testing (set based on test data)
private static final String TEST_ANIMAL_ID_1 = "TEST001";  // TODO: Set based on test data
private static final String TEST_ANIMAL_ID_2 = "TEST002";  // TODO: Set based on test data
private static final String TEST_ANIMAL_ID_3 = "TEST003";  // TODO: Set based on test data
private static final String TEST_ANIMAL_ID_4 = "TEST004";  // TODO: Set based on test data
private static final String TEST_ANIMAL_ID_5 = "TEST005";  // TODO: Set based on test data

// Alias for testing (maps to TEST_ANIMAL_ID_2)
private static final String TEST_ALIAS_TATTOO = "TATTOO_001";  // TODO: Set based on test data

// Status-specific animals for Alive at Center tests
private static final String ALIVE_ANIMAL_ID = "TEST001";  // TODO: Must have calculated_status = 'Alive'
private static final String DEAD_ANIMAL_ID = "DEAD001";   // TODO: Must have calculated_status != 'Alive'

// Report names for testing supportsNonIdFilters behavior
private static final String REPORT_SUPPORTS_NON_ID_FILTERS = "Demographics";  // TODO: Set based on actual report
private static final String REPORT_NO_NON_ID_FILTER_SUPPORT = "Snapshot";     // TODO: Set based on actual report
```

#### Helper Methods to Add

```java
// ============================================
// Navigation Methods
// ============================================

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

private void navigateToUrl(String url)
{
    getDriver().get(url);
    waitForElement(Locator.css(".search-by-id-panel, .read-only-summary"));
}

private String getCurrentUrl()
{
    return getDriver().getCurrentUrl();
}

// ============================================
// Input Methods
// ============================================

private void enterAnimalIds(String... ids)
{
    if (ids == null || ids.length == 0)
        throw new IllegalArgumentException("Must provide at least one ID");

    Locator textarea = Locator.css("textarea.animal-id-input");
    waitForElement(textarea);
    setFormElement(textarea, String.join(",", ids));
}

private void clearIdInput()
{
    Locator textarea = Locator.css("textarea.animal-id-input");
    waitForElement(textarea);
    setFormElement(textarea, "");
}

private String[] generateTestIds(int count)
{
    String[] ids = new String[count];
    for (int i = 0; i < count; i++)
    {
        ids[i] = "GENERATED_ID_" + i;
    }
    return ids;
}

private String[] getTestAnimalIds(int count)
{
    // Return real test animal IDs from test data
    // Adjust based on available test data
    String[] allIds = {TEST_ANIMAL_ID_1, TEST_ANIMAL_ID_2, TEST_ANIMAL_ID_3,
                       TEST_ANIMAL_ID_4, TEST_ANIMAL_ID_5};
    return Arrays.copyOf(allIds, Math.min(count, allIds.length));
}

// ============================================
// Button/Action Methods
// ============================================

private void clickSearchByIds()
{
    clickButton("Search By Ids");

    // Wait for loading indicator to appear then disappear (if present)
    Locator loadingIndicator = Locator.css(".loading-indicator");
    if (isElementPresent(loadingIndicator))
    {
        waitForElementToDisappear(loadingIndicator, WAIT_FOR_PAGE);
    }

    // Then wait for content or error
    waitFor(() -> isElementPresent(Locator.css(".report-content")) ||
                  isElementPresent(Locator.css(".validation-error")) ||
                  isElementPresent(Locator.css(".id-resolution-feedback")),
            "Expected report content, validation error, or resolution feedback", WAIT_FOR_PAGE);
}

private void clickFilterButton(String buttonText)
{
    clickButton(buttonText); // "All Animals", "All Alive at Center", or "Search By Ids"
    sleep(500); // Allow mode transition
}

private void clickReportTab(String tabName)
{
    Locator tab = Locator.css(".report-tab").containing(tabName);
    clickAndWait(tab);
    waitForElement(Locator.css(".report-content"));
}

// ============================================
// ID Resolution Assertions
// ============================================

private void assertIdResolutionVisible(boolean shouldBeVisible)
{
    if (shouldBeVisible)
        assertElementPresent(Locator.css(".id-resolution-feedback"));
    else
        assertElementNotPresent(Locator.css(".id-resolution-feedback"));
}

private void assertResolvedContains(String inputId, String resolvedId, String aliasType)
{
    // For alias matches: "TATTOO_001 → ID123 (tattoo)"
    Locator resolved = Locator.css(".resolved-section")
        .containing(inputId)
        .containing(resolvedId)
        .containing(aliasType);
    assertElementPresent(resolved);
}

private void assertResolvedContains(String directId)
{
    // For direct matches: just the ID
    Locator resolved = Locator.css(".resolved-section").containing(directId);
    assertElementPresent(resolved);
}

private void assertNotFoundContains(String id)
{
    assertElementPresent(Locator.css(".not-found-section").containing(id));
}

// ============================================
// Validation Assertions
// ============================================

private void assertValidationError(String expectedMessage)
{
    Locator validationError = Locator.css(".validation-error").containing(expectedMessage);
    assertElementPresent(validationError);
    assertTrue("Validation error should be visible",
               validationError.findElement(getDriver()).isDisplayed());
}

private void assertNoValidationError()
{
    assertElementNotPresent(Locator.css(".validation-error"));
}

private void assertErrorMessage(String expectedMessage)
{
    Locator error = Locator.css(".filter-error, .error-message").containing(expectedMessage);
    assertElementPresent(error);
}

private void assertNoErrorMessage()
{
    assertElementNotPresent(Locator.css(".filter-error, .error-message"));
}

// ============================================
// Report Content Assertions
// ============================================

private void assertReportContainsAnimal(String animalId)
{
    waitForElement(Locator.css(".report-content"));
    assertTextPresent(animalId);
}

private void assertReportDoesNotContainAnimal(String animalId)
{
    waitForElement(Locator.css(".report-content"));
    assertTextNotPresent(animalId);
}

private void assertReportShowsMultipleAnimals()
{
    waitForElement(Locator.css(".report-content"));
    // Verify more than one row in the report grid
    Locator rows = Locator.css(".report-content tr, .report-content .data-row");
    assertTrue("Report should show multiple animals",
               getElementCount(rows) > 1);
}

// ============================================
// Button State Assertions
// ============================================

private void assertFilterButtonState(String buttonText, boolean shouldBeEnabled)
{
    Locator button = Locator.button(buttonText);
    assertElementPresent(button);

    if (shouldBeEnabled)
        assertElementPresent(button.notWithClass("disabled"));
    else
        assertElementPresent(button.withClass("disabled"));
}

private void assertFilterButtonActive(String buttonText)
{
    Locator button = Locator.button(buttonText).withClass("active");
    assertElementPresent(button);
}

private void assertSearchByIdsButtonEnabled(boolean shouldBeEnabled)
{
    Locator button = Locator.button("Search By Ids");
    assertElementPresent(button);

    boolean isDisabled = button.findElement(getDriver()).getAttribute("disabled") != null;

    if (shouldBeEnabled)
        assertFalse("Search By Ids button should be enabled", isDisabled);
    else
        assertTrue("Search By Ids button should be disabled", isDisabled);
}

private void assertFilterButtonsVisible(boolean shouldBeVisible)
{
    Locator buttonContainer = Locator.css(".button-container");
    if (shouldBeVisible)
    {
        assertElementPresent(buttonContainer);
        assertTrue("Filter buttons should be visible",
                   buttonContainer.findElement(getDriver()).isDisplayed());
    }
    else
    {
        if (isElementPresent(buttonContainer))
        {
            assertFalse("Filter buttons should not be visible",
                       buttonContainer.findElement(getDriver()).isDisplayed());
        }
    }
}

// ============================================
// Textarea State Assertions
// ============================================

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
        if (isElementPresent(textarea))
        {
            assertFalse("Textarea should not be visible",
                       textarea.findElement(getDriver()).isDisplayed());
        }
    }
}

private void assertTextareaCleared()
{
    Locator textarea = Locator.css("textarea.animal-id-input");
    String value = textarea.findElement(getDriver()).getAttribute("value");
    assertTrue("Textarea should be empty", value == null || value.isEmpty());
}

private void assertTextareaEmpty()
{
    assertTextareaCleared();
}

private void assertTextareaContains(String expectedText)
{
    Locator textarea = Locator.css("textarea.animal-id-input");
    String value = textarea.findElement(getDriver()).getAttribute("value");
    assertTrue("Textarea should contain: " + expectedText,
               value != null && value.contains(expectedText));
}

// ============================================
// URL Assertions
// ============================================

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

private String buildUrlWithParams(String filterType, String[] subjects, boolean readOnly)
{
    StringBuilder url = new StringBuilder(getProjectHome() + "/ehr-participantViewNew.view");
    url.append("#filterType:").append(filterType);

    if (subjects != null && subjects.length > 0)
        url.append("&subjects:").append(String.join(";", subjects));

    if (readOnly)
        url.append("&readOnly:true");

    return url.toString();
}

// ============================================
// Keyboard/Accessibility Methods
// ============================================

private void pressTab()
{
    getDriver().switchTo().activeElement().sendKeys(Keys.TAB);
}

private void pressEnter()
{
    getDriver().switchTo().activeElement().sendKeys(Keys.ENTER);
}

private void pressSpace()
{
    getDriver().switchTo().activeElement().sendKeys(Keys.SPACE);
}

private void sendKeys(String text)
{
    getDriver().switchTo().activeElement().sendKeys(text);
}

private void assertFocusedElement(Locator expectedElement)
{
    WebElement focused = getDriver().switchTo().activeElement();
    WebElement expected = expectedElement.findElement(getDriver());
    assertEquals("Expected element should be focused", expected, focused);
}

private WebElement getFocusedElement()
{
    return getDriver().switchTo().activeElement();
}

private void assertElementHasClass(WebElement element, String className)
{
    String classes = element.getAttribute("class");
    assertTrue("Element should have class: " + className,
               classes != null && classes.contains(className));
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

---

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

Feature Area: `ehrParticipantHistoryFilter`

Metrics use FilterType values directly:
- [x] `idSearch` - Tracks when user performs a successful ID search (after IDs are resolved)
- [x] `all` - Tracks when user selects "All Animals" filter (clicks "All Animals" button)
- [x] `aliveAtCenter` - Tracks when user selects "All Alive at Center" filter (clicks "All Alive at Center" button)
- [x] `urlParams` - Tracks when filter mode changes to URL Params mode

[image1]: images/animal-history-search-by-id-mockup.png "Animal History Search By Id Interface"