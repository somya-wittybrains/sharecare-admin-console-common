import React from 'react';
import { observer } from 'mobx-react-lite';

const ImageUploadUITemplate = observer(
  ({
    id,
    hint,
    error,
    uploadError,
    required,
    value,
    clearable,
    busy,
    clearButtonText,
    confirmProps,
    width = 150,
    handleClear,
    confirm,
    setConfirm,
    ImageDisplay,
    UploadButton,
    uploadButtonIcon,
    ConfirmDisplay,
    cloudName,
    marginTop,
    marginBottom,
    disabled,
    level,
    uploadButtonText,
    showImage,
    imageClass,
    defaultImageSource = 'https://res.cloudinary.com/sharecare/image/upload/v1590014365/audiences/bpsimxhdrcnzqtvhu7dw.jpg'
  }) => {
    return (
      <React.Fragment>
        <div
          style={{
            position: 'relative'
          }}
          className={value && clearable ? 'uploadedThumbnail' : ''}
        >
          {showImage && (
            <React.Fragment>
              <ConfirmDisplay
                handleClear={handleClear}
                setConfirm={setConfirm}
                confirm={confirm}
                value={value}
                confirmProps={confirmProps}
              />
              <ImageDisplay
                setConfirm={setConfirm}
                clearable={clearable}
                clearButtonText={clearButtonText}
                defaultImageSource={defaultImageSource}
                width={width}
                cloudName={cloudName}
                value={value}
                error={error}
                handleClear={handleClear}
                confirmProps={confirmProps}
                imageClass={imageClass}
              />
            </React.Fragment>
          )}
        </div>
        <UploadButton
          id={id}
          uploadButtonIcon={uploadButtonIcon}
          uploadButtonText={uploadButtonText}
          level={level}
          marginTop={marginTop}
          marginBottom={marginBottom}
          uploadError={uploadError}
          busy={busy}
          hint={hint}
          error={error}
          disabled={disabled}
        />
      </React.Fragment>
    );
  }
);
export default ImageUploadUITemplate;
