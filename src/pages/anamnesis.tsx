import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { apiFetch } from '../lib/api';
import { useRequireAuth } from '../lib/auth';

type Anamnesis = {
  filledAt: string;
  personalInfo: Record<string, string | number>;
  healthHistory: { conditions: string[]; surgeries: string[]; allergies: string[]; intolerances: string[]; medications: string[]; familyHistory: string[] };
  physicalActivity: { currentLevel: string; pastActivities: string[]; injuries: string[]; limitations: string };
  dietaryProfile: { eatingPattern: string; avoidedFoods: string[]; preferredFoods: string[]; supplementsInUse: string[]; waterConsumption: string; mealPrepSkill: string };
  goals: { primary: string; secondary: string; timeframe: string; motivation: string; obstacles: string };
  trainerNotes: string;
};

const personalInfoLabels: Record<string, string> = {
  bloodType: 'Tipo sanguíneo', occupation: 'Profissão', sleepHours: 'Horas de sono',
  waterIntake: 'Ingestão de água', smokingStatus: 'Tabagismo', alcoholUse: 'Álcool',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card p-6" style={{ background: 'var(--color-khaki)', boxShadow: 'var(--card-shadow)' }}>
      <p className="text-xs font-semibold tracking-widest mb-5" style={{ color: 'var(--color-camel)' }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function TagList({ items, color = 'var(--color-camel)' }: { items: string[]; color?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="text-xs px-3 py-1 rounded-full font-medium"
          style={{ background: 'rgba(178,150,125,0.2)', color }}>
          {item}
        </span>
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid rgba(74,52,42,0.07)' }}>
      <span className="text-xs font-semibold w-36 flex-shrink-0 pt-0.5" style={{ color: 'rgba(74,52,42,0.5)' }}>
        {label}
      </span>
      <span className="text-sm" style={{ color: 'var(--color-espresso)' }}>{String(value)}</span>
    </div>
  );
}

export default function Anamnesis() {
  useRequireAuth('student');
  const [data, setData] = useState<Anamnesis | null>(null);

  useEffect(() => {
    apiFetch<Anamnesis>('/api/anamnesis')
      .then(setData)
      .catch(() => null);
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
        <Header />
        <div className="flex items-center justify-center h-64 text-sm" style={{ color: 'rgba(74,52,42,0.4)' }}>Carregando…</div>
      </div>
    );
  }

  const filled = new Date(data.filledAt + 'T12:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
      <Header />

      {/* Hero */}
      <div className="bg-hero py-12 px-6">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            HISTÓRICO DE SAÚDE
          </p>
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Anamnese
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Preenchida em {filled}
          </p>
        </div>
      </div>

      <div className="app-container py-8 space-y-5">

        {/* Info pessoal */}
        <Section title="INFORMAÇÕES PESSOAIS">
          <div>
            {Object.entries(data.personalInfo).map(([k, v]) => (
              <Row key={k} label={personalInfoLabels[k] ?? k} value={v} />
            ))}
          </div>
        </Section>

        {/* Saúde */}
        <Section title="HISTÓRICO DE SAÚDE">
          <div className="space-y-5">
            {[
              { label: 'Condições de saúde',  items: data.healthHistory.conditions   },
              { label: 'Cirurgias',           items: data.healthHistory.surgeries    },
              { label: 'Alergias',            items: data.healthHistory.allergies    },
              { label: 'Intolerâncias',       items: data.healthHistory.intolerances },
              { label: 'Medicamentos',        items: data.healthHistory.medications  },
              { label: 'Histórico familiar',  items: data.healthHistory.familyHistory},
            ].map(({ label, items }) => (
              <div key={label}>
                <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(74,52,42,0.5)' }}>{label.toUpperCase()}</p>
                {items.length > 0 ? <TagList items={items} /> : <span className="text-sm" style={{ color: 'rgba(74,52,42,0.35)' }}>Nenhum</span>}
              </div>
            ))}
          </div>
        </Section>

        {/* Atividade física */}
        <Section title="ATIVIDADE FÍSICA">
          <div className="space-y-4">
            <Row label="Nível atual"      value={data.physicalActivity.currentLevel} />
            <Row label="Limitações"       value={data.physicalActivity.limitations}  />
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(74,52,42,0.5)' }}>ATIVIDADES ANTERIORES</p>
              <TagList items={data.physicalActivity.pastActivities} />
            </div>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(74,52,42,0.5)' }}>LESÕES</p>
              {data.physicalActivity.injuries.length > 0 ? <TagList items={data.physicalActivity.injuries} color="#E86C2C" /> : <span className="text-sm" style={{ color: 'rgba(74,52,42,0.35)' }}>Nenhuma</span>}
            </div>
          </div>
        </Section>

        {/* Dieta */}
        <Section title="PERFIL ALIMENTAR">
          <div className="space-y-4">
            <Row label="Padrão alimentar"  value={data.dietaryProfile.eatingPattern}    />
            <Row label="Água"              value={data.dietaryProfile.waterConsumption}  />
            <Row label="Habilidade culinária" value={data.dietaryProfile.mealPrepSkill} />
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(74,52,42,0.5)' }}>ALIMENTOS EVITADOS</p>
              <TagList items={data.dietaryProfile.avoidedFoods} color="#E86C2C" />
            </div>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(74,52,42,0.5)' }}>ALIMENTOS PREFERIDOS</p>
              <TagList items={data.dietaryProfile.preferredFoods} />
            </div>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(74,52,42,0.5)' }}>SUPLEMENTOS</p>
              <TagList items={data.dietaryProfile.supplementsInUse} />
            </div>
          </div>
        </Section>

        {/* Objetivos */}
        <Section title="OBJETIVOS">
          <div className="space-y-3">
            <Row label="Objetivo principal"  value={data.goals.primary}   />
            <Row label="Objetivo secundário" value={data.goals.secondary} />
            <Row label="Prazo"               value={data.goals.timeframe} />
            <Row label="Motivação"           value={data.goals.motivation}/>
            <Row label="Obstáculos"          value={data.goals.obstacles} />
          </div>
        </Section>

        {/* Trainer notes */}
        <div
          className="rounded-card p-6"
          style={{ background: 'linear-gradient(135deg, var(--color-hero-from), var(--color-hero-to))', boxShadow: 'var(--card-shadow-dark)' }}
        >
          <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
            NOTAS DA PERSONAL
          </p>
          <p className="text-sm leading-relaxed text-white">{data.trainerNotes}</p>
        </div>

      </div>
    </div>
  );
}
