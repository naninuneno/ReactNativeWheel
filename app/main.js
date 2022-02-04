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
import Wheel from './wheel';
import {NavigationContainer, useIsFocused} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const SAVED_WHEELS_ITEM = 'savedWheels';
const SAVED_CHOICES_ITEM = 'savedChoices';

const saveNewChoice = async choice => {
  let savedChoices = await AsyncStorage.getItem(SAVED_CHOICES_ITEM)
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
  await AsyncStorage.setItem(SAVED_CHOICES_ITEM, JSON.stringify(savedChoices));
};

const getSavedWheels = async () => {
  // await AsyncStorage.removeItem(SAVED_WHEELS_ITEM);
  const savedData = await AsyncStorage.getItem(SAVED_WHEELS_ITEM)
    .then(req => JSON.parse(req))
    .catch(error => console.error('Error getting saved wheels', error));
  if (savedData !== null) {
    return savedData;
  } else {
    return [];
  }
};

const saveNewWheel = async function (name, choices) {
  let savedWheels = await AsyncStorage.getItem(SAVED_WHEELS_ITEM)
    .then(req => JSON.parse(req))
    .catch(error => console.error('Error setting saved wheels', error));
  if (savedWheels === null) {
    savedWheels = [];
  }
  const id = savedWheels.length;
  const newWheel = new Wheel(id, name, choices);
  console.log('new wheels: ', newWheel);
  savedWheels.push(newWheel);
  await AsyncStorage.setItem(SAVED_WHEELS_ITEM, JSON.stringify(savedWheels));
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
          <Stack.Screen name="Choose Wheel" component={ChooseWheelScreen} />
          <Stack.Screen name="Create Wheel" component={CreateWheelScreen} />
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
          onPress={() => navigation.navigate('Choose Wheel')}
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

const ChooseWheelScreen = ({navigation}) => {
  const savedWheels = useRef([]);
  const [viewInitialised, setViewInitialised] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clearData, setClearData] = useState(false);

  useEffect(() => {
    if (!viewInitialised) {
      getSavedWheels().then(wheels => {
        console.log('saved wheels: ', wheels);
        savedWheels.current = wheels;
        setViewInitialised(true);
        setLoading(false);
      });
    }

    const deleteWheels = async () => {
      await AsyncStorage.removeItem(SAVED_WHEELS_ITEM);
    };
    if (clearData) {
      deleteWheels().then(() => {
        setLoading(true);
        getSavedWheels().then(wheels => {
          savedWheels.current = wheels;
          setLoading(false);
        });
      });
    }
  }, [viewInitialised, setViewInitialised, clearData]);

  return (
    <ScrollView>
      <View
        style={{
          flex: 1,
          alignItems: 'flex-end',
        }}>
        <Button
          title="Create Wheel"
          onPress={() => navigation.navigate('Create Wheel')}
        />
        <View style={{width: 1, height: 5}} />
        <Button title="Clear data" onPress={() => setClearData(true)} />
      </View>
      {loading ? (
        <ActivityIndicator style={{marginTop: 50}} />
      ) : (
        <View>
          {savedWheels.current.map((savedWheel, index) => {
            return (
              <View key={index}>
                <Section title={savedWheel.name}>
                  <SectionText>Choices:</SectionText>
                  {savedWheel.choices.map((choice, innerIndex) => {
                    return (
                      <SectionText key={innerIndex}>
                        {'\u25AA'} {choice}
                      </SectionText>
                    );
                  })}
                  <Button
                    title="Spin"
                    onPress={() => {
                      navigation.navigate('Wheel Spin', {
                        choices: savedWheel.choices,
                      });
                    }}
                  />
                </Section>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const CreateWheelScreen = ({navigation}) => {
  const savedWheelNames = useRef([]);
  const [viewInitialised, setViewInitialised] = useState(false);
  const wheelName = useRef('');
  const wheelChoices = useRef('');
  const [saveWheel, setSaveWheel] = useState(false);

  useEffect(() => {
    if (!viewInitialised) {
      getSavedWheels().then(wheels => {
        savedWheelNames.current = wheels.map(w => w.name);
        console.log('saved wheels (create wheel): ', savedWheelNames.current);
        setViewInitialised(true);
      });
    }

    if (saveWheel) {
      const choicesArray = wheelChoices.current.split(',').map(ch => ch.trim());
      saveNewWheel(wheelName.current, choicesArray).then(() => {
        navigation.popToTop();
        navigation.navigate('Choose Wheel');
      });
    }
  }, [viewInitialised, setViewInitialised, navigation, saveWheel]);

  return (
    <ScrollView>
      <Section>
        <Text>Wheel name:</Text>
        <TextInput
          style={{backgroundColor: 'white'}}
          onChangeText={wheelNameInput => {
            wheelName.current = wheelNameInput;
          }}
        />
        <Text>Enter wheel choices separated by comma:</Text>
        <TextInput
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

const WheelSpinScreen = ({navigation, route}) => {
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

  const choices = route.params.choices;
  const baseUrl = 'https://tools-unite.com/tools/random-picker-wheel?inputs=';
  const params = choices.map(ch => '' + ch + ':1').join(',');
  const spinUrl = baseUrl + params;

  const handleWebViewNavigationStateChange = newNavState => {
    const {url} = newNavState;
    console.log('New nav: ', url);
  };

  const [choice, setChoice] = useState('');

  useEffect(() => {
    if (choice) {
      saveNewChoice(choice).then(() => {
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
        uri: spinUrl,
      }}
      ref={webViewRef}
      onMessage={event => {
        let location;
        const message = event.nativeEvent.data;
        // TODO replace with wheel associations
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
  const [clearData, setClearData] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const savedValues = await AsyncStorage.getItem(SAVED_CHOICES_ITEM)
        .then(req => JSON.parse(req))
        .catch(error => console.error('Error getting saved choices', error));
      if (savedValues !== null) {
        setStoredChoices(savedValues);
      } else {
        setStoredChoices([]);
      }
    };

    const deleteChoices = async () => {
      await AsyncStorage.removeItem(SAVED_CHOICES_ITEM);
    };

    if (isFocused) {
      console.log('Fetching data...');
      getData().then(() => setLoading(false));
    } else {
      setLoading(true);
    }

    if (clearData) {
      deleteChoices().then(() => {
        setLoading(true);
        getData().then(() => setLoading(false));
      });
    }
  }, [isFocused, clearData]);

  return (
    <ScrollView>
      {loading ? (
        <ActivityIndicator style={{marginTop: 50}} />
      ) : (
        <View>
          <View
            style={{
              flex: 1,
              alignItems: 'flex-end',
            }}>
            <Button title="Clear data" onPress={() => setClearData(true)} />
          </View>
          <ChoicesList {...{navigation, storedChoices}} />
        </View>
      )}
    </ScrollView>
  );
};

const ChoicesList = ({navigation, storedChoices}) => {
  return storedChoices.map((storedChoice, index) => {
    return (
      <View key={index}>
        <Section title={storedChoice.name} subTitle={storedChoice.timestamp}>
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
  });
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
      await AsyncStorage.getItem(SAVED_CHOICES_ITEM)
        .then(req => JSON.parse(req))
        .then(savedChoices => savedChoices[choice.id])
        .catch(error => console.error('Error getting saved choice', error));
    };

    const updateChoice = async () => {
      const savedChoices = await AsyncStorage.getItem(SAVED_CHOICES_ITEM)
        .then(req => JSON.parse(req))
        .catch(error => console.error('Error getting saved choices', error));

      console.log('Before: ', choice);
      choice.additionalInfo = additionalInfoForUpdate;
      savedChoices[choice.id] = choice;
      console.log('After: ', choice);

      await AsyncStorage.setItem(
        SAVED_CHOICES_ITEM,
        JSON.stringify(savedChoices),
      );
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
