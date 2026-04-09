import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../../../../components/Header';
import Card from '../../../../components/Card';
import { Button } from '../../../../components/Button';
import { apiFetch } from '../../../../lib/api';
import { BookOpen, Plus } from 'lucide-react';

type Exercise = { id: string; name: string; reps: string; rest: string; description: string; videoUrl: string };
type Training = { id: string; title: string; duration: number; level: string; category: string; exercises: Exercise[] };
type LibraryExercise = { id: number; name: string; description: string | null; videoUrl: string | null; category: string | null };

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const CATEGORIES = ['Full Body', 'Força', 'HIIT', 'Pernas', 'Funcional', 'Cardio'];

function uid() {
  return 'e' + Math.random().toString(36).slice(2, 8);
}

export default function TrainerTrainingEdit() {
  const router = useRouter();
  const id = router.query.id as string | undefined;
  const isNew = id === 'new';

  const [form, setForm] = useState<Omit<Training, 'id'>>({
    title: '',
    duration: 30,
    level: 'Beginner',
    category: 'Full Body',
    exercises: [],
  });
  const [saved, setSaved] = useState(false);
  const [library, setLibrary] = useState<LibraryExercise[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libSearch, setLibSearch] = useState('');

  useEffect(() => {
    apiFetch<LibraryExercise[]>('/api/exercise-library').then(setLibrary).catch(() => []);
  }, []);

  useEffect(() => {
    if (!id || isNew) return;
    apiFetch<Training>(`/api/trainings/${id}`)
      .then((t) => {
        const { id: _id, ...rest } = t;
        void _id;
        setForm({
          ...rest,
          exercises: rest.exercises.map((e) => ({
            ...e,
            description: (e as any).description || '',
            videoUrl: (e as any).videoUrl || '',
          })),
        });
      })
      .catch(() => null);
  }, [id, isNew]);

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addExercise() {
    setForm((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { id: uid(), name: '', reps: '3x12', rest: '60s', description: '', videoUrl: '' }],
    }));
  }

  function addFromLibrary(libEx: LibraryExercise) {
    const already = form.exercises.some((e) => e.name === libEx.name);
    if (already) return;
    setForm((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        { id: uid(), name: libEx.name, reps: '3x12', rest: '60s', description: libEx.description || '', videoUrl: libEx.videoUrl || '' },
      ],
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
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/trainings' : `/api/trainings/${id}`;
    const payload = {
      ...form,
      exercises: form.exercises.map((e) => ({
        name: e.name,
        reps: e.reps,
        rest: e.rest,
        description: e.description || null,
        videoUrl: e.videoUrl || null,
      })),
    };

    apiFetch<Training>(url, {
      method,
      body: JSON.stringify(payload),
    })
      .then(() => {
        setSaved(true);
        // Refresh library after save (new exercises may have been added)
        apiFetch<LibraryExercise[]>('/api/exercise-library').then(setLibrary).catch(() => {});
        setTimeout(() => setSaved(false), 2000);
      })
      .catch(() => alert('Erro ao salvar treino.'));
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
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <p className="text-xs font-semibold tracking-widest" style={{ color: 'var(--color-camel)' }}>
              EXERCÍCIOS ({form.exercises.length})
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setShowLibrary(!showLibrary)}>
                <BookOpen size={16} /> Biblioteca
              </Button>
              <Button variant="ghost" onClick={addExercise}><Plus size={16} /> Novo exercício</Button>
            </div>
          </div>

          {/* Library picker */}
          {showLibrary && (
            <div className="mb-5 p-4 rounded-2xl" style={{ background: 'rgba(178,150,125,0.1)', border: '1px solid rgba(178,150,125,0.2)' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-cocoa)' }}>Selecionar da biblioteca</p>
              <input
                className="field !text-sm mb-3"
                placeholder="Buscar exercício…"
                value={libSearch}
                onChange={(e) => setLibSearch(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {library
                  .filter((l) => !libSearch || l.name.toLowerCase().includes(libSearch.toLowerCase()))
                  .map((l) => {
                    const added = form.exercises.some((e) => e.name === l.name);
                    return (
                      <button
                        key={l.id}
                        onClick={() => !added && addFromLibrary(l)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                        style={{
                          background: added ? 'var(--color-camel)' : 'rgba(255,255,255,0.7)',
                          color: added ? 'white' : 'var(--color-espresso)',
                          opacity: added ? 0.6 : 1,
                          cursor: added ? 'default' : 'pointer',
                        }}
                      >
                        {added ? '✓ ' : '+ '}{l.name}
                      </button>
                    );
                  })}
                {library.length === 0 && (
                  <span className="text-xs" style={{ color: 'rgba(74,52,42,0.4)' }}>
                    Nenhum exercício na biblioteca ainda. Crie treinos para popular.
                  </span>
                )}
              </div>
            </div>
          )}

          {form.exercises.length === 0 && (
            <div className="text-center py-8 text-sm" style={{ color: 'rgba(74,52,42,0.35)' }}>
              Nenhum exercício adicionado ainda.
            </div>
          )}

          <div className="space-y-3">
            {form.exercises.map((e, i) => (
              <div key={e.id} className="p-3 rounded-2xl space-y-2"
                style={{ background: 'rgba(255,255,255,0.55)' }}>
                <div className="flex items-center gap-3 flex-wrap">
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
                <div className="flex gap-3 pl-10 flex-wrap">
                  <input
                    className="field flex-1 min-w-0 !text-xs"
                    value={e.videoUrl}
                    onChange={(ev) => updateExercise(i, 'videoUrl', ev.target.value)}
                    placeholder="Link do vídeo (YouTube, etc.)"
                  />
                </div>
                <div className="pl-10">
                  <textarea
                    className="field w-full !text-xs"
                    rows={2}
                    value={e.description}
                    onChange={(ev) => updateExercise(i, 'description', ev.target.value)}
                    placeholder="Descrição / instruções do exercício…"
                  />
                </div>
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
