import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import SimpleView from './SimpleView';

describe('SimpleView', () => {
  const createTestInstance = props =>
    TestRenderer.create(<SimpleView {...props} />);

  test('Renders a form field', () => {
    let component;
    act(() => {
      component = createTestInstance({
        label: 'label',
        value: 'value'
      });
    });

    expect(() =>
      component.root.find(
        element => element.type && element.type.name === 'FormField'
      )
    ).not.toThrow();
  });

  test('Renders both a label and a value', () => {
    let component;
    act(() => {
      component = createTestInstance({
        label: 'label',
        value: 'value'
      });
    });

    expect(() => component.root.findByProps({ value: 'value' })).not.toThrow();
    expect(() => component.root.findByProps({ label: 'label' })).not.toThrow();
  });

  test('Uses placeholder for missing value prop', () => {
    let component;
    act(() => {
      component = createTestInstance({
        label: 'label',
        value: undefined,
        placeholder: 'N/A'
      });
    });

    expect(() =>
      component.root.findByProps({ placeholder: 'N/A' })
    ).not.toThrow();
  });
});
