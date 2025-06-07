const figlet = require('figlet');
const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs');
const { runBot } = require('./src/bot');
const { fetchProxies } = require('./src/proxy');
const fetch = require('node-fetch'); // npm install node-fetch@2

console.clear();
console.log(chalk.cyan(figlet.textSync('SEOSAMUDERA', { horizontalLayout: 'full' })));
console.log(chalk.yellowBright('SELAMAT DATANG BOSKU AKASHI ARROCHMAN!'));
console.log(chalk.greenBright('SELAMAT BERAKSELERASI ^_^'));
console.log(chalk.magentaBright('SELAMAT DATANG DI SEOSAMUDERA BOT\n'));

async function validateProxy(proxy, testUrl) {
  try {
    const HttpsProxyAgent = require('https-proxy-agent');
    const agent = new HttpsProxyAgent('http://' + proxy);

    const response = await fetch(testUrl, { method: 'GET', agent, timeout: 10000 });
    if (response.ok) {
      return true;
    }
  } catch (e) {}
  return false;
}

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

  console.log(chalk.blue('[INFO] Mengambil proxy gratis...'));
  let proxies = await fetchProxies();

  console.log(chalk.blue('[INFO] Validasi proxy satu per satu (proses agak lama)...'));
  const validProxies = [];
  for (const proxy of proxies) {
    process.stdout.write(`Testing proxy ${proxy} ... `);
    const ok = await validateProxy(proxy, targetURL);
    if (ok) {
      console.log(chalk.green('OK'));
      validProxies.push(proxy);
    } else {
      console.log(chalk.red('GAGAL'));
    }
  }

  if (validProxies.length === 0) {
    console.log(chalk.red('[ERROR] Tidak ada proxy yang valid, keluar.'));
    process.exit(1);
  }
  console.log(chalk.green(`[INFO] Total proxy valid: ${validProxies.length}`));

  const keywords = fs.readFileSync(`${keywordDir}/${keywordFile}`, 'utf-8')
    .split('\n')
    .filter(Boolean);

  for (const keyword of keywords) {
    const proxy = validProxies[Math.floor(Math.random() * validProxies.length)];
    console.log(chalk.cyan(`[BOT] Menjalankan bot dengan keyword: "${keyword}" dan proxy: ${proxy}`));
    try {
      await runBot(keyword, targetURL, proxy);
    } catch (err) {
      console.log(chalk.red(`[ERROR] Gagal menjalankan bot untuk keyword "${keyword}": ${err.message || err}`));
    }
  }
})();
