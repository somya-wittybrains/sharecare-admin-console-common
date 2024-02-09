import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';
import { Image as CloudinaryImage } from 'cloudinary-react';
import { useAppModelStore } from 'model/hooks';

const ImageValue = observer(function ImageValue ({ value, placeholder }) {
  const { configStore } = useAppModelStore();

  return (
    <div
      style={{
        marginBottom: '1em'
      }}
    >
      {value && (
        <CloudinaryImage
          cloudName={configStore.cloudName}
          publicId={value}
          width={'150'}
          crop='scale'
        />
      )}
      {!value && placeholder}
    </div>
  );
});
ImageValue.propTypes = {
  value: PropTypes.any,
  placeholder: PropTypes.any
};

export default ImageValue;
