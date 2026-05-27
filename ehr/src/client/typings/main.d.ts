/*
 * Copyright (c) 2024-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


/**
 * Needed for npm start-link to satisfy @labkey/components type checking.
 */
declare const process: {
    env: {
        NODE_ENV: string;
    };
};