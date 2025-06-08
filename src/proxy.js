const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Fungsi untuk mengambil dan menggabungkan proxy dari URL dalam proxy.txt
async function fetchProxiesFromURLs() {
  const urls = fs.readFileSync(path.join(__dirname, '../proxy.txt'), 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('http'));

  const proxies = [];

  for (const url of urls) {
    try {
      const res = await axios.get(url, { timeout: 5000 });
      const raw = res.data;
      const lines = raw.split('\n')
        .map(line => line.trim())
        .filter(line => /^\d+\.\d+\.\d+\.\d+:\d+$/.test(line));
      proxies.push(...lines);
    } catch (err) {
      console.warn(`[WARNING] Gagal ambil proxy dari ${url}`);
    }
  }

  return proxies;
}

module.exports = {
  fetchProxiesFromURLs
};
