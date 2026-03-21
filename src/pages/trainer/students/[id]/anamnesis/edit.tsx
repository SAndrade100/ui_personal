import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../../../../../components/Header';
import Card from '../../../../../components/Card';
import { Button } from '../../../../../components/Button';
import { apiFetch } from '../../../../../lib/api';

type Anamnesis = {
  filledAt: string;
  personalInfo: { bloodType: string; occupation: string; sleepHours: number; waterIntake: string; smokingStatus: string; alcoholUse: string };
  healthHistory: { conditions: string[]; surgeries: string[]; allergies: string[]; intolerances: string[]; medications: string[]; familyHistory: string[] };
  physicalActivity: { currentLevel: string; pastActivities: string[]; injuries: string[]; limitations: string };
  dietaryProfile: { eatingPattern: string; avoidedFoods: string[]; preferredFoods: string[]; supplementsInUse: string[]; waterConsumption: string; mealPrepSkill: string };
  goals: { primary: string; secondary: string; timeframe: string; motivation: string; obstacles: string };
  trainerNotes: string;
};

function TagEditor({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('');
  const add = () => {
    if (!input.trim()) return;
    onChange([...value, input.trim()]);
    setInput('');
  };
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((v, i) => (
          <span key={i} className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: 'rgba(178,150,125,0.2)', color: 'var(--color-camel)' }}>
            {v}
            <button onClick={() => remove(i)} className="ml-1 opacity-60 hover:opacity-100">✕</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="field !py-1.5 !text-sm flex-1" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Adicionar…" />
        <Button variant="ghost" onClick={add} className="!py-1.5 !px-3 !text-xs">+</Button>
      </div>
    </div>
  );
}

export default function TrainerAnamnesisEdit() {
  const router = useRouter();
  const studentId = router.query.id as string | undefined;
  const [form, setForm] = useState<Anamnesis | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    apiFetch<Anamnesis>(`/api/trainer/students/${studentId}?section=anamnesis`)
      .then((data) => {
        if (data) {
          setForm(data);
        } else {
          // No existing anamnesis — initialize blank form
          setForm({
            filledAt: new Date().toISOString(),
            personalInfo: { bloodType: '', occupation: '', sleepHours: 7, waterIntake: '', smokingStatus: '', alcoholUse: '' },
            healthHistory: { conditions: [], surgeries: [], allergies: [], intolerances: [], medications: [], familyHistory: [] },
            physicalActivity: { currentLevel: '', pastActivities: [], injuries: [], limitations: '' },
            dietaryProfile: { eatingPattern: '', avoidedFoods: [], preferredFoods: [], supplementsInUse: [], waterConsumption: '', mealPrepSkill: '' },
            goals: { primary: '', secondary: '', timeframe: '', motivation: '', obstacles: '' },
            trainerNotes: '',
          });
        }
      })
      .catch(() => null);
  }, [studentId]);

  if (!form) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
        <Header />
        <div className="flex items-center justify-center h-64 text-sm" style={{ color: 'rgba(74,52,42,0.4)' }}>Carregando…</div>
      </div>
    );
  }

  function setPI<K extends keyof Anamnesis['personalInfo']>(key: K, value: Anamnesis['personalInfo'][K]) {
    setForm(prev => prev ? { ...prev, personalInfo: { ...prev.personalInfo, [key]: value } } : prev);
  }

  function setGoal<K extends keyof Anamnesis['goals']>(key: K, value: string) {
    setForm(prev => prev ? { ...prev, goals: { ...prev.goals, [key]: value } } : prev);
  }

  function setHH<K extends keyof Anamnesis['healthHistory']>(key: K, value: string[]) {
    setForm(prev => prev ? { ...prev, healthHistory: { ...prev.healthHistory, [key]: value } } : prev);
  }

  function setPA<K extends keyof Anamnesis['physicalActivity']>(key: K, value: string | string[]) {
    setForm(prev => prev ? { ...prev, physicalActivity: { ...prev.physicalActivity, [key]: value } } : prev);
  }

  function setDP<K extends keyof Anamnesis['dietaryProfile']>(key: K, value: string | string[]) {
    setForm(prev => prev ? { ...prev, dietaryProfile: { ...prev.dietaryProfile, [key]: value } } : prev);
  }

  function handleSave() {
    if (!studentId) return;
    apiFetch(`/api/anamnesis?studentId=${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(form),
    })
      .then(() => {
        setSaved(true);
        setTimeout(() => router.push(`/trainer/students/${studentId}`), 1200);
      })
      .catch(() => alert('Erro ao salvar anamnese.'));
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
            Editar Anamnese
          </h1>
        </div>
      </div>

      <div className="app-container py-8 space-y-6">

        {/* Personal info */}
        <Card>
          <p className="text-xs font-semibold tracking-widest mb-5" style={{ color: 'var(--color-camel)' }}>INFORMAÇÕES PESSOAIS</p>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {([
              { key: 'bloodType',    label: 'Tipo sanguíneo' },
              { key: 'occupation',   label: 'Profissão' },
              { key: 'waterIntake',  label: 'Ingestão de água' },
              { key: 'smokingStatus',label: 'Tabagismo' },
              { key: 'alcoholUse',   label: 'Uso de álcool' },
            ] as { key: keyof Anamnesis['personalInfo']; label: string }[]).map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>{label}</label>
                <input className="field" value={String(form.personalInfo[key])}
                  onChange={e => setPI(key, e.target.value as never)} />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Horas de sono</label>
              <input type="number" className="field" value={form.personalInfo.sleepHours}
                onChange={e => setPI('sleepHours', Number(e.target.value))} min={1} max={12} />
            </div>
          </div>
        </Card>

        {/* Health history */}
        <Card>
          <p className="text-xs font-semibold tracking-widest mb-5" style={{ color: 'var(--color-camel)' }}>HISTÓRICO DE SAÚDE</p>
          <div className="space-y-4">
            <TagEditor label="Condições" value={form.healthHistory.conditions} onChange={v => setHH('conditions', v)} />
            <TagEditor label="Cirurgias" value={form.healthHistory.surgeries} onChange={v => setHH('surgeries', v)} />
            <TagEditor label="Alergias" value={form.healthHistory.allergies} onChange={v => setHH('allergies', v)} />
            <TagEditor label="Intolerâncias" value={form.healthHistory.intolerances} onChange={v => setHH('intolerances', v)} />
            <TagEditor label="Medicamentos" value={form.healthHistory.medications} onChange={v => setHH('medications', v)} />
            <TagEditor label="Histórico familiar" value={form.healthHistory.familyHistory} onChange={v => setHH('familyHistory', v)} />
          </div>
        </Card>

        {/* Physical activity */}
        <Card>
          <p className="text-xs font-semibold tracking-widest mb-5" style={{ color: 'var(--color-camel)' }}>ATIVIDADE FÍSICA</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Nível atual</label>
              <input className="field" value={form.physicalActivity.currentLevel}
                onChange={e => setPA('currentLevel', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Limitações</label>
              <textarea className="field" rows={2} value={form.physicalActivity.limitations}
                onChange={e => setPA('limitations', e.target.value)} />
            </div>
            <TagEditor label="Atividades anteriores" value={form.physicalActivity.pastActivities} onChange={v => setPA('pastActivities', v)} />
            <TagEditor label="Lesões" value={form.physicalActivity.injuries} onChange={v => setPA('injuries', v)} />
          </div>
        </Card>

        {/* Dietary profile */}
        <Card>
          <p className="text-xs font-semibold tracking-widest mb-5" style={{ color: 'var(--color-camel)' }}>PERFIL ALIMENTAR</p>
          <div className="space-y-4">
            {([
              { key: 'eatingPattern', label: 'Padrão alimentar' },
              { key: 'waterConsumption', label: 'Consumo de água' },
              { key: 'mealPrepSkill', label: 'Habilidade culinária' },
            ] as { key: keyof Anamnesis['dietaryProfile']; label: string }[]).map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>{label}</label>
                <input className="field" value={String(form.dietaryProfile[key])}
                  onChange={e => setDP(key, e.target.value)} />
              </div>
            ))}
            <TagEditor label="Alimentos evitados" value={form.dietaryProfile.avoidedFoods} onChange={v => setDP('avoidedFoods', v)} />
            <TagEditor label="Alimentos preferidos" value={form.dietaryProfile.preferredFoods} onChange={v => setDP('preferredFoods', v)} />
            <TagEditor label="Suplementos" value={form.dietaryProfile.supplementsInUse} onChange={v => setDP('supplementsInUse', v)} />
          </div>
        </Card>

        {/* Goals */}
        <Card>
          <p className="text-xs font-semibold tracking-widest mb-5" style={{ color: 'var(--color-camel)' }}>OBJETIVOS</p>
          <div className="space-y-4">
            {([
              { key: 'primary',   label: 'Objetivo principal' },
              { key: 'secondary', label: 'Objetivo secundário' },
              { key: 'timeframe', label: 'Prazo' },
              { key: 'motivation',label: 'Motivação' },
              { key: 'obstacles', label: 'Obstáculos' },
            ] as { key: keyof Anamnesis['goals']; label: string }[]).map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>{label}</label>
                <input className="field" value={form.goals[key]} onChange={e => setGoal(key, e.target.value)} />
              </div>
            ))}
          </div>
        </Card>

        {/* Trainer notes */}
        <Card>
          <p className="text-xs font-semibold tracking-widest mb-4" style={{ color: 'var(--color-camel)' }}>NOTAS DO TREINADOR</p>
          <textarea className="field" rows={4} value={form.trainerNotes}
            onChange={e => setForm(prev => prev ? { ...prev, trainerNotes: e.target.value } : prev)}
            placeholder="Observações, recomendações, atenção especial…" />
        </Card>

        <div className="flex gap-3 justify-end">
          <Link href={`/trainer/students/${studentId}`}>
            <Button variant="ghost">Cancelar</Button>
          </Link>
          <Button variant="accent" onClick={handleSave}>
            {saved ? '✓ Salvo!' : 'Salvar anamnese'}
          </Button>
        </div>
      </div>
    </div>
  );
}
