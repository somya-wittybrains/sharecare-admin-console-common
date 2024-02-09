import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
//import DateRangePicker from 'react-semantic-ui-datepickers';
//import './react-semantic-ui-datepickers.css';
import moment from 'moment';
import EnumField from 'controls/form/fields/EnumField';
import { Popup } from 'semantic-ui-react';
import { t } from 'translate';

const DateRangePicker = {};
export default observer(
  ({
    label,
    id = 'dateRange',
    style,
    inputStyle,
    error,
    startDate,
    endDate,
    onChange,
    props
  }) => {
    let ranges = {};
    const CUSTOM_DATE_RANGE = 'Custom Date Range';
    ranges[t('Today')] = [moment().startOf('day'), moment().endOf('day')];
    ranges[t('Yesterday')] = [
      moment()
        .startOf('day')
        .subtract(1, 'day'),
      moment()
        .endOf('day')
        .subtract(1, 'day')
    ];
    ranges[t('Last 7 Days')] = [
      moment()
        .startOf('day')
        .subtract(6, 'days'),
      moment().endOf('day')
    ];
    ranges[t('Last 14 Days')] = [
      moment()
        .startOf('day')
        .subtract(13, 'days'),
      moment().endOf('day')
    ];
    ranges[t('Last 30 Days')] = [
      moment()
        .startOf('day')
        .subtract('29', 'days'),
      moment().endOf('day')
    ];
    ranges[CUSTOM_DATE_RANGE] = [null, null];
    const resetCustomData = () => {
      customOption.text = CUSTOM_DATE_RANGE;
      ranges[CUSTOM_DATE_RANGE][0] = customOption.startDate = null;
      ranges[CUSTOM_DATE_RANGE][1] = customOption.endDate = null;
      setDateOptions([...dateOptions]);
    };
    const inputRef = useRef(null);
    const enumRef = useRef(null);
    const [dateOptions, setDateOptions] = useState([
      {
        text: t('Today'),
        value: t('Today'),
        startDate: ranges[t('Today')][0],
        endDate: ranges[t('Today')][1]
      },
      {
        text: t('Yesterday'),
        value: t('Yesterday'),
        startDate: ranges[t('Yesterday')][0],
        endDate: ranges[t('Yesterday')][1]
      },
      {
        text: t('Last 7 Days'),
        value: t('Last 7 Days'),
        startDate: ranges[t('Last 7 Days')][0],
        endDate: ranges[t('Last 7 Days')][1]
      },
      {
        text: t('Last 14 Days'),
        value: t('Last 14 Days'),
        startDate: ranges[t('Last 14 Days')][0],
        endDate: ranges[t('Last 14 Days')][1]
      },
      {
        text: t('Last 30 Days'),
        value: t('Last 30 Days'),
        startDate: ranges[t('Last 30 Days')][0],
        endDate: ranges[t('Last 30 Days')][1]
      },
      {
        text: CUSTOM_DATE_RANGE,
        value: CUSTOM_DATE_RANGE,
        startDate: ranges[CUSTOM_DATE_RANGE][0],
        endDate: ranges[CUSTOM_DATE_RANGE][1]
      }
    ]);

    const getInputValue = (ranges, startDate, endDate) => {
      for (const label in ranges) {
        if (
          label !== CUSTOM_DATE_RANGE &&
          ranges[label][0] &&
          ranges[label][1] &&
          startDate &&
          endDate &&
          (ranges[label][0].format('YYYYMMDD') ===
            startDate.format('YYYYMMDD') &&
            ranges[label][1].format('YYYYMMDD') === endDate.format('YYYYMMDD'))
        ) {
          return label;
        }
      }
      return CUSTOM_DATE_RANGE;
    };
    const [value, setValue] = useState(
      getInputValue(ranges, startDate, endDate)
    );
    const [prevValue, setPrevValue] = useState(value);
    const customOption = dateOptions.find(
      ({ value: selValue }) => selValue === CUSTOM_DATE_RANGE
    );
    useEffect(() => {
      if (value === CUSTOM_DATE_RANGE) {
        if (startDate && endDate) {
          ranges[CUSTOM_DATE_RANGE][0] = startDate;
          ranges[CUSTOM_DATE_RANGE][1] = endDate;
          customOption.startDate = startDate;
          customOption.endDate = endDate;
          customOption.text = `${moment(startDate).format(
            'YYYY/MM/DD'
          )}-${moment(endDate).format('YYYY/MM/DD')}`;
        } else {
          resetCustomData();
        }
        setDateOptions([...dateOptions]);
      } else resetCustomData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, startDate, endDate]);
    return (
      <React.Fragment>
        <div style={{ display: 'flex', position: 'relative' }}>
          <EnumField
            label={label}
            options={dateOptions}
            value={value}
            onChange={changedValue => {
              const selectedOption = dateOptions.find(
                ({ value: selValue }) => selValue === changedValue
              );
              setPrevValue(value);
              setValue(changedValue);
              if (selectedOption.value !== CUSTOM_DATE_RANGE)
                onChange(selectedOption.startDate, selectedOption.endDate);
              else inputRef.current.focus();
            }}
          />
          <button
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              pointerEvents: 'none',
              opacity: '0',
              width: '100%',
              height: '100%'
            }}
            ref={enumRef}
          />
          <Popup
            on={'focus'}
            onClose={() => {
              const selectedOption = dateOptions.find(
                ({ value: selValue }) => selValue === prevValue
              );
              if (
                value === CUSTOM_DATE_RANGE &&
                customOption.text === CUSTOM_DATE_RANGE
              ) {
                onChange(selectedOption.startDate, selectedOption.endDate);
              }
            }}
            content={
              <DateRangePicker
                inline={true}
                onChange={(event, data) => {
                  if (data.value && data.value.length === 2) {
                    onChange(
                      moment(data.value[0]).startOf('day'),
                      moment(data.value[1]).endOf('day')
                    );
                    enumRef.current.click();
                  }
                }}
                type='range'
              />
            }
            trigger={
              <button
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  pointerEvents: 'none',
                  opacity: '0',
                  width: '100%',
                  height: '100%'
                }}
                ref={inputRef}
              />
            }
          />
        </div>
      </React.Fragment>
    );
  }
);
