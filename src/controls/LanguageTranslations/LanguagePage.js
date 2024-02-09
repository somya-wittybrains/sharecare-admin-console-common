import React from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Message, Item, Divider, Icon } from 'semantic-ui-react';
import { Prompt } from 'react-router';
import { t } from 'translate';
import LoadingSegment from 'controls/LoadingSegment';
import FormField from 'controls/form/fields';
import { AddFilters, DeleteFilters } from './LanguageSelection';
import SimpleActionModal from 'controls/SimpleActionModal';
import { useAppModelStore } from 'model/hooks';
import './LanguageTranslations.less';

const LanguageFormSection = observer(
  ({ translations, formal, canEdit }) => {
    const { sponsorStore, localesStore } = useAppModelStore();
    const { availableLocales, defaultLocale } = localesStore;
    const defaultLocalizedName = availableLocales.find(
      ({ locale }) => locale === defaultLocale.locale
    )
      ? availableLocales.find(({ locale }) => locale === defaultLocale.locale)
          .localizedName
      : '';

    return (
      <React.Fragment>
        <Prompt
          when={formal.isDirty}
          message={t(
            'All changes are not saved, are you sure you want to leave?'
          )}
        />

        <Item as='div' style={{ maxWidth: 900 }}>
          {defaultLocale && (
            <FormField.Enum
              selection
              label={t('Default Language')}
              options={[defaultLocale].map(
                ({ locale, localizedName }, key) => ({
                  text: defaultLocalizedName,
                  value: locale,
                  key
                })
              )}
              icon='none'
              id='defaultLocale'
              {...formal.getFieldProps('defaultLocale')}
              value={defaultLocale.locale}
              disabled
            />
          )}
          <Item as='div' style={{ color: '#7f8fa4', fontSize: '12px' }}>
            {t(
              `By default, programs will display labels and text in language specified. `
            )}
          </Item>
          <Divider hidden />
          <FormField.Boolean
            label={t('Enable Language Translations')}
            toggle
            {...formal.getFieldProps('isTranslationEnabled')}
            disabled={!canEdit}
          />
          <React.Fragment>
            <Form.Field>
              <label>{t('Select Languages')}</label>
            </Form.Field>
            <Divider hidden />
            <Item as='div' className='LanguagePanel'>
              <AddFilters
                localesStore={localesStore}
                {...formal.getFieldProps('displayLocales')}
                isDisabled={!formal.values.isTranslationEnabled || !canEdit}
                translations={translations}
              />
              <Item
                as='div'
                style={{ maxHeight: '340px' }}
                className='SearchedItemPanel'
              >
                <DeleteFilters
                  localesStore={localesStore}
                  {...formal.getFieldProps('displayLocales')}
                  isDisabled={!formal.values.isTranslationEnabled || !canEdit}
                  translations={translations}
                />
              </Item>
            </Item>
          </React.Fragment>
        </Item>
        {sponsorStore && sponsorStore.requestedSponsor && formal.isDirty && (
          <SimpleActionModal
            open
            description={t(
              'All changes are not saved, are you sure you want to leave?'
            )}
            onConfirm={() => {
              formal.reset();
            }}
            confirmLabel={t('OK')}
            secondary={true}
            onClose={() => sponsorStore.cancelRequestedSponsor()}
          />
        )}
      </React.Fragment>
    );
  }
);

const LanguagePage = observer(
  ({
    ready,
    formal,
    canEdit,
    translations,
    translationStore,
    store,
  }) => {

    return (
      <React.Fragment>
       <Message
            positive
            className='mini-message'
            icon={
              <Icon
                name='check circle'
                color='white'
                style={{ fontSize: 16 }}
              />
            }
            hidden={!translationStore.message}
            content={translationStore.message}
            onDismiss={() => translationStore.clearMessage()}
          />
         <Message
            negative
            className='mini-message'
            icon={
              <Icon
                name='times circle'
                color='white'
                style={{ fontSize: 16 }}
              />
            }
            hidden={!translationStore.error}
            content={translationStore.error}
            onDismiss={() => translationStore.clearError()}
          />

        <Message
            positive
            className='mini-message'
            icon={
              <Icon
                name='check circle'
                color='white'
                style={{ fontSize: 16 }}
              />
            }
            hidden={!store.message}
            content={store.message}
            onDismiss={() => store.clearMessage()}
          />
         <Message
            negative
            className='mini-message'
            icon={
              <Icon
                name='times circle'
                color='white'
                style={{ fontSize: 16 }}
              />
            }
            hidden={!store.error}
            content={store.error}
            onDismiss={() => store.clearError()}
          />
        {!ready ? (
          <LoadingSegment />
        ) : (
          <LanguageFormSection
            formal={formal}
            canEdit={canEdit}
            translations={translations}
          />
        )}
      </React.Fragment>
    );
  }
);

export default LanguagePage;
