/*
 * Copyright (c) 2023-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
module.exports = {
  apps: [
    {
      dependencies: ["Ext4", "LDK.context"],
      name: "animalHistoryReact",
      path: "./src/client/AnimalHistory",
      permissionClasses: ["org.labkey.api.security.permissions.ReadPermission"],
      title: "Animal History",
    },
  ],
};
