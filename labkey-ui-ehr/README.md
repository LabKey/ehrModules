# @labkey/ehr

[![Build Status](https://teamcity.labkey.org/app/rest/builds/buildType:(id:LabKey_Trunk_Premium_Ehr_LabkeyEhrJavaScript)/statusIcon)](https://teamcity.labkey.org/viewType.html?buildTypeId=LabKey_Trunk_Premium_Ehr_LabkeyEhrJavaScript)

This package contains React components, models, actions, and utility functions for LabKey EHR applications.

## Setting the Registry Scope

This package is currently available on LabKey's Artifactory package registry and relies on
the `@labkey/api`, `@labkey/components` and `@labkey/build` packages.  To include this package, set the registry in npm
for the `@labkey` scope. This can be done via command line using `npm config`:
```
npm config set @labkey:registry https://labkey.jfrog.io/artifactory/api/npm/libs-client/
```
or via a `.npmrc` file
```
# .npmrc
@labkey:registry=https://labkey.jfrog.io/artifactory/api/npm/libs-client/
```

## Installing the npm package

To install using npm
```
npm install @labkey/ehr
```
You can then import `@labkey/ehr` in your application as follows:
```js
import { TestComponent } from '@labkey/ehr';
```

## Development

### Getting Started
If you are building the components locally, you will need to do the following to prepare your system.

Clone this repository to a local directory.

```sh
git clone https://github.com/LabKey/ehrModules.git # or via ssh
```

Navigate into the /ehrModules/labkey-ui-ehr directory and run:

```sh
npm install --legacy-peer-deps
```

This will install all dependencies for the component packages.
Once this is complete you can utilize npm to build and test the package.

```sh
npm run build
npm test
```

## Related docs from labkey-ui-components repository

- [Linting](https://github.com/LabKey/labkey-ui-components/blob/develop/packages/components/docs/localDev.md#linting)
- [Check package bundle size](https://github.com/LabKey/labkey-ui-components/blob/develop/packages/components/docs/localDev.md#package-bundle-size)
- [Publishing alpha package versions and release verions](https://github.com/LabKey/labkey-ui-components/blob/develop/packages/components/docs/localDev.md#publishing)
- [Merging feature branch changes into develop](https://github.com/LabKey/labkey-ui-components/blob/develop/packages/components/docs/localDev.md#merging-changes-into-develop)
- [Making hotfix patches to a release branch](https://github.com/LabKey/labkey-ui-components/blob/develop/packages/components/docs/localDev.md#making-hotfix-patches-to-a-release-branch)

