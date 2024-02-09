import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useAppModelStore } from 'model/hooks';
import { Message, Modal, Button, Item, Menu, Form } from 'semantic-ui-react';
import LibraryView from './ImageManagerComponents/LibraryView';
import UploadImageView from './ImageManagerComponents/UploadImageView';
import ImageUrlView from './ImageManagerComponents/ImageUrlView';
import { t } from 'translate';

export default observer(
  ({
    cloudName,
    showImageURL,
    showImageUpload,
    showImageListing,
    defaultType,
    defaultImage,
    sponsor,
    metadata,
    value,
    categories,
    cloudinaryImageWidth,
    libraryImageAsIcon,
    libraryImageWidth,
    uploadImageWidth,
    uploadImageHeight,
    uploadHint,
    onImageSelected,
    showUploadLibraryListing,
    onCancelImageSelection,
    outputPublicId,
    title,
    useHttpsForImageUrl,
    clearButtonText,
    ImagePopUpHint,
    accept
  }) => {
    const { cloudinaryStore } = useAppModelStore();

    const [tabType, setTabType] = useState(defaultType);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(defaultImage);
    const [previewInputURL, setPreviewInputURL] = useState('');
    const [previewURL, setPreviewURL] = useState(null);
    const [imageUrlError, setImageUrlError] = useState(null);

    const formatImageUrl = (url, type) => {
      let urlPath = url;
      const index = url.indexOf('?');
      if (index !== -1) {
        urlPath = url.substr(0, index);
      }

      return `${urlPath}?type=${type}`;
    };

    useEffect(() => {
      const validTypes = ['listing', 'upload', 'imageurl'];
      const getTypeFromUrl = url => {
        if (url) {
          const index = url.indexOf('?');
          if (index !== -1) {
            const params = url.substr(index + 1);
            if (params) {
              const paramSplits = params.split('=');
              const typeIndex = paramSplits.indexOf('type');
              if (typeIndex > -1) {
                const typeValue = paramSplits[typeIndex + 1];
                if (validTypes.includes(typeValue)) {
                  return typeValue;
                }
              }
            }
          }
        }
      };

      const type = getTypeFromUrl(value) || defaultType;

      setTabType(type);

      // Set the initial selected image based on the value
      let urlPath = value;
      const index = (value || '').indexOf('?');
      if (index !== -1) {
        urlPath = value.substr(0, index);
      }
      if (type === 'listing' || type === 'upload') {
        if (type === 'listing') {
          setSelectedImage(urlPath);
        } else {
          setUploadedImage(urlPath);
        }
      } else if (urlPath) {
        setPreviewInputURL(urlPath);
        setPreviewURL(urlPath);
      }
    }, [defaultType, value, setTabType, setSelectedImage, setUploadedImage]);

    const onApply = () => {
      switch (tabType) {
        case 'listing':
          onImageSelected(formatImageUrl(selectedImage, 'listing'));
          break;
        case 'upload':
          onImageSelected(formatImageUrl(uploadedImage, 'upload'));
          break;
        case 'imageurl':
        {
          const imageUrl = previewURL || defaultImage;
          if (useHttpsForImageUrl && imageUrl.indexOf('https://') !== 0)
            setImageUrlError(t('Enter a secure URL'));
          else onImageSelected(formatImageUrl(imageUrl, 'imageurl'));
        }
          break;
        default:
          break;
      }
    };

    const selectButtonColor = () => {
      switch (tabType) {
        case 'listing':
          return !!selectedImage;
        case 'upload':
          return !!uploadedImage;
        case 'imageurl':
          return true;
        default:
          return false;
      }
    };

    const disableSelectButton = () => {
      switch (tabType) {
        case 'listing':
          return !selectedImage;
        case 'upload':
          return !uploadedImage;
        case 'imageurl':
          return !!imageUrlError || !previewInputURL;
        default:
          return true;
      }
    };

    return (
      <Modal
        style={{ background: '#fbfbfb' }}
        className='new-group-modal'
        open
        closeOnEscape={false}
        closeOnDimmerClick={false}
        onClose={onCancelImageSelection}
      >
        <Modal.Header style={{ background: '#fbfbfb' }}>
          {title || t('Select an Image')}
        </Modal.Header>

        {!cloudinaryStore.loading && cloudinaryStore.error && (
          <Message
            negative
            content={cloudinaryStore.error}
            onDismiss={() => cloudinaryStore.clearError()}
          />
        )}

        <Item
          as='h3'
          style={{
            margin: '15px 20px 0 20px',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <Menu pointing secondary compact className='justify-start mb-25'>
            {showImageListing && (
              <Menu.Item
                active={tabType === 'listing'}
                onClick={() => setTabType('listing')}
              >
                {t('Image Library')}
              </Menu.Item>
            )}

            {showImageUpload && (
              <Menu.Item
                active={tabType === 'upload'}
                onClick={() => setTabType('upload')}
              >
                {t('Upload Image')}
              </Menu.Item>
            )}

            {showImageURL && (
              <Menu.Item
                active={tabType === 'imageurl'}
                onClick={() => setTabType('imageurl')}
              >
                {t('Image URL')}
              </Menu.Item>
            )}
          </Menu>
        </Item>

        <Form style={{ padding: '10px 25px', minHeight: 450 }}>
          {tabType === 'listing' && (
            <LibraryView
              cloudName={cloudName}
              metadata={metadata}
              cloudinaryImageWidth={cloudinaryImageWidth}
              libraryImageWidth={libraryImageWidth}
              libraryImageAsIcon={libraryImageAsIcon}
              selectedImage={selectedImage}
              onImageSelectionChange={(e, { value }) => {
                setSelectedImage(value);
              }}
              categories={categories}
            />
          )}
          {tabType === 'upload' && (
            <UploadImageView
              cloudName={cloudName}
              sponsor={sponsor}
              metadata={metadata}
              showUploadLibraryListing={showUploadLibraryListing}
              libraryImageWidth={libraryImageWidth}
              libraryImageAsIcon={libraryImageAsIcon}
              uploadHint={uploadHint}
              selectedImage={uploadedImage}
              defaultImage={defaultImage}
              outputPublicId={outputPublicId}
              clearButtonText={clearButtonText}
              accept={accept}
              onImageSelectionChange={(e, { value }) => {
                setUploadedImage(value);
              }}
              ImagePopUpHint={ImagePopUpHint}
            />
          )}
          {tabType === 'imageurl' && (
            <ImageUrlView
              cloudName={cloudName}
              uploadImageWidth={uploadImageWidth}
              uploadImageHeight={uploadImageHeight}
              previewInputURL={previewInputURL}
              setPreviewInputURL={val => {
                setPreviewInputURL(val);
                const validSecureUrl = new RegExp('^(https)://[^ "]+$');
                if (!validSecureUrl.test(val)) {
                  setImageUrlError(t('Enter a valid secure URL'));
                } else {
                  setImageUrlError(null);
                }
              }}
              previewURL={previewURL}
              setPreviewURL={setPreviewURL}
              uploadHint={uploadHint}
              defaultImage={defaultImage}
              error={imageUrlError}
              ImagePopUpHint={ImagePopUpHint}
            />
          )}
        </Form>

        <Modal.Actions className='flex-space'>
          <Button
            as='label'
            content={t('Cancel')}
            onClick={onCancelImageSelection}
          />
          <Button
            as='label'
            color={selectButtonColor() ? 'green' : 'grey'}
            content={t('Select')}
            disabled={disableSelectButton()}
            onClick={onApply}
          />
        </Modal.Actions>
      </Modal>
    );
  }
);
