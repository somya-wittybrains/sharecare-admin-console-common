import React from 'react';
import { getProfileColor } from 'utils';
import { useAuthStore } from 'model/hooks';
import { Label } from 'semantic-ui-react';

const ProfileTag = ({ profileName, size, style }) => {
  const authStore = useAuthStore();
  const profileColor = getProfileColor(profileName, authStore.profiles);
  size = size || 'medium';
  return profileName ? (
    <>
      <Label
        style={{
          backgroundColor: profileColor || 'grey',
          color: '#fff',
          ...style
        }}
        size={size}
      >
        {profileName}
      </Label>
    </>
  ) : (
    <></>
  );
};

export default ProfileTag;
