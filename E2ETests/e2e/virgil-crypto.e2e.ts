import {by, element, expect as detoxExpect, waitFor} from 'detox';

import testCases from './test-cases';

describe('virgilCrypto', () => {
  for (const testCaseName of Object.keys(testCases)) {
    it(testCaseName, async () => {
      const testCase = element(by.id(testCaseName));
      await waitFor(testCase)
        .toBeVisible()
        .whileElement(by.id('testCasesScroll'))
        .scroll(200, 'down');
      await testCase.tap();
      await waitFor(element(by.id(`${testCaseName}Result`)))
        .toHaveText('ok')
        .withTimeout(5000);
      await element(by.id('removePassed')).tap();
      await waitFor(element(by.id(testCaseName)))
        .not.toExist()
        .withTimeout(2000);
    });
  }
});
