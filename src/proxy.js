const fetch = require('node-fetch');

async function fetchProxies() {
  try {
    const res = await fetch('https://www.proxy-list.download/api/v1/get?type=http');
    const text = await res.text();
    return text.split('\r\n').filter(Boolean);
  } catch (e) {
    console.error('Gagal ambil proxy:', e);
    return [];
  }
}

module.exports = { fetchProxies };
