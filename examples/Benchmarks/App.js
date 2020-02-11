/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Fragment} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  ActivityIndicator,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import {createBenchmark} from './createBenchmark';

class App extends React.Component {
  state = {
    isRunning: false,
    benchmarks: [],
  };

  runBenchmark = () => {
    const suite = createBenchmark();

    suite.on('cycle', event => {
      this.setState(state => ({
        benchmarks: state.benchmarks.concat(event.target),
      }));
    });

    suite.on('complete', event => {
      this.setState({
        isRunning: false,
      });
    });

    suite.run({
      async: true,
    });
    this.setState({
      isRunning: true,
      benchmarks: [],
    });
  };

  render() {
    const {isRunning, benchmarks} = this.state;
    return (
      <Fragment>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            {global.HermesInternal == null ? null : (
              <View style={styles.engine}>
                <Text style={styles.footer}>Engine: Hermes</Text>
              </View>
            )}
            <View style={styles.body}>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Virgil Crypto Benchmark</Text>
                <Text style={styles.sectionDescription}>
                  Tap the button and wait for results to appear...
                </Text>
                <View style={styles.buttonContainer}>
                  <Button
                    title="Run"
                    disabled={isRunning}
                    onPress={this.runBenchmark}
                  />
                </View>
                <Fragment>
                  {benchmarks.map(b => (
                    <Text style={styles.benchmark} key={b.name}>
                      {String(b)}
                    </Text>
                  ))}
                </Fragment>
                {isRunning && (
                  <ActivityIndicator size="large" color="#333333" />
                )}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  buttonContainer: {
    marginVertical: 16,
  },
  benchmark: {
    marginBottom: 8,
  },
});

export default App;
