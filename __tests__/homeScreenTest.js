import 'react-native';
import React from 'react';
import {render, waitFor} from '@testing-library/react-native';
import {HomeScreen} from '../app/views/home';

test('home screen has expected buttons', async () => {
  const {getByText} = render(<HomeScreen />);

  await getByText('Spin Wheel');
  await getByText('Saved Choices');
});
