const CONVERSION = [
  { fromUnit: 'kg', toUnit: 'lb', scale: 2.20462262184878 },
  { fromUnit: 'lb', toUnit: 'kg', scale: 0.45359237 },
  { fromUnit: 'lb', toUnit: 'gm', scale: 453.592 },
  { fromUnit: 'kg', toUnit: 'gm', scale: 1000.0 },
  { fromUnit: 'kg', toUnit: 'mg', scale: 1000000.0 },
  { fromUnit: 'gm', toUnit: 'mg', scale: 1000.0 },
  { fromUnit: 'lb', toUnit: 'mg', scale: 453592.0 },
  { fromUnit: 'ft', toUnit: 'in', scale: 12.0 },
  { fromUnit: 'm', toUnit: 'ft', scale: 3.28084 },
  { fromUnit: 'ft', toUnit: 'm', scale: 0.30479 },
  { fromUnit: 'm', toUnit: 'in', scale: 39.3701 },
  { fromUnit: 'cm', toUnit: 'in', scale: 0.393701 },
  { fromUnit: 'cm', toUnit: 'ft', scale: 0.0328084 },
  { fromUnit: 'cm', toUnit: 'm', scale: 0.001 },
  { fromUnit: 'm', toUnit: 'cm', scale: 100.0 },
  { fromUnit: 'ft', toUnit: 'cm', scale: 30.48 },
  { fromUnit: 'sec', toUnit: 'min', scale: 0.0166666666666667 },
  { fromUnit: 'min', toUnit: 'sec', scale: 60 }
];

export const convertValues = (value, unitFrom, unitTo, decimalPlaces = 0) => {
  const convertedValue = {
    origValue: value,
    unitFrom,
    unitTo,
    value: undefined
  };
  if (unitFrom === unitTo) {
    convertedValue.value = value;
  } else {
    const conversion = CONVERSION.find(({ fromUnit, toUnit }) => {
      return fromUnit === unitFrom && toUnit === unitTo;
    });
    if (conversion) {
      convertedValue.value = (value * conversion.scale).toFixed(decimalPlaces);
    } else {
      const inverted = CONVERSION.find(({ fromUnit, toUnit }) => {
        return fromUnit === unitTo && toUnit === unitFrom;
      });
      if (inverted) {
        convertedValue.value = (value / inverted.scale).toFixed(decimalPlaces);
      }
    }
  }
  return convertedValue;
};
// The foot inches dual value conversions have been seperated for simplicity
// this decision and implementation is open to alternative solutions
export const getFtIn = (value, unitFrom) => {
  let convertedValue = {};
  switch (unitFrom) {
    case 'm':
      convertedValue = inToFi(Math.round(value * 39.3701));
      break;
    case 'cm':
    {
      let m = value / 100;
      convertedValue = inToFi(Math.round(m * 39.3701));
    }
      break;
    case 'in':
      convertedValue = inToFi(value);
      break;
    default:
      convertedValue = value;
  }
  return convertedValue;
};
export const fiToM = (f, i) => (f * 12 + i) / 39.3701;

export const fiToCm = (f, i) => fiToM(f, i) * 100;

export const inToFi = totalInches => {
  const inches = Math.floor(totalInches % 12);
  const feet = Math.floor(totalInches / 12);
  return {
    feet,
    inches,
    totalInches,
    string: `${feet} ft. ${inches} in.`,
    stringShort: `${feet}' ${inches}"`
  };
};
