import type { NextApiRequest, NextApiResponse } from 'next';
import students from '../../../../mocks/fixtures/students.json';
import anamnesis from '../../../../mocks/fixtures/anamnesis.json';
import assessments from '../../../../mocks/fixtures/assessments.json';
import progress from '../../../../mocks/fixtures/progress.json';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, section } = req.query;
  const student = students.find((s) => s.id === id);
  if (!student) return res.status(404).json({ message: 'Aluno não encontrado' });

  if (section === 'anamnesis')   return res.status(200).json(anamnesis);
  if (section === 'assessments') return res.status(200).json(assessments);
  if (section === 'progress')    return res.status(200).json(progress);

  res.status(200).json(student);
}
