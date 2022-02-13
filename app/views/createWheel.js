import React, {useEffect, useRef, useState} from 'react';
import * as asyncStore from '../storage/asyncStore';
import * as screenNames from '../constants/screenNames';
import {Button, ScrollView, Text, TextInput} from 'react-native';
import {Section} from '../common/section';
import notify from '../common/notify';
import {
  CREATE_WHEEL_CHOICES_INPUT,
  CREATE_WHEEL_WHEEL_NAME_INPUT,
} from './_testIds';

export const CreateWheelScreen = ({navigation}) => {
  const savedWheelNames = useRef([]);
  const [viewInitialised, setViewInitialised] = useState(false);
  const wheelName = useRef('');
  const wheelChoices = useRef('');
  const [saveWheel, setSaveWheel] = useState(false);

  useEffect(() => {
    if (!viewInitialised) {
      asyncStore.getSavedWheels().then(wheels => {
        savedWheelNames.current = wheels.map(w => w.name);
        console.log('saved wheels (create wheel): ', savedWheelNames.current);
        setViewInitialised(true);
      });
    }

    if (saveWheel) {
      const choicesArray = wheelChoices.current.split(',').map(ch => ch.trim());
      asyncStore.saveNewWheel(wheelName.current, choicesArray).then(() => {
        navigation.popToTop();
        navigation.navigate(screenNames.CHOOSE_WHEEL);
      });
    }
  }, [viewInitialised, setViewInitialised, navigation, saveWheel]);

  return (
    <ScrollView>
      <Section>
        <Text>Wheel name:</Text>
        <TextInput
          testID={CREATE_WHEEL_WHEEL_NAME_INPUT}
          style={{backgroundColor: 'white'}}
          onChangeText={wheelNameInput => {
            wheelName.current = wheelNameInput;
          }}
        />
        <Text>Enter wheel choices separated by comma:</Text>
        <TextInput
          testID={CREATE_WHEEL_CHOICES_INPUT}
          style={{backgroundColor: 'white'}}
          onChangeText={wheelChoicesInput => {
            wheelChoices.current = wheelChoicesInput;
          }}
        />
        <Button
          title="Save"
          onPress={() => {
            if (wheelName.current.length < 1) {
              notify('Please provide a wheel name');
            } else if (savedWheelNames.current.includes(wheelName.current)) {
              notify('A wheel already exists with this name');
            } else if (wheelChoices.current.length < 1) {
              notify('Please provide wheel choices');
            } else if (wheelChoices.current.indexOf(',') === -1) {
              notify(
                'Please provide more than one wheel choice separated by comma',
              );
            } else {
              setSaveWheel(true);
            }
          }}
        />
      </Section>
    </ScrollView>
  );
};
