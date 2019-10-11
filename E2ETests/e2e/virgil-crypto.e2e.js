const { element, by, waitFor } = require('detox');
const testCases = require('./test-cases');

describe('virgilCrypto', () => {
  Object.keys(testCases).forEach(testCaseName => {
    it(testCaseName, async () => {
      // TODO: if there will be more test cases than can fit on the screen,
      // they will fail as the element will not be found. We'll need to 
      // figure out a way to make them visible (e.g. by removing elements after 
      // the corresponding test completes)
      await element(by.id(testCaseName)).tap();
      await waitFor(element(by.id(testCaseName + 'Result'))).toHaveText('ok').withTimeout(1000);
    });
  });
});