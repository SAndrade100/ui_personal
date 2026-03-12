import { rest } from 'msw';
import user from './fixtures/user.json';
import trainings from './fixtures/trainings.json';
import schedule from './fixtures/schedule.json';

export const handlers = [
  rest.get('/api/user', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(user));
  }),

  rest.get('/api/trainings', (req, res, ctx) => {
    const q = req.url.searchParams.get('q') || '';
    const filtered = trainings.filter((t) =>
      t.title.toLowerCase().includes(q.toLowerCase())
    );
    return res(ctx.status(200), ctx.json(filtered));
  }),

  rest.get('/api/trainings/:id', (req, res, ctx) => {
    const { id } = req.params;
    const t = trainings.find((x) => x.id === id);
    if (!t) return res(ctx.status(404));
    return res(ctx.status(200), ctx.json(t));
  }),

  rest.get('/api/schedule', (req, res, ctx) => {
    const month = req.url.searchParams.get('month'); // e.g. "2026-03"
    const filtered = month
      ? schedule.filter((s) => s.date.startsWith(month))
      : schedule;
    return res(ctx.status(200), ctx.json(filtered));
  })
];
