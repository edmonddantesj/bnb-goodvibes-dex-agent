/* 🧬 S-DNA: AOI-2026-0214-BNB-DEX-01 | module: cybercentry_wallet_gate | owner: Aoineco */

// Cybercentry Wallet Verification — optional risk gate
// Disabled by default. Enable with:
//   ENABLE_WALLET_RISK_GATE=1
// Provide endpoint + key:
//   CYBERCENTRY_ENDPOINT=https://...
//   CYBERCENTRY_API_KEY=...
//
// NOTE: This file implements a safe, minimal client. You MUST confirm the
// official API endpoint + request schema before using LIVE.

const DEFAULT_TIMEOUT_MS = 10_000;

export async function checkWalletRisk({ wallet, chain = 'bsc' }) {
  const enabled = (process.env.ENABLE_WALLET_RISK_GATE || '0') === '1';
  if (!enabled) {
    return {
      enabled: false,
      status: 'skipped',
      reason: 'ENABLE_WALLET_RISK_GATE != 1'
    };
  }

  const endpoint = process.env.CYBERCENTRY_ENDPOINT;
  const apiKey = process.env.CYBERCENTRY_API_KEY;

  if (!endpoint || !apiKey) {
    return {
      enabled: true,
      status: 'error',
      reason: 'Missing CYBERCENTRY_ENDPOINT or CYBERCENTRY_API_KEY'
    };
  }

  const timeoutMs = Number(process.env.CYBERCENTRY_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  // Conservative: treat unknown/error as FAIL unless override.
  const failClosed = (process.env.CYBERCENTRY_FAIL_CLOSED || '1') === '1';

  try {
    // Placeholder schema; adapt once official docs are confirmed.
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ wallet, chain }),
      signal: ctrl.signal
    });

    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!res.ok) {
      return {
        enabled: true,
        status: failClosed ? 'fail' : 'warn',
        reason: `HTTP ${res.status}`,
        response: data
      };
    }

    // Interpret result with minimal assumptions.
    // Expected shape (example): { risk: 'benign|suspicious|malicious', score: 0-100, reasons: [] }
    const risk = (data?.risk || data?.verdict || 'unknown').toString().toLowerCase();
    const score = data?.score ?? data?.riskScore ?? null;

    const isPass = ['benign', 'low', 'safe', 'clean', 'pass'].includes(risk);
    const isFail = ['malicious', 'scam', 'high', 'blocked', 'fail'].includes(risk);

    if (isPass) {
      return { enabled: true, status: 'pass', risk, score, response: data };
    }
    if (isFail) {
      return { enabled: true, status: 'fail', risk, score, response: data };
    }

    // unknown / suspicious
    return {
      enabled: true,
      status: failClosed ? 'fail' : 'warn',
      risk,
      score,
      response: data,
      reason: 'Unknown or non-benign verdict'
    };
  } catch (e) {
    return {
      enabled: true,
      status: failClosed ? 'fail' : 'warn',
      reason: e?.message || 'fetch_error'
    };
  } finally {
    clearTimeout(t);
  }
}
