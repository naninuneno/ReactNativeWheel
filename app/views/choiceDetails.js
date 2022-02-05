import React, {useEffect, useRef, useState} from 'react';
import * as asyncStore from '../storage/asyncStore';
import notify from '../common/notify';
import {Button, Text, TextInput, View} from 'react-native';

export const ChoiceDetailsScreen = ({route}) => {
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

    choice.additionalInfo = additionalInfoForUpdate;
    asyncStore.updateChoice(choice).then(() => notify('Choice updated'));
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
