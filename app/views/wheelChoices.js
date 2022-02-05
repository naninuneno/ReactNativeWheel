import React, {useEffect, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import * as asyncStore from '../storage/asyncStore';
import {ActivityIndicator, Button, ScrollView, View} from 'react-native';
import {Section, SectionText} from '../common/section';
import * as screenNames from '../constants/screenNames';

export const WheelChoicesScreen = ({navigation}) => {
  const isFocused = useIsFocused();
  const [storedChoices, setStoredChoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clearData, setClearData] = useState(false);

  useEffect(() => {
    const refreshChoices = async () => {
      setLoading(true);
      asyncStore.getSavedChoices().then(choices => {
        setStoredChoices(choices);
        setLoading(false);
      });
    };

    if (isFocused) {
      console.log('Fetching data...');
      refreshChoices();
    } else {
      setLoading(true);
    }

    if (clearData) {
      asyncStore.deleteChoices().then(() => {
        refreshChoices();
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
              navigation.navigate(screenNames.CHOICE_DETAILS, {
                choice: storedChoice,
              })
            }
          />
        </Section>
      </View>
    );
  });
};
