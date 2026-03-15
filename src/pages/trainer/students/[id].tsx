import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../../../components/Header';
import Card from '../../../components/Card';
import { Button } from '../../../components/Button';

// ─── Types ────────────────────────────────────────────────────────────────────
type Student = {
  id: string; name: string; avatar: string; status: string;
  email: string; phone: string; birthdate: string; height: number;
  currentWeight: number; targetWeight: number; startWeight: number;
  goal: string; plan: string; startDate: string;
  weeklyGoal: number; weeklyDone: number; streak: number;
  totalWorkouts: number; fatPercent: number; notes: string;
};

type Assessment = {
  id: string; date: string; weight: number; fatPercent: number;
  leanMass: number; fatMass: number;
  measurements: Record<string, number>;
  skinfolds: Record<string, number>;
  notes: string;
};

type Anamnesis = {
  filledAt: string;
  personalInfo: Record<string, string | number>;
  healthHistory: { conditions: string[]; surgeries: string[]; allergies: string[]; intolerances: string[]; medications: string[]; familyHistory: string[] };
  physicalActivity: { currentLevel: string; pastActivities: string[]; injuries: string[]; limitations: string };
  dietaryProfile: { eatingPattern: string; avoidedFoods: string[]; preferredFoods: string[]; supplementsInUse: string[]; waterConsumption: string; mealPrepSkill: string };
  goals: { primary: string; secondary: string; timeframe: string; motivation: string; obstacles: string };
  trainerNotes: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function age(birthdate: string) {
  const b = new Date(birthdate);
  const t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  if (t < new Date(t.getFullYear(), b.getMonth(), b.getDate())) a--;
  return a;
}
function fmtDate(iso: string) {
  return new Date(iso + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function tags(items: string[]) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t) => (
        <span key={t} className="text-xs px-3 py-1 rounded-full font-medium"
          style={{ background: 'rgba(178,150,125,0.2)', color: 'var(--color-camel)' }}>{t}</span>
      ))}
    </div>
  );
}
function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid rgba(74,52,42,0.07)' }}>
      <span className="text-xs font-semibold w-40 flex-shrink-0 pt-0.5" style={{ color: 'rgba(74,52,42,0.5)' }}>{label}</span>
      <span className="text-sm" style={{ color: 'var(--color-espresso)' }}>{String(value)}</span>
    </div>
  );
}
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <p className="text-xs font-semibold tracking-widest mb-4" style={{ color: 'var(--color-camel)' }}>{title}</p>
      {children}
    </Card>
  );
}

const measureLabels: Record<string, string> = {
  waist: 'Cintura', hip: 'Quadril', chest: 'Peitoral', rightArm: 'Bíceps D',
  leftArm: 'Bíceps E', rightThigh: 'Coxa D', leftThigh: 'Coxa E', abdomen: 'Abdômen', calf: 'Panturrilha',
};

type Tab = 'overview' | 'anamnesis' | 'assessments';

export default function TrainerStudentProfile() {
  const { query } = useRouter();
  const id = query.id as string | undefined;

  const [student, setStudent] = useState<Student | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [anamnesis, setAnamnesis] = useState<Anamnesis | null>(null);
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/trainer/students/${id}`).then((r) => r.json()).then(setStudent).catch(() => null);
    fetch(`/api/trainer/students/${id}?section=assessments`).then((r) => r.json()).then(setAssessments).catch(() => []);
    fetch(`/api/trainer/students/${id}?section=anamnesis`).then((r) => r.json()).then(setAnamnesis).catch(() => null);
  }, [id]);

  if (!student) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
        <Header />
        <div className="flex items-center justify-center h-64 text-sm" style={{ color: 'rgba(74,52,42,0.4)' }}>
          Carregando…
        </div>
      </div>
    );
  }

  const pct = Math.min(100, Math.max(0,
    ((student.startWeight - student.currentWeight) / (student.startWeight - student.targetWeight)) * 100));
  const latest = assessments[assessments.length - 1];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
      <Header />

      {/* Hero */}
      <div className="bg-hero py-10 px-6">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Link href="/trainer/students" className="text-xs font-semibold tracking-widest mb-3 inline-block opacity-60 hover:opacity-100 text-white">
            ← Voltar para alunos
          </Link>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <span className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.25)' }}>
              {student.avatar}
            </span>
            <div>
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                {student.name}
              </h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {student.plan} · {student.goal}
              </p>
            </div>
            <div className="ml-auto flex gap-2 flex-wrap">
              <Link href={`/trainer/students/${id}/assessment/new`}>
                <Button variant="outline-white">+ Avaliação</Button>
              </Link>
              <Link href={`/trainer/students/${id}/anamnesis/edit`}>
                <Button variant="outline-white">Editar anamnese</Button>
              </Link>
              <Link href={`/trainer/students/${id}/progress`}>
                <Button variant="accent">Ver progresso</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b" style={{ borderColor: 'var(--color-khaki)', background: 'rgba(245,241,234,0.95)' }}>
        <div className="flex gap-1" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {(['overview', 'anamnesis', 'assessments'] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-3 text-sm font-medium border-b-2 transition-all"
              style={{
                borderColor: tab === t ? 'var(--color-accent)' : 'transparent',
                color: tab === t ? 'var(--color-accent)' : 'rgba(74,52,42,0.55)',
              }}>
              {t === 'overview' ? 'Visão Geral' : t === 'anamnesis' ? 'Anamnese' : 'Avaliações'}
            </button>
          ))}
        </div>
      </div>

      <div className="app-container py-8">

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {/* KPIs */}
            <Card variant="dark">
              <p className="text-xs font-semibold tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>PROGRESSO DE PESO</p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-white">{student.currentWeight} kg</span>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>atual</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--color-accent)' }} />
              </div>
              <div className="flex justify-between text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <span>Início: {student.startWeight} kg</span>
                <span className="font-bold" style={{ color: 'var(--color-accent)' }}>{pct.toFixed(0)}% da meta</span>
                <span>Meta: {student.targetWeight} kg</span>
              </div>
            </Card>

            {/* Details */}
            <SectionCard title="DADOS PESSOAIS">
              <Row label="E-mail" value={student.email} />
              <Row label="Telefone" value={student.phone} />
              <Row label="Idade" value={`${age(student.birthdate)} anos`} />
              <Row label="Altura" value={`${student.height} cm`} />
              <Row label="Desde" value={fmtDate(student.startDate)} />
            </SectionCard>

            {/* Week summary */}
            <SectionCard title="SEMANA ATUAL">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Treinos', value: `${student.weeklyDone}/${student.weeklyGoal}` },
                  { label: 'Sequência', value: `${student.streak}d 🔥` },
                  { label: 'Total', value: String(student.totalWorkouts) },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.6)' }}>
                    <div className="text-xl font-bold">{value}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(74,52,42,0.5)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Latest assessment */}
            {latest && (
              <SectionCard title="ÚLTIMA AVALIAÇÃO">
                <Row label="Data" value={fmtDate(latest.date)} />
                <Row label="Peso" value={`${latest.weight} kg`} />
                <Row label="% Gordura" value={`${latest.fatPercent}%`} />
                <Row label="Massa magra" value={`${latest.leanMass} kg`} />
                <Row label="Massa gorda" value={`${latest.fatMass} kg`} />
                {latest.notes && <Row label="Obs" value={latest.notes} />}
              </SectionCard>
            )}

            {/* Trainer notes */}
            <div className="md:col-span-2 rounded-card p-5" style={{ background: 'rgba(232,108,44,0.07)', border: '1px solid rgba(232,108,44,0.15)' }}>
              <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'var(--color-accent)' }}>NOTAS DO TREINADOR</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-espresso)' }}>{student.notes}</p>
            </div>

            {/* Quick actions */}
            <div className="md:col-span-2 flex gap-3 flex-wrap">
              <Link href={`/trainer/nutrition/${id}/edit`}>
                <Button variant="primary">🥗 Editar plano alimentar</Button>
              </Link>
              <Link href={`/trainer/trainings`}>
                <Button variant="outline">🏋️ Gerenciar treinos</Button>
              </Link>
              <Link href={`/trainer/chat`}>
                <Button variant="ghost">💬 Abrir chat</Button>
              </Link>
            </div>
          </div>
        )}

        {/* ── ANAMNESIS ── */}
        {tab === 'anamnesis' && anamnesis && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Link href={`/trainer/students/${id}/anamnesis/edit`}>
                <Button variant="primary">Editar anamnese</Button>
              </Link>
            </div>

            <SectionCard title="INFORMAÇÕES PESSOAIS">
              {Object.entries(anamnesis.personalInfo).map(([k, v]) => (
                <Row key={k} label={k} value={v} />
              ))}
            </SectionCard>

            <SectionCard title="HISTÓRICO DE SAÚDE">
              <div className="space-y-4">
                {[
                  { label: 'Condições', items: anamnesis.healthHistory.conditions },
                  { label: 'Cirurgias', items: anamnesis.healthHistory.surgeries },
                  { label: 'Alergias', items: anamnesis.healthHistory.allergies },
                  { label: 'Intolerâncias', items: anamnesis.healthHistory.intolerances },
                  { label: 'Medicamentos', items: anamnesis.healthHistory.medications },
                  { label: 'Histórico familiar', items: anamnesis.healthHistory.familyHistory },
                ].map(({ label, items }) => (
                  <div key={label}>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(74,52,42,0.5)' }}>{label}</p>
                    {items.length > 0 ? tags(items) : <span className="text-xs" style={{ color: 'rgba(74,52,42,0.35)' }}>Nenhum</span>}
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="ATIVIDADE FÍSICA">
              <Row label="Nível atual" value={anamnesis.physicalActivity.currentLevel} />
              <Row label="Limitações" value={anamnesis.physicalActivity.limitations} />
              <div className="pt-2">
                <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(74,52,42,0.5)' }}>Atividades anteriores</p>
                {tags(anamnesis.physicalActivity.pastActivities)}
              </div>
              <div className="pt-2">
                <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(74,52,42,0.5)' }}>Lesões</p>
                {tags(anamnesis.physicalActivity.injuries)}
              </div>
            </SectionCard>

            <SectionCard title="PERFIL ALIMENTAR">
              <Row label="Padrão alimentar" value={anamnesis.dietaryProfile.eatingPattern} />
              <Row label="Consumo de água" value={anamnesis.dietaryProfile.waterConsumption} />
              <Row label="Habilidade culinária" value={anamnesis.dietaryProfile.mealPrepSkill} />
              <div className="pt-2">
                <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(74,52,42,0.5)' }}>Alimentos evitados</p>
                {tags(anamnesis.dietaryProfile.avoidedFoods)}
              </div>
              <div className="pt-2">
                <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(74,52,42,0.5)' }}>Alimentos preferidos</p>
                {tags(anamnesis.dietaryProfile.preferredFoods)}
              </div>
              <div className="pt-2">
                <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(74,52,42,0.5)' }}>Suplementos</p>
                {tags(anamnesis.dietaryProfile.supplementsInUse)}
              </div>
            </SectionCard>

            <SectionCard title="OBJETIVOS">
              <Row label="Principal" value={anamnesis.goals.primary} />
              <Row label="Secundário" value={anamnesis.goals.secondary} />
              <Row label="Prazo" value={anamnesis.goals.timeframe} />
              <Row label="Motivação" value={anamnesis.goals.motivation} />
              <Row label="Obstáculos" value={anamnesis.goals.obstacles} />
            </SectionCard>

            <div className="rounded-card p-5" style={{ background: 'rgba(232,108,44,0.07)' }}>
              <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'var(--color-accent)' }}>NOTAS DO TREINADOR</p>
              <p className="text-sm leading-relaxed">{anamnesis.trainerNotes}</p>
            </div>
          </div>
        )}

        {/* ── ASSESSMENTS ── */}
        {tab === 'assessments' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Link href={`/trainer/students/${id}/assessment/new`}>
                <Button variant="primary">+ Nova avaliação</Button>
              </Link>
            </div>
            {assessments.map((a, i) => (
              <Card key={a.id}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <p className="text-xs font-semibold tracking-widest" style={{ color: 'var(--color-camel)' }}>
                      AVALIAÇÃO #{i + 1}
                    </p>
                    <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{fmtDate(a.date)}</h3>
                  </div>
                  {a.notes && (
                    <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(178,150,125,0.2)', color: 'var(--color-cocoa)' }}>
                      {a.notes}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Peso', value: `${a.weight} kg` },
                    { label: '% Gordura', value: `${a.fatPercent}%` },
                    { label: 'Massa magra', value: `${a.leanMass} kg` },
                    { label: 'Massa gorda', value: `${a.fatMass} kg` },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.6)' }}>
                      <div className="text-lg font-bold">{value}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'rgba(74,52,42,0.5)' }}>{label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold mb-3" style={{ color: 'rgba(74,52,42,0.5)' }}>MEDIDAS (cm)</p>
                    <div className="space-y-1">
                      {Object.entries(a.measurements).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm">
                          <span style={{ color: 'rgba(74,52,42,0.6)' }}>{measureLabels[k] || k}</span>
                          <span className="font-semibold">{v} cm</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-3" style={{ color: 'rgba(74,52,42,0.5)' }}>DOBRAS CUTÂNEAS (mm)</p>
                    <div className="space-y-1">
                      {Object.entries(a.skinfolds).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm">
                          <span style={{ color: 'rgba(74,52,42,0.6)' }}>{k}</span>
                          <span className="font-semibold">{v} mm</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
