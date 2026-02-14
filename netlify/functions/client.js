function pickHeaders(headers) {
  const out = {};
  const names = [
    'accept',
    'accept-language',
    'cache-control',
    'sec-ch-ua',
    'sec-ch-ua-mobile',
    'sec-ch-ua-platform',
    'sec-fetch-dest',
    'sec-fetch-mode',
    'sec-fetch-site',
    'user-agent',
    'x-forwarded-for',
    'x-nf-client-connection-ip',
    'x-nf-geo',
    'x-nf-request-id'
  ];

  for (const name of names) {
    if (headers[name]) {
      out[name] = headers[name];
    }
  }

  return out;
}

function getClientIp(headers) {
  if (headers['x-nf-client-connection-ip']) {
    return headers['x-nf-client-connection-ip'];
  }

  const forwarded = headers['x-forwarded-for'];
  if (!forwarded) {
    return null;
  }

  return forwarded.split(',')[0].trim();
}

exports.handler = async (event) => {
  if ((event.httpMethod || 'GET') === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, OPTIONS',
        'access-control-allow-headers': 'content-type, accept, user-agent'
      }
    };
  }

  const headers = event.headers || {};
  const visibleHeaders = pickHeaders(headers);
  const payload = {
    endpoint: '/api/client',
    generatedAt: new Date().toISOString(),
    runtime: 'netlify-function',
    method: event.httpMethod || 'GET',
    path: event.path || '/api/client',
    clientIp: getClientIp(headers),
    headers: visibleHeaders
  };

  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS'
    },
    body: JSON.stringify(payload)
  };
};
