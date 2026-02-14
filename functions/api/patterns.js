function normalizeHeaders(headers) {
  const out = {};
  for (const [key, value] of headers.entries()) {
    if (value) {
      out[key.toLowerCase()] = value;
    }
  }
  return out;
}

function getClientFamily(userAgent) {
  if (!userAgent) {
    return 'unknown';
  }

  if (/(curl|wget|httpie|powershell|go-http-client)/i.test(userAgent)) {
    return 'cli';
  }

  if (/(python-requests|httpx|aiohttp|node-fetch|axios|okhttp|java\/|libwww-perl|ruby|faraday)/i.test(userAgent)) {
    return 'library';
  }

  if (/(bot|crawler|spider|slurp|bingpreview|gptbot|claudebot|anthropic|perplexitybot|facebookexternalhit|discordbot)/i.test(userAgent)) {
    return 'bot';
  }

  if (/(mozilla\/5\.0|chrome\/|safari\/|firefox\/|edg\/)/i.test(userAgent)) {
    return 'browser';
  }

  return 'unknown';
}

function analyze(headers) {
  const userAgent = headers['user-agent'] || '';
  const accept = headers.accept || '';
  const acceptLanguage = headers['accept-language'] || '';
  const secChUa = headers['sec-ch-ua'] || '';
  const secFetchMode = headers['sec-fetch-mode'] || '';

  const signals = [];
  const family = getClientFamily(userAgent);

  if (family !== 'unknown') {
    signals.push(`client-family:${family}`);
  }

  if (!headers['user-agent']) {
    signals.push('missing:user-agent');
  }

  if (accept.includes('application/json')) {
    signals.push('accepts:json');
  }

  if (headers['sec-ch-ua']) {
    signals.push('has:sec-ch-ua');
  }

  if (headers['sec-fetch-site'] || headers['sec-fetch-mode']) {
    signals.push('has:sec-fetch-*');
  }

  let automationScore = 0;

  if (family === 'cli' || family === 'library' || family === 'bot') {
    automationScore += 50;
  }

  if (/(headless|playwright|puppeteer|selenium|phantomjs|webdriver)/i.test(userAgent)) {
    automationScore += 35;
    signals.push('automation:ua-keyword');
  }

  if (/Headless/i.test(secChUa)) {
    automationScore += 35;
    signals.push('automation:sec-ch-ua-headless');
  }

  if (!acceptLanguage && family === 'browser') {
    automationScore += 10;
    signals.push('anomaly:browser-without-accept-language');
  }

  if (!secFetchMode && family === 'browser') {
    automationScore += 5;
    signals.push('anomaly:browser-without-sec-fetch-mode');
  }

  const isLikelyAIClient = /(gptbot|claudebot|anthropic|perplexitybot|chatgpt|openai)/i.test(userAgent);
  if (isLikelyAIClient) {
    signals.push('ai-client:ua-match');
    automationScore += 20;
  }

  automationScore = Math.min(100, automationScore);

  return {
    clientFamily: family,
    isLikelyAutomation: automationScore >= 40,
    automationScore,
    isLikelyAIClient,
    signals,
    headerPresence: {
      userAgent: Boolean(userAgent),
      accept: Boolean(accept),
      acceptLanguage: Boolean(acceptLanguage),
      secChUa: Boolean(secChUa),
      secFetchMode: Boolean(secFetchMode)
    }
  };
}

export function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const headers = normalizeHeaders(request.headers);

  const payload = {
    endpoint: '/api/patterns',
    generatedAt: new Date().toISOString(),
    runtime: 'cloudflare-pages-function',
    method: request.method,
    path: url.pathname,
    analysis: analyze(headers),
    headers
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
