import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Label, Image, Icon, Popup } from 'semantic-ui-react';
import { Image as CloudinaryImage } from 'cloudinary-react';
import { t } from 'translate';
import ImageManager from './ImageManager';
import 'controls/form/fields/ImageUploadField.css';
import ActionModal from 'controls/ActionModal';

const PopupHint = () => {
  return (
    <small className='img-upload-hint'>
      <React.Fragment>
        <span>
          {t(
            'Supported Formats: PNG / JPEG; Required Size: 1280 x 1280 (1:1 Aspect Ratio)'
          )}
        </span>
        <Popup
          position='top center'
          inverted
          on={'hover'}
          content={
            <React.Fragment>
              <p style={{ whiteSpace: 'nowrap', fontWeight: 100 }}>
                <span style={{ fontWeight: 500 }}>
                  {t('Recommended Image:')}
                </span>
                <br />
                {t('Padding Left / Right: 200px')}
                <br />
                {t('Padding Top / Bottom: 100px')}
                <br />
                <span style={{ color: '#999' }}>
                  {' '}
                  {t('(Trim Excess White Space/Transparent Pixels)')}{' '}
                </span>
              </p>
            </React.Fragment>
          }
          itemAs={Label}
          trigger={<Icon name='info circle' />}
        />
      </React.Fragment>
    </small>
  );
};

export default function SelectImageFromManagerField ({
  label,
  hint,
  error,
  required,
  onChange,
  value,
  disabled,
  width,
  height,
  cloudName,
  sponsor,
  metadata,
  cloudinaryImageWidth,
  libraryImageAsIcon,
  libraryImageWidth,
  uploadImageWidth,
  uploadImageHeight,
  displayWidth,
  uploadHint,
  outputPublicId = false,
  defaultImage = 'https://res.cloudinary.com/sharecare/image/upload/v1629309830/admin-console-care-console/defaults/new/d1da6qnuoorltxuq0sa5.png',
  showImageUpload = true,
  showImageURL = true,
  showImageListing = true,
  defaultType = 'listing',
  showUploadLibraryListing = true,
  useHttpsForImageUrl = false,
  clearable = false,
  clearButtonText = 'Delete Image',
  clearConfirmProps = null,
  noImageSelectedText,
  onLoad,
  ImagePopUpHint = <PopupHint />,
  accept
}) {
  const [toSelectImage, setToSelectImage] = useState(false);
  const [deleteImage, setDeleteImage] = useState(false);

  const onDeleteConfirm = () => {
    onImageSelected(noImageSelectedText ? '' : defaultImage);
    setDeleteImage(false);
  };
  const onDeleteCancel = () => {
    setDeleteImage(false);
  };
  const onCancelImageSelection = () => {
    setToSelectImage(false);
  };

  const onImageSelected = imageValue => {
    setToSelectImage(false);
    onChange(
      noImageSelectedText &&
        defaultImage &&
        imageValue &&
        imageValue.indexOf(defaultImage) !== -1
        ? ''
        : imageValue
    );
  };

  const optimizationDisplayImageURL = value => {
    const urlTokens = value.split('/');
    const uploadIndex = urlTokens.indexOf('upload');
    if (
      uploadIndex !== -1 &&
      (urlTokens[uploadIndex + 1].includes('w_') ||
        urlTokens[uploadIndex + 1].includes('h_'))
    )
      urlTokens.splice(
        uploadIndex + 1,
        1,
        displayWidth ? 'w_' + displayWidth : ''
      );
    return urlTokens.join('/');
  };
  return (
    <React.Fragment>
      <Form.Field required={required} disabled={disabled}>
        {label && <label>{label}</label>}
        {value && value.indexOf(defaultImage) === -1 && (
          <React.Fragment>
            <div
              className={
                value && value !== defaultImage ? 'uploadedThumbnail' : ''
              }
              style={{
                position: 'relative'
              }}
            >
              <CloudinaryImage
                cloudName={cloudName}
                publicId={
                  outputPublicId ? value : optimizationDisplayImageURL(value)
                }
                width={width ? width : '150'}
                height={height}
                crop='scale'
                onLoad={event => {
                  if (onLoad) onLoad(event.target);
                }}
              />
              {clearable && value !== defaultImage && (
                <div className='delete-overlay '>
                  <Button
                    type='button'
                    size='mini'
                    onClick={
                      !disabled
                        ? () => {
                            if (!clearConfirmProps)
                              onImageSelected(defaultImage);
                            else setDeleteImage(true);
                          }
                        : {}
                    }
                  >
                    <Icon name='trash' />
                    {clearButtonText}
                  </Button>
                </div>
              )}
            </div>
          </React.Fragment>
        )}
        {(!value || value.indexOf(defaultImage) !== -1) &&
          !noImageSelectedText && <Image src={defaultImage} size='small' />}
        {(!value || value.indexOf(defaultImage) !== -1) &&
          noImageSelectedText && <small>{noImageSelectedText}</small>}

        {/* this div is to prevent default semantic UI field label styling */}
        <div
          style={{
            marginTop: '1em'
          }}
        >
          <Button
            onClick={!disabled ? () => setToSelectImage(true) : {}}
            as='label'
            secondary
          >
            {t('Select Image')}
          </Button>
        </div>
        {!hint && { ...ImagePopUpHint }}
        {hint && <small style={{ display: 'block' }}>{hint}</small>}
        {error && (
          <Label basic color='red' pointing>
            {error}
          </Label>
        )}
      </Form.Field>
      {toSelectImage && (
        <ImageManager
          showImageUpload={showImageUpload}
          showImageURL={showImageURL}
          showImageListing={showImageListing}
          defaultType={defaultType}
          defaultImage={defaultImage}
          cloudName={cloudName}
          sponsor={sponsor}
          metadata={metadata}
          cloudinaryImageWidth={cloudinaryImageWidth}
          libraryImageAsIcon={libraryImageAsIcon}
          libraryImageWidth={libraryImageWidth}
          uploadImageWidth={uploadImageWidth}
          uploadImageHeight={uploadImageHeight}
          uploadHint={uploadHint}
          outputPublicId={outputPublicId}
          title={t('Select an Image')}
          onCancelImageSelection={onCancelImageSelection}
          onImageSelected={onImageSelected}
          showUploadLibraryListing={showUploadLibraryListing}
          useHttpsForImageUrl={useHttpsForImageUrl}
          value={value}
          clearButtonText={clearButtonText}
          ImagePopUpHint={ImagePopUpHint}
          accept={accept}
        />
      )}
      {deleteImage && (
        <ActionModal
          {...{
            ...clearConfirmProps,
            open: deleteImage,
            onConfirm: onDeleteConfirm,
            onClose: onDeleteCancel
          }}
        />
      )}
    </React.Fragment>
  );
}

SelectImageFromManagerField.propTypes = {
  label: PropTypes.string,
  hint: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired
};
