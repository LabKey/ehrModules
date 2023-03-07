
export const MODEL_ID_GRID_1 = 'model-id-grid-1';
export const MODEL_ID_GRID_2 = 'model-id-grid-2';

export interface FormHook {
    component: string
    componentPath: string
}

export interface FormHooks {
    [hook: string]: FormHook
}

export interface FormConfig {
    form: string,
    hooks?: FormHooks
}