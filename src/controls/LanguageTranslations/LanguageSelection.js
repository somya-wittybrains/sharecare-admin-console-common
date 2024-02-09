import React, { useState, useEffect } from 'react';
import { t } from 'translate';
import { Form, Icon, Item, Table, Header, Label } from 'semantic-ui-react';
import EnumField from 'controls/form/fields/EnumField';
import GlobeIcon from 'controls/GlobeIcon';
import 'LanguageSelectionFilter.less';
import Box from 'layouts/Box';

export const DeleteFilters = ({
  localesStore,
  value,
  onChange,
  isDisabled,
  translations
}) => {
  const { availableLocales } = localesStore;

  const getTextForFilter = localeId => {
    const selectedLocale =
      availableLocales &&
      availableLocales.find(({ locale }) => locale.indexOf(localeId) !== -1);
    return selectedLocale ? selectedLocale.localizedName : '';
  };

  const onDeleteFilter = index =>
    onChange([...value.slice(0, index), ...value.slice(index + 1)]);

  const SelectedLocaleBar = ({ locale, index, translationStatus }) => {
    const barColor =
      translationStatus === 'Submitted'
        ? 'grey'
        : translationStatus === 'Translated'
        ? 'black'
        : 'blue';
    return (
      <Item as='div' key={`${translationStatus}-${index}`}>
        <Label as='a' style={{ margin: '8px 0 0 0' }} color={barColor}>
          <Item as='div' style={{ display: 'flex' }}>
            <Box>
              <GlobeIcon
                style={{ alignSelf: 'center' }}
                color='white'
                height='1.18em'
                width='1.1em'
              />
            </Box>
            <Item as='div' style={{ marginLeft: '3px', marginTop: '0.5px' }}>
              {getTextForFilter(locale)}
            </Item>
            {translationStatus === '' && (
              <Icon
                onClick={() => onDeleteFilter(index)}
                disabled={isDisabled}
                name='delete'
                style={{ marginLeft: 'auto' }}
              />
            )}
          </Item>
        </Label>
      </Item>
    );
  };

  return (
    <React.Fragment>
      <Item as='div' className='box'>
        { availableLocales &&
          translations &&
          translations.length > 0 &&
          translations
            .filter(
              ({ translationStatus }) => translationStatus === 'Translated'
            )
            .map(({ locale, translationStatus }, index) => (
              <React.Fragment>
                {index === 0 && (
                  <Header as='h4' style={{ paddingLeft: 0 }}>
                    <Icon
                      name='check circle'
                      color='green'
                      style={{ alignSelf: 'center', paddingRight: '2px' }}
                    />
                    {t(' TRANSLATED LANGUAGES')}
                  </Header>
                )}
                <SelectedLocaleBar
                  locale={locale}
                  index={index}
                  translationStatus={translationStatus}
                />
              </React.Fragment>
            ))}
        { availableLocales &&
          translations &&
          translations.length > 0 &&
          translations
            .filter(
              ({ translationStatus }) => translationStatus === 'Submitted'
            )
            .map(({ locale, translationStatus }, index) => (
              <React.Fragment>
                {index === 0 && (
                  <Header as='h4' style={{ paddingLeft: 0 }}>
                    <GlobeIcon
                      style={{ position: 'relative', top: 3 }}
                      color='#333f52'
                      height='14px'
                      width='14px'
                    />
                    {t(' REQUESTED LANGUAGES')}
                  </Header>
                )}
                <SelectedLocaleBar
                  locale={locale}
                  index={index}
                  translationStatus={translationStatus}
                />
              </React.Fragment>
            ))}
        <Header as='h4'>{t(' SELECTED LANGUAGES')}</Header>
        {availableLocales &&
          value &&
          value.map((locale, index) => (
            <SelectedLocaleBar
              locale={locale}
              index={index}
              translationStatus={'Selected'}
            />
          ))}
        {(!value || !value.length > 0) && (
          <Item as='div' className='box NoAdditionFilter'>
            <Item as='p' textalign='center'>
              {t(
                'Select a language from the left side to request translations.'
              )}
            </Item>
          </Item>
        )}
      </Item>
    </React.Fragment>
  );
};

export const AddFilters = ({
  error,
  localesStore,
  value,
  onChange,
  isDisabled,
  translations
}) => {
  const [search, setSearch] = useState('');
  const { defaultLocale, availableLocales } = localesStore;
  const normalFilters =
    availableLocales &&
    availableLocales.filter(
      ({ locale }) =>
        !search ||
        (locale && locale.toLowerCase().indexOf(search.toLowerCase())) !== -1
    );

  useEffect(() => {
    if (isDisabled) setSearch('');
  }, [isDisabled]);

  const isTranslatedLocale = localeId =>
    translations &&
    translations.find(
      ({ locale, translationStatus }) =>
        translationStatus === 'Translated' && localeId.indexOf(locale) !== -1
    );

  const isRequestedLocale = localeId =>
    translations &&
    translations.find(
      ({ locale, translationStatus }) =>
        translationStatus === 'Submitted' && localeId.indexOf(locale) !== -1
    );

  const isSelectedLocale = keyVal =>
    value && value.find(locale => locale === keyVal);

  const onUpdateFilter = key => {
    if (!key) return;
    if (value) {
      if (!value.find(locale => locale === key)) onChange([...value, key]);
    } else onChange([key]);
  };

  const undoAllSelectedLangs = () => {
    onChange([]);
    setSearch('');
  };
  const handleSearchChange = value => {
    setSearch(value);
  };

  const availableLocaleBar = (localizedName, locale) => {
    const localeStatusText = isSelectedLocale(locale)
      ? ''
      : isRequestedLocale(locale)
      ? 'Requested'
      : isTranslatedLocale(locale)
      ? 'Translated'
      : '';
    return (
      <React.Fragment>
        <span key={`localeName-${localizedName}`}>{localizedName}</span>
        <span
          key={`${localizedName}`}
          style={{ color: '#8e8e8e', fontStyle: 'italic', float: 'right' }}
        >
          {isSelectedLocale(locale) && (
            <Icon name='checkmark' style={{ fontSize: '1.1em' }} />
          )}
          { !isSelectedLocale(locale) &&
            isRequestedLocale(locale) && (
              <GlobeIcon
                style={{
                  marginRight: 5,
                  float: 'left',
                  opacity: 1,
                  fontSize: '1.1em'
                }}
                color='#8e8e8e'
                height='1.18em'
                width='1.1em'
              />
            )}
          { !isSelectedLocale(locale) &&
            !isRequestedLocale(locale) &&
            isTranslatedLocale(locale) && (
              <Icon
                name='check circle'
                style={{
                  float: 'left',
                  color: '#8e8e8e',
                  opacity: 1,
                  fontSize: '1.1em'
                }}
              />
            )}
          {localeStatusText}
        </span>
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <Item
        as='div'
        style={{ width: '100%' }}
        className={isDisabled ? 'item SearchPanel' : 'SearchPanel'}
      >
        <Item as='div' className='SearchHeader'>
          <Form.Field error={Boolean(error)}>
            <EnumField
              icon='search'
              clearable
              selectOnBlur={false}
              selectOnNavigation={false}
              options={
                availableLocales &&
                availableLocales
                  .filter(({ locale }) => locale !== defaultLocale.locale)
                  .map(({ locale, localizedName }, key) => ({
                    value: locale,
                    text: localizedName,
                    key
                  }))
              }
              onSearchChange={handleSearchChange}
              placeholder='Search Language...'
              onChange={onUpdateFilter}
              onClose={() => {
                setSearch('');
              }}
              search={true}
              disabled={isDisabled}
              id='searchLocale'
            />
            {error && (
              <Label basic color='red' pointing>
                {error}
              </Label>
            )}
          </Form.Field>
        </Item>

        <Item
          as='div'
          className='SearchPanelBody'
          style={{ overFlow: 'scroll' }}
        >
          <Table celled striped>
            <React.Fragment>
              <Table.Body>
                {normalFilters ? (
                  normalFilters
                    .filter(({ locale }) => locale !== defaultLocale.locale)
                    .map(({ locale, localizedName }, index) => (
                      <Table.Row
                        onClick={
                          isDisabled
                            ? undoAllSelectedLangs
                            : () => onUpdateFilter(locale)
                        }
                        className={
                          isSelectedLocale(locale) && !isDisabled
                            ? 'selected'
                            : ''
                        }
                        key={index}
                        disabled={isDisabled}
                      >
                        <Table.Cell>
                          {availableLocaleBar(localizedName, locale)}
                        </Table.Cell>
                      </Table.Row>
                    ))
                ) : (
                  <Item as='div' className='box NoAdditionFilter'>
                    <Item as='p' textalign='center'>
                      <b>{t('No languages found')}</b>
                    </Item>
                  </Item>
                )}
              </Table.Body>
            </React.Fragment>
          </Table>
        </Item>
      </Item>
    </React.Fragment>
  );
};
