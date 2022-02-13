import {Alert, Platform, ToastAndroid} from 'react-native';

export default function notify(msg) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    Alert.alert(msg);
  }
}
