import type { NextApiRequest, NextApiResponse } from 'next';
import trainings from '../../../mocks/fixtures/trainings.json';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const training = trainings.find((t) => t.id === id);
  if (!training) return res.status(404).json({ message: 'Not found' });
  res.status(200).json(training);
}
