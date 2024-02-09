import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Button, Label, Icon } from 'semantic-ui-react';
import { useAppModelStore } from 'model/hooks';
import { t } from 'translate';
import { readFileAsBlob, validateFileType } from 'utils';

const UploadButton = ({
  marginTop,
  id,
  level,
  uploadError,
  busy,
  hint,
  uploadButtonText,
  uploadButtonIcon,
  disabled,
  error
}) => {
  return (
    <React.Fragment>
      <div
        style={{
          marginTop: `${marginTop}em`
        }}
      >
        <Button disabled={disabled} className={level} as='label' htmlFor={id}>
          <Icon
            name={
              busy
                ? 'circle notch'
                : uploadButtonIcon
                ? uploadButtonIcon
                : 'cloud upload'
            }
            loading={busy}
            style={{
              height: '1em'
            }}
          />
          {uploadButtonText ? uploadButtonText : t('Upload Image')}
        </Button>
      </div>
      {hint && <small style={{ display: 'block' }}>{hint}</small>}
      {uploadError && (
        <Label basic color='red' pointing>
          {uploadError}
        </Label>
      )}
    </React.Fragment>
  );
};

export default observer(
  ({
    id,
    label,
    hint,
    accept = '.png,.jpg,.jpeg',
    required,
    onChange,
    uploadMetadata = {},
    disabled,
    level = 'primary',
    marginTop = 1,
    outputPublicId = true,
    uploadButtonText = t('Upload Image'),
    uploadButtonIcon = 'cloud upload',
    setError,
    error
  }) => {
    const refInput = useRef();

    const { restStore } = useAppModelStore();
    const [busy, setBusy] = useState(false);

    const handleChange = async event => {
      setError(null);
      const { current: fileInput } = refInput;
      const [file] = event.target.files;
      readFileAsBlob(file)
        .then(({ type: inputMimeType }) =>
          validateFileType(inputMimeType, accept)
        )
        .then(isValidMimeType => {
          if (!isValidMimeType)
            setError(
              `Invalid Image Format. Please Select Valid Image (${accept.toUpperCase()})`
            );
          else {
            setBusy(true);
            restStore
              .upload('/api/upload/cloudinary', file, uploadMetadata)
              .then(({ secure_url: url, public_id: publicId }) => {
                setBusy(false);
                if (outputPublicId) onChange(publicId);
                else onChange(url);
                fileInput.value = '';
              })
              .catch(() => {
                setBusy(false);
              });
          }
        });
    };
    // This is an exception to not block CRA update (CN-577). Do not duplicate. Properly fix this instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
      if (error || restStore.uploadError) setBusy(false);
    });

    return (
      <Form.Field required={required} disabled={busy || disabled}>
        {label && <label>{label}</label>}
        <input
          ref={refInput}
          type='file'
          id={id}
          accept={accept ? accept : '.png,.jpg,.svg'}
          style={{
            width: 0.1,
            height: 0.1,
            opacity: 0,
            overflow: 'hidden',
            position: 'absolute',
            zIndex: -1
          }}
          onChange={handleChange}
        />
        <UploadButton
          id={id}
          uploadButtonIcon={uploadButtonIcon}
          uploadButtonText={uploadButtonText}
          level={level}
          marginTop={marginTop}
          uploadError={restStore.uploadError}
          error={error}
          busy={busy}
          hint={hint}
          disabled={busy || disabled}
        />
      </Form.Field>
    );
  }
);
