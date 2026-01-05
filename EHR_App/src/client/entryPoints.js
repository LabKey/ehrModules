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
