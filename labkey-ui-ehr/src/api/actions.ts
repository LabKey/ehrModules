// import { ActionURL, Ajax, Filter, PermissionTypes, Query, Utils } from '@labkey/api';
import {
    SchemaQuery,
    selectRows
} from '@labkey/components';

export interface AnimalHistoryReportCategory {
    category: string;
    reports: string[];
}

export interface AnimalHistoryReports {
    categories: AnimalHistoryReportCategory[];
}

export const getAnimalHistoryReports = async (): Promise<AnimalHistoryReports> => {

    let schemaQuery: SchemaQuery = new SchemaQuery('ehr', 'reports');

    const response = await selectRows({ columns: ['reportname', 'category'], schemaQuery });

    let tempCategories = {};
    response.rows?.forEach(row => {
        let category = row['category'].value;

        if (!tempCategories[category]) {
            tempCategories[category] = [];
        }

        tempCategories[category].push(row['reportname'].value);
    });

    return {
        categories: Object.keys(tempCategories).map(category => {
            return {
                category,
                reports: tempCategories[category]
            }
        })
    };
}