import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Card from '../../../components/Card';
import { Button } from '../../../components/Button';
import { apiFetch } from '../../../lib/api';
import { ClipboardList, ChevronDown, ChevronUp, Trash2, Pencil, Plus, Search } from 'lucide-react';

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

type Training = { id: number; title: string; duration: number; level: string; category: string; exercises: any[] };
type SheetDay = { id: number; trainingId: number; weekdays: number[]; training: Training };
type TrainingSheet = { id: number; title: string; createdAt: string; days: SheetDay[] };

export default function TrainerSheets() {
  const [sheets, setSheets] = useState<TrainingSheet[]>([]);
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const params = q ? `?q=${encodeURIComponent(q)}` : '';
    apiFetch<TrainingSheet[]>(`/api/training-sheets${params}`)
      .then((data) => setSheets(Array.isArray(data) ? data : []))
      .catch(() => setSheets([]));
  }, [q]);

  function handleDelete(id: number, title: string) {
    if (!confirm(`Excluir ficha "${title}"? Esta ação não pode ser desfeita.`)) return;
    apiFetch(`/api/training-sheets/${id}`, { method: 'DELETE' })
      .then(() => setSheets((prev) => prev.filter((s) => s.id !== id)))
      .catch(() => alert('Erro ao excluir ficha.'));
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
      <Header />

      <div className="bg-hero py-10 px-6">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Link href="/trainer" className="text-xs font-semibold tracking-widest mb-3 inline-block opacity-60 hover:opacity-100 text-white">
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white mt-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Fichas Semanais
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {sheets.length} ficha{sheets.length !== 1 ? 's' : ''} cadastrada{sheets.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="app-container py-8">
        {/* Search + New */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(74,52,42,0.4)' }} />
            <input
              type="text"
              placeholder="Buscar por título…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="field pl-9 w-full"
            />
          </div>
          <Link href="/trainer/sheets/new/edit">
            <Button variant="accent"><Plus size={16} /> Nova ficha</Button>
          </Link>
        </div>

        {sheets.length === 0 && (
          <div className="text-center py-16">
            <ClipboardList size={48} className="mx-auto mb-4" style={{ color: 'rgba(74,52,42,0.2)' }} />
            <p className="text-sm" style={{ color: 'rgba(74,52,42,0.4)' }}>Nenhuma ficha semanal criada ainda.</p>
          </div>
        )}

        <div className="space-y-4">
          {sheets.map((sheet) => (
            <Card key={sheet.id}>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(178,150,125,0.15)' }}>
                  <ClipboardList size={20} style={{ color: 'var(--color-camel)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold">{sheet.title}</span>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(74,52,42,0.5)' }}>
                    {sheet.days.length} treino{sheet.days.length !== 1 ? 's' : ''} na semana
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExpanded(expanded === sheet.id ? null : sheet.id)}
                    className="text-xs px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1"
                    style={{ background: 'rgba(74,52,42,0.08)', color: 'var(--color-espresso)' }}>
                    {expanded === sheet.id ? <><ChevronUp size={14} /> Ocultar</> : <><ChevronDown size={14} /> Detalhes</>}
                  </button>
                  <Link href={`/trainer/sheets/${sheet.id}/edit`}>
                    <Button variant="outline" className="!py-1.5 !px-4 !text-xs">
                      <Pencil size={14} /> Editar
                    </Button>
                  </Link>
                  <button
                    onClick={() => handleDelete(sheet.id, sheet.title)}
                    className="text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1"
                    style={{ background: 'rgba(34,197,94,0.08)', color: 'var(--color-accent)' }}>
                    <Trash2 size={14} /> Excluir
                  </button>
                </div>
              </div>

              {expanded === sheet.id && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(74,52,42,0.08)' }}>
                  <div className="space-y-3">
                    {sheet.days.map((day) => (
                      <div key={day.id} className="flex items-center gap-3 py-2 px-3 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.55)' }}>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium">{day.training.title}</span>
                          <span className="text-xs ml-2" style={{ color: 'rgba(74,52,42,0.5)' }}>
                            {day.training.duration} min · {day.training.exercises.length} exercícios
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {WEEKDAY_LABELS.map((label, idx) => (
                            <span
                              key={idx}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold"
                              style={{
                                background: day.weekdays.includes(idx) ? 'var(--color-camel)' : 'rgba(74,52,42,0.06)',
                                color: day.weekdays.includes(idx) ? 'white' : 'rgba(74,52,42,0.3)',
                              }}>
                              {label.charAt(0)}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
