import type { NextApiRequest, NextApiResponse } from 'next';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const target = `${API}/api/auth/login`;
    const headers: Record<string, string> = { 'content-type': 'application/json' };

    const r = await fetch(target, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
    });
    const data = await r.json().catch(() => null);
    res.status(r.status).json(data);
  } catch (err) {
    res.status(502).json({ message: 'Bad gateway' });
  }
}
