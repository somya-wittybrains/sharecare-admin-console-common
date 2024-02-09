import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useAppModelStore } from 'model/hooks';
import ImageList from './ImageList';

export default observer(
  ({
    cloudName,
    metadata,
    cloudinaryImageWidth,
    libraryImageWidth,
    libraryImageAsIcon,
    categories,
    selectedImage,
    onImageSelectionChange
  }) => {
    const { cloudinaryStore } = useAppModelStore();

    const getImageCategory = category => {
      if (category === '!all!') {
        return categories.map(c => c.value).filter(c => c !== '!all!');
      } else {
        return category;
      }
    };

    const onLoadImages = category => {
      let libraryFolder = metadata.libraryAbsolutePath; 
      if (!libraryFolder){
        libraryFolder = metadata.libraryFolder
          ? `${metadata.folder}/${metadata.libraryFolder}`
          : metadata.folder
      }
      return cloudinaryStore.loadImages(
        getImageCategory(category),
        cloudinaryImageWidth ? { width: cloudinaryImageWidth } : undefined,
        libraryFolder
      );
    };

    /*
     * Categories may be passed in from above like the following format
     *
     * NOTE: Use allValuesKey '!all!' in order to parse and build an array of the rest of the categories in
     *  order to properly query all of the category keys
     *
     *   const categories = [
     *     { text: 'All', value: '!all!' },
     *     { text: 'Diet', value: 'diet' },
     *     { text: 'Green Days', value: 'green_days' }
     *   ];
     */
    const allValuesKey = '!all!';

    const initCategory =
      categories && categories.length > 0 && categories[0].value
        ? categories[0].value
        : undefined;

    const [images, setImages] = useState([]);
    const [category, setCategory] = useState(initCategory);

    const load = async categoryVal => {
      const results = await onLoadImages(
        categoryVal && categoryVal !== '' ? categoryVal : ''
      );

      if (!cloudinaryStore.error) {
        if (categoryVal && categoryVal !== '' && categoryVal !== allValuesKey) {
          const imagesSet = results.filter(({ key }) => key === categoryVal);
          if (imagesSet.length !== 0) setImages(imagesSet[0].images);
        } else {
          setImages(
            results.reduce((all, current) => {
              return [...all, ...current.images];
            }, [])
          );
        }
      }
    };

    useEffect(() => {
      load(category);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category]);

    return (
      <React.Fragment>
        <ImageList
          cloudName={cloudName}
          libraryImageWidth={libraryImageWidth}
          libraryImageAsIcon={libraryImageAsIcon}
          images={images}
          selectedImage={selectedImage}
          onImageSelectionChange={onImageSelectionChange}
          categories={categories}
          category={category}
          onCategoryChange={val => setCategory(val)}
        />
      </React.Fragment>
    );
  }
);
