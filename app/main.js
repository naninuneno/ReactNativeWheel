/**
 * @format
 * @flow strict-local
 */

import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Platform,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import WebView from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Section, SectionText} from './common/section';
import Choice from './choice';
import {NavigationContainer, useIsFocused} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const setData = async choice => {
  let savedChoices = await AsyncStorage.getItem('savedChoices')
    .then(req => JSON.parse(req))
    .catch(error => console.error('Error setting saved choices', error));
  if (savedChoices === null) {
    savedChoices = [];
  }
  const currentTime = new Date().toLocaleString();
  const id = savedChoices.length;
  const newChoice = new Choice(id, choice, currentTime, '');
  savedChoices.push(newChoice);
  console.log('saving?');
  await AsyncStorage.setItem('savedChoices', JSON.stringify(savedChoices));
};

function notify(msg) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    // TODO test this, where does it show? should show on top
    Alert.alert(msg);
  }
}

const App = () => {
  return (
    <View style={{flex: 1}}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Wheel Spin" component={WheelSpinScreen} />
          <Stack.Screen name="Wheel Choices" options={{title: 'History'}}>
            {props => <WheelChoicesScreen {...props} />}
          </Stack.Screen>
          <Stack.Screen name="Choice Details" component={ChoiceDetailsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

const HomeScreen = ({navigation}) => {
  return (
    <View>
      <Section>
        <Button
          title="Spin Wheel"
          onPress={() => navigation.navigate('Wheel Spin')}
        />
      </Section>
      <Section>
        <Button
          title="Saved Choices"
          onPress={() => navigation.navigate('Wheel Choices')}
        />
      </Section>
    </View>
  );
};

const WheelSpinScreen = ({navigation}) => {
  const runFirst = `
      function getElementByXpath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      }

      setInterval(function() {
        const readyToSpinButton = getElementByXpath('.//*[text()="Ready to Spin!"]');
        if (readyToSpinButton) {
          readyToSpinButton.click();
        }

        const selectedValue = getElementByXpath(".//*[text()='Selected']/../../span");
        if (selectedValue) {
          window.ReactNativeWebView.postMessage(selectedValue.textContent);
        }
      }, 500);
      true; // note: this is required, or you'll sometimes get silent failures
    `;

  const webViewRef = useRef();

  const handleWebViewNavigationStateChange = newNavState => {
    const {url} = newNavState;
    console.log('New nav: ', url);
  };

  const [choice, setChoice] = useState('');

  useEffect(() => {
    // DEV - to clear data down to test fresh instance
    const clearData = async () => {
      await AsyncStorage.removeItem('savedChoices');
    };

    if (choice) {
      // clearData();
      setData(choice).then(() => {
        // popToTop to navigate to home screen first then choices
        // so 'Back' navigation from choices will go back to home instead of wheel spin
        navigation.popToTop();
        navigation.navigate('Wheel Choices');
        notify("Choice '" + choice + "' saved");
      });
    }
  }, [choice, navigation]);

  return (
    <WebView
      source={{
        uri:
          'https://tools-unite.com/tools/random-picker-wheel?inputs=Read:1,Watch:1,' +
          'Read:1,Watch:1,Read:1,Watch:1,Read:1,Watch:1,SmallWheel:1',
      }}
      ref={webViewRef}
      onMessage={event => {
        let location;
        const message = event.nativeEvent.data;
        if (message === 'SmallWheel') {
          location =
            'https://tools-unite.com/tools/random-picker-wheel?inputs=OpenSource:1,Productive:1,' +
            'Free:1';
        } else if (message === 'Read' || message === 'Watch') {
          location =
            'https://tools-unite.com/tools/random-picker-wheel?inputs=Language:1,Misc:1,' +
            'Programming:1,Piano:1,Politics:1';
        } else {
          setChoice(message);
        }

        if (location) {
          webViewRef.current.injectJavaScript(
            'this.document.location = "' + location + '";',
          );
        }
      }}
      injectedJavaScript={runFirst}
      startInLoadingState={true}
      scalesPageToFit={true}
      style={{marginTop: 20}}
      onNavigationStateChange={handleWebViewNavigationStateChange}
    />
  );
};

const WheelChoicesScreen = ({navigation}) => {
  const isFocused = useIsFocused();
  const [storedChoices, setStoredChoices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const savedValues = await AsyncStorage.getItem('savedChoices')
        .then(req => JSON.parse(req))
        .catch(error => console.error('Error getting saved choices', error));
      if (savedValues !== null) {
        setStoredChoices(savedValues);
      }
    };

    if (isFocused) {
      console.log('Fetching data...');
      getData().then(() => setLoading(false));
    } else {
      setLoading(true);
    }
  }, [isFocused]);

  return (
    <ScrollView>
      {loading ? (
        <ActivityIndicator style={{marginTop: 50}} />
      ) : (
        storedChoices.map((storedChoice, index) => {
          return (
            <View key={index}>
              <Section
                title={storedChoice.name}
                subTitle={storedChoice.timestamp}>
                <SectionText>Info: {storedChoice.additionalInfo}</SectionText>
                <Button
                  title="Details"
                  onPress={() =>
                    navigation.navigate('Choice Details', {
                      choice: storedChoice,
                    })
                  }
                />
              </Section>
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

const ChoiceDetailsScreen = ({route}) => {
  const choice = route.params.choice;
  let additionalInfo = '';
  const [additionalInfoForUpdate, setAdditionalInfoForUpdate] = useState('');
  // used to avoid running useEffect()'s initial render which would reset additional info
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      console.log('Skipping first render');
      firstRender.current = false;
      return;
    }

    const getSavedChoice = async () => {
      await AsyncStorage.getItem('savedChoices')
        .then(req => JSON.parse(req))
        .then(savedChoices => savedChoices[choice.id])
        .catch(error => console.error('Error getting saved choice', error));
    };

    const updateChoice = async () => {
      const savedChoices = await AsyncStorage.getItem('savedChoices')
        .then(req => JSON.parse(req))
        .catch(error => console.error('Error getting saved choices', error));

      console.log('Before: ', choice);
      choice.additionalInfo = additionalInfoForUpdate;
      savedChoices[choice.id] = choice;
      console.log('After: ', choice);

      await AsyncStorage.setItem('savedChoices', JSON.stringify(savedChoices));
    };

    getSavedChoice().then(() =>
      updateChoice().then(() => notify('Choice updated')),
    );
  }, [additionalInfoForUpdate, choice]);

  return (
    <View>
      <Text>
        {choice.id} - {choice.name} - {choice.timestamp}
      </Text>
      <TextInput
        style={{backgroundColor: 'white'}}
        placeholder={'Enter additional info...'}
        defaultValue={choice.additionalInfo}
        onChangeText={newText => {
          additionalInfo = newText;
        }}
      />
      <Button
        onPress={() => setAdditionalInfoForUpdate(additionalInfo)}
        title="Save"
      />
    </View>
  );
};

export default App;
