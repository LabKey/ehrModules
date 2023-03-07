import { ComponentKeys, initQueryGridState } from '@labkey/components';
import CustomEHRFormButtons from "./buttons/CustomEHRFormButtons";
import DefaultEHRFormButtons from "./buttons/DefaultEHRFormButtons";
import { fromJS } from 'immutable';
import { AnimalIdInputRenderer } from "./AnimalIdInputRenderer";

// List of base EHR components used in EHR hooks. This would be in @labkey/ehr
export const EHRComponents: ComponentKeys = {
    defaultEHRFormButtons: DefaultEHRFormButtons
}

// List of custom components defined for EHR hooks. This would be in the custom module.
export const CustomComponents: ComponentKeys = {
    customEHRFormButtons: CustomEHRFormButtons,
    defaultEHRFormButtons: DefaultEHRFormButtons
}

export const metadataSetup = () => {
    initQueryGridState(QUERY_METADATA, COLUMN_RENDERERS);
}

const QUERY_METADATA = fromJS({
    concepts: {
        'http://cpas.labkey.com/study#participantid': {
            inputRenderer: AnimalIdInputRenderer
        }
    }
});

export const COLUMN_RENDERERS = {
    // animalIdRenderer: AnimalIdInputRenderer,
}