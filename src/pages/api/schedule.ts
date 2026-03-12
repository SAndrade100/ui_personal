import type { NextApiRequest, NextApiResponse } from 'next';
import schedule from '../../mocks/fixtures/schedule.json';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const month = req.query.month as string | undefined; // e.g. "2026-03"
  const result = month
    ? schedule.filter((s) => s.date.startsWith(month))
    : schedule;
  res.status(200).json(result);
}
