import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../../../../../components/Header';
import Card from '../../../../../components/Card';
import { Button } from '../../../../../components/Button';

type Measurements = { waist: number; hip: number; chest: number; rightArm: number; leftArm: number; rightThigh: number; leftThigh: number; abdomen: number; calf: number };
type Skinfolds = { triceps: number; subscapular: number; suprailiac: number; abdominal: number; thigh: number };

const measureLabels: [keyof Measurements, string][] = [
  ['waist', 'Cintura'], ['hip', 'Quadril'], ['chest', 'Peitoral'],
  ['rightArm', 'Bíceps D'], ['leftArm', 'Bíceps E'], ['rightThigh', 'Coxa D'],
  ['leftThigh', 'Coxa E'], ['abdomen', 'Abdômen'], ['calf', 'Panturrilha'],
];
const skinfoldLabels: [keyof Skinfolds, string][] = [
  ['triceps', 'Tríceps'], ['subscapular', 'Subescapular'],
  ['suprailiac', 'Suprailíaca'], ['abdominal', 'Abdominal'], ['thigh', 'Coxa'],
];

export default function TrainerAssessmentNew() {
  const { query } = useRouter();
  const studentId = query.id as string | undefined;

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    weight: 0, fatPercent: 0, leanMass: 0, fatMass: 0,
    notes: '',
    measurements: { waist: 0, hip: 0, chest: 0, rightArm: 0, leftArm: 0, rightThigh: 0, leftThigh: 0, abdomen: 0, calf: 0 } as Measurements,
    skinfolds: { triceps: 0, subscapular: 0, suprailiac: 0, abdominal: 0, thigh: 0 } as Skinfolds,
  });
  const [saved, setSaved] = useState(false);

  function setBase<K extends 'date' | 'notes'>(key: K, value: string): void;
  function setBase<K extends 'weight' | 'fatPercent' | 'leanMass' | 'fatMass'>(key: K, value: number): void;
  function setBase(key: string, value: string | number) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function setMeasurement(key: keyof Measurements, value: number) {
    setForm(prev => ({ ...prev, measurements: { ...prev.measurements, [key]: value } }));
  }

  function setSkinfold(key: keyof Skinfolds, value: number) {
    setForm(prev => ({ ...prev, skinfolds: { ...prev.skinfolds, [key]: value } }));
  }

  function autoCalc() {
    const fat = parseFloat(((form.fatPercent / 100) * form.weight).toFixed(1));
    const lean = parseFloat((form.weight - fat).toFixed(1));
    setForm(prev => ({ ...prev, fatMass: fat, leanMass: lean }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
      <Header />

      <div className="bg-hero py-10 px-6">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Link href={`/trainer/students/${studentId}`}
            className="text-xs font-semibold tracking-widest mb-3 inline-block opacity-60 hover:opacity-100 text-white">
            ← Voltar para aluno
          </Link>
          <h1 className="text-3xl font-bold text-white mt-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Nova Avaliação Física
          </h1>
        </div>
      </div>

      <div className="app-container py-8 space-y-6">

        {/* General */}
        <Card>
          <p className="text-xs font-semibold tracking-widest mb-5" style={{ color: 'var(--color-camel)' }}>DADOS GERAIS</p>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Data</label>
              <input type="date" className="field" value={form.date}
                onChange={e => setBase('date', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Peso (kg)</label>
              <input type="number" step="0.1" className="field" value={form.weight || ''}
                onChange={e => setBase('weight', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>% Gordura</label>
              <div className="flex gap-2">
                <input type="number" step="0.1" className="field flex-1" value={form.fatPercent || ''}
                  onChange={e => setBase('fatPercent', parseFloat(e.target.value) || 0)} />
                <Button variant="ghost" onClick={autoCalc} className="!text-xs !px-3 flex-shrink-0">Auto</Button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Massa magra (kg)</label>
              <input type="number" step="0.1" className="field" value={form.leanMass || ''}
                onChange={e => setBase('leanMass', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Massa gorda (kg)</label>
              <input type="number" step="0.1" className="field" value={form.fatMass || ''}
                onChange={e => setBase('fatMass', parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Observações</label>
            <textarea className="field" rows={2} value={form.notes}
              onChange={e => setBase('notes', e.target.value)}
              placeholder="Observações gerais sobre a avaliação…" />
          </div>
        </Card>

        {/* Measurements */}
        <Card>
          <p className="text-xs font-semibold tracking-widest mb-5" style={{ color: 'var(--color-camel)' }}>MEDIDAS CORPORAIS (cm)</p>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
            {measureLabels.map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>{label}</label>
                <input type="number" step="0.1" className="field" value={form.measurements[key] || ''}
                  onChange={e => setMeasurement(key, parseFloat(e.target.value) || 0)} />
              </div>
            ))}
          </div>
        </Card>

        {/* Skinfolds */}
        <Card>
          <p className="text-xs font-semibold tracking-widest mb-5" style={{ color: 'var(--color-camel)' }}>DOBRAS CUTÂNEAS (mm)</p>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
            {skinfoldLabels.map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>{label}</label>
                <input type="number" step="0.1" className="field" value={form.skinfolds[key] || ''}
                  onChange={e => setSkinfold(key, parseFloat(e.target.value) || 0)} />
              </div>
            ))}
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Link href={`/trainer/students/${studentId}`}>
            <Button variant="ghost">Cancelar</Button>
          </Link>
          <Button variant="accent" onClick={handleSave}>
            {saved ? '✓ Avaliação salva!' : 'Salvar avaliação'}
          </Button>
        </div>
      </div>
    </div>
  );
}
