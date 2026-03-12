module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  const decoded = decodeURIComponent(url);
  if (!decoded.includes('cloudinary.com')) {
    return res.status(403).json({ error: 'Only Cloudinary URLs are allowed' });
  }

  try {
    const response = await fetch(decoded);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch file: ' + response.status });
    }

    const contentType = response.headers.get('content-type') || 'application/pdf';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('X-Frame-Options', 'ALLOWALL');

    if (req.method === 'HEAD') { return res.status(200).end(); }

    const buffer = await response.arrayBuffer();
    return res.status(200).send(Buffer.from(buffer));

  } catch (err) {
    console.error('PDF proxy error:', err);
    return res.status(500).json({ error: 'Failed to proxy file: ' + err.message });
  }
};
