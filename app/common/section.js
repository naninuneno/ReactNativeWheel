import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

export const Section = ({children, title, subTitle}): Node => {
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionSubTitle,
          {
            color: Colors.gray,
          },
        ]}>
        {subTitle}
      </Text>
      <View>{children}</View>
    </View>
  );
};

export const SectionText = ({children}): Node => {
  return (
    <Text
      style={[
        styles.sectionDescription,
        {
          color: Colors.dark,
        },
      ]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  sectionSubTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  sectionDescription: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});
