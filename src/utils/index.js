import React from 'react';
import { v1 as uuid } from 'uuid';
import ProfileTag from 'controls/ProfileTag';
import { Branch } from '../model/Tree';
import { t } from 'translate';
import { omitBy , isEmpty} from 'lodash';

export const formQueryString = params => {
  const searchParams = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) searchParams.set(k, v);
  }
  return searchParams.toString();
};
export const numberWithCommas = value => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const getSubdomain = () => window.location.host.split('.')[0];

export const isURLValid = url => {
  return url && url.match(/^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/gm);
};

export const getValueProductDetails = (productDetails, key) => {
  if (productDetails) {
    const productDetailsObject = productDetails.reduce((all, item) => {
      all[item.key] = item.value;
      return all;
    }, {});
    return productDetailsObject ? productDetailsObject[key] : '';
  }
  return '';
};

export const getUniqueOfferingId = (prefix = 'SC_AUDIENCES') =>
  `${prefix}_${uuid().toUpperCase()}`;

export const isSharecareConsumer = sponsorId => {
  return sponsorId && sponsorId.indexOf('SC_CONSUMER') !== -1;
};
export const isPhoneNumberValid = phoneNumber => {
  if (!phoneNumber || !phoneNumber.trim()) return true;
  const rawPhoneNumber = phoneNumber.trim().replace(/[ +)(-]/g, '');

  const validatorFormattedNumber = {
    7: /^((\d{3}-\d{4})|(\d{3} \d{4}))$/,
    8: /^((\d{3}-\d{2}-\d{3})|(\d{3} \d{2} \d{3})|\d{3} \d{5})$/,
    9: /^((\d{3} \d{3} \d{3})|(\d{3}-\d{3}-\d{3})|(\d{4}-\d{3}-\d{2})|(\d{4} \d{3} \d{2})|(\d{4} \d{2} \d{3})|\d{4} \d{5}|\d{3}-\d{2} \d{2} \d{2}|\d{3} \d{2} \d{4})$/,
    10: /^((\d{1} \d{3} \d{3} \d{3})|(\d{1}-\d{3}-\d{3}-\d{3})|(\d{2} \d{3} \d{2} \d{3})|(\d{2}-\d{3}-\d{2}-\d{3})|(\d{3}-\d{3}-\d{4})|(\d{3} \d{3} \d{4})|(\d{3} \d{3} \d{2} \d{2})|(\d{3}-\d{3}-\d{2}-\d{2})|(\d{4} \d{3} \d{3})|\d{4}-\d{3}-\d{3}|\d{2} \d{2} \d{2} \d{2} \d{2}|\d{2} \d{2} \d{3} \d{3}|\d{1} \d{3} \d{3}-\d{3}|\d{3} \d{7}|\d{1} \d{3} \d{6})$/,
    11: /^(\+\d{11})|((\d{1} \d{3} \d{3} \d{4})|(\d{1}-\d{3}-\d{3}-\d{4})|(\+\d{1} \d{3} \d{3} \d{4})|(\+\d{1}-\d{3}-\d{3}-\d{4})|(\+\d{1} \d{3}-\d{3}-\d{4})|(\(\+\d{1}\) \d{3}-\d{3}-\d{4})|(\d{2} \d{3} \d{2} \d{4})|(\d{2}-\d{3}-\d{2}-\d{4})|(\d{3} \d{4} \d{4})|(\d{3}-\d{4}-\d{4})|(\+\d{3} \d{4} \d{4})|(\+\d{3}-\d{4}-\d{4})|(\d{4} \d{3} \d{4})|(\d{4}-\d{3}-\d{4})|\d{1} \d{3} \d{7}|\d{4} \d{7}|\d{2} \d{1} \d{2} \d{2} \d{2} \d{2})$/,
    12: /^(\+\d{12})| |((\d{1} \d{4} \d{3} \d{4})|(\d{4} \d{4} \d{4})|(\d{1}-\d{4}-\d{3}-\d{4})|(\d{2} \d{3} \d{3} \d{4})|(\d{2}-\d{3}-\d{3}-\d{4})|(\+\d{2}-\d{3}-\d{3}-\d{4})|(\+\d{2} \d{3}-\d{3}-\d{4})|(\(\+\d{2}\) \d{3}-\d{3}-\d{4})|(\d{3} \d{4} \d{2} \d{3})|(\d{3}-\d{4}-\d{2}-\d{3})|(\+\d{3} \d{1} \d{4} \d{4})|(\d{4} \d{8}))$/,
    13: /^(\+\d{13})|(\+\d{3} \d{2} \d{4} \d{4})|(\+\d{3}-\d{3}-\d{3}-\d{4})|(\d{3}-\d{3}-\d{3}-\d{4})|(\d{3} \d{3} \d{3} \d{4})|(\+\d{3} \d{3}-\d{3}-\d{4})|(\(\+\d{3}\) \d{3}-\d{3}-\d{4})|(\d{4} \d{2} \d{2} \d{2} \d{2} \d{1})|(\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{1})|(\d{6} \d{3} \d{4})$/,
    16: /^((\d{2} \d{3} \d{4} \d{3} \d{4})|(\d{2}-\d{3}-\d{4}-\d{3}-\d{4}))$/,
    14: /^(\+\d{14})$/
  };

  const validatorRawNumber = {
    7: /^\d{7}$/,
    8: /^\d{8}$/,
    9: /^\d{9}$/,
    10: /^\d{10}$/,
    11: /^\d{11}$/,
    12: /^\d{12}$/,
    13: /^\d{13}$/,
    16: /^\d{16}$/,
    14: /^\d{14}$/
  };

  if (!validatorFormattedNumber[`${rawPhoneNumber.length}`]) return false;

  return (
    phoneNumber.match(validatorFormattedNumber[`${rawPhoneNumber.length}`]) ||
    (validatorRawNumber[`${phoneNumber.length}`] &&
      phoneNumber.match(validatorRawNumber[`${phoneNumber.length}`]))
  );
};

export const formatPhoneNumber = phoneNumber => {
  //var rawValueRegExp = /^(\d{10}|\d{11}|\d{12}|\d{13}|\d{7}|\d{8}|\d{9})$/;
  //const rawValueMatch = phoneNumber.match(rawValueRegExp);
  /*if (phoneNumber && rawValueMatch && phoneNumber.length === 10)
    return (
      '' +
      phoneNumber.substr(0, 3) +
      '-' +
      phoneNumber.substr(3, 3) +
      '-' +
      phoneNumber.substr(6, 4)
    );
  if (phoneNumber && rawValueMatch && phoneNumber.length === 11)
    return (
      '(+' +
      phoneNumber.substr(0, 1) +
      ') ' +
      phoneNumber.substr(1, 3) +
      '-' +
      phoneNumber.substr(4, 3) +
      '-' +
      phoneNumber.substr(7, 4)
    );
  if (phoneNumber && rawValueMatch && phoneNumber.length === 12)
    return (
      '(+' +
      phoneNumber.substr(0, 2) +
      ') ' +
      phoneNumber.substr(2, 3) +
      '-' +
      phoneNumber.substr(5, 3) +
      '-' +
      phoneNumber.substr(8, 4)
    );
  if (phoneNumber && rawValueMatch && phoneNumber.length === 13)
    return (
      '(+' +
      phoneNumber.substr(0, 3) +
      ') ' +
      phoneNumber.substr(3, 3) +
      '-' +
      phoneNumber.substr(6, 3) +
      '-' +
      phoneNumber.substr(9, 4)
    );*/
  return phoneNumber;
};

export const MARKETING_PROGRAMS = {
  '/marketing-program/milestone': [
    {
      programName: 'Muscle and Joint Health',
      programCode: ['SC_DGTL_SWORD_MSK'],
      programKey: 'SC_DGTL_SWORD_MSK',
      programEvents: [
        {
          eventName: 'Complete First Session',
          activityDetail: 'SC_DGTL_SWORD_MSK:progressGoal1'
        },
        {
          eventName: 'Complete Three Sessions',
          activityDetail: 'SC_DGTL_SWORD_MSK:progressGoal2'
        },
        {
          eventName: 'Complete Program',
          activityDetail: 'SC_DGTL_SWORD_MSK:successfulProgramCompletion'
        }
      ]
    },
    {
      programName: 'Meta - Move',
      programCode: ['SC_DGTL_META_MOVE'],
      programKey: 'SC_DGTL_META_MOVE',
      programEvents: [
        {
          eventName: 'First Activity Minute Tracked',
          activityDetail: 'SC_DGTL_META_MOVE:progressGoal1'
        }
      ]
    },
    {
      programName: 'Tobacco Cessation',
      programCode: ['SC_DGTL_MS_TC', 'SC_DGTL_MS_TCNRT'],
      programKey: 'SC_DGTL_MS_TCNRT',
      programEvents: [
        {
          eventName: 'Complete All Modules',
          activityDetail:
            'SC_DGTL_MS_TC:moduleCompletionAll,SC_DGTL_MS_TCNRT:moduleCompletionAll'
        },
        {
          eventName: '50% Smoking Reduction',
          activityDetail:
            'SC_DGTL_MS_TC:progressGoal2,SC_DGTL_MS_TCNRT:progressGoal2'
        },
        {
          eventName: 'Quit Smoking',
          activityDetail:
            'SC_DGTL_MS_TC:progressGoal3,SC_DGTL_MS_TCNRT:progressGoal3'
        }
      ]
    },
    {
      programName: 'Tobacco Cessation',
      programCode: ['SC_DGTL_MS_TC', 'SC_DGTL_MS_TCNRT'],
      programKey: 'SC_DGTL_MS_TC',
      programEvents: [
        {
          eventName: 'Complete All Modules',
          activityDetail:
            'SC_DGTL_MS_TC:moduleCompletionAll,SC_DGTL_MS_TCNRT:moduleCompletionAll'
        },
        {
          eventName: '50% Smoking Reduction',
          activityDetail:
            'SC_DGTL_MS_TC:progressGoal2,SC_DGTL_MS_TCNRT:progressGoal2'
        },
        {
          eventName: 'Quit Smoking',
          activityDetail:
            'SC_DGTL_MS_TC:progressGoal3,SC_DGTL_MS_TCNRT:progressGoal3'
        }
      ]
    },
    {
      programName: 'Unwinding Anxiety',
      programCode: ['SC_DGTL_MS_ANXIETY'],
      programKey: 'SC_DGTL_MS_ANXIETY',
      programEvents: [
        {
          eventName: 'Complete All Modules',
          activityDetail: 'SC_DGTL_MS_ANXIETY:moduleCompletionAll'
        }
      ]
    },
    {
      programName: 'Financial Well-being',
      programCode: ['SC_DGTL_DRAM_FINANCIALWB'],
      programKey: 'SC_DGTL_DRAM_FINANCIALWB',
      programEvents: [
        {
          eventName: '50% Points Earned',
          activityDetail: 'SC_DGTL_DRAM_FINANCIALWB:pointGoalPct'
        },
        {
          eventName: '100% Points Earned',
          activityDetail: 'SC_DGTL_DRAM_FINANCIALWB:pointGoalAchieved'
        }
      ]
    },
    {
      programName: 'Diabetes Prevention',
      programCode: ['SC_DGTL_FS_DPP'],
      programKey: 'SC_DGTL_FS_DPP',
      programEvents: [
        {
          eventName: 'Achieve 5% Weight Loss',
          activityDetail: 'SC_DGTL_FS_DPP:successfulProgramCompletion'
        }
      ]
    },
    {
      programName: 'Diabetes Education',
      programCode: ['SC_DGTL_SC_DSME'],
      programKey: 'SC_DGTL_SC_DSME',
      programEvents: [
        {
          eventName: 'Program Completion',
          activityDetail: 'SC_DGTL_SC_DSME:successfulProgramCompletion'
        }
      ]
    },
    {
      programName: 'Quit Tobacco Guide',
      programCode: ['SC_DGTL_SC_TOB_GUIDE'],
      programKey: 'SC_DGTL_SC_TOB_GUIDE',
      programEvents: [
        {
          eventName: 'Complete All Modules',
          activityDetail: 'SC_DGTL_SC_TOB_GUIDE:successfulProgramCompletion'
        }
      ]
    },
    {
      programName: 'Scale Back',
      programCode: ['SC_DGTL_FS_DPP_WL'],
      programKey: 'SC_DGTL_FS_DPP_WL',
      programEvents: [
        {
          eventName: 'Achieve 5% Weight Loss',
          activityDetail: 'SC_DGTL_FS_DPP_WL:successfulProgramCompletion'
        }
      ]
    },
    {
      programName: 'Eat Right Now',
      programCode: ['SC_DGTL_MS_ERN', 'SC_DGTL_MS_ERN_CM'],
      programKey: 'SC_DGTL_MS_ERN',
      programEvents: [
        {
          eventName: 'Complete All Modules',
          activityDetail:
            'SC_DGTL_MS_ERN:moduleCompletionAll,SC_DGTL_MS_ERN_CM:moduleCompletionAll'
        }
      ]
    },
    {
      programName: 'Eat Right Now',
      programCode: ['SC_DGTL_MS_ERN', 'SC_DGTL_MS_ERN_CM'],
      programKey: 'SC_DGTL_MS_ERN_CM',
      programEvents: [
        {
          eventName: 'Complete All Modules',
          activityDetail:
            'SC_DGTL_MS_ERN:moduleCompletionAll,SC_DGTL_MS_ERN_CM:moduleCompletionAll'
        }
      ]
    },
    {
      programName: 'Eat Right Now',
      programCode: ['SC_DGTL_MS_ERN_WL', 'SC_DGTL_MS_ERN_WL_CM'],
      programKey: 'SC_DGTL_MS_ERN_WL',
      programEvents: [
        {
          eventName: 'Complete All Modules',
          activityDetail:
            'SC_DGTL_MS_ERN_WL:moduleCompletionAll,SC_DGTL_MS_ERN_WL_CM:moduleCompletionAll'
        }
      ]
    },
    {
      programName: 'Eat Right Now',
      programCode: ['SC_DGTL_MS_ERN_WL', 'SC_DGTL_MS_ERN_WL_CM'],
      programKey: 'SC_DGTL_MS_ERN_WL_CM',
      programEvents: [
        {
          eventName: 'Complete All Modules',
          activityDetail:
            'SC_DGTL_MS_ERN_WL:moduleCompletionAll,SC_DGTL_MS_ERN_WL_CM:moduleCompletionAll'
        }
      ]
    },
    {
      programName: 'Eat Right Now',
      programCode: ['SC_DGTL_MS_ERN_WL_META', 'SC_DGTL_MS_ERN_WL_META_CM'],
      programKey: 'SC_DGTL_MS_ERN_WL_META',
      programEvents: [
        {
          eventName: 'Complete All Modules',
          activityDetail:
            'SC_DGTL_MS_ERN_WL_META:moduleCompletionAll,SC_DGTL_MS_ERN_WL_META_CM:moduleCompletionAll'
        }
      ]
    },
    {
      programName: 'Eat Right Now (ERN) - DPP',
      programCode: ['SC_DGTL_MS_ERN_DPP', 'SC_DGTL_MS_ERN_DPP_WL'],
      programKey: 'SC_DGTL_MS_ERN_DPP',
      programEvents: [
        {
          eventName: '2% Weight Loss',
          activityDetail: 'SC_DGTL_MS_ERN_DPP:progressGoal1'
        },
        {
          eventName: '3.5% Weight Loss',
          activityDetail: 'SC_DGTL_MS_ERN_DPP:progressGoal2'
        },
        {
          eventName: '5% Weight Loss',
          activityDetail: 'SC_DGTL_MS_ERN_DPP:progressGoal3'
        }
      ]
    },
    {
      programName: 'Eat Right Now (ERN) - DPP',
      programCode: ['SC_DGTL_MS_ERN_DPP', 'SC_DGTL_MS_ERN_DPP_WL'],
      programKey: 'SC_DGTL_MS_ERN_DPP_WL',
      programEvents: [
        {
          eventName: '2% Weight Loss',
          activityDetail: 'SC_DGTL_MS_ERN_DPP_WL:progressGoal1'
        },
        {
          eventName: '3.5% Weight Loss',
          activityDetail: 'SC_DGTL_MS_ERN_DPP_WL:progressGoal2'
        },
        {
          eventName: '5% Weight Loss',
          activityDetail: 'SC_DGTL_MS_ERN_DPP_WL:progressGoal3'
        }
      ]
    }
  ],
  '/marketing-program/activity': [
    {
      programName: 'Total Fitness (Combo)',
      programCode: ['SC_DGTL_FITON_COMBO'],
      programKey: 'SC_DGTL_FITON_COMBO',
      programEvents: [
        {
          eventName: 'Visit a Studio',
          activityDetail: 'SC_DGTL_FITON_COMBO:studioVisit'
        },
        {
          eventName: 'Complete Challenge',
          activityDetail: 'SC_DGTL_FITON_COMBO:challengeComplete'
        },
        {
          eventName: 'Complete Program',
          activityDetail: 'SC_DGTL_FITON_COMBO:programComplete'
        },
        {
          eventName: 'Complete Workout',
          activityDetail: 'SC_DGTL_FITON_COMBO:workoutComplete'
        }
      ]
    },
    {
      programName: 'Mental Healthcare',
      programCode: ['SC_DGTL_SPRH_MENTALHC'],
      programKey: 'SC_DGTL_SPRH_MENTALHC',
      programEvents: [
        {
          eventName: 'Complete an Assessment',
          activityDetail: 'SC_DGTL_SPRH_MENTALHC:assessmentCompletion'
        },
        {
          eventName: 'Complete a Moments Exercise',
          activityDetail: 'SC_DGTL_SPRH_MENTALHC:lessonCompletion'
        }
      ]
    },
    {
      programName: 'Mental and Behavioral Health',
      programCode: ['SC_DGTL_SPRH_EAP'],
      programKey: 'SC_DGTL_SPRH_EAP',
      programEvents: [
        {
          eventName: 'Complete an Assessment',
          activityDetail: 'SC_DGTL_SPRH_EAP:assessmentCompletion'
        },
        {
          eventName: 'Complete a Moments Exercise',
          activityDetail: 'SC_DGTL_SPRH_EAP:lessonCompletion'
        }
      ]
    },
    {
      programName: 'Meta - Move',
      programCode: ['SC_DGTL_META_MOVE'],
      programKey: 'SC_DGTL_META_MOVE',
      programEvents: [
        {
          eventName: 'Activate & Turn on Cloud Sync',
          activityDetail: 'SC_DGTL_META_MOVE:devicePairing'
        },
        {
          eventName: 'Met Weekly Goal',
          activityDetail: 'SC_DGTL_META_MOVE:weeklyGoalMet'
        },
        {
          eventName: 'Met Monthly Goal',
          activityDetail: 'SC_DGTL_META_MOVE:monthlyGoalMet'
        }
      ]
    },
    {
      programName: 'Onduo - Hypertension',
      programCode: ['SC_DGTL_OND_BPMGMT'],
      programKey: 'SC_DGTL_OND_BPMGMT',
      programEvents: [
        {
          eventName: 'Device Pairing',
          activityDetail: 'SC_DGTL_OND_BPMGMT:devicePairing'
        },
        {
          eventName: 'App Launch',
          activityDetail: 'SC_DGTL_OND_BPMGMT:appLaunch'
        },
        {
          eventName: 'Tracker Use',
          activityDetail: 'SC_DGTL_OND_BPMGMT:trackerUse'
        }
      ]
    },
    {
      programName: 'Onduo - Condition Management',
      programCode: ['SC_DGTL_OND_CONDMGMT'],
      programKey: 'SC_DGTL_OND_CONDMGMT',
      programEvents: [
        {
          eventName: 'Device Pairing',
          activityDetail: 'SC_DGTL_OND_CONDMGMT:devicePairing'
        },
        {
          eventName: 'App Launch',
          activityDetail: 'SC_DGTL_OND_CONDMGMT:appLaunch'
        },
        {
          eventName: 'Tracker Use',
          activityDetail: 'SC_DGTL_OND_CONDMGMT:trackerUse'
        }
      ]
    },
    {
      programName: 'Pregnancy',
      programCode: ['SC_DGTL_OV_PREGNANCY'],
      programKey: 'SC_DGTL_OV_PREGNANCY',
      programEvents: [
        {
          eventName: 'Engagement',
          activityDetail: 'SC_DGTL_OV_PREGNANCY:appLaunch'
        }
      ]
    },
    {
      programName: 'Parenting',
      programCode: ['SC_DGTL_OV_PARENTING'],
      programKey: 'SC_DGTL_OV_PARENTING',
      programEvents: [
        {
          eventName: 'Engagement',
          activityDetail: 'SC_DGTL_OV_PARENTING:appLaunch'
        }
      ]
    },
    {
      programName: 'Diabetes Prevention',
      programCode: ['SC_DGTL_FS_DPP'],
      programKey: 'SC_DGTL_FS_DPP',
      programEvents: [
        {
          eventName: 'Coaching Call',
          activityDetail: 'SC_DGTL_FS_DPP:classCompletion'
        }
      ]
    },
    {
      programName: 'Fertility',
      programCode: ['SC_DGTL_OV_FERTILITY'],
      programKey: 'SC_DGTL_OV_FERTILITY',
      programEvents: [
        {
          eventName: 'Engagement',
          activityDetail: 'SC_DGTL_OV_FERTILITY:appLaunch'
        }
      ]
    },
    {
      programName: 'Financial Well-being',
      programCode: ['SC_DGTL_DRAM_FINANCIALWB'],
      programKey: 'SC_DGTL_DRAM_FINANCIALWB',
      programEvents: [
        {
          eventName: 'Engagement',
          activityDetail: 'SC_DGTL_DRAM_FINANCIALWB:appLaunch'
        }
      ]
    },
    {
      programName: 'Scale Back',
      programCode: ['SC_DGTL_FS_DPP_WL'],
      programKey: 'SC_DGTL_FS_DPP_WL',
      programEvents: [
        {
          eventName: 'Coaching Call',
          activityDetail: 'SC_DGTL_FS_DPP_WL:classCompletion'
        }
      ]
    },
    {
      programName: 'Onduo',
      programCode: ['SC_DGTL_OND_INSULINMGMT'],
      programKey: 'SC_DGTL_OND_INSULINMGMT',
      programEvents: [
        {
          eventName: 'Engagement',
          activityDetail: 'SC_DGTL_OND_INSULINMGMT:appLaunch'
        }
      ]
    },
    {
      programName: 'Muscle/Joint Health',
      programCode: ['SC_DGTL_FSS_MSK', 'SC_DGTL_FSS_MSK_CM'],
      programKey: 'SC_DGTL_FSS_MSK',
      programEvents: [
        {
          eventName: 'Engagement',
          activityDetail:
            'SC_DGTL_FSS_MSK:appLaunch,SC_DGTL_FSS_MSK_CM:appLaunch'
        }
      ]
    },
    {
      programName: 'Muscle/Joint Health',
      programCode: ['SC_DGTL_FSS_MSK', 'SC_DGTL_FSS_MSK_CM'],
      programKey: 'SC_DGTL_FSS_MSK_CM',
      programEvents: [
        {
          eventName: 'Engagement',
          activityDetail:
            'SC_DGTL_FSS_MSK:appLaunch,SC_DGTL_FSS_MSK_CM:appLaunch'
        }
      ]
    },
    {
      programName: 'Unwinding',
      programCode: ['SC_DGTL_MS_UNWINDING', 'SC_DGTL_MS_UNWINDING_CM'],
      programKey: 'SC_DGTL_MS_UNWINDING',
      programEvents: [
        {
          eventName: 'Complete Mini Program',
          activityDetail:
            'SC_DGTL_MS_UNWINDING:moduleCompletion,SC_DGTL_MS_UNWINDING_CM:moduleCompletion'
        },
        {
          eventName: 'Tool Engagement',
          activityDetail:
            'SC_DGTL_MS_UNWINDING:toolUse,SC_DGTL_MS_UNWINDING_CM:toolUse'
        }
      ]
    },
    {
      programName: 'Unwinding',
      programCode: ['SC_DGTL_MS_UNWINDING', 'SC_DGTL_MS_UNWINDING_CM'],
      programKey: 'SC_DGTL_MS_UNWINDING_CM',
      programEvents: [
        {
          eventName: 'Complete Mini Program',
          activityDetail:
            'SC_DGTL_MS_UNWINDING:moduleCompletion,SC_DGTL_MS_UNWINDING_CM:moduleCompletion'
        },
        {
          eventName: 'Tool Engagement',
          activityDetail:
            'SC_DGTL_MS_UNWINDING:toolUse,SC_DGTL_MS_UNWINDING_CM:toolUse'
        }
      ]
    },
    {
      programName: 'Eat Right Now (ERN) - DPP',
      programCode: ['SC_DGTL_MS_ERN_DPP', 'SC_DGTL_MS_ERN_DPP_WL'],
      programKey: 'SC_DGTL_MS_ERN_DPP',
      programEvents: [
        {
          eventName: 'Module Completion',
          activityDetail: 'SC_DGTL_MS_ERN_DPP:moduleCompletion'
        },
        {
          eventName: 'Benchmark Weigh In',
          activityDetail: 'SC_DGTL_MS_ERN_DPP:weighIn'
        }
      ]
    },
    {
      programName: 'Eat Right Now (ERN) - DPP',
      programCode: ['SC_DGTL_MS_ERN_DPP', 'SC_DGTL_MS_ERN_DPP_WL'],
      programKey: 'SC_DGTL_MS_ERN_DPP_WL',
      programEvents: [
        {
          eventName: 'Module Completion',
          activityDetail: 'SC_DGTL_MS_ERN_DPP_WL:moduleCompletion'
        },
        {
          eventName: 'Benchmark Weigh In',
          activityDetail: 'SC_DGTL_MS_ERN_DPP_WL:weighIn'
        }
      ]
    }
  ],
  '/marketing-program/enroll': [
    {
      programName: 'Muscle and Joint Health',
      programCode: ['SC_DGTL_SWORD_MSK'],
      programKey: 'SC_DGTL_SWORD_MSK',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_SWORD_MSK'
        }
      ]
    },
    {
      programName: 'Total Fitness (Combo)',
      programCode: ['SC_DGTL_FITON_COMBO'],
      programKey: 'SC_DGTL_FITON_COMBO',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_FITON_COMBO'
        }
      ]
    },
    {
      programName: 'Mental Healthcare',
      programCode: ['SC_DGTL_SPRH_MENTALHC'],
      programKey: 'SC_DGTL_SPRH_MENTALHC',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_SPRH_MENTALHC'
        }
      ]
    },
    {
      programName: 'Mental and Behavioral Health',
      programCode: ['SC_DGTL_SPRH_EAP'],
      programKey: 'SC_DGTL_SPRH_EAP',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_SPRH_EAP'
        }
      ]
    },
    {
      programName: 'Onduo - Hypertension',
      programCode: ['SC_DGTL_OND_BPMGMT'],
      programKey: 'SC_DGTL_OND_BPMGMT',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_OND_BPMGMT'
        }
      ]
    },
    {
      programName: 'Onduo - Condition Management',
      programCode: ['SC_DGTL_OND_CONDMGMT'],
      programKey: 'SC_DGTL_OND_CONDMGMT',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_OND_CONDMGMT'
        }
      ]
    },
    {
      programName: 'Tobacco Cessation (NRT)',
      programCode: ['SC_DGTL_SC_TOB_GUIDE'],
      programKey: 'SC_DGTL_SC_TOB_GUIDE',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_SC_TOB_GUIDE'
        }
      ]
    },
    {
      programName: 'Tobacco Cessation',
      programCode: ['SC_DGTL_MS_TC', 'SC_DGTL_MS_TCNRT'],
      programKey: 'SC_DGTL_MS_TC',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_MS_TC,SC_DGTL_MS_TCNRT'
        }
      ]
    },
    {
      programName: 'Tobacco Cessation',
      programCode: ['SC_DGTL_MS_TC', 'SC_DGTL_MS_TCNRT'],
      programKey: 'SC_DGTL_MS_TCNRT',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_MS_TC,SC_DGTL_MS_TCNRT'
        }
      ]
    },
    {
      programName: 'Unwinding Anxiety',
      programCode: ['SC_DGTL_MS_ANXIETY'],
      programKey: 'SC_DGTL_MS_ANXIETY',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_MS_ANXIETY'
        }
      ]
    },
    {
      programName: 'Financial Well-being',
      programCode: ['SC_DGTL_DRAM_FINANCIALWB'],
      programKey: 'SC_DGTL_DRAM_FINANCIALWB',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_DRAM_FINANCIALWB'
        }
      ]
    },
    {
      programName: 'Pregnancy',
      programCode: ['SC_DGTL_OV_PREGNANCY'],
      programKey: 'SC_DGTL_OV_PREGNANCY',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_OV_PREGNANCY'
        }
      ]
    },
    {
      programName: 'Fertility',
      programCode: ['SC_DGTL_OV_FERTILITY'],
      programKey: 'SC_DGTL_OV_FERTILITY',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_OV_FERTILITY'
        }
      ]
    },
    {
      programName: 'Parenting',
      programCode: ['SC_DGTL_OV_PARENTING'],
      programKey: 'SC_DGTL_OV_PARENTING',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_OV_PARENTING'
        }
      ]
    },
    {
      programName: 'Diabetes Prevention',
      programCode: ['SC_DGTL_FS_DPP'],
      programKey: 'SC_DGTL_FS_DPP',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_FS_DPP'
        }
      ]
    },
    {
      programName: 'Diabetes Education',
      programCode: ['SC_DGTL_SC_DSME'],
      programKey: 'SC_DGTL_SC_DSME',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_SC_DSME'
        }
      ]
    },
    {
      programName: 'Scale Back',
      programCode: ['SC_DGTL_FS_DPP_WL'],
      programKey: 'SC_DGTL_FS_DPP_WL',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_FS_DPP_WL'
        }
      ]
    },
    {
      programName: 'Eat Right Now',
      programCode: ['SC_DGTL_MS_ERN', 'SC_DGTL_MS_ERN_CM'],
      programKey: 'SC_DGTL_MS_ERN',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_MS_ERN,SC_DGTL_MS_ERN_CM'
        }
      ]
    },
    {
      programName: 'Eat Right Now',
      programCode: ['SC_DGTL_MS_ERN', 'SC_DGTL_MS_ERN_CM'],
      programKey: 'SC_DGTL_MS_ERN_CM',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_MS_ERN,SC_DGTL_MS_ERN_CM'
        }
      ]
    },
    {
      programName: 'Eat Right Now',
      programCode: ['SC_DGTL_MS_ERN_WL', 'SC_DGTL_MS_ERN_WL_CM'],
      programKey: 'SC_DGTL_MS_ERN_WL',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_MS_ERN_WL,SC_DGTL_MS_ERN_WL_CM'
        }
      ]
    },
    {
      programName: 'Eat Right Now',
      programCode: ['SC_DGTL_MS_ERN_WL', 'SC_DGTL_MS_ERN_WL_CM'],
      programKey: 'SC_DGTL_MS_ERN_WL_CM',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_MS_ERN_WL,SC_DGTL_MS_ERN_WL_CM'
        }
      ]
    },
    {
      programName: 'Eat Right Now',
      programCode: ['SC_DGTL_MS_ERN_WL_META', 'SC_DGTL_MS_ERN_WL_META_CM'],
      programKey: 'SC_DGTL_MS_ERN_WL_META',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_MS_ERN_WL_META,SC_DGTL_MS_ERN_WL_META_CM'
        }
      ]
    },
    {
      programName: 'Onduo',
      programCode: ['SC_DGTL_OND_INSULINMGMT'],
      programKey: 'SC_DGTL_OND_INSULINMGMT',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_OND_INSULINMGMT'
        }
      ]
    },
    {
      programName: 'Eat Right Now (ERN) - DPP',
      programCode: ['SC_DGTL_MS_ERN_DPP', 'SC_DGTL_MS_ERN_DPP_WL'],
      programKey: 'SC_DGTL_MS_ERN_DPP',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_MS_ERN_DPP'
        }
      ]
    },
    {
      programName: 'Eat Right Now (ERN) - DPP',
      programCode: ['SC_DGTL_MS_ERN_DPP', 'SC_DGTL_MS_ERN_DPP_WL'],
      programKey: 'SC_DGTL_MS_ERN_DPP_WL',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_MS_ERN_DPP_WL'
        }
      ]
    },
    {
      programName: 'Muscle/Joint Health',
      programCode: ['SC_DGTL_FSS_MSK', 'SC_DGTL_FSS_MSK_CM'],
      programKey: 'SC_DGTL_FSS_MSK',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_FSS_MSK,SC_DGTL_FSS_MSK_CM'
        }
      ]
    },
    {
      programName: 'Muscle/Joint Health',
      programCode: ['SC_DGTL_FSS_MSK', 'SC_DGTL_FSS_MSK_CM'],
      programKey: 'SC_DGTL_FSS_MSK_CM',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_FSS_MSK,SC_DGTL_FSS_MSK_CM'
        }
      ]
    },
    {
      programName: 'Unwinding',
      programCode: ['SC_DGTL_MS_UNWINDING', 'SC_DGTL_MS_UNWINDING_CM'],
      programKey: 'SC_DGTL_MS_UNWINDING',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_MS_UNWINDING,SC_DGTL_MS_UNWINDING_CM'
        }
      ]
    },
    {
      programName: 'Unwinding',
      programCode: ['SC_DGTL_MS_UNWINDING', 'SC_DGTL_MS_UNWINDING_CM'],
      programKey: 'SC_DGTL_MS_UNWINDING_CM',
      programEvents: [
        {
          eventName: 'Program Enrollment',
          activityDetail: 'SC_DGTL_MS_UNWINDING,SC_DGTL_MS_UNWINDING_CM'
        }
      ]
    }
  ]
};

export const removeMetricsSystemFromLocale = locale => {
  let index = -1;
  index = locale.indexOf('-u-ms-ussystem');
  if (index !== -1) return locale.substr(0, index);
  index = locale.indexOf('-u-ms-metric');
  if (index !== -1) return locale.substr(0, index);
  return locale;
};

export const checkPasswordComplexity = (password = '', rules = {}) => {
  const { complexityRules = [] } = rules || {};
  const complexityRulesFullfilled = new Array(complexityRules.length);
  complexityRules.forEach((rule, index) => {
    const regExp = new RegExp(rule.pattern);
    complexityRulesFullfilled[index] = !!regExp.test(password);
  });
  return complexityRulesFullfilled;
};

export const isUserPasswordValid = (passwordComplexity, rules) => {
  const { complexityRules = [] } = rules || {};
  return (
    passwordComplexity &&
    passwordComplexity.filter(Boolean).length === complexityRules.length
  );
};

export const getProfileColor = (name, profiles) => {
  const matchedProfile = profiles.filter(
    ({ profileName }) => name === profileName
  );
  return matchedProfile?.length ? matchedProfile[0].color : undefined;
};

export const validateSecureUrl = value => {
  const pattern =
    '^(https)://res.cloudinary.com/[Ss][Hh][Aa][Rr][Ee][Cc][Aa][Rr][Ee]/[^ "]+$';
  return !new RegExp(pattern).test(value);
};

export const getProfileEnumOptions = profilesYml =>
  profilesYml.map(({ id, profileName }) => ({
    key: id,
    value: profileName,
    text: (
      <React.Fragment>
        <ProfileTag profileName={profileName} />
      </React.Fragment>
    ),
    content: (
      <React.Fragment>
        <ProfileTag profileName={profileName} />
      </React.Fragment>
    )
  }));

export const getSponsorHeader = sponsorStore =>
  sponsorStore.sponsor && sponsorStore.sponsor.id
    ? sponsorStore.sponsor.id
    : sponsorStore.advocacySponsors.string;

export const intersectAllSponsors = (
  advocacySponsors,
  authStoreSponsors,
  siteSponsors
) => {
  authStoreSponsors = authStoreSponsors.map(sponsor => ({
    id: sponsor.substring(sponsor.lastIndexOf('/') + 1)
  }));
  const advocateAndAuthenticatedUserSponsors = authStoreSponsors.length
    ? advocacySponsors.filter(advocacySponsor =>
        authStoreSponsors.find(
          authenticatedUserSponsor =>
            advocacySponsor.sponsorId === authenticatedUserSponsor.id
        )
      )
    : advocacySponsors;

  const globalAdvocacySponsors = advocateAndAuthenticatedUserSponsors
    .filter(sponsor =>
      siteSponsors.find(siteSponsor => siteSponsor.id === sponsor.sponsorId)
    )
    .sort((a, b) => (a.name > b.name ? 1 : -1));

  return {
    array: globalAdvocacySponsors.map(
      ({ name, hierarchyLevel, sponsorId }) => ({
        name,
        hierarchyLevel,
        id: sponsorId
      })
    ),
    string: globalAdvocacySponsors.map(sponsor => sponsor.sponsorId).toString()
  };
};

// 3 seconds less than their real values defined in SSO to prevent timing issues.
export const REFRESH_TIMEOUT = 35 * 60 * 1000;
export const ACCESS_TIMEOUT = 29 * 60 * 1000;
export const SESSION_REFRESH_DISPLAY_TIMEOUT = 3 * 60 * 1000;
/*export const REFRESH_TIMEOUT = 60000;
export const ACCESS_TIMEOUT = 60000;
export const SESSION_REFRESH_DISPLAY_TIMEOUT = 30000;*/

export const validateFileType = (inputMimeType, accept) => {
  const arr = inputMimeType?.split('/');
  const mimeType = `.${arr[1]}`;
  return (
    (mimeType && accept.toLowerCase().indexOf(mimeType.toLowerCase()) !== -1) ||
    false
  );
};

export const readFileAsBlob = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject;
    reader.onload = () => resolve(dataURLToBlob(reader.result));
    reader.readAsDataURL(file);
  });

export const readRemoteFileAsBlob = async url => {
  let fileBinaryData = null;
  const res = await fetch(url);
  if (res && res.ok && res.status === 200) fileBinaryData = await res.blob();
  return fileBinaryData;
};

export const dataURLToBlob = dataurl => {
  const arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    u8arr = new Uint8Array(bstr.length);
  let n = bstr.length;

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

export const base64ArrayBuffer = arrayBuffer => {
  let base64 = '';
  const encodings =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  const bytes = new Uint8Array(arrayBuffer);
  const byteLength = bytes.byteLength;
  const byteRemainder = byteLength % 3;
  const mainLength = byteLength - byteRemainder;

  let a;
  let b;
  let c;
  let d;
  let chunk;
  for (let i = 0; i < mainLength; i += 3) {
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    a = (chunk & 16515072) >> 18;
    b = (chunk & 258048) >> 12;
    c = (chunk & 4032) >> 6;
    d = chunk & 63;
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }
  if (byteRemainder === 1) {
    chunk = bytes[mainLength];
    a = (chunk & 252) >> 2;
    b = (chunk & 3) << 4;
    base64 += `${encodings[a]}${encodings[b]}==`;
  } else if (byteRemainder === 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
    a = (chunk & 64512) >> 10;
    b = (chunk & 1008) >> 4;
    c = (chunk & 15) << 2;
    base64 += `${encodings[a]}${encodings[b]}${encodings[c]}=`;
  }
  return base64;
};

export const dataURItoBlob = dataURI => {
  const byteString = atob(dataURI);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const int8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    int8Array[i] = byteString.charCodeAt(i);
  }
  const blobObj = new Blob([int8Array], {
    type: 'application/pdf'
  });
  return blobObj;
};

const getParentForPermission = (permission, componentTree) => {
  if (componentTree instanceof Branch) {
    const leaves = componentTree.leaves;
    if (leaves && leaves.find(({ value }) => value === permission)) {
      return componentTree;
    }
    const branches = componentTree.branches;
    if (branches) {
      for (let i = 0; i < branches.length; i++) {
        const parent = getParentForPermission(permission, branches[i]);
        if (parent) {
          return parent;
        }
      }
    }
  }
  return null;
};

export const filterPermissionsOnRestrictionOrder = (
  roles,
  Modules = { moduleRoles: { children: [] } }
) => {
  let finalRoles = [];
  try {
    finalRoles = roles.map(({ module, roles: permissions = [] }) => {
      const componentTree = Modules.moduleRoles.children.find(
        ({ id }) => id === module
      );
      let excludeRoles = [];
      permissions.forEach(permission => {
        const parentBranch = getParentForPermission(permission, componentTree);
        if (parentBranch && parentBranch.name) {
          const leaves = parentBranch.leaves.sort(
            (leave1, leave2) =>
              leave2.restrictiveOrder - leave1.restrictiveOrder
          );
          const excludedPermissions = leaves
            .filter(({ value }) => permissions.includes(value))
            .map(({ value }) => value);
          if (excludedPermissions.length > 1) {
            excludeRoles = [
              ...new Set([
                ...excludeRoles,
                ...excludedPermissions.splice(1, excludedPermissions.length)
              ])
            ];
          }
        }
      });
      return {
        module,
        roles: permissions.filter(
          permission =>
            excludeRoles.length === 0 || !excludeRoles.includes(permission)
        )
      };
    });
  } catch (e) {
    console.log(e);
  }
  return finalRoles;
};

export const getErrorMessage = (errorString, maxLength = 200) =>
  errorString?.length > maxLength || !errorString?.length
    ? t('An Error Occurred')
    : errorString;

export const getMultiSiteSponsors = (sponsor, sponsors) => {
  if (sponsor) return sponsor;
  return sponsors
    .map(sponsorVal => {
      const lastIndex = sponsorVal.lastIndexOf('/');
      if (lastIndex !== -1) {
        return sponsorVal.substr(lastIndex + 1, sponsorVal.length);
      }
      return sponsorVal;
    })
    .join(',');
};

export const logForAnalytics = data => {
  if (window._analytics) window._analytics(data);
};

export const isMemberAssociatedWithLoggedInUser = (members, ssoId) => {
  return !!members.find(({ id: selectedSSOId }) => selectedSSOId === ssoId);
};

export const getMinMaxValues = (
  biometricCategories,
  selectedCategory,
  system = 'metric'
) => {
  if (biometricCategories && selectedCategory) {
    const category = biometricCategories.find(({ categoryValue }) => {
      return categoryValue === selectedCategory;
    });
    if (category && category.measurementProfiles) {
      const measurementProfile = category.measurementProfiles.find(
        ({ measurementSystem }) => {
          return measurementSystem === system;
        }
      );
      if (measurementProfile && measurementProfile.ranges) {
        const normalRange = measurementProfile.ranges.find(({ name }) => {
          return [
            'Normal',
            'Desirable',
            'Ideal',
            'Optimal',
            'Healthy'
          ].includes(name);
        });
        if (normalRange && (normalRange.minimum || normalRange.maximum)) {
          return {
            minValue: normalRange.minimum.value,
            maxValue: normalRange.maximum.value,
            decimalPlaces: measurementProfile.decimalPlaces
          };
        }
      }
      //Handle exceptional conditions - not inline with clinicalinformation API
      if (
        selectedCategory === '2.16.840.1.113883.6.1-2345-7' &&
        system === 'metric'
      ) {
        //TODO: Remove this hardcoding when clinical information API is fixed for Healthy scenario in Non-fasting glucose
        return {
          minValue: 70,
          maxValue: 200,
          decimalPlaces: measurementProfile.decimalPlaces
        };
      } else if (
        selectedCategory === '2.16.840.1.113883.6.1-8280-0' &&
        system === 'metric'
      ) {
        //TODO: Remove this hardcoding when clinical information API is fixed for Healthy scenario in Non-fasting glucose
        return {
          minValue: 25,
          maxValue: 88,
          decimalPlaces: measurementProfile.decimalPlaces
        };
      } else if (
        selectedCategory === '2.16.840.1.113883.6.1-8302-2' &&
        system === 'metric'
      ) {
        //TODO: Remove this hardcoding when clinical information API is fixed for Normal scenario in Height
        return {
          minValue: 122,
          maxValue: 230,
          decimalPlaces: measurementProfile.decimalPlaces
        };
      } else if (
        selectedCategory === '2.16.840.1.113883.6.1-29463-7' &&
        system === 'metric'
      ) {
        //TODO: Remove this hardcoding when clinical information API is fixed for Healthy scenario in Weight
        return {
          minValue: 36,
          maxValue: 136,
          decimalPlaces: measurementProfile.decimalPlaces
        };
      }

      if (measurementProfile && measurementProfile.limits) {
        return {
          minValue: measurementProfile.limits.minimum.value,
          maxValue: measurementProfile.limits.maximum.value,
          decimalPlaces: measurementProfile.decimalPlaces
        };
      }
    }
  }
  return { minValue: undefined, maxValue: undefined };
};

const IMPROVEMENTS = [
  {
    code: '2.16.840.1.113883.6.1-8480-6',
    improvement: '0.05',
    isDecrease: true
  },
  {
    code: '2.16.840.1.113883.6.1-8462-4',
    improvement: '0.05',
    isDecrease: true
  },
  {
    code: '2.16.840.1.113883.6.1-39156-5',
    improvement: '0.05',
    isDecrease: true
  },
  {
    code: '2.16.840.1.113883.6.1-8280-0',
    improvement: '0.05',
    isDecrease: true
  },
  {
    code: '2.16.840.1.113883.6.1-2093-3',
    improvement: '0.05',
    isDecrease: true
  },
  {
    code: '2.16.840.1.113883.6.1-2085-9',
    improvement: '0.05',
    isDecrease: false
  },
  {
    code: '2.16.840.1.113883.6.1-2089-1',
    improvement: '0.05',
    isDecrease: true
  },
  {
    code: '2.16.840.1.113883.6.1-13458-5',
    improvement: '0.05',
    isDecrease: true
  },
  {
    code: '2.16.840.1.113883.6.1-9830-1',
    improvement: '0.05',
    isDecrease: true
  },
  {
    code: '2.16.840.1.113883.6.1-1558-6',
    improvement: '0.05',
    isDecrease: true
  },
  {
    code: '2.16.840.1.113883.6.1-2345-7',
    improvement: '0.05',
    isDecrease: true
  },
  {
    code: '2.16.840.1.113883.6.1-4548-4',
    improvement: '0.05',
    isDecrease: true
  },
  {
    code: '2.16.840.1.113883.6.1-2571-8',
    improvement: '0.05',
    isDecrease: true
  },
  {
    code: '2.16.840.1.113883.6.1-29463-7',
    improvement: '0.05',
    isDecrease: true
  }
];

export const getOutcomesImprovement = eventCode =>
  IMPROVEMENTS.find(({ code }) => {
    return code === eventCode;
  });

export const isProductionURL = () => {
  const hostNameParts = window?.location?.hostname.split('.') || [];
  return (
    hostNameParts.length < 5 &&
    !window?.location?.hostname?.includes('localhost')
  );
};

export const convertToLocalDateFormat = (date, delim = '/') => {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date
  const initialDate = new Date(date);
  const [year, month, day] = [
    initialDate.toLocaleDateString('en-US', { year: 'numeric' }),
    initialDate.toLocaleDateString('en-US', { month: '2-digit' }),
    initialDate.toLocaleDateString('en-US', { day: '2-digit' })
  ];
  return [year, month, day].join(delim);
};

export const convertLocalToUTC = (dateString, options = { delim: '-' }) => {
  const dateTokens = dateString.split(options.delim);
  return new Date(
    dateTokens[0],
    +dateTokens[1] - 1,
    dateTokens[2],
    options.useEndOfDay ? 23 : 0,
    options.useEndOfDay ? 59 : 0,
    options.useEndOfDay ? 59 : 0
  ).toISOString()
}
export const cloneDeep = toCloneObject => {

  return JSON.parse(JSON.stringify(toCloneObject));

};


export const nullSafeObject = (object) => !object ? {} :omitBy(object, (v, k) => v === null || (typeof v === 'object' && isEmpty(v)))

