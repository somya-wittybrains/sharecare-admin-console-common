import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';
import { Form, Button, Label, Icon, Image } from 'semantic-ui-react';
import { Image as CloudinaryImage } from 'cloudinary-react';
import { useAppModelStore } from 'model/hooks';
import { t } from 'translate';
import ActionModal from 'controls/ActionModal';
import ImageUploadUITemplate from './ImageUploadUITemplate';
import './ImageUploadField.css';
import { readFileAsBlob, validateFileType } from 'utils';

// show image preview placeholder

const debug = require('debug')('controls.form.fields.ImageUploadField');

const ConfirmDisplay = ({
  value,
  confirmProps,
  confirm,
  handleClear,
  Component = ActionModal,
  setConfirm
}) => {
  return value ? (
    <React.Fragment>
      {confirmProps && (
        <Component
          {...confirmProps}
          onConfirm={handleClear}
          open={confirm}
          onClose={() => setConfirm(false)}
        />
      )}
    </React.Fragment>
  ) : null;
};
const ImageDisplay = ({
  setConfirm,
  clearable,
  clearButtonText,
  confirmProps,
  value,
  defaultImageSource,
  cloudName,
  handleClear,
  width,
  height,
  error, 
  imageClass,
}) => {
  return (
    <React.Fragment>
      <div className={`${imageClass}`} style={{ display: 'flex', gridGap: 15, alignItems: 'center' }}>
        {value && (
          <CloudinaryImage
            cloudName={cloudName}
            publicId={value}
            width={width}
            height={height}
            crop='scale'
          />
        )}
        {!value && <Image src={defaultImageSource} size='small' />}
        {value && clearable && (
          <div className='delete-overlay '>
            <Button
              type='button'
              size='mini'
              onClick={() => (confirmProps ? setConfirm(true) : handleClear())}
            >
              <Icon name='trash' />
              {clearButtonText}
            </Button>
          </div>
        )}
        {error && (
          <Label basic color='red'>
            <Icon name='times circle' color='white' style={{ fontSize: 16 }} />
            {error}
          </Label>
        )}
      </div>
    </React.Fragment>
  );
};
const UploadButton = ({
  marginTop,
  marginBottom,
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
          marginTop: `${marginTop}em`,
          marginBottom
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
      {hint && !Array.isArray(hint) && (
        <small style={{ display: 'block' }}>{hint}</small>
      )}
      {hint &&
        Array.isArray(hint) &&
        hint.map(value => <small style={{ display: 'block' }}>{value}</small>)}
      {uploadError && (
        <Label color='red' pointing>
          <Icon name='times circle' color='white' style={{ fontSize: 16 }} />
          {uploadError}
        </Label>
      )}
    </React.Fragment>
  );
};

const ImageUploadField = observer(function ImageUploadField ({
  id,
  label,
  hint,
  accept = '.png,.jpg,.jpeg',
  required,
  onChange,
  value,
  metadata = {},
  disabled,
  clearable,
  clearButtonText = t('Delete Image'),
  confirmProps,
  width = 150,
  level = 'primary',
  marginTop = 1,
  marginBottom,
  as,
  outputPublicId = true,
  showImage = true,
  uploadButtonText = t('Upload Image'),
  uploadButtonIcon = 'cloud upload',
  defaultImageSource = 'https://res.cloudinary.com/sharecare/image/upload/v1629309830/admin-console-care-console/defaults/new/d1da6qnuoorltxuq0sa5.png',
  getError,
  imageClass
}) {
  debug(
    'render(%s,%s,%s,%s,%s,%o,%s,%s,%w)',
    id,
    label,
    hint,
    required,
    onChange,
    value,
    disabled,
    clearable,
    clearButtonText,
    width,
    as,
    uploadButtonText,
    uploadButtonIcon,
    defaultImageSource
  );

  const UIComponent = as || ImageUploadUITemplate;
  const { restStore, configStore } = useAppModelStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const handleClear = () => onChange(undefined);
  const handleChange = async event => {
    const [file] = event.target.files;
    if (!file) return;
    setError(null);
    readFileAsBlob(file)
      .then(({ type: inputMimeType }) =>
        validateFileType(inputMimeType, accept)
      )
      .then(isValidMimeType => {
        if (!isValidMimeType) {
          if (getError)
            getError(
              `Invalid Image Format. Please Select Valid Image (${accept.toUpperCase()})`
            );
          else
            setError(
              `Invalid Image Format. Please Select Valid Image (${accept.toUpperCase()})`
            );
        } else {
          if (getError) getError(null);
          setBusy(true);
          restStore
            .upload('/api/upload/cloudinary', file, metadata)
            .then(({ secure_url: url, public_id: publicId }) => {
              setBusy(false);
              if (outputPublicId) onChange(publicId);
              else onChange(url);
            })
            .catch(() => {
              setBusy(false);
            });
        }
      });
  };
  const [confirm, setConfirm] = useState(false);
  // This is an exception to not block CRA update (CN-577). Do not duplicate. Properly fix this instead.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (error || restStore.uploadError) setBusy(false);
  });

  return (
    <Form.Field required={required} disabled={busy || disabled}>
      {label && <label>{label}</label>}
      <input
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
      <UIComponent
        disabled={busy || disabled}
        marginTop={marginTop}
        marginBottom={marginBottom}
        id={id}
        showImage={showImage}
        level={level}
        uploadButtonIcon={uploadButtonIcon}
        uploadButtonText={uploadButtonText}
        uploadError={restStore.uploadError}
        ConfirmDisplay={ConfirmDisplay}
        UploadButton={UploadButton}
        ImageDisplay={ImageDisplay}
        cloudName={configStore.cloudName}
        clearButtonText={clearButtonText}
        confirmProps={confirmProps}
        hint={hint}
        error={error}
        width={width}
        handleClear={handleClear}
        busy={busy}
        setConfirm={setConfirm}
        confirm={confirm}
        clearable={clearable}
        value={value}
        defaultImageSource={defaultImageSource}
        imageClass={imageClass}
      />
    </Form.Field>
  );
});
ImageUploadField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  hint: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  metadata: PropTypes.object,
  disabled: PropTypes.bool,
  uploadButtonText: PropTypes.string,
  showImage: PropTypes.bool,
  outputPublicId: PropTypes.bool,
  width: PropTypes.string
};

export default ImageUploadField;
