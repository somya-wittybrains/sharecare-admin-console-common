import { t } from 'translate';

export const checkIfUserCanResetPassword = account => {
  const additionalEmailOverride =
    account.additionalEmails &&
    account.additionalEmails.filter(email => {
      if (email.lastIndexOf('.dis-abled') === -1) return false;
      return (
        email.lastIndexOf('.dis-abled') + '.dis-abled'.length === email.length
      );
    }).length !== 0;
  return account.isActive || additionalEmailOverride;
};

export const isMemberAssociatedWithLoggedInUser = (members, ssoId) => {
  return !!members.find(({ id: selectedSSOId }) => selectedSSOId === ssoId);
};
export const careGapStatusOptions = [
  { text: t('All'), value: 'All' },
  { text: t('Open'), value: 'Open', icon: 'idea' },
  { text: t('Follow-Up'), value: 'Follow-up', icon: 'clock' },
  { text: t('Disputed'), value: 'Disputed', icon: 'close' },
  {
    text: t('Closed'),
    value: 'Closed',
    icon: 'check circle'
  }
];

export const careGapDispositionOptions = [
  { text: t('All'), value: 'all' },
  { text: t('Reviewed'), value: 'Reviewed' },
  { text: t('Not Reviewed'), value: 'Not Reviewed', icon: 'eye' }
];

/*const getOnboardingStatus = sponsorship => {
  const { onboarded, state } = sponsorship;
  const terminatedState = 'TERMINATED';

  const finalStatus =
    onboarded && (state === 'CURRENT' || state === 'GRACE PERIOD')
      ? 'Active'
      : state === terminatedState
      ? 'Terminated'
      : !onboarded && (state === 'CURRENT' || state === 'GRACE PERIOD')
      ? 'Inactive'
      : 'Undefined';
  return finalStatus;
};*/
/*const getActiveSponsorships = (sponsorships = []) => {
  return sponsorships.filter(
    sponsorship => getOnboardingStatus(sponsorship) !== 'Terminated'
  );
};*/

export const filterCareGapsOnShareCareAccount = ({
  caregapSource = '',
  sponsorships
}) => {
  return true;
  // Needs to remove this logic As per Jeremy
  /*const clients = getActiveSponsorships(sponsorships)
    .map(({ clientId }) => clientId)
    .filter(Boolean);
  return (
    !clients.includes('ER_SHARECARE') ||
    (clients.includes('ER_SHARECARE') &&
      caregapSource.toLowerCase() === 'gusto')
  );*/
};