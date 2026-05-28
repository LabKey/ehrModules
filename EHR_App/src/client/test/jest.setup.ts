/*
 * Copyright (c) 2023-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
import '@testing-library/jest-dom'; // add custom jest matchers from jest-dom

// This silences errors related to components using window.scrollTo. JSDom doesn't implement scrollTo, but that is ok,
// we aren't testing that behavior.
const noop = () => {};
Object.defineProperty(window, 'scrollTo', { value: noop, writable: true });
