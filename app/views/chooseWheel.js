import React, {useEffect, useRef, useState} from 'react';
import * as asyncStore from '../storage/asyncStore';
import {ActivityIndicator, Button, ScrollView, View} from 'react-native';
import * as screenNames from '../constants/screenNames';
import {Section, SectionText} from '../common/section';
import {styles} from '../common/styles';
import {
  CHOOSE_WHEEL_LOADING_INDICATOR,
  CHOOSE_WHEEL_SAVED_WHEELS,
} from './_testIds';

export const ChooseWheelScreen = ({navigation}) => {
  const savedWheels = useRef([]);
  const [viewInitialised, setViewInitialised] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clearData, setClearData] = useState(false);

  useEffect(() => {
    if (!viewInitialised) {
      asyncStore.getSavedWheels().then(wheels => {
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
      <View style={styles.alignEnd}>
        <Button
          title="Create Wheel"
          onPress={() => navigation.navigate(screenNames.CREATE_WHEEL)}
        />
        <View style={{width: 1, height: 5}} />
        <Button title="Clear data" onPress={() => setClearData(true)} />
      </View>
      {loading ? (
        <ActivityIndicator
          style={{marginTop: 50}}
          testID={CHOOSE_WHEEL_LOADING_INDICATOR}
        />
      ) : (
        <View testID={CHOOSE_WHEEL_SAVED_WHEELS}>
          {savedWheels.current.map((savedWheel, index) => {
            return (
              <View key={index} testID={savedWheel.name}>
                <Section title={savedWheel.name}>
                  <View style={styles.alignEnd}>
                    <Button
                      title="View"
                      onPress={() => {
                        navigation.navigate(screenNames.EDIT_WHEEL, {
                          wheel: savedWheel,
                        });
                      }}
                    />
                  </View>
                  <SectionText>Choices:</SectionText>
                  {savedWheel.choices.map((choice, innerIndex) => {
                    return (
                      <SectionText key={innerIndex}>
                        {'\u25AA'} {choice}
                      </SectionText>
                    );
                  })}
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      marginLeft: 100,
                      marginRight: 100,
                    }}>
                    <Button
                      title="Spin"
                      onPress={() => {
                        navigation.navigate(screenNames.SPIN_WHEEL, {
                          choices: savedWheel.choices,
                        });
                      }}
                    />
                  </View>
                </Section>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};
