import type { NextApiRequest, NextApiResponse } from 'next';
import trainings from '../../mocks/fixtures/trainings.json';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const q = (req.query.q as string | undefined) ?? '';
  const result = q
    ? trainings.filter((t) => t.title.toLowerCase().includes(q.toLowerCase()))
    : trainings;
  res.status(200).json(result);
}
