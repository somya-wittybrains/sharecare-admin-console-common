import React, { useState, useEffect } from 'react';
import { t } from 'translate';
import { Icon } from 'semantic-ui-react';
import EnumField from 'controls/form/fields/EnumField';
import { useAdvocacyPresenceContext } from 'controls/AdvocacyPresence/AdvocacyPresence';
import { fetchProfilesData } from 'utils/advocacyProfileUtils';
import AdvocateUsersStore from 'model/AdvocateUsersStore';
import { useAppModelStore } from 'model/hooks';
import { getSubdomain, getSponsorHeader } from 'utils';
import { modelStoreSingleton } from '../../model';
const { restStore } = modelStoreSingleton;

const AdvocacyUserSecletor = ({
  setSelectedUserData,
  // Suppress group used in Five9 use of this component
  suppressGroupFilter,
  // Below props are used in Digital Messaging use of this component
  isColumnView,
  suppressUserSelection,
  onFilteredUsersChange,
  onProfileDataChange,
  onFilterCount,
  sponsorOverride = null
}) => {
  const { sponsorStore, authStore } = useAppModelStore();

  const fetchAdvocateUsers = async () => {
    try {
      return await restStore.fetch(
        `/api/advocacyproxy-sf/v1/advocaterequests/assignee`,
        {
          method: 'GET',
          skip401: true,
          query: {
            sponsorId: sponsorOverride || (sponsorStore.sponsor && sponsorStore.sponsor.id),
            subDomain: getSubdomain()
          },
          headers: {
            'account-id': authStore.accountId,
            'sponsor-id': getSponsorHeader(sponsorStore)
          }
        }
      );
    } catch (e) {
      return [];
    }
  };

  const [advocateUsers, setAdvocateUsers] = useState([]);
  const [profileData, setProfileData] = useState([]);
  useEffect(() => {
    (async () => {
      const advUsers = await fetchAdvocateUsers();
      setAdvocateUsers(advUsers);

      const pData = await fetchProfilesData();
      setProfileData(pData);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [advocateUsersStore, setAdvocateUsersStore] = useState();

  useEffect(() => {
    setAdvocateUsersStore(
      new AdvocateUsersStore(restStore, authStore, sponsorStore)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [specialityData, setSpecialityData] = useState([]);
  const [licensesData, setLicensesData] = useState([]);
  const [groupsData, setGroupsData] = useState([]);
  useEffect(() => {
    if (advocateUsersStore) {
      advocateUsersStore.getGlobalSpecialties().then(data => {
        if (data) {
          setSpecialityData(data);
        }
      });
      advocateUsersStore.getGlobalLicenses().then(data => {
        if (data) {
          setLicensesData(data);
        }
      });
      advocateUsersStore.getGlobalGroups(sponsorOverride).then(data => {
        if (data) {
          setGroupsData(data);
        }
      });
    }
  }, [sponsorOverride, advocateUsersStore]);

  const [userData, setUserData] = useState([]);
  useEffect(() => {
    restStore
      .fetch(`/api/advocacyproxy-sf/v1/members/advocates`, {
        method: 'GET',
        skip401: true,
        query: {
          subDomain: getSubdomain()
        },
        headers: {
          'sponsor-id': sponsorOverride || getSponsorHeader(sponsorStore),
          'account-id': authStore.accountId
        }
      })
      .then(data => {
        setUserData(data);
      })
      .catch(err => {
        setUserData([]);
      });
  }, [sponsorOverride, sponsorStore, authStore]);

  const [profile, setProfile] = useState();

  const [speciality, setSpeciality] = useState();

  const [licenseFilter, setLicenseFilter] = useState();

  const [groupsFilter, setGroupsFilter] = useState();

  const [selectedUser, setSelectedUser] = useState();

  useEffect(() => {
    if (selectedUser) {
      const foundSelectedUserObj = userData.find(
        ({ advocateId }) => `${advocateId}` === selectedUser
      );
      if (foundSelectedUserObj) {
        setSelectedUserData(foundSelectedUserObj);
      } else {
        setSelectedUserData(undefined);
      }
    } else {
      setSelectedUserData(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  const getProfileDisplay = (name, color = '#7F8FA4') => {
    return name ? (
      <div
        style={{
          display: 'inline-flex',
          borderRadius: '5px',
          padding: '2px 6px',
          backgroundColor: color,
          color: '#ffffff',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
          marginTop: '-5px',
          position: 'relative',
          top: '0px',
          left: '-7px'
        }}
      >
        {name}
      </div>
    ) : (
      <></>
    );
  };

  const profileOptions = profileData.map(({ profileName, color }) => ({
    value: profileName,
    text: getProfileDisplay(profileName, color)
  }));

  const specialityOptions = specialityData.map(({ id, name }) => ({
    value: id,
    text: name
  }));

  const licensesOptions = licensesData.map(({ stateLicensureId, name }) => ({
    value: stateLicensureId,
    text: name
  }));

  const groupsOptions = groupsData.map(({ groupId, name }) => ({
    value: groupId,
    text: name
  }));

  const getFilteredUserData = () => {
    return userData.filter(
      ({ profileName, specialties, licensures, groups }) => {
        // Defaulting this way to prevent issue where data contains 'null'
        if (!profileName) profileName = '';
        if (!specialties) specialties = [];
        if (!licensures) licensures = [];
        if (!groups) groups = [];

        let passedFilters = true;
        if (profile) {
          const profileMatch =
            profile.toLowerCase() === profileName.toLowerCase();
          if (!profileMatch) {
            passedFilters = false;
          }
        }
        if (speciality) {
          const hasSpeciality = specialties.find(
            ({ specialtyId }) => specialtyId === speciality
          );
          if (!hasSpeciality) {
            passedFilters = false;
          }
        }
        if (licenseFilter) {
          const hasLicense = licensures.find(
            ({ stateLicensureId }) => stateLicensureId === licenseFilter
          );
          if (!hasLicense) {
            passedFilters = false;
          }
        }
        if (groupsFilter) {
          const hasGroup = groups.find(
            ({ groupId }) => groupId === groupsFilter
          );
          if (!hasGroup) {
            passedFilters = false;
          }
        }
        return passedFilters;
      }
    );
  };

  const filteredUserData = getFilteredUserData();

  // Used to handle other implementations of this component
  useEffect(() => {
    if (onFilteredUsersChange) {
      onFilteredUsersChange(getFilteredUserData());
    }

    if (onFilterCount) {
      let count = [groupsFilter, profile, speciality, licenseFilter].filter(
        Boolean
      ).length;
      onFilterCount(count);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, profile, speciality, licenseFilter, groupsFilter]);

  // Used to handle other implementations of this component
  useEffect(() => {
    if (onProfileDataChange) {
      onProfileDataChange(profileData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData]);

  const foundSelectedUserObj = filteredUserData.find(
    ({ advocateId }) => `${advocateId}` === selectedUser
  );

  if (selectedUser && !foundSelectedUserObj) {
    setSelectedUser(undefined);
    setSelectedUserData(undefined);
  }

  const { state: advocacyPresenceData } = useAdvocacyPresenceContext();
  const getUserPresenceData = ssoId => {
    return advocacyPresenceData[ssoId] || {};
  };

  const userOptions = filteredUserData
    .map(({ advocateId, profileName }) => {
      const matchingProfileObj =
        profileData.find(({ profileName: pName }) => pName === profileName) ||
        {};
      const { color: profileColor } = matchingProfileObj;
      const foundUserObj = advocateUsers.find(
        ({ advocateId: aId }) => aId === advocateId
      );
      if (foundUserObj) {
        const { advocateId, ssoId, advocateName, advocateEmail } = foundUserObj;
        return {
          value: `${advocateId}`,
          text: (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div>
                <Icon
                  name='circle'
                  size='small'
                  style={{
                    color: getUserPresenceData(ssoId).color,
                    marginRight: '10px'
                  }}
                />
              </div>
              <div style={{ fontWeight: 'bold' }}>{advocateName}</div>
              <div style={{ marginLeft: '17px' }}>
                {getProfileDisplay(profileName, profileColor)}
              </div>
            </div>
          ),
          content: (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div>
                <Icon
                  name='circle'
                  size='small'
                  style={{
                    color: getUserPresenceData(ssoId).color,
                    marginRight: '10px'
                  }}
                />
              </div>
              <div>
                <div style={{ fontWeight: 'bold' }}>{advocateName}</div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: '5px',
                    marginLeft: '7px'
                  }}
                >
                  <div>{getProfileDisplay(profileName, profileColor)}</div>
                  <div style={{ fontSize: '13px' }}>{advocateEmail}</div>
                </div>
              </div>
            </div>
          )
        };
      } else {
        return null;
      }
    })
    .filter(Boolean);

  const containerStyle = isColumnView
    ? { padding: '15px 20px' }
    : { padding: '15px 20px' };

  const sectionStyle = isColumnView
    ? { display: 'flex', columnGap: '30px' }
    : {};

  return (
    <div>
      <div style={containerStyle}>
        <div style={sectionStyle}>
          <div style={{ marginBottom: 20, flex: 1 }}>
            <div style={{ display: 'flex', marginBottom: 5 }}>
              <div
                style={{
                  color: '#636467',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                {t('Profile')}
              </div>
            </div>
            <div style={{ height: '45px' }}>
              <EnumField
                label={''}
                id={'profile'}
                placeholder={t('Select Profile')}
                style={{ width: '100%' }}
                value={profile || ''}
                options={profileOptions}
                onChange={value => setProfile(value)}
                clearable
                search
              />
            </div>
          </div>

          {!suppressGroupFilter && (
            <div style={{ marginBottom: 20, flex: 1 }}>
              <div style={{ display: 'flex', marginBottom: 5 }}>
                <div
                  style={{
                    color: '#636467',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}
                >
                  {t('Group')}
                </div>
              </div>
              <EnumField
                label={''}
                id={'group'}
                placeholder={t('Select Group')}
                style={{ width: '100%' }}
                value={groupsFilter || ''}
                options={groupsOptions}
                onChange={value => setGroupsFilter(value)}
                clearable
                search
              />
            </div>
          )}
        </div>

        <div style={sectionStyle}>
          <div style={{ marginBottom: 20, flex: 1 }}>
            <div style={{ display: 'flex', marginBottom: 5 }}>
              <div
                style={{
                  color: '#636467',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                {t('Specialty')}
              </div>
            </div>
            <EnumField
              label={''}
              id={'speciality'}
              placeholder={t('Select Specialty')}
              style={{ width: '100%' }}
              value={speciality || ''}
              options={specialityOptions}
              onChange={value => setSpeciality(value)}
              clearable
              search
            />
          </div>

          <div style={{ marginBottom: 20, flex: 1 }}>
            <div style={{ display: 'flex', marginBottom: 5 }}>
              <div
                style={{
                  color: '#636467',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                {t('License')}
              </div>
            </div>
            <EnumField
              label={''}
              id={'license'}
              placeholder={t('Select License')}
              style={{ width: '100%' }}
              value={licenseFilter || ''}
              options={licensesOptions}
              onChange={value => setLicenseFilter(value)}
              clearable
              search
            />
          </div>
        </div>

        {!suppressUserSelection && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', marginBottom: 5 }}>
              <div
                style={{
                  color: '#636467',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                {t('Assignee')}
              </div>
            </div>
            <div style={{ height: '41px' }}>
              <EnumField
                label={''}
                style={{ width: '100%' }}
                placeholder={t('Search Assignee')}
                value={selectedUser || ''}
                options={userOptions}
                onChange={value => setSelectedUser(value)}
                search
                clearable
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdvocacyUserSecletor;