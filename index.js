// index.js
const figlet = require('figlet');
const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs');
const { runBot } = require('./src/bot');
const { fetchProxiesFromURLs } = require('./src/proxy');
const os = require('os');
const path = require('path');
const { Worker } = require('worker_threads');

console.clear();
console.log(chalk.cyan(figlet.textSync('SEOSAMUDERA', { horizontalLayout: 'full' })));
console.log(chalk.yellowBright('SELAMAT DATANG BOSKU AKASHI ARROCHMAN!'));
console.log(chalk.greenBright('SELAMAT BERAKSELERASI ^_^'));
console.log(chalk.magentaBright('SELAMAT DATANG DI SEOSAMUDERA BOT\n'));

(async () => {
  const keywordDir = './keywords';
  const keywordFiles = fs.readdirSync(keywordDir).filter(f => f.endsWith('.txt'));

  const { targetURL, keywordFile } = await inquirer.prompt([
    {
      type: 'input',
      name: 'targetURL',
      message: 'Masukkan URL target website:',
      validate: input => input.startsWith('http') || 'Masukkan URL valid (http/https)',
    },
    {
      type: 'list',
      name: 'keywordFile',
      message: 'Pilih file keyword:',
      choices: keywordFiles,
    }
  ]);

  console.log(chalk.blue('[INFO] Mengambil proxy dari URL penyedia...'));
  const proxies = await fetchProxiesFromURLs();
  console.log(chalk.green(`[INFO] Total proxy aktif: ${proxies.length}`));

  const keywords = fs.readFileSync(path.join(keywordDir, keywordFile), 'utf-8')
    .split('\n')
    .filter(Boolean);

  let index = 0;
  let activeThreads = 0;
  const maxThreads = 20;

  const runNext = () => {
    if (index >= keywords.length) return;
    if (activeThreads >= maxThreads) return;

    const keyword = keywords[index++];
    const proxy = proxies[Math.floor(Math.random() * proxies.length)];
    activeThreads++;

    const worker = new Worker('./src/worker.js', {
      workerData: { keyword, targetURL, proxy }
    });

    worker.on('message', msg => console.log(msg));
    worker.on('exit', () => {
      activeThreads--;
      runNext();
    });
    worker.on('error', err => {
      console.error(`[ERROR] Worker gagal:`, err);
      activeThreads--;
      runNext();
    });

    runNext();
  };

  for (let i = 0; i < maxThreads; i++) runNext();
})();
