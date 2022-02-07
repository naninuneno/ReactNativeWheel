/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../app/main';
import {render, fireEvent, waitFor} from '@testing-library/react-native';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import {HomeScreen} from '../app/views/home';

// it('renders correctly', () => {
//   renderer.create(<App />);
// });

test('buttons are present on home screen', async () => {
  const {getByText} = render(<App />);

  await waitFor(() => getByText('Saved Choices'));
});

test('home screen directly', async () => {
  const {getByText} = render(<HomeScreen />);

  await waitFor(() => getByText('Saved Choices'));
});
