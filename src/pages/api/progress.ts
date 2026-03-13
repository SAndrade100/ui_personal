import type { NextApiRequest, NextApiResponse } from 'next';
import progress from '../../mocks/fixtures/progress.json';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(progress);
}
