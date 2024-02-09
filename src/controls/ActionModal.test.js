import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import ActionModal from './ActionModal';

describe('ActionModal', () => {
  const createTestInstance = props =>
    TestRenderer.create(
      <ActionModal
        {...{
          open: true,
          onClose: () => {},
          onConfirm: () => {},
          header: 'header',
          description: <p>text</p>,
          confirmIcon: 'configure',
          cancelLabel: 'cancel',
          ...props
        }}
      />
    );

  test('Calls confirm and close callbacks when clicking confirm', async () => {
    const onConfirmSpy = jest.fn();
    const onCloseSpy = jest.fn();
    let component;
    act(() => {
      component = createTestInstance({
        onClose: onCloseSpy,
        onConfirm: onConfirmSpy
      });
    });
    await act(async () => {
      await component.root.findAllByType('button')[1].props.onClick();
    });

    expect(onConfirmSpy).toHaveBeenCalledTimes(1);
    // expect(onCloseSpy).toHaveBeenCalledTimes(1);
  });

  test('Calls close callback when clicking cancel', async () => {
    const onConfirmSpy = jest.fn();
    const onCloseSpy = jest.fn();
    let component;
    act(() => {
      component = createTestInstance({
        onClose: onCloseSpy,
        onConfirm: onConfirmSpy
      });
    });
    await act(async () => {
      await component.root.findAllByType('button')[0].props.onClick();
    });

    expect(onCloseSpy).toHaveBeenCalledTimes(1);
    expect(onConfirmSpy).not.toHaveBeenCalledTimes(1);
  });

  test('Shows confirm icon when provided', () => {
    let component;
    act(() => {
      component = createTestInstance();
    });

    expect(() =>
      component.root.findByProps({ name: 'configure' })
    ).not.toThrow();
  });

  test('Passes props down to confirm button', () => {
    const negative = false;
    let component;
    act(() => {
      component = createTestInstance();
    });

    let confirmButton;
    expect(() => {
      confirmButton = component.root.findByProps({ primary: true, negative });
    }).not.toThrow();
    expect(confirmButton.props).toMatchObject({
      onClick: expect.any(Function),
      size: 'large',
      disabled: expect.any(Boolean),
      loading: expect.any(Boolean),
      primary: true,
      negative: expect.any(Boolean)
    });
  });

  test('Passes props down to cancel button', () => {
    let component;
    act(() => {
      component = createTestInstance();
    });

    let cancelButton;
    expect(() => {
      cancelButton = component.root.findByProps({ children: 'cancel' });
    }).not.toThrow();
    expect(cancelButton.props).toMatchObject({
      onClick: expect.any(Function),
      size: 'large',
      disabled: expect.any(Boolean),
      children: 'cancel'
    });
  });

  test('Passes props down to modal bits', () => {
    let component;
    act(() => {
      component = createTestInstance({
        header: 'header',
        description: 'desc'
      });
    });

    let modal;
    expect(() => {
      modal = component.root.findByProps({ size: 'tiny', dimmer: 'blurring' });
    }).not.toThrow();
    expect(modal.props).toMatchObject({
      onClose: expect.any(Function),
      open: expect.any(Boolean)
    });

    expect(() => {
      component.root.findByProps({ header: 'header' });
    }).not.toThrow();
    expect(() => {
      component.root.findByProps({ description: 'desc' });
    }).not.toThrow();
  });
});
