const detox = require('detox');
const { detox: config } = require('../package.json');
const adapter = require('detox/runners/mocha/adapter');

before(async () => {
  try {
    await detox.init(config, {initGlobals: false});
  } catch (e) {
    console.log(e)
  }
});

beforeEach(async function beforeEach() {
  await adapter.beforeEach(this);
});

afterEach(async function() {
  await adapter.afterEach(this);
});

after(async () => {
  console.log(' ✨ Tests Complete ✨ ');
  await detox.cleanup();
});
