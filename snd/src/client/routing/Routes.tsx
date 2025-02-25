/*
 * Copyright (c) 2017-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';


import { EditCategories } from '../containers/Wizards/Categories/EditCategories'
import { LandingPage } from '../containers/LandingPage/LandingPage'
import { PackageFormContainer } from '../containers/Packages/Forms/PackageFormContainer'
import { PackageSearch } from '../containers/Packages/Forms/PackageSearch'
import { ProjectSearch } from '../containers/Projects/Forms/ProjectSearch'

import { ProjectFormContainer } from '../containers/Projects/Forms/ProjectFormContainer'

import { NotFound } from '../components/NotFound/NotFound'
import { Crumb } from '../components/Crumb/Crumb'


export interface RouteProps {
    component: React.ComponentClass<RouteComponentProps<any>>;
    exact?: boolean;
    path?: string;
    props?: {crumbNav?: string, crumbName?: string}
}


export const Routes: Array<RouteProps> = [
    {
        component: LandingPage,
        exact: true,
        path: '/',
    },

    {
        component: PackageSearch,
        exact: true,
        path: '/packages',
    },

    {
        component: PackageFormContainer,
        exact: true,
        path: '/packages/new',
    },

    {
        component: PackageFormContainer,
        exact: true,
        path: '/packages/edit/:id',
    },

    {
        component: PackageFormContainer,
        exact: true,
        path: '/packages/view/:id',
    },

    {
        component: PackageFormContainer,
        exact: true,
        path: '/packages/clone/:id',
    },

    {
        component: EditCategories,
        exact: true,
        path: '/categories',
    },

    {
        component: EditCategories,
        exact: true,
        path: '/categories/edit',
    },

    {
        component: ProjectSearch,
        exact: true,
        path: '/projects',
    },

    {
        component: ProjectFormContainer,
        exact: true,
        path: '/projects/new',
    },

    {
        component: ProjectFormContainer,
        exact: true,
        path: '/projects/edit/:idRev',
    },

    {
        component: ProjectFormContainer,
        exact: true,
        path: '/projects/view/:idRev',
    },

    {
        component: ProjectFormContainer,
        exact: true,
        path: '/projects/revise/:idRev',
    },

    {
        component: NotFound
    }
];

export const CrumbRoutes: Array<RouteProps> = [


    {
        component: null,
        exact: true,
        path: '/packages',
    },

    {
        component: null,
        exact: true,
        path: '/projects',
    },

    {
        component: Crumb,
        exact: true,
        path: '/packages/*',
        props: {
            crumbNav: '/packages',
            crumbName: 'Packages'
        }
    },

    {
        component: Crumb,
        exact: true,
        path: '/projects/*',
        props: {
            crumbNav: '/projects',
            crumbName: 'Projects'
        }
    }

];