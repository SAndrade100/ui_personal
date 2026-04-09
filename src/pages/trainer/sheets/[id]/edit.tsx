import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../../../../components/Header';
import Card from '../../../../components/Card';
import { Button } from '../../../../components/Button';
import { apiFetch } from '../../../../lib/api';
import { ClipboardList, Plus, Trash2, Search } from 'lucide-react';

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

type Training = { id: number; title: string; duration: number; level: string; category: string; exercises: any[] };
type SheetDay = { trainingId: number; weekdays: number[] };
type TrainingSheet = { id: number; title: string; days: (SheetDay & { training?: Training })[] };

export default function TrainerSheetEdit() {
  const router = useRouter();
  const id = router.query.id as string | undefined;
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [days, setDays] = useState<{ trainingId: number; weekdays: number[]; trainingTitle?: string }[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [saved, setSaved] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  useEffect(() => {
    apiFetch<Training[]>('/api/trainings').then((data) => setTrainings(Array.isArray(data) ? data : [])).catch(() => []);
  }, []);

  useEffect(() => {
    if (!id || isNew) return;
    apiFetch<TrainingSheet>(`/api/training-sheets/${id}`)
      .then((sheet) => {
        setTitle(sheet.title);
        setDays(
          sheet.days.map((d) => ({
            trainingId: d.trainingId,
            weekdays: d.weekdays,
            trainingTitle: d.training?.title,
          })),
        );
      })
      .catch(() => null);
  }, [id, isNew]);

  function addTraining(t: Training) {
    if (days.some((d) => d.trainingId === t.id)) return;
    setDays((prev) => [...prev, { trainingId: t.id, weekdays: [], trainingTitle: t.title }]);
    setShowPicker(false);
    setPickerSearch('');
  }

  function toggleWeekday(idx: number, wd: number) {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== idx) return d;
        const has = d.weekdays.includes(wd);
        return { ...d, weekdays: has ? d.weekdays.filter((w) => w !== wd) : [...d.weekdays, wd].sort() };
      }),
    );
  }

  function removeDay(idx: number) {
    setDays((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSave() {
    if (!title.trim()) return alert('Informe o título da ficha.');
    if (days.length === 0) return alert('Adicione ao menos um treino à ficha.');
    if (days.some((d) => d.weekdays.length === 0)) return alert('Selecione os dias da semana para cada treino.');

    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/training-sheets' : `/api/training-sheets/${id}`;
    const payload = {
      title,
      days: days.map((d) => ({ trainingId: d.trainingId, weekdays: d.weekdays })),
    };

    apiFetch(url, { method, body: JSON.stringify(payload) })
      .then(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        if (isNew) router.push('/trainer/sheets');
      })
      .catch(() => alert('Erro ao salvar ficha.'));
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
      <Header />

      <div className="bg-hero py-10 px-6">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Link href="/trainer/sheets" className="text-xs font-semibold tracking-widest mb-3 inline-block opacity-60 hover:opacity-100 text-white">
            ← Voltar para fichas
          </Link>
          <h1 className="text-3xl font-bold text-white mt-2" style={{ fontFamily: 'var(--font-heading)' }}>
            {isNew ? 'Nova Ficha Semanal' : 'Editar Ficha Semanal'}
          </h1>
        </div>
      </div>

      <div className="app-container py-8 space-y-6">
        {/* Title */}
        <Card>
          <p className="text-xs font-semibold tracking-widest mb-4" style={{ color: 'var(--color-camel)' }}>TÍTULO DA FICHA</p>
          <input
            className="field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ex: Semana de Hipertrofia A"
          />
        </Card>

        {/* Days / Training mapping */}
        <Card>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <p className="text-xs font-semibold tracking-widest" style={{ color: 'var(--color-camel)' }}>
              TREINOS DA SEMANA ({days.length})
            </p>
            <Button variant="ghost" onClick={() => setShowPicker(!showPicker)}>
              <Plus size={16} /> Adicionar treino
            </Button>
          </div>

          {/* Training picker */}
          {showPicker && (
            <div className="mb-5 p-4 rounded-2xl" style={{ background: 'rgba(178,150,125,0.1)', border: '1px solid rgba(178,150,125,0.2)' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-cocoa)' }}>Selecionar treino</p>
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(74,52,42,0.4)' }} />
                <input
                  className="field !text-sm pl-8"
                  placeholder="Buscar treino…"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {trainings
                  .filter((t) => !pickerSearch || t.title.toLowerCase().includes(pickerSearch.toLowerCase()))
                  .map((t) => {
                    const added = days.some((d) => d.trainingId === t.id);
                    return (
                      <button
                        key={t.id}
                        onClick={() => !added && addTraining(t)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                        style={{
                          background: added ? 'var(--color-camel)' : 'rgba(255,255,255,0.7)',
                          color: added ? 'white' : 'var(--color-espresso)',
                          opacity: added ? 0.6 : 1,
                          cursor: added ? 'default' : 'pointer',
                        }}>
                        {added ? '✓ ' : '+ '}{t.title}
                      </button>
                    );
                  })}
                {trainings.length === 0 && (
                  <span className="text-xs" style={{ color: 'rgba(74,52,42,0.4)' }}>
                    Nenhum treino cadastrado. <Link href="/trainer/trainings/new/edit" className="underline">Criar treino</Link>
                  </span>
                )}
              </div>
            </div>
          )}

          {days.length === 0 && !showPicker && (
            <div className="text-center py-8">
              <ClipboardList size={40} className="mx-auto mb-3" style={{ color: 'rgba(74,52,42,0.15)' }} />
              <p className="text-sm" style={{ color: 'rgba(74,52,42,0.35)' }}>
                Adicione treinos e defina os dias da semana para cada um.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {days.map((day, idx) => {
              const training = trainings.find((t) => t.id === day.trainingId);
              const displayTitle = day.trainingTitle || training?.title || `Treino #${day.trainingId}`;
              return (
                <div key={idx} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.55)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-sm">{displayTitle}</span>
                    <button onClick={() => removeDay(idx)} className="p-1 rounded-lg transition-all"
                      style={{ color: 'rgba(232,108,44,0.7)', background: 'rgba(232,108,44,0.08)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-xs mb-2" style={{ color: 'rgba(74,52,42,0.5)' }}>Dias da semana:</p>
                  <div className="flex gap-2">
                    {WEEKDAY_LABELS.map((label, wd) => (
                      <button
                        key={wd}
                        onClick={() => toggleWeekday(idx, wd)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-semibold transition-all"
                        style={{
                          background: day.weekdays.includes(wd) ? 'var(--color-camel)' : 'rgba(74,52,42,0.06)',
                          color: day.weekdays.includes(wd) ? 'white' : 'rgba(74,52,42,0.4)',
                          border: day.weekdays.includes(wd) ? '2px solid var(--color-camel)' : '2px solid transparent',
                        }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link href="/trainer/sheets">
            <Button variant="ghost">Cancelar</Button>
          </Link>
          <Button variant="accent" onClick={handleSave}>
            {saved ? '✓ Salvo!' : 'Salvar ficha'}
          </Button>
        </div>
      </div>
    </div>
  );
}
