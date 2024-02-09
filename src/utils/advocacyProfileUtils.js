import Modules from 'modules';
import YAML from 'yaml';

export const getModulesFromRoles = roles => {
  const roleToModuleMap = {};
  const components = Modules.moduleRoles.children;
  components.forEach(({ name, values = [] }) => {
    values.forEach(value => {
      roleToModuleMap[value] = name;
    });
  });

  const foundModules = [];
  roles.forEach(role => {
    const foundModule = roleToModuleMap[role];
    if (foundModule && foundModules.indexOf(foundModule) < 0) {
      foundModules.push(foundModule);
    }
  });

  return foundModules;
};

export const getPermissionsFromRoles = (rawRoles, validRoles = []) => {
  const roles = rawRoles.filter(r => {
    return !!validRoles.find(vr => vr === r);
  });

  const roleToModuleMap = {};
  const components = Modules.moduleRoles.children;
  components.forEach(({ id, values = [] }) => {
    values.forEach(value => {
      roleToModuleMap[value] = id;
    });
  });

  const permissions = [];
  roles.forEach(role => {
    const foundModule = roleToModuleMap[role];

    const foundPermission = permissions.find(
      ({ module }) => module === foundModule
    );

    if (foundPermission) {
      foundPermission.roles.push(role);
    } else if (foundModule) {
      permissions.push({
        module: foundModule,
        roles: [role]
      });
    }
  });

  return permissions;
};

export const fetchProfilesData = async () => {
  const profileYmlFile = await fetch('/profiles.yml');
  const profileYmlRawText = await profileYmlFile.text();

  const rawProfileData = YAML.parse(profileYmlRawText);

  const processedProfileData = Object.keys(rawProfileData).map(key => {
    const {
      'display-name': profileName,
      'display-description': profileDescription,
      'display-color': color,
      roles = []
    } = rawProfileData[key];
    return {
      id: key,
      profileName,
      profileDescription,
      color,
      roles
    };
  });

  return processedProfileData;
};
