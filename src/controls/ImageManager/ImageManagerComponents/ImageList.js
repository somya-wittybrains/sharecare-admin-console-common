import React from 'react';
import { observer } from 'mobx-react-lite';
import { List, Checkbox, Icon } from 'semantic-ui-react';
import { Image as CloudinaryImage } from 'cloudinary-react';
import EnumField from 'controls/form/fields/EnumField';
import { t } from 'translate';

export default observer(
  ({
    cloudName,
    libraryImageWidth,
    selectedImage,
    onImageSelectionChange,
    libraryImageAsIcon,
    images,
    categories,
    category,
    onCategoryChange,
    onDeleteImage,
    style
  }) => {
    const libImageWrapperStyle = libraryImageAsIcon
      ? {
          padding: '25px',
          background: '#ffffff'
        }
      : {};

    return (
      <div>
        <React.Fragment>
          {categories && categories.length > 1 && (
            <EnumField
              id='categoryField'
              onChange={onCategoryChange}
              style={{ fontSize: '14px', maxWidth: 300 }}
              placeholder={t('Select')}
              options={categories}
              value={category}
              label={t('Category:  ')}
            />
          )}
          <div className='image scrolling content' style={style}>
            <List style={{ display: 'flex', flexWrap: 'wrap' }}>
              {images.map(({ public_id, secure_url }, index) => (
                <List.Item
                  key={`cloudinary-image-lib-item-${index}`}
                  style={{ margin: '10px', position: 'relative' }}
                >
                  <div style={libImageWrapperStyle}>
                    <Checkbox
                      onChange={onImageSelectionChange}
                      checked={selectedImage === secure_url}
                      value={secure_url}
                      radio
                      name='imageGroup'
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '10px',
                        zIndex: '9'
                      }}
                    />
                    {onDeleteImage && (
                      <Icon
                        name='trash alternate outline'
                        onClick={() => {
                          onDeleteImage(public_id);
                        }}
                        style={{
                          position: 'absolute',
                          left: '8px',
                          top: '10px',
                          zIndex: '9',
                          color: '#DB2828',
                          cursor: 'pointer'
                        }}
                      />
                    )}
                    <CloudinaryImage
                      cloudName={cloudName}
                      publicId={secure_url}
                      width={libraryImageWidth}
                      crop='scale'
                    />
                  </div>
                </List.Item>
              ))}
            </List>
          </div>
        </React.Fragment>
      </div>
    );
  }
);
