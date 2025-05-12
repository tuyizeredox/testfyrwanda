// Simple proxy endpoint to bypass CORS restrictions
const https = require('https');
const http = require('http');
const url = require('url');

module.exports = async (req, res) => {
  // Set CORS headers to allow requests from anywhere
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get the target URL from the query parameter
  const targetUrl = req.query.url;
  
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    // Parse the target URL
    const parsedUrl = url.parse(targetUrl);
    
    // Choose the appropriate protocol
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    // Create options for the request
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.path,
      method: req.method,
      headers: {
        ...req.headers,
        host: parsedUrl.hostname
      }
    };
    
    // Remove headers that might cause issues
    delete options.headers['host'];
    delete options.headers['origin'];
    delete options.headers['referer'];
    
    // Make the request to the target URL
    const proxyReq = protocol.request(options, (proxyRes) => {
      // Copy status code
      res.statusCode = proxyRes.statusCode;
      
      // Copy headers
      Object.keys(proxyRes.headers).forEach(key => {
        res.setHeader(key, proxyRes.headers[key]);
      });
      
      // Stream the response
      proxyRes.pipe(res);
    });
    
    // Handle errors
    proxyReq.on('error', (error) => {
      console.error('Proxy error:', error);
      res.status(500).json({ error: 'Proxy request failed' });
    });
    
    // If there's a request body, write it to the proxy request
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      proxyReq.write(JSON.stringify(req.body));
    }
    
    // End the request
    proxyReq.end();
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed' });
  }
};
