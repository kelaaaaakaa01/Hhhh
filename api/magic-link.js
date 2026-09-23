const API_URL = 'https://axzyedev.biz.id/api/v1/send-magic-link';
function sendJson(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.end(JSON.stringify(body));
}
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }
  const key = process.env.AXZYEDEV_API_KEY;
  if (!key) return sendJson(res, 503, { error: 'Server belum dikonfigurasi: AXZYEDEV_API_KEY belum diatur.' });
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return sendJson(res, 400, { error: 'Alamat email tidak valid.' });
  }
  try {
    const upstream = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email })
    });
    const text = await upstream.text();
    let payload;
    try { payload = text ? JSON.parse(text) : {}; } catch { payload = {}; }
    if (!upstream.ok) {
      // Avoid passing through potentially sensitive upstream details.
      return sendJson(res, upstream.status >= 500 ? 502 : upstream.status, { error: `Penyedia API menolak permintaan (HTTP ${upstream.status}). Periksa konfigurasi dan format request.` });
    }
    return sendJson(res, 200, { ok: true, message: 'Permintaan magic link berhasil dikirim ke penyedia API.' });
  } catch (_) {
    return sendJson(res, 502, { error: 'Tidak dapat terhubung ke penyedia API.' });
  }
};
