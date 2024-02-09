import React from 'react';
import { Search as BaseSearch, Form } from 'semantic-ui-react';
import StoreBindingComponent from './StoreBindingComponent';

const debug = require('debug')('controls.form.elements.Search');

export default class Search extends StoreBindingComponent {
  constructor (props) {
    debug('constructor(%o)', props);

    super(props);
  }

  field = props => {
    const { store, name, onResultSelect = result => {}, ...rest } = props;

    return (
      <React.Fragment>
        <Form.Input
          control={BaseSearch}
          {...rest}
          error={this.hasErrors(name)}
          onResultSelect={(_, { result }) => {
            store.updateAttribute(name, result.key);
            onResultSelect(result);
          }}
        />
        {this.renderErrors(name)}
      </React.Fragment>
    );
  };

  wrappedField = props => {
    return <div className='required field'>{this.field(props)}</div>;
  };

  render () {
    debug('render()');

    const { wrapField = false, ...rest } = this.props;
    if (wrapField) {
      return this.wrappedField(rest);
    } else {
      return this.field(rest);
    }
  }
}
