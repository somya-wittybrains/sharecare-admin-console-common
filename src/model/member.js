import computeObjectDelta from 'model/computeObjectDelta';

export const DEFAULT_ENTITY = () => {
  return {
    id: '',
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    additionalEmails: [],
    gender: '',
    genderIdentity: '',
    dateOfBirth: 0,
    phoneNumber: '',
    postalCode: '',
    country: '',
    segments: ['global>sc'],
    properties: {},
    created: null,
    modified: null,

    get primaryEmail() {
      return getPrimaryEmail(this);
    }
  };
};

export function getPrimaryEmail(member) {
  if (member.email) return member.email;
  if (Array.isArray(member.emails)) return member.emails[0].email;
  if (Array.isArray(member.additionalEmails)) return member.additionalEmails[0];
  return undefined;
}

export const computeMemberDelta = (memberOld, memberNew) =>
  computeObjectDelta(memberOld, memberNew, ['id']);
