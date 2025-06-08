const { parentPort, workerData } = require('worker_threads');
const { runBot } = require('./bot');

(async () => {
  try {
    await runBot(workerData.keyword, workerData.url, workerData.proxy);
    parentPort.postMessage({ success: true });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
})();
