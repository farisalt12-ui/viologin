const https = require('https');
const crypto = require('crypto');

const UPSTREAM_URL = 'https://violetbot.net:6963/check/';
const TIMEOUT_MS = 15000;

function md5(value) {
  return crypto.createHash('md5').update(String(value || ''), 'utf8').digest('hex');
}

function normalizeError(text) {
  const t = String(text || '').trim().toLowerCase();
  if (!t) return 'unknown_err';
  if (t === 'id_empty' || t === 'wrong_creds' || t === 'unknown_err') return t;
  return '';
}

function postToUpstream(formBody) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      UPSTREAM_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Content-Length': Buffer.byteLength(formBody),
          'User-Agent': 'VioletBot-Vercel-Auth/1.0',
        },
        timeout: TIMEOUT_MS,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk.toString();
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode || 0,
            body: data,
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('upstream_timeout'));
    });
    req.on('error', reject);
    req.write(formBody);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const username = String(body.u || body.username || '').trim();
    const password = String(body.p || body.password || '');

    if (!username) {
      return res.status(200).json({ ok: false, error: 'id_empty' });
    }

    const hashedPassword = md5(password.toUpperCase());
    const formBody = new URLSearchParams({
      u: username,
      p: hashedPassword,
    }).toString();

    const upstream = await postToUpstream(formBody);
    const raw = String(upstream.body || '').trim();
    const knownError = normalizeError(raw);

    if (!knownError) {
      return res.status(200).json({
        ok: true,
        id: raw,
        upstreamStatus: upstream.statusCode,
      });
    }

    return res.status(200).json({
      ok: false,
      error: knownError,
      upstreamStatus: upstream.statusCode,
    });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: 'proxy_failed',
      details: String(error && error.message ? error.message : error),
    });
  }
};
