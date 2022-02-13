import 'react-native';
import React from 'react';
import {act, fireEvent, render, waitFor} from '@testing-library/react-native';
import {CreateWheelScreen} from '../app/views/createWheel';
import AsyncStorageMock from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import {
  CREATE_WHEEL_CHOICES_INPUT,
  CREATE_WHEEL_WHEEL_NAME_INPUT,
} from '../app/views/_testIds';
import {Alert} from 'react-native';

beforeEach(() => {
  jest.spyOn(Alert, 'alert');
  AsyncStorageMock.clear();
});

test('create wheel successfully', async () => {
  await saveSuccessfulWheel();

  expect(Alert.alert).not.toHaveBeenCalled();
  expect(AsyncStorageMock.setItem.mock.calls.length).toBe(1);
  expect(AsyncStorageMock.setItem.mock.calls[0][1]).toBe(
    '[{"id":0,"name":"Wheel Name","choices":["Choice 1","Choice 2"]}]',
  );
});

test('validation for existing wheel with same name', async () => {
  await saveSuccessfulWheel();
  await saveSuccessfulWheel();

  expect(AsyncStorageMock.setItem.mock.calls.length).toBe(1);
  expect(Alert.alert).toHaveBeenCalledWith(
    'A wheel already exists with this name',
  );
});

test('validation for empty wheel name', async () => {
  const {getByText, getByTestId} = await render(<CreateWheelScreen />);

  await enterChoicesInput(getByTestId, 'Choice 1, Choice 2');
  await saveWheel(getByText);

  expect(AsyncStorageMock.setItem.mock.calls.length).toBe(0);
  expect(Alert.alert).toHaveBeenCalledWith('Please provide a wheel name');
});

test('validation for empty choices', async () => {
  const {getByText, getByTestId} = await render(<CreateWheelScreen />);

  await enterWheelNameInput(getByTestId, 'Wheel Name');
  await saveWheel(getByText);

  expect(AsyncStorageMock.setItem.mock.calls.length).toBe(0);
  expect(Alert.alert).toHaveBeenCalledWith('Please provide wheel choices');
});

test('validation for choices input without multiple comma-separated values', async () => {
  const {getByText, getByTestId} = await render(<CreateWheelScreen />);

  await enterWheelNameInput(getByTestId, 'Wheel Name');
  await enterChoicesInput(getByTestId, 'Single choices value');
  await saveWheel(getByText);

  expect(AsyncStorageMock.setItem.mock.calls.length).toBe(0);
  expect(Alert.alert).toHaveBeenCalledWith(
    'Please provide more than one wheel choice separated by comma',
  );
});

async function saveSuccessfulWheel() {
  const {getByText, getByTestId} = await render(<CreateWheelScreen />);

  await enterWheelNameInput(getByTestId, 'Wheel Name');
  await enterChoicesInput(getByTestId, 'Choice 1, Choice 2');
  await saveWheel(getByText);
}

async function enterWheelNameInput(getByTestId, inputValue) {
  await act(async () =>
    fireEvent.changeText(
      getByTestId(CREATE_WHEEL_WHEEL_NAME_INPUT),
      inputValue,
    ),
  );
}

async function enterChoicesInput(getByTestId, inputValue) {
  await act(async () =>
    fireEvent.changeText(getByTestId(CREATE_WHEEL_CHOICES_INPUT), inputValue),
  );
}

async function saveWheel(getByText) {
  await act(async () => fireEvent.press(getByText('Save')));
}
