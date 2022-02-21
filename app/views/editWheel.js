import React from 'react';
import {ScrollView, Text} from 'react-native';

export const EditWheelScreen = ({navigation, route}) => {
  return (
    <ScrollView>
      <Text>Wheel test: {route.params.wheel.name}</Text>
    </ScrollView>
  );
};
