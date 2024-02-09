import React from 'react';
import moment from 'moment';
import { memoize } from 'lodash';
import { t } from 'translate';
import SharecareIcon from 'controls/SharecareIcon';
import GlobeIcon from 'controls/GlobeIcon';
import ProviderIcon from 'controls/ProviderIcon';

import { Icon, Popup } from 'semantic-ui-react';

export const fpget = object => key => object[key];

export const formatRepo = fpget({
  uat: t('UAT'),
  prod: t('Production')
});

export const formatPublished = published =>
  published ? t('Published') : t('Unpublished');

export const getHashInUrl = () => {
  let val = window.location.hash;
  if (val.indexOf('#/') !== -1) return val.substr('#/'.length, val.length);
  return null;
};

export const formatTimezone = memoize(tzName =>
  t('(UTC{Z}) {zone} - {timezone}', {
    Z: moment.tz(moment(), tzName).format('Z'),
    zone: moment.tz(moment(), tzName).format('z'),
    timezone: tzName.replace(/_/g, ' ')
  })
);

export const formatTZ = memoize(tzName =>
  t('UTC{Z}', { Z: moment.tz(moment(), tzName).format('Z') })
);

export const formatDateIso = date => moment(date).format('YYYY-MM-DD');

export const formatDate = (timestamp, format) => {
  return moment(timestamp).format(format);
};

export const formatDateTime = (dateToFormat, withTime = false, options = {}) => {
  if (!dateToFormat) return dateToFormat;
  let formatOptions = {};
  options.useUTC && (formatOptions = { timeZone: 'UTC' });
  const dateObject = new Date(dateToFormat);

  const year = dateObject.toLocaleString('en-US', { year: 'numeric', ...formatOptions });
  const month = dateObject.toLocaleString('en-US', { month: '2-digit', ...formatOptions });
  const day = dateObject.toLocaleString('en-US', { day: '2-digit', ...formatOptions });

  let timeString = '';
  if (withTime) {
    timeString = dateObject.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      ...formatOptions
    });
  }
  const formatedDate = withTime ? `${year}/${month}/${day} ${timeString}` : `${year}/${month}/${day}`;
  return formatedDate;
};

export const getChallengeStatus = fpget({
  upcoming: t('Upcoming'),
  past: t('Past'),
  active: t('Active')
});

export const trackerIdToText = (trackerId, trackers) => {
  if (trackers) {
    const tracker = trackers.find(({ value }) => trackerId === value);
    return tracker ? tracker.text : '';
  }
  return '';
};

export const getSponsorType = sponsorUrl => {
  if (sponsorUrl.substr(sponsorUrl.lastIndexOf('/') + 1).startsWith(t('CM_'))) {
    return t('Community');
  }
  if (sponsorUrl.substr(sponsorUrl.lastIndexOf('/') + 1).startsWith(t('SC_'))) {
    return t('Consumer');
  }
  if (sponsorUrl.substr(sponsorUrl.lastIndexOf('/') + 1).startsWith(t('PR_'))) {
    return t('Health System');
  }
  return t('Enterprise');
};

export const getStatusForChallenge = (
  startTimeStamp,
  endTimeStamp,
  gracePeriod
) => {
  const presentDate = new Date();
  const presentEpoch = presentDate.getTime();
  if (presentEpoch < startTimeStamp) {
    return 'Upcoming';
  }
  if (presentEpoch > endTimeStamp + gracePeriod * 86400 * 1000) {
    return 'Past';
  }
  if (
    presentEpoch > endTimeStamp &&
    presentEpoch < endTimeStamp + gracePeriod * 86400 * 1000
  ) {
    return 'Active (Grace)';
  }
  return 'Active';
};

export const renderSponsorIcon = (
  sponsor,
  includeName = false,
  includeLabel = false,
  allColor,
  iconPaddingRight = 10,
  size = ''
) => {
  const position = includeLabel ? 'left' : 'center';
  if (sponsor && sponsor.isGlobal) {
    return (
      <Popup
        inverted
        content={
          !includeName ? (
            t('Global')
          ) : (
            <React.Fragment>
              {t('Global:')}
              <p />
              {sponsor.name}
            </React.Fragment>
          )
        }
        on={'hover'}
        position={`top ${position}`}
        trigger={
          <span>
            <GlobeIcon
              color={allColor || '#2987cd'}
              width={15}
              height={15}
              style={{
                paddingRight: iconPaddingRight || 5,
                position: 'relative',
                top: 2
              }}
            />
            {includeLabel && sponsor.name}
          </span>
        }
      />
    );
  }
  if (sponsor && sponsor.isConsumer) {
    return (
      <Popup
        inverted
        content={
          !includeName ? (
            t('Consumer')
          ) : (
            <React.Fragment>
              {t('Consumer:')}
              <p />
              {sponsor.name}
            </React.Fragment>
          )
        }
        on={'hover'}
        position={`top ${position}`}
        trigger={
          <span>
            <SharecareIcon
              color={allColor || undefined}
              width={15}
              height={15}
              style={{
                paddingRight: iconPaddingRight || 5,
                position: 'relative',
                top: 2
              }}
            />
            {includeLabel && sponsor.name}
          </span>
        }
      />
    );
  }
  if (sponsor && sponsor.isCommunity) {
    return (
      <Popup
        inverted
        content={
          !includeName ? (
            t('Community')
          ) : (
            <React.Fragment>
              {t('Community:')}
              <p />
              {sponsor.name}
            </React.Fragment>
          )
        }
        on={'hover'}
        position={`top ${position}`}
        trigger={
          <span>
            <Icon
              style={{
                color: allColor || '#66a2e7',
                paddingRight: 15
              }}
              name='home'
            />
            {includeLabel && sponsor.name}
          </span>
        }
      />
    );
  }
  if (sponsor && sponsor.isHealthSystem) {
    return (
      <Popup
        inverted
        content={
          !includeName ? (
            t('Health System')
          ) : (
            <React.Fragment>
              {t('Health System:')}
              <p />
              {sponsor.name}
            </React.Fragment>
          )
        }
        on={'hover'}
        position={`top ${position}`}
        trigger={
          <span>
            <ProviderIcon
              color={allColor || undefined}
              width={15}
              height={15}
              style={{
                paddingRight: iconPaddingRight || 5,
                position: 'relative',
                top: 2
              }}
            />
            {includeLabel && sponsor.name}
          </span>
        }
      />
    );
  }
  if (sponsor && sponsor.isEnterprise) {
   return (
      <Popup
        inverted
        content={
          !includeName ? (
            t('Enterprise')
          ) : (
            <React.Fragment>
              {t('Enterprise:')}
              <p />
              {sponsor.name}
            </React.Fragment>
          )
        }
        on={'hover'}
        position={`top ${position}`}
        trigger={
          <span>
            <Icon
              style={{
                color: allColor || '#00bfa5',
                paddingRight: 15
              }}
              name='university'
              size={size}
            />
            {includeLabel && sponsor.name}
          </span>
        }
      />
    );
  }
  return undefined;
};

export const BenfitTabsData = [
  { key: 'Medical', icon: 'first aid', text: 'Medical', value: 'Medical' },
  { key: 'Dental', icon: 'delete', text: 'Dental', value: 'Dental' },
  { key: 'Vision', icon: 'hide', text: 'Vision', value: 'Vision' },
  { key: 'Prescription', icon: 'hide', text: 'prescription', value: 'Hide' }
];

export const carrierOptions = [
  { key: 'Anthem', icon: 'first aid', text: 'Anthem', value: 'Medical' },
  { key: 'Dental', icon: 'delete', text: 'Atena', value: 'Dental' },
  { key: 'Vision', icon: 'hide', text: 'Vision', value: 'Vision' },
  { key: 'Prescription', icon: 'hide', text: 'prescription', value: 'Hide' }
];

export const convertObjectIntoArray = jsonObject => {
  return Object.entries(jsonObject).map(item => ({
    key: item[0],
    value: item[1]
  }));
};

export const convertArrayIntoObject = arrayCollection => {
  return arrayCollection && arrayCollection.length !== 0
    ? arrayCollection?.reduce((all, item) => {
        all[item.key] = item.value;
        return all;
      }, {})
    : {};
};

export const formatGender = (key)=> fpget({
  prefer_not_to_answer: 'Prefer Not To Answer',
  other: t('Other'),
  male: t('Male'),
  female: t('Female')
})(key.toLowerCase());

export const SOURCE_LOCALE = 'en-US';
