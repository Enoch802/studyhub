module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { url } = req.query;
  if (!url) return res.status(400).send('Missing url');

  const decoded = decodeURIComponent(url);
  if (!decoded.includes('cloudinary.com')) return res.status(403).send('Only Cloudinary URLs allowed');

  try {
    const upstream = await fetch(decoded);
    if (!upstream.ok) return res.status(upstream.status).send('Upstream error: ' + upstream.status);

    const ct = upstream.headers.get('content-type') || 'application/pdf';
    res.setHeader('Content-Type', ct);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    if (req.method === 'HEAD') return res.status(200).end();

    const buf = await upstream.arrayBuffer();
    return res.status(200).send(Buffer.from(buf));

  } catch (e) {
    return res.status(500).send('Proxy error: ' + e.message);
  }
};
