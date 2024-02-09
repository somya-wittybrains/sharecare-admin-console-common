import 'semantic-ui-react/dist/commonjs/addons/Portal/Portal';

jest.mock(
  'semantic-ui-react/dist/commonjs/addons/Portal/Portal',
  () => ({ children }) => children
);
