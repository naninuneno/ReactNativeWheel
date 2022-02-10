import 'react-native';
import React from 'react';
import App from '../app/main';
import {render, waitFor} from '@testing-library/react-native';

// Note: test renderer must be required after react-native.
// import renderer from 'react-test-renderer';

test('app starts at home screen', async () => {
  const {getByText} = render(<App />);

  await getByText('Spin Wheel');
  await getByText('Saved Choices');
});
