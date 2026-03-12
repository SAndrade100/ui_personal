import type { NextApiRequest, NextApiResponse } from 'next';
import user from '../../mocks/fixtures/user.json';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(user);
}
