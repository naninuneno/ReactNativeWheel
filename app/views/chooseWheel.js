import React, {useEffect, useRef, useState} from 'react';
import * as asyncStore from '../storage/asyncStore';
import {ActivityIndicator, Button, ScrollView, View} from 'react-native';
import * as screenNames from '../constants/screenNames';
import {Section, SectionText} from '../common/section';

export const ChooseWheelScreen = ({navigation}) => {
  const savedWheels = useRef([]);
  const [viewInitialised, setViewInitialised] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clearData, setClearData] = useState(false);

  useEffect(() => {
    if (!viewInitialised) {
      asyncStore.getSavedWheels().then(wheels => {
        console.log('saved wheels: ', wheels);
        savedWheels.current = wheels;
        setViewInitialised(true);
        setLoading(false);
      });
    }

    if (clearData) {
      asyncStore.deleteWheels().then(() => {
        setLoading(true);
        asyncStore.getSavedWheels().then(wheels => {
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
          onPress={() => navigation.navigate(screenNames.CREATE_WHEEL)}
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
                      navigation.navigate(screenNames.SPIN_WHEEL, {
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
