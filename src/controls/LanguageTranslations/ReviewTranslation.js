import React, { useState } from 'react';
import { t } from 'translate';
import { observer } from 'mobx-react-lite';
import { Table } from 'semantic-ui-react';
import EnumField from 'controls/form/fields/EnumField';
import { convertObjectIntoArray } from 'model/formatters';
import LoadingSegment from 'controls/LoadingSegment';
import { useAppModelStore } from 'model/hooks';

const ReviewTranslation = observer(({ translationObject, ready }) => {
  const { localesStore } = useAppModelStore();
  const { defaultLocale, availableLocales } = localesStore;

  const [previewLocale, setPreviewLocale] = useState(defaultLocale.locale);

  const getPreviewLocaleName = previewLocale => {
    const selectedLocale = availableLocales.find(
      ({ locale }) => locale === previewLocale
    );
    return selectedLocale ? selectedLocale.localizedName : '';
  };

  const getTranslatedText = (item, targetLocale) => {
    const selectedLocale =
      targetLocale &&
      item &&
      convertObjectIntoArray(item).filter(
        ({ key }) => targetLocale.replaceAll('-', '_').indexOf(key) !== -1
      );
    return targetLocale && item && selectedLocale && selectedLocale.length !== 0
      ? selectedLocale[0].value
      : '';
  };

  return !ready ? (
    <LoadingSegment />
  ) : (
    <React.Fragment>
      <EnumField
        style={{ width: 200, minWidth: 'auto' }}
        id='previewlanguage'
        label={t('Preview Language')}
        placeholder={t('Select Language')}
        options={availableLocales.map(({ locale, localizedName }, key) => ({
          value: locale,
          text: localizedName,
          key
        }))}
        value={previewLocale}
        onChange={locale => setPreviewLocale(locale)}
      />
      <Table style={{ marginTop: 50 }}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              {t('Display Setting (default)')}
            </Table.HeaderCell>
            <Table.HeaderCell>{t('Display Text (default)')}</Table.HeaderCell>
            <Table.HeaderCell>
              {t(`Display Text (${getPreviewLocaleName(previewLocale)})`)}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {translationObject.map(
            ({ defaultKey, defaultValue,  targetValue, index }) => {
              return (
                <React.Fragment key={index}>
                  <Table.Row>
                    <Table.Cell>{defaultKey}</Table.Cell>
                    <Table.Cell>{defaultValue}</Table.Cell>
                    <Table.Cell>
                      {defaultLocale &&
                      defaultLocale.locale &&
                      previewLocale &&
                      previewLocale !== defaultLocale.locale
                        ? getTranslatedText(targetValue, previewLocale)
                        : defaultValue}
                    </Table.Cell>
                  </Table.Row>
                </React.Fragment>
              );
            }
          )}
        </Table.Body>
      </Table>
    </React.Fragment>
  );
});

export default ReviewTranslation;
