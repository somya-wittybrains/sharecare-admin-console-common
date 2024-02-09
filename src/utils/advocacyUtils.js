import { sortBy, capitalize } from 'lodash';

export const sortByPrimary = (arrayObjects, statusField) =>
  sortBy(arrayObjects, houseHoldMember =>
    houseHoldMember[statusField] === 'PRIMARY' ? -1 : 1
  );

export const canAccessMemberManagement = authStore => {
  const canEditMembers = authStore.hasRole(
    'member-management',
    'CONSOLE_MEMBER_ACCT_EDIT'
  );
  const canManageMembers = authStore.hasRole(
    'member-management',
    'CONSOLE_MEMBER_ACCT_MANAGE'
  );
  const canDeleteMembers = authStore.hasRole(
    'member-management',
    'CONSOLE_MEMBER_ACCT_MANAGE_AND_DELETE'
  );
  const canViewMembers = authStore.hasRole(
    'member-management',
    'CONSOLE_MEMBER_ACCT_VIEW'
  );
  return (
    canDeleteMembers || canEditMembers || canManageMembers || canViewMembers
  );
};

export const canEditUsers = authStore => {
  const canEditUsers = authStore.hasRole(
    'company-profile',
    'CONSOLE_COMPANY_MANAGER'
  );
  const isSuperAdmin = authStore.hasRole(
    'company-profile',
    'CONSOLE_COMPANY_SUPERADMIN'
  );
  return canEditUsers || isSuperAdmin;
};

export const getGender = gender =>
  gender === 'NOT_SPECIFIED' ? 'Unspecified' : capitalize(gender);

export const isAdvocacyManager = authStore =>
  authStore.hasRole('advocacy', 'CONSOLE_ADVOCACY_MANAGER');

export const getModalTitle = advocate =>
  `${advocate.firstName} ${advocate.lastName} (${advocate.userLogin})`;

export const getSpecialtiesIcon = specialtyName => {
  switch (specialtyName) {
    case 'Nurse Advocacy':
      return 'user';
    case 'Family Advocacy':
      return 'users';
    default:
  }
};

export const getAdvocateFullName = (object, truncateLength = 20) => {
  const firstName = object.advocateFirstName || object.firstName || '';
  const lastName = object.advocateLastName || object.lastName || '';
  const fullName = firstName
    ? `${firstName} ${lastName}`
    : lastName || object.advocateName || object.displayName || object.id || '';
  return truncateLength
    ? fullName?.length > truncateLength
      ? `${fullName.substring(0, truncateLength)}...`
      : fullName
    : fullName;
};

export const isExternalUser = (userTypeId, advocateUsersStore) => {
  const selectedUserType = advocateUsersStore?.userTypes.find(
    globalUserType => globalUserType.value === userTypeId
  );
  return selectedUserType?.text === 'External';
};

export const getUserType = (userTypeDescription, advocateUsersStore) =>
  advocateUsersStore?.userTypes.find(
    globalUserType => globalUserType.text === userTypeDescription
  );

export const convertSponsorObjectArrayToSponsorIdArray = sponsors =>
  sponsors.map(({ sponsorId }) => sponsorId);

export const defaultSpecialtyForAdvocateType = (
  advocateDetails,
  sponsorStore
) =>
  advocateDetails?.isHealthAdvocate
    ? sponsorStore.healthAdvocacyName
    : sponsorStore.clinicalAdvocacyName;

export const isEligibleForHealthAdvocacy = memberSponsorships => {
  return memberSponsorships
    ?.filter(
      ({ state }) =>
        state?.toLowerCase() === 'current' ||
        state?.toLowerCase() === 'grace period'
    )
    .some(({ offerings }) => {
      const hasMarketPlaceOfferings = offerings?.marketplace?.some(
        marketplaceOffering =>
          marketplaceOffering === 'SC_ADV_SC_ADVOCACYCLINICALADVOCACY' ||
          marketplaceOffering === 'SC_ADV_SC_ADVOCACY'
      );
      const hasSCMarketPlaceOfferings = offerings?.sc_marketplace?.some(
        marketplaceOffering =>
          marketplaceOffering === 'SC_ADV_SC_ADVOCACYCLINICALADVOCACY' ||
          marketplaceOffering === 'SC_ADV_SC_ADVOCACY'
      );
      return hasMarketPlaceOfferings || hasSCMarketPlaceOfferings;
    });
};
