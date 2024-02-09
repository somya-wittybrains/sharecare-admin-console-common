import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Icon } from 'semantic-ui-react';
import { Image as CloudinaryImage } from 'cloudinary-react';
import StringField from 'controls/form/fields/StringField';
import { t } from 'translate';
import { readRemoteFileAsBlob, validateFileType } from 'utils';

export default observer(
  ({
    cloudName,
    uploadImageWidth,
    uploadImageHeight,
    previewInputURL,
    setPreviewInputURL,
    previewURL,
    setPreviewURL,
    uploadHint,
    defaultImage,
    accept = '.png,.jpg,.jpeg',
    ImagePopUpHint
  }) => {
    const [error, setError] = useState('');
    return (
      <React.Fragment>
        {previewURL && (
          <CloudinaryImage
            cloudName={cloudName}
            publicId={previewURL}
            width={String(uploadImageWidth)}
            height={String(uploadImageHeight)}
            crop='scale'
          />
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            marginTop: 15,
            marginBottom: 15
          }}
        >
          <div style={{ flex: 1, marginRight: 15 }}>
            <StringField
              id='imageUrl'
              error={
                error ? (
                  <React.Fragment>
                    <Icon
                      name='times circle'
                      color='white'
                      style={{ fontSize: 16 }}
                    />
                    {error}
                  </React.Fragment>
                ) : (
                  ''
                )
              }
              fluid
              clearable
              placeholder={t('Enter Image URL')}
              onChange={value => {
                setPreviewInputURL(value);
                if (!value) setPreviewURL('');
              }}
              value={previewInputURL}
              label={t('Image URL')}
            />
          </div>
          <Button
            type='button'
            secondary
            style={{
              position: 'relative',
              top: '16px'
            }}
            onClick={async () => {
              setError(null);
              if (previewInputURL)
                readRemoteFileAsBlob(previewInputURL)
                  .then(({ type: inputMimeType }) =>
                    validateFileType(inputMimeType, accept)
                  )
                  .then(isValidMimeType => {
                    if (!isValidMimeType)
                      setError(
                        `Invalid Image Format. Please Select Valid Image (${accept.toUpperCase()})`
                      );
                    else if (previewInputURL) setPreviewURL(previewInputURL);
                  });
              else {
                setPreviewURL(defaultImage);
                setPreviewInputURL(defaultImage);
              }
            }}
          >
            {t('Preview')}
          </Button>
        </div>
        {uploadHint && (
          <small
            style={{
              fontWeight: '100',
              fontSize: '72%',
              display: 'block',
              marginTop: -10,
              marginBottom: 15,
              marginLeft: 2
            }}
          >
            {uploadHint}
          </small>
        )}
        {!uploadHint && { ...ImagePopUpHint }}
      </React.Fragment>
    );
  }
);
