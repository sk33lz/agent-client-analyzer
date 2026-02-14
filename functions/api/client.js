function pickHeaders(headers) {
  const out = {};
  const names = [
    'accept',
    'accept-language',
    'cache-control',
    'cf-connecting-ip',
    'cf-ipcountry',
    'cf-ray',
    'sec-ch-ua',
    'sec-ch-ua-mobile',
    'sec-ch-ua-platform',
    'sec-fetch-dest',
    'sec-fetch-mode',
    'sec-fetch-site',
    'user-agent',
    'x-forwarded-for'
  ];

  for (const name of names) {
    const value = headers.get(name);
    if (value) {
      out[name] = value;
    }
  }

  return out;
}

export function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const headers = request.headers;

  const payload = {
    endpoint: '/api/client',
    generatedAt: new Date().toISOString(),
    runtime: 'cloudflare-pages-function',
    method: request.method,
    path: url.pathname,
    clientIp: headers.get('cf-connecting-ip') || null,
    country: headers.get('cf-ipcountry') || null,
    headers: pickHeaders(headers)
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS'
    }
  });
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'access-control-allow-headers': 'content-type, accept, user-agent'
    }
  });
}
