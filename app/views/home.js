import React from 'react';
import {Button, View} from 'react-native';
import {Section} from '../common/section';
import * as screenNames from '../constants/screenNames';

export const HomeScreen = ({navigation}) => {
  return (
    <View>
      <Section>
        <Button
          title="Spin Wheel"
          onPress={() => navigation.navigate(screenNames.CHOOSE_WHEEL)}
        />
      </Section>
      <Section>
        <Button
          title="Saved Choices"
          onPress={() => navigation.navigate(screenNames.WHEEL_CHOICES)}
        />
      </Section>
    </View>
  );
};
