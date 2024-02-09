import { makeObservable, observable } from 'mobx';
import GenericStore from 'model/GenericStore';
import { uniqBy, orderBy } from 'lodash';
import { convertValues } from 'utils/units';
import { getMinMaxValues, getOutcomesImprovement } from 'utils';

const debug = require('debug')(
  'modules.rewards.model.ClinicalInformationStore'
);

export default class ClinicalInformationStore extends GenericStore {
  @observable biometricCategories = [];
  @observable ready = false;

  constructor(restStore) {
    debug('ClinicalInformationStore()');
    super();
    makeObservable(this);
    this.restStore = restStore;
  }

  init() {
    if (!this.ready && !this.loading) {
      this.loading = true;
      this.restStore
        .fetch('/api/clinical-information/biometric/categories')
        .then(biometricCategories => {
          this.biometricCategories = biometricCategories;
          this.loading = false;
          this.ready = true;
        });
    }
  }

  getCategory = selection => {
    return this.biometricCategories.find(({ categoryValue }) => {
      return categoryValue === selection;
    });
  };

  getCategoryOptions = () =>
    this.biometricCategories.map(({ categoryValue, name }) => {
      return { value: categoryValue, text: name };
    });

  convertUSToMetric = (selectedCategory, value) => {
    return this.convertMeasurementSystem(
      selectedCategory,
      'us',
      'metric',
      value
    );
  };

  convertMetricToUS = (selectedCategory, value) => {
    return (
      this.convertMeasurementSystem(selectedCategory, 'metric', 'us', value) ||
      {}
    );
  };

  convertMeasurementSystem = (
    selectedCategory,
    fromProfile,
    toProfile,
    value
  ) => {
    if (this.biometricCategories && selectedCategory) {
      const category = this.getCategory(selectedCategory);
      if (
        category &&
        category.measurementProfiles &&
        category.measurementProfiles.length > 0
      ) {
        const fromMeasurementProfile = category.measurementProfiles.find(
          ({ measurementSystem }) => {
            return measurementSystem === fromProfile;
          }
        );
        const toMeasurementProfile = category.measurementProfiles.find(
          ({ measurementSystem }) => {
            return measurementSystem === toProfile;
          }
        );
        const convertedValue = convertValues(
          value,
          fromMeasurementProfile.unit,
          toMeasurementProfile.unit,
          toMeasurementProfile.decimalPlaces
        );
        if (
          convertedValue &&
          convertedValue.value !== undefined &&
          convertedValue.value !== null
        ) {
          return convertedValue;
        } else {
          return {};
        }
      }
    }
  };

  getDefaultMinMaxValues = (selectedCategory, system) => {
    return getMinMaxValues(this.biometricCategories, selectedCategory, system);
  };

  getDefaultOutcomesPercent = selectedCategory => {
    return getOutcomesImprovement(selectedCategory);
  };

  isOutcomePercentDecrease = selectedCategory => {
    const outcomesImprovement = getOutcomesImprovement(selectedCategory);
    if (outcomesImprovement) return outcomesImprovement.isDecrease;
    return null;
  };

  getMetricMeasurementUnit = selectedCategory => {
    const measurementProfiles = this.getMeasurementUnits(selectedCategory);
    if (measurementProfiles) {
      const unit = measurementProfiles.find(({ measurementSystem }) => {
        return measurementSystem === 'metric';
      });
      if (unit) return unit.value;
    }
    return '';
  };

  getUSMeasurementUnit = selectedCategory => {
    const measurementProfiles = this.getMeasurementUnits(selectedCategory);
    if (measurementProfiles) {
      const unit = measurementProfiles.find(({ measurementSystem }) => {
        return measurementSystem === 'us';
      });
      if (unit) return unit.value;
    }
    return '';
  };

  getMeasurementUnits = selectedCategory => {
    if (this.biometricCategories && selectedCategory) {
      const category = this.getCategory(selectedCategory);
      if (category && category.measurementProfiles) {
        const units = orderBy(
          uniqBy(
            category.measurementProfiles.map(({ unit, measurementSystem }) => {
              return {
                value: unit,
                text: unit,
                measurementSystem
              };
            }),
            'value'
          ),
          ['measurementSystem'],
          ['desc']
        );
        return units;
      }
    }
    return [];
  };
}
