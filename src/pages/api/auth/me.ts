import type { NextApiRequest, NextApiResponse } from 'next';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const target = `${API}/api/auth/me`;
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (req.headers.authorization) headers['authorization'] = String(req.headers.authorization);
    if (req.headers.cookie) headers['cookie'] = String(req.headers.cookie);

    const r = await fetch(target, { method: 'GET', headers });
    const data = await r.json().catch(() => null);
    res.status(r.status).json(data);
  } catch (err) {
    res.status(502).json({ message: 'Bad gateway' });
  }
}
