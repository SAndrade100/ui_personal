import type { NextApiRequest, NextApiResponse } from 'next';
import students from '../../../../mocks/fixtures/students.json';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { status, q } = req.query;
  let result = [...students];
  if (status && status !== 'all') result = result.filter((s) => s.status === status);
  if (q) result = result.filter((s) => s.name.toLowerCase().includes((q as string).toLowerCase()));
  res.status(200).json(result);
}
