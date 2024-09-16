

/**
 * Needed for npm start-link to satisfy @labkey/components type checking.
 */
declare const process: {
    env: {
        NODE_ENV: string;
    };
};