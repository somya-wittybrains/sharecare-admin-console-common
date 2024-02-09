import React from 'react';
import { observer } from 'mobx-react-lite';
import ArrayValue from './ArrayValue';
import HtmlValue from './HtmlValue';
import ImageValue from './ImageValue';
import SimpleView from './SimpleView';

const withProps = injectProps => Component =>
  function withProps (props) {
    const moreProps =
      injectProps instanceof Function ? injectProps(props) : injectProps;

    return <Component {...props} {...moreProps} />;
  };

const ArrayOfStrings = withProps({ control: ArrayValue })(SimpleView);
const Boolean = withProps(({ value }) => ({ value: value ? 'Yes' : 'No' }))(
  SimpleView
);
const Date = withProps({ placeholder: '<no date>' })(SimpleView);
const DateRange = withProps({ placeholder: '<no dates>' })(SimpleView);
const Enum = observer(
  withProps(({ options, value }) => {
    const selectedOptions = Array.isArray(value)
      ? options.filter(({ value: v }) => value.includes(v))
      : options.find(({ value: v }) => v === value) || [];
    return {
      value:
        selectedOptions.length > 0
          ? selectedOptions.map(({ text }) => text).join(', ')
          : value
    };
  })(SimpleView)
);
const ImageUpload = withProps({
  placeholder: '<no image>',
  control: ImageValue
})(SimpleView);
const RichEditor = withProps({ control: HtmlValue })(SimpleView);

export default {
  ArrayOfStrings,
  Boolean,
  Date,
  DateRange,
  Enum,
  ImageUpload,
  LongString: SimpleView,
  Number: SimpleView,
  NumberSelector: SimpleView,
  RichEditor,
  SearchEnum: Enum,
  String: SimpleView,
  UnitString: SimpleView,
  Integer: SimpleView
};
