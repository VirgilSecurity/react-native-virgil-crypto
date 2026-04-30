import React, {useState} from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as rnvcModule from 'react-native-virgil-crypto';

import testCases from './e2e/test-cases';

type TestResult = {
  result: string | null;
};

type TestCaseState = Record<string, TestResult>;

function getInitialState(): TestCaseState {
  return Object.keys(testCases).reduce<TestCaseState>((acc, name) => {
    acc[name] = {result: null};
    return acc;
  }, {});
}

function evalTest(name: string): string {
  try {
    testCases[name as keyof typeof testCases](rnvcModule);
    return 'ok';
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return error.message;
    }
    console.log(error);
    return String(error);
  }
}

function App(): React.JSX.Element {
  const [cases, setCases] = useState<TestCaseState>(getInitialState);

  function runTest(name: string) {
    const result = evalTest(name);
    setCases(current => ({
      ...current,
      [name]: {result},
    }));
  }

  function removePassedTests() {
    setCases(current =>
      Object.entries(current).reduce<TestCaseState>((acc, [name, details]) => {
        if (details.result == null) {
          acc[name] = details;
        }
        return acc;
      }, {}),
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        testID="testCasesScroll"
        contentContainerStyle={styles.scrollContent}>
        {Object.keys(cases).map(testCaseName => (
          <View key={testCaseName} style={styles.case}>
            <Pressable testID={testCaseName} onPress={() => runTest(testCaseName)}>
              <Text style={styles.item}>{testCaseName}</Text>
            </Pressable>
            {cases[testCaseName].result ? (
              <Text style={styles.result} testID={`${testCaseName}Result`}>
                {cases[testCaseName].result}
              </Text>
            ) : null}
          </View>
        ))}
      </ScrollView>
      <Pressable
        testID="removePassed"
        style={styles.bottomButton}
        onPress={removePassedTests}>
        <Text style={styles.bottomButtonText}>Remove passed tests</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bottomButton: {
    alignItems: 'center',
    borderTopColor: '#d4d4d8',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bottomButtonText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  case: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  container: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  item: {
    color: '#111827',
    fontSize: 13,
  },
  result: {
    color: '#374151',
    fontSize: 13,
    marginLeft: 12,
  },
  scrollContent: {
    padding: 12,
  },
});

export default App;
