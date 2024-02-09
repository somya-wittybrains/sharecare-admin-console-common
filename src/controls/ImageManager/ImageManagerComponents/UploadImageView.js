import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import ImageUploadField from './ImageUploadField';
import ImageList from './ImageList';
import { Image as CloudinaryImage } from 'cloudinary-react';
import { useAppModelStore } from 'model/hooks';
import { Button, Icon, Label } from 'semantic-ui-react';
import { t } from 'translate';
import 'controls/form/fields/ImageUploadField.css';

export default observer(
  ({
    cloudName,
    sponsor,
    metadata,
    cloudinaryImageWidth,
    libraryImageWidth,
    libraryImageAsIcon,
    uploadHint,
    selectedImage,
    onImageSelectionChange,
    showUploadLibraryListing = true,
    defaultImage,
    outputPublicId = false,
    clearButtonText = t('Delete Image'),
    ImagePopUpHint,
    accept
  }) => {
    const { cloudinaryStore } = useAppModelStore();
    const [error, setError] = useState(null);

    const [images, setImages] = useState([]);

    const getUploadsFolder = () => {
      const uploadsFolder = metadata.uploadsFolder
        ? `${metadata.folder}/${metadata.uploadsFolder}`
        : metadata.folder;
      return sponsor ? `${uploadsFolder}/${sponsor}` : uploadsFolder;
    };

    const onGetUploadedImages = () => {
      return cloudinaryStore.loadImages(
        '',
        cloudinaryImageWidth ? { width: cloudinaryImageWidth } : undefined,
        getUploadsFolder()
      );
    };

    const deleteImageFile = public_id => {
      return cloudinaryStore.deleteFile(public_id);
    };

    useEffect(() => {
      if (showUploadLibraryListing) load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const load = async () => {
      const result = await onGetUploadedImages();
      if (!cloudinaryStore.error) {
        setImages(
          result.reduce((all, current) => {
            return [...all, ...current.images];
          }, [])
        );
      } else {
        setImages([]);
      }
    };

    const onDeleteImage = secure_url => {
      deleteImageFile(secure_url).then(() => {
        if (showUploadLibraryListing) load();
        else onImageSelectionChange(null, { value: defaultImage });
      });
    };

    const optimizationDisplayImageURL = (value, displayWidth) => {
      if (!value) return value;
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

    const uploadsFolder = metadata.uploadsFolder
      ? `${metadata.folder}/${metadata.uploadsFolder}`
      : metadata.folder;

    const sponsorUploadsFolder = sponsor
      ? `${uploadsFolder}/${sponsor}`
      : uploadsFolder;

    const uploadMetadata = {
      folder: sponsorUploadsFolder,
      tags: metadata.tags
    };

    const style = {
      minHeight: '350px',
      maxHeight: 'calc(80vh - 10em - 50px)'
    };
    return (
      <div>
        {!showUploadLibraryListing && (
          <React.Fragment>
            <div style={{ display: 'flex', gridGap: 15, alignItems: 'center' }}>
              <div
                className={selectedImage ? 'uploadedThumbnail' : ''}
                style={{
                  position: 'relative'
                }}
              >
                <CloudinaryImage
                  cloudName={cloudName}
                  publicId={
                    outputPublicId
                      ? selectedImage
                      : optimizationDisplayImageURL(
                          selectedImage,
                          libraryImageWidth
                        )
                  }
                  width={libraryImageWidth}
                  crop='scale'
                />
                {selectedImage && selectedImage !== defaultImage && (
                  <div className='delete-overlay '>
                    <Button
                      type='button'
                      size='mini'
                      onClick={() => {
                        onDeleteImage(selectedImage);
                      }}
                    >
                      <Icon name='trash' />
                      {clearButtonText}
                    </Button>
                  </div>
                )}
              </div>
              {error && (
                <Label color='red'>
                  <Icon
                    name='times circle'
                    color='white'
                    style={{ fontSize: 16 }}
                  />
                  {error}
                </Label>
              )}
            </div>
          </React.Fragment>
        )}
        <ImageUploadField
          id={'imageUploadField'}
          outputPublicId={outputPublicId}
          level={'secondary'}
          uploadMetadata={uploadMetadata}
          setError={setError}
          error={error}
          accept={accept}
          onChange={value => {
            if (showUploadLibraryListing) load();
            else onImageSelectionChange(null, { value });
          }}
        />
        {uploadHint && (
          <small
            style={{
              fontWeight: '100',
              fontSize: '72%',
              marginTop: '0px',
              display: 'block'
            }}
          >
            {uploadHint}
          </small>
        )}
        {!uploadHint && { ...ImagePopUpHint }}
        {showUploadLibraryListing && (
          <ImageList
            cloudName={cloudName}
            libraryImageWidth={libraryImageWidth}
            selectedImage={selectedImage}
            onImageSelectionChange={onImageSelectionChange}
            onDeleteImage={onDeleteImage}
            libraryImageAsIcon={libraryImageAsIcon}
            images={images}
            style={style}
          />
        )}
      </div>
    );
  }
);
