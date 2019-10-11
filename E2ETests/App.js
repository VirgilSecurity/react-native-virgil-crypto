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
import { expect } from 'chai';
import testCases from './e2e/test-cases';

function evalTest(body) {
  try {
    Function('module', 'expect', `"use strict"; (${body})(module, expect);`)(rnvcModule, expect);
  } catch (err) {
    console.log(err.message);
    return err.message;
  }
  return 'ok';
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = Object.keys(testCases).reduce((state, name) => {
      state[name] = {
        result: null
      };
      return state;
    }, {});
  }

  runTest(name) {
    const body = testCases[name];
    const result = evalTest(body);
    this.setState({ [name]: { result } });
  }

  render() {
    return (
      <ScrollView>
        <View style={[styles.container, styles.horizontal]}>
          {Object.keys(this.state).map(testCaseName => (
            <View key={testCaseName} style={styles.case}>
              <TouchableOpacity testID={testCaseName} onPress={() => this.runTest(testCaseName)}>
                <Text style={styles.item}>{testCaseName}</Text>
              </TouchableOpacity>
              {this.state[testCaseName].result && <Text style={[styles.item, styles.result]} testID={`${testCaseName}Result`}>{this.state[testCaseName].result}</Text>}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 60
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
