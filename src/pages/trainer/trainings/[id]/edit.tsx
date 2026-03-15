import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../../../../components/Header';
import Card from '../../../../components/Card';
import { Button } from '../../../../components/Button';

type Exercise = { id: string; name: string; reps: string; rest: string };
type Training = { id: string; title: string; duration: number; level: string; category: string; exercises: Exercise[] };

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const CATEGORIES = ['Full Body', 'Força', 'HIIT', 'Pernas', 'Funcional', 'Cardio'];

function uid() {
  return 'e' + Math.random().toString(36).slice(2, 8);
}

export default function TrainerTrainingEdit() {
  const { query } = useRouter();
  const id = query.id as string | undefined;
  const isNew = id === 'new';

  const [form, setForm] = useState<Omit<Training, 'id'>>({
    title: '',
    duration: 30,
    level: 'Beginner',
    category: 'Full Body',
    exercises: [],
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id || isNew) return;
    fetch(`/api/trainings/${id}`)
      .then((r) => r.json())
      .then((t: Training) => {
        const { id: _id, ...rest } = t;
        void _id;
        setForm(rest);
      })
      .catch(() => null);
  }, [id, isNew]);

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addExercise() {
    setForm((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { id: uid(), name: '', reps: '3x12', rest: '60s' }],
    }));
  }

  function updateExercise(idx: number, field: keyof Exercise, value: string) {
    setForm((prev) => ({
      ...prev,
      exercises: prev.exercises.map((e, i) => i === idx ? { ...e, [field]: value } : e),
    }));
  }

  function removeExercise(idx: number) {
    setForm((prev) => ({ ...prev, exercises: prev.exercises.filter((_, i) => i !== idx) }));
  }

  function handleSave() {
    // In a real app: POST/PUT to API. Here we just show success feedback.
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
      <Header />

      <div className="bg-hero py-10 px-6">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Link href="/trainer/trainings" className="text-xs font-semibold tracking-widest mb-3 inline-block opacity-60 hover:opacity-100 text-white">
            ← Voltar para treinos
          </Link>
          <h1 className="text-3xl font-bold text-white mt-2" style={{ fontFamily: 'var(--font-heading)' }}>
            {isNew ? 'Novo treino' : 'Editar treino'}
          </h1>
        </div>
      </div>

      <div className="app-container py-8 space-y-6">
        {/* Basic info */}
        <Card>
          <p className="text-xs font-semibold tracking-widest mb-5" style={{ color: 'var(--color-camel)' }}>INFORMAÇÕES BÁSICAS</p>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Título</label>
              <input className="field" value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="ex: Full Body Beginner" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Duração (min)</label>
              <input type="number" className="field" value={form.duration}
                onChange={(e) => setField('duration', Number(e.target.value))} min={5} max={180} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Nível</label>
              <select className="field" value={form.level} onChange={(e) => setField('level', e.target.value)}>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Categoria</label>
              <select className="field" value={form.category} onChange={(e) => setField('category', e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </Card>

        {/* Exercises */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-semibold tracking-widest" style={{ color: 'var(--color-camel)' }}>
              EXERCÍCIOS ({form.exercises.length})
            </p>
            <Button variant="ghost" onClick={addExercise}>+ Adicionar exercício</Button>
          </div>

          {form.exercises.length === 0 && (
            <div className="text-center py-8 text-sm" style={{ color: 'rgba(74,52,42,0.35)' }}>
              Nenhum exercício adicionado ainda.
            </div>
          )}

          <div className="space-y-3">
            {form.exercises.map((e, i) => (
              <div key={e.id} className="flex items-center gap-3 p-3 rounded-2xl flex-wrap"
                style={{ background: 'rgba(255,255,255,0.55)' }}>
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: 'var(--color-camel)' }}>{i + 1}</span>
                <input
                  className="field flex-1 min-w-0 !text-sm"
                  value={e.name}
                  onChange={(ev) => updateExercise(i, 'name', ev.target.value)}
                  placeholder="Nome do exercício"
                />
                <input
                  className="field w-24 !text-sm"
                  value={e.reps}
                  onChange={(ev) => updateExercise(i, 'reps', ev.target.value)}
                  placeholder="Séries/reps"
                />
                <input
                  className="field w-20 !text-sm"
                  value={e.rest}
                  onChange={(ev) => updateExercise(i, 'rest', ev.target.value)}
                  placeholder="Descanso"
                />
                <button
                  onClick={() => removeExercise(i)}
                  className="text-xs px-2 py-1 rounded-lg transition-all"
                  style={{ color: 'rgba(232,108,44,0.7)', background: 'rgba(232,108,44,0.08)' }}
                  aria-label="Remover exercício">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link href="/trainer/trainings">
            <Button variant="ghost">Cancelar</Button>
          </Link>
          <Button variant="accent" onClick={handleSave}>
            {saved ? '✓ Salvo!' : 'Salvar treino'}
          </Button>
        </div>
      </div>
    </div>
  );
}
