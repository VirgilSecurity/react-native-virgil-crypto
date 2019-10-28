/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as rnvcModule from 'react-native-virgil-crypto';
import testCases from './e2e/test-cases';

function evalTest(body) {
  try {
    body(rnvcModule);
  } catch (err) {
    console.log(err.message);
    return err.message;
  }
  return 'ok';
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      testCases: Object.keys(testCases).reduce((acc, name) => {
        acc[name] = {
          result: null
        };
        return acc;
      }, {}),
    };
  }

  runTest(name) {
    const body = testCases[name];
    const result = evalTest(body);
    this.setState(({ testCases }) => {
      testCases[name] = { result };
      return { testCases };
    });
  }

  removePassedTests() {
    this.setState(({ testCases }) => {
      const pending = Object.keys(testCases)
      .filter(name => testCases[name].result == null)
      .reduce((acc, name) => {
        acc[name] = testCases[name];
        return acc;
      }, {});

      return { testCases: pending };
    });
  }

  render() {
    const { testCases } = this.state;
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.horizontal}>
            {Object.keys(testCases).map(testCaseName => (
              <View key={testCaseName} style={styles.case}>
                <TouchableOpacity testID={testCaseName} onPress={() => this.runTest(testCaseName)}>
                  <Text style={styles.item}>{testCaseName}</Text>
                </TouchableOpacity>
                {testCases[testCaseName].result && <Text style={[styles.item, styles.result]} testID={`${testCaseName}Result`}>{testCases[testCaseName].result}</Text>}
              </View>
            ))}
          </View>
        </ScrollView>
        <TouchableOpacity testID={'removePassed'} style={styles.bottomButton} onPress={() => this.removePassedTests()}>
          <Text>{'Remove passed tests'}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50
  },
  scrollView: {
    flex: 1
  },
  bottomButton: {
    flex: 0,
    alignSelf: 'center'
  },
  horizontal: {
    flexDirection: 'column',
    padding: 10,
  },
  item: {
    fontSize: 12,
  },
  module: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  group: {
    fontSize: 16,
    color: 'grey',
  },
  case: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 8,
  },
  result: {
    marginLeft: 10
  }
});

export default App;
