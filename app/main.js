/**
 * @format
 * @flow strict-local
 */

import React from 'react';
import {View} from 'react-native';
import {HomeScreen} from './views/home';
import {ChooseWheelScreen} from './views/chooseWheel';
import {CreateWheelScreen} from './views/createWheel';
import {SpinWheelScreen} from './views/spinWheel';
import {WheelChoicesScreen} from './views/wheelChoices';
import {ChoiceDetailsScreen} from './views/choiceDetails';
import * as screenNames from './constants/screenNames';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {EditWheelScreen} from './views/editWheel';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <View style={{flex: 1}}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name={screenNames.HOME} component={HomeScreen} />
          <Stack.Screen
            name={screenNames.CHOOSE_WHEEL}
            component={ChooseWheelScreen}
          />
          <Stack.Screen
            name={screenNames.CREATE_WHEEL}
            component={CreateWheelScreen}
          />
          <Stack.Screen
            name={screenNames.EDIT_WHEEL}
            component={EditWheelScreen}
          />
          <Stack.Screen
            name={screenNames.SPIN_WHEEL}
            component={SpinWheelScreen}
          />
          <Stack.Screen
            name={screenNames.WHEEL_CHOICES}
            options={{title: 'History'}}>
            {props => <WheelChoicesScreen {...props} />}
          </Stack.Screen>
          <Stack.Screen
            name={screenNames.CHOICE_DETAILS}
            component={ChoiceDetailsScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

export default App;
