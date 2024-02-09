import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'semantic-ui-react';
import { t } from 'translate';
import { observer } from 'mobx-react-lite';
import LoadingSegment from 'controls/LoadingSegment';
import LanguageConfigurationModal from './LanguageConfigurationModal';
import LanguagePage from './LanguagePage';
import useFormal from 'hooks/useFormal';
import ReviewTranslation from './ReviewTranslation';
import * as yup from 'yup';
import { useAppModelStore } from 'model/hooks';
import { SOURCE_LOCALE } from 'model/formatters';

const debug = require('debug')('LanguageEdit');
const LanguageEdit = observer(
  ({
    canEdit,
    translationObject,
    onClose,
    translationFields = [],
    handleSubmit,
    ready,
    headerText = '',
    store,
    repo,
  }) => {
    const { localesStore, translationStore } = useAppModelStore();

    useEffect(() => {
      translationStore.reset();
      // This is an exception to not block CRA update (CN-577). Do not duplicate. Properly fix this instead.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (!ready || translationStore.loading) ? (
      <Modal open>
        <Modal.Header>{t(`${headerText}`)} (loading...)</Modal.Header>
        <Modal.Content>
          <LoadingSegment />
        </Modal.Content>
        <Modal.Actions>
          <Button type='button' onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button type='button' primary disabled>
            {t('Update')}
          </Button>
        </Modal.Actions>
      </Modal>
    ) : (
      <LanguageModal
        ready={ready}
        headerText={headerText}
        canEdit={canEdit}
        translationFields={translationFields}
        key={`language-modal-${ready}`}
        translationObject={translationObject}
        store={store}
        onClose={onClose}
        translationStore={translationStore}
        onSubmit={async values => {
          try {
            if (!values.defaultLocale) {
              values['defaultLocale'] = localesStore.defaultLocale.locale;
            }
            const { displayLocales } = values;
            if (displayLocales && displayLocales.length !== 0) {
                translationStore.requestTranslation(repo, 
                  {
                      ...translationObject.translationMeta,
                      translationRequest : { 
                    sourceLocale: SOURCE_LOCALE,
                    targetLocales: displayLocales,
                    translations:  translationFields.reduce((all, {dbKey, uiKey}) => all.concat({ key: dbKey, value: translationObject[`${uiKey}`] || '' }), [])
                    .filter(({value})=>value)
                    }
                    }
                )
                .then(() => {
                  if (!translationStore.error)
                      handleSubmit(values);
                });
              }
          } catch (e) {
            debug(e);
          }
        }}
      />
    );
  }
);

LanguageEdit.propTypes = {
  title: PropTypes.string,
  error: PropTypes.string,
  steps: PropTypes.arrayOf(PropTypes.element).isRequired,
  stepLabels: PropTypes.arrayOf(PropTypes.string),
  formal: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  clearError: PropTypes.func,
  open: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired
};

const LanguageModal = observer(
  ({
    onClose,
    onSubmit,
    canEdit,
    translationObject,
    store,
    translationFields,
    headerText,
    ready,
    translationStore
  }) => {
    const makeLanguageSchema = () => {
      return yup.object().shape({
        isTranslationEnabled: yup
          .boolean()
          .default(false)
          .required(),
        defaultLocale: yup.string().nullable(),
        displayLocales: yup
        .array()
        .default([])
        .when('isTranslationEnabled', {
          is: true,
          then: (schema)=>schema
          .min(1, 'At lease 1 value is required.')
          .required(),
          otherwise: schema=>
          schema
          .notRequired()
          .nullable()
        })
    });
    };

    const schema = makeLanguageSchema();

    const formal = useFormal(
      schema.cast({
        ...translationObject
      }),
      {
        schema: schema,
        onSubmit
      }
    );

    const getTranslationsDetails = () => {
      return translationFields.map(({uiKey}) => {
        return {
          defaultKey: uiKey,
          defaultValue: translationObject[`${uiKey}`],
          targetKey: `${uiKey}Translations`,
          targetValue: translationObject[`${uiKey}Translations`]
        };
      });
    };

    return (
      <LanguageConfigurationModal
        open
        formal={formal}
        canEdit={canEdit}
        title={t(`${headerText}`)}
        stepLabels={[t('Language'), t('Preview Translation')]}
        steps={[
          <LanguagePage
            ready={ready}
            formal={formal}
            canEdit={canEdit}
            translations={translationObject.translations}
            store={store}
            translationStore={translationStore}
            key='step-1'
          />,
          <ReviewTranslation
            ready={ready}
            translationObject={getTranslationsDetails()}
            key='step-2'
          />
        ]}
        onClose={onClose}
      />
    );
  }
);

export default LanguageEdit;
