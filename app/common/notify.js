import {Alert, Platform, ToastAndroid} from 'react-native';

export default function notify(msg) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    // TODO test this, where does it show? should show on top
    Alert.alert(msg);
  }
}
