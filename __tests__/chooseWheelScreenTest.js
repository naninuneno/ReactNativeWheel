import 'react-native';
import React from 'react';
import {render, waitFor} from '@testing-library/react-native';
import {ChooseWheelScreen} from '../app/views/chooseWheel';
import AsyncStorageMock from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import Wheel from '../app/wheel';
import {Section, SectionText} from '../app/common/section';
import {
  CHOOSE_WHEEL_LOADING_INDICATOR,
  CHOOSE_WHEEL_SAVED_WHEELS,
} from '../app/views/_testIds';

// not sure if this is needed - can't tell if this mock is reset between different test files,
// but it's not reset between different tests in the same test file
let default_getItem;
beforeEach(() => {
  default_getItem = AsyncStorageMock.getItem;
});
afterEach(() => {
  AsyncStorageMock.getItem = default_getItem;
});

test('choose wheel page has saved wheels', async () => {
  AsyncStorageMock.getItem = jest.fn(key => {
    if (key === 'savedWheels') {
      const wheel1 = new Wheel(1, 'Wheel 1', ['Choice A', 'Choice B']);
      const wheel2 = new Wheel(2, 'Wheel 2', [
        'Choice X',
        'Choice Y',
        'Choice Z',
      ]);
      const wheels = [wheel1, wheel2];
      return new Promise(resolve => {
        return resolve(JSON.stringify(wheels));
      });
    } else {
      throw new Error('Unexpected key used to getItem: ', key);
    }
  });

  const {getByText, getByTestId, queryByTestId} = render(<ChooseWheelScreen />);

  await waitFor(() => {
    getByText('Create Wheel');
    getByText('Clear data');

    const wheelsView = getByTestId(CHOOSE_WHEEL_SAVED_WHEELS);
    const sections = wheelsView.findAllByType(Section);
    const wheel1Section = sections[0];
    const wheel2Section = sections[1];

    expect(wheel1Section.props.title).toBe('Wheel 1');
    expect(wheel2Section.props.title).toBe('Wheel 2');

    const wheel1SectionTexts = wheel1Section.findAllByType(SectionText);
    expect(wheel1SectionTexts.length).toBe(3);
    expect(getSectionText(wheel1SectionTexts[0])).toBe('Choices:');
    expect(getSectionText(wheel1SectionTexts[1])).toBe('▪ Choice A');
    expect(getSectionText(wheel1SectionTexts[2])).toBe('▪ Choice B');

    const wheel2SectionTexts = wheel2Section.findAllByType(SectionText);
    expect(wheel2SectionTexts.length).toBe(4);
    expect(getSectionText(wheel2SectionTexts[0])).toBe('Choices:');
    expect(getSectionText(wheel2SectionTexts[1])).toBe('▪ Choice X');
    expect(getSectionText(wheel2SectionTexts[2])).toBe('▪ Choice Y');
    expect(getSectionText(wheel2SectionTexts[3])).toBe('▪ Choice Z');

    const loadingIndicator = queryByTestId(CHOOSE_WHEEL_LOADING_INDICATOR);
    expect(loadingIndicator).toBeNull();
  });

  function getSectionText(sectionTextNode) {
    return Array.isArray(sectionTextNode.props.children)
      ? sectionTextNode.props.children.join('')
      : sectionTextNode.props.children;
  }
});

test('choose wheel page has spinner until wheels loaded', async () => {
  AsyncStorageMock.getItem = jest.fn(key => {
    if (key === 'savedWheels') {
      // return non-promise so follow up promise-chaining doesn't happen (and loading isn't set to false)
      return 'Non-promise';
    } else {
      throw new Error('Unexpected key used to getItem: ', key);
    }
  });

  const {getByText, getByTestId, queryByTestId} = render(<ChooseWheelScreen />);

  await waitFor(() => {
    getByText('Create Wheel');
    getByText('Clear data');

    getByTestId(CHOOSE_WHEEL_LOADING_INDICATOR);
    const wheelsView = queryByTestId(CHOOSE_WHEEL_SAVED_WHEELS);
    expect(wheelsView).toBeNull();
  });
});
