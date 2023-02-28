import testCases from './test-cases'
import detox from "detox";

describe('virgilCrypto', () => {

  // before(async () => {
  //   await detox.installWorker()
  // });
  //
  // after(async () => {
  //   console.log(' ✨ Tests Complete ✨ ');
  //   await detox.cleanup();
  // });

  Object.keys(testCases).forEach(testCaseName => {
    it(testCaseName, async () => {
      await detox.element(detox.by.id(testCaseName)).tap();
      await detox.waitFor(detox.element(detox.by.id(testCaseName + 'Result'))).toHaveText('ok').withTimeout(1000);
      await detox.element(detox.by.id('removePassed')).tap();
    });
  });
});