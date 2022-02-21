import React, {useEffect, useRef, useState} from 'react';
import * as asyncStore from '../storage/asyncStore';
import * as screenNames from '../constants/screenNames';
import notify from '../common/notify';
import WebView from 'react-native-webview';

export const SpinWheelScreen = ({navigation, route}) => {
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
      asyncStore.saveNewChoice(choice).then(() => {
        // popToTop to navigate to home screen first then choices
        // so 'Back' navigation from choices will go back to home instead of wheel spin
        navigation.popToTop();
        navigation.navigate(screenNames.WHEEL_CHOICES);
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
            'https://tools-unite.com/tools/random-picker-wheel?inputs=Choice1:1,Choice2:1,' +
            'Choice3:1';
        } else if (message === 'Read' || message === 'Watch') {
          location =
            'https://tools-unite.com/tools/random-picker-wheel?inputs=ReadWatch1:1,ReadWatch2:1,' +
            'ReadWatch3:1,ReadWatch4:1,ReadWatch5:1';
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
