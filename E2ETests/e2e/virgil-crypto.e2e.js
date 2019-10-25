const { element, by, waitFor } = require('detox');
const testCases = require('./test-cases');

describe('virgilCrypto', () => {
  Object.keys(testCases).forEach(testCaseName => {
    it(testCaseName, async () => {
      await element(by.id(testCaseName)).tap();
      await waitFor(element(by.id(testCaseName + 'Result'))).toHaveText('ok').withTimeout(1000);
      await element(by.id('removePassed')).tap();
    });
  });
});