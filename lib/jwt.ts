const encoder = new globalThis.TextEncoder();
const decoder = new globalThis.TextDecoder();

const alg = { name: 'HMAC', hash: 'SHA-256' };

async function importKey(secret: string) {
  return await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    alg,
    false,
    ['sign', 'verify']
  );
}

async function sign(data: object, secret: string): Promise<string> {
  const key = await importKey(secret);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { ...data, iat: Math.floor(Date.now() / 1000) };

  const base64UrlEncode = (obj: object) =>
    btoa(JSON.stringify(obj))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const toSign = `${base64UrlEncode(header)}.${base64UrlEncode(payload)}`;
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(toSign));
  const base64UrlSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${toSign}.${base64UrlSignature}`;
}

async function verify(token: string, secret: string): Promise<object | null> {
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  if (!headerB64 || !payloadB64 || !signatureB64) return null;

  const key = await importKey(secret);
  const toVerify = `${headerB64}.${payloadB64}`;
  const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), c =>
    c.charCodeAt(0)
  );

  const isValid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(toVerify));
  if (!isValid) return null;

  return JSON.parse(decoder.decode(Uint8Array.from(atob(payloadB64), c => c.charCodeAt(0))));
}

export { sign, verify };
