import React, {Fragment, useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import {createBenchmark} from './createBenchmark';

type BenchmarkResult = {
  name: string;
  toString: () => string;
};

function App(): React.JSX.Element {
  const [isRunning, setIsRunning] = useState(false);
  const [benchmarks, setBenchmarks] = useState<BenchmarkResult[]>([]);

  const runBenchmark = useCallback(() => {
    const suite = createBenchmark();

    suite.on('cycle', (event: {target: BenchmarkResult}) => {
      setBenchmarks(prev => prev.concat(event.target));
    });

    suite.on('complete', () => {
      setIsRunning(false);
    });

    setBenchmarks([]);
    setIsRunning(true);
    suite.run({async: true});
  }, []);

  return (
    <Fragment>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
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
                  onPress={runBenchmark}
                />
              </View>
              {benchmarks.map(b => (
                <Text style={styles.benchmark} key={b.name}>
                  {String(b)}
                </Text>
              ))}
              {isRunning && <ActivityIndicator size="large" color="#333333" />}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
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
