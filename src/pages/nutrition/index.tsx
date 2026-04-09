import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { apiFetch } from '../../lib/api';
import {
  ClipboardList, Salad, BookOpen, Clock,
  Coffee, Apple, UtensilsCrossed, GlassWater, Moon, Sun, Utensils,
  type LucideIcon,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type MacroKey = 'protein' | 'carbs' | 'fat';
type FoodItem  = { name: string; calories: number; protein: number; carbs: number; fat: number };
type Meal      = { id: string; name: string; time: string; emoji: string; items: FoodItem[] };
type Plan      = { title: string; updatedBy: string; updatedAt: string; dailyTargets: { calories: number } & Record<MacroKey, number>; meals: Meal[] };
type DiaryEntry = { id: string; mealSlot: string; description: string; calories: number; protein: number; carbs: number; fat: number; time: string };
type DiaryDay   = { date: string; entries: DiaryEntry[] };
type NutritionData = { plan: Plan; diary: DiaryDay[] };

// ─── Helpers ──────────────────────────────────────────────────────────────────
type NumericFoodKey = 'calories' | 'protein' | 'carbs' | 'fat';
function sum(items: Partial<Record<NumericFoodKey, number>>[], key: NumericFoodKey): number {
  return items.reduce((s, i) => s + (i[key] ?? 0), 0);
}

function macroColor(k: MacroKey): string {
  return k === 'protein' ? '#E86C2C' : k === 'carbs' ? '#B2967D' : '#7D5A44';
}

function macroLabel(k: MacroKey): string {
  return k === 'protein' ? 'Proteína' : k === 'carbs' ? 'Carboidrato' : 'Gordura';
}

// ─── Macro ring (SVG donut) ───────────────────────────────────────────────────
function MacroRing({ protein, carbs, fat, calories }: { protein: number; carbs: number; fat: number; calories: number }) {
  const r = 54, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  const total = protein * 4 + carbs * 4 + fat * 9;
  const segs: { key: MacroKey; cals: number }[] = [
    { key: 'protein', cals: protein * 4 },
    { key: 'carbs',   cals: carbs * 4   },
    { key: 'fat',     cals: fat * 9     },
  ];
  let offset = 0;
  const arcs = segs.map(({ key, cals }) => {
    const len = total > 0 ? (cals / total) * circ : 0;
    const arc = { key, len, offset };
    offset += len;
    return arc;
  });

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" aria-label="Gráfico de macros">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(74,52,42,0.1)" strokeWidth="18" />
      {arcs.map(({ key, len, offset: off }) => (
        <circle
          key={key}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={macroColor(key)}
          strokeWidth="18"
          strokeDasharray={`${len.toFixed(2)} ${(circ - len).toFixed(2)}`}
          strokeDashoffset={(-off + circ / 4).toFixed(2)}
          strokeLinecap="round"
        />
      ))}
      <text x={cx} y={cy - 8}  textAnchor="middle" fontSize={20} fontWeight="bold" fill="#4A342A">{calories}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={10} fill="rgba(74,52,42,0.5)">kcal</text>
    </svg>
  );
}

// ─── Bar gauge ────────────────────────────────────────────────────────────────
function MacroBar({ label, consumed, target, color }: { label: string; consumed: number; target: number; color: string }) {
  const pct = Math.min(100, (consumed / target) * 100);
  const over = consumed > target;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5" style={{ color: 'rgba(74,52,42,0.7)' }}>
        <span className="font-semibold">{label}</span>
        <span>
          <span className="font-bold" style={{ color: over ? '#E86C2C' : color }}>{consumed}g</span>
          {' '}/{' '}{target}g
        </span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(74,52,42,0.08)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: over ? '#E86C2C' : color }}
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type Tab = 'plan' | 'macros' | 'diary';

export default function Nutrition() {
  const [data, setData] = useState<NutritionData | null>(null);
  const [tab, setTab] = useState<Tab>('plan');
  const [diaryIdx, setDiaryIdx] = useState(0);   // which day
  const [open, setOpen] = useState<string | null>(null); // expanded meal in plan

  useEffect(() => {
    apiFetch<NutritionData>('/api/nutrition')
      .then(setData)
      .catch(() => null);
  }, []);

  const plan   = data?.plan;
  const diary  = data?.diary ?? [];
  const today  = diary[diaryIdx];
  const macroKeys: MacroKey[] = ['protein', 'carbs', 'fat'];

  // consumed macros for selected day
  const consumed = today
    ? {
        calories: sum(today.entries, 'calories'),
        protein:  sum(today.entries, 'protein'),
        carbs:    sum(today.entries, 'carbs'),
        fat:      sum(today.entries, 'fat'),
      }
    : { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const fmtDate = (iso: string) =>
    new Date(iso + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });

  const ICON_MAP: Record<string, LucideIcon> = {
    Coffee, Apple, UtensilsCrossed, GlassWater, Moon, Sun, Salad,
    '☕': Coffee, '⛰️': Coffee,
    '🍎': Apple, '🍽️': UtensilsCrossed,
    '🥤': GlassWater, '🌙': Moon, '🌛': Moon, '🥗': Salad,
  };
  function getMealIcon(emoji: string): LucideIcon { return ICON_MAP[emoji] ?? Utensils; }

  const tabs: { key: Tab; label: string; Icon: LucideIcon }[] = [
    { key: 'plan',   label: 'Plano alimentar', Icon: ClipboardList },
    { key: 'macros', label: 'Macros do dia',   Icon: Salad },
    { key: 'diary',  label: 'Diário',          Icon: BookOpen },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-linen)' }}>
      <Header />

      {/* Hero */}
      <div className="bg-hero py-12 px-6">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            ALIMENTAÇÃO
          </p>
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Nutrição
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Seu plano alimentar personalizado e registro de refeições.
          </p>

          {/* Tab row */}
          <div className="flex gap-2 mt-6 flex-wrap">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: tab === t.key ? 'white' : 'rgba(255,255,255,0.1)',
                  color:      tab === t.key ? 'var(--color-espresso)' : 'rgba(255,255,255,0.7)',
                }}
              >
                <t.Icon size={14} />{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="app-container py-8">

        {/* ══ TAB: Plano alimentar ══ */}
        {tab === 'plan' && plan && (
          <div>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>{plan.title}</h2>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(74,52,42,0.5)' }}>
                  Montado por {plan.updatedBy} • {new Date(plan.updatedAt + 'T12:00').toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex gap-3 text-xs">
                {macroKeys.map((k) => (
                  <span key={k} className="flex items-center gap-1.5 font-semibold" style={{ color: macroColor(k) }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: macroColor(k) }} />
                    {macroLabel(k)}: {plan.dailyTargets[k]}g
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {plan.meals.map((meal) => {
                const mealCals = sum(meal.items, 'calories');
                const isOpen = open === meal.id;
                return (
                  <div
                    key={meal.id}
                    className="rounded-card overflow-hidden"
                    style={{ background: 'var(--color-khaki)', boxShadow: 'var(--card-shadow)' }}
                  >
                    {/* Header row */}
                    <button
                      className="w-full flex items-center gap-4 p-5 text-left"
                      onClick={() => setOpen(isOpen ? null : meal.id)}
                    >
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-camel)', color: 'white' }}>
                        {React.createElement(getMealIcon(meal.emoji), { size: 16 })}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                          {meal.name}
                        </div>
                        <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: 'rgba(74,52,42,0.5)' }}><Clock size={10} /> {meal.time}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-sm" style={{ color: 'var(--color-accent)' }}>{mealCals} kcal</div>
                        <div className="text-xs" style={{ color: 'rgba(74,52,42,0.45)' }}>
                          P{sum(meal.items, 'protein')}g · C{sum(meal.items, 'carbs')}g · G{sum(meal.items, 'fat')}g
                        </div>
                      </div>
                      <span className="ml-2 text-xs transition-transform" style={{
                        color: 'rgba(74,52,42,0.4)',
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        display: 'inline-block',
                      }}>▼</span>
                    </button>

                    {/* Items */}
                    {isOpen && (
                      <div style={{ borderTop: '1px solid rgba(74,52,42,0.08)' }}>
                        {meal.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 px-5 py-3"
                            style={{ borderBottom: i < meal.items.length - 1 ? '1px solid rgba(74,52,42,0.06)' : 'none' }}
                          >
                            <div className="flex-1 text-sm">{item.name}</div>
                            <div className="flex gap-3 text-xs" style={{ color: 'rgba(74,52,42,0.6)' }}>
                              <span className="font-semibold" style={{ color: 'var(--color-espresso)' }}>{item.calories} kcal</span>
                              <span>P{item.protein}g</span>
                              <span>C{item.carbs}g</span>
                              <span>G{item.fat}g</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Daily total */}
            <div
              className="rounded-card p-5 mt-5"
              style={{ background: 'linear-gradient(135deg, var(--color-hero-from), var(--color-hero-to))', boxShadow: 'var(--card-shadow-dark)' }}
            >
              <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>TOTAL DO PLANO</p>
              <div className="flex items-center gap-6 flex-wrap">
                {([['kcal', plan.dailyTargets.calories], ...macroKeys.map((k) => [`${k.slice(0,1).toUpperCase()}`, plan.dailyTargets[k]] as [string, number])] as [string, number][]).map(([lbl, val]) => (
                  <div key={lbl} className="text-center">
                    <div className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>{val}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB: Macros do dia ══ */}
        {tab === 'macros' && (
          <div>
            {/* Day selector */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {diary.map((d, i) => (
                <button
                  key={d.date}
                  onClick={() => setDiaryIdx(i)}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={{
                    background: diaryIdx === i ? 'var(--color-espresso)' : 'var(--color-khaki)',
                    color:      diaryIdx === i ? 'white' : 'var(--color-espresso)',
                    boxShadow:  diaryIdx === i ? 'var(--card-shadow-dark)' : 'none',
                  }}
                >
                  {fmtDate(d.date)}
                </button>
              ))}
            </div>

            {today && plan && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Donut */}
                <div className="rounded-card p-6 flex flex-col items-center justify-center gap-4"
                  style={{ background: 'var(--color-khaki)', boxShadow: 'var(--card-shadow)' }}
                >
                  <p className="text-xs font-semibold tracking-widest self-start" style={{ color: 'var(--color-camel)' }}>
                    DISTRIBUIÇÃO DE MACROS
                  </p>
                  <MacroRing {...consumed} />
                  <div className="flex gap-4 mt-1">
                    {macroKeys.map((k) => (
                      <div key={k} className="flex items-center gap-1.5 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: macroColor(k) }} />
                        <span style={{ color: 'rgba(74,52,42,0.65)' }}>{macroLabel(k)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bars */}
                <div className="rounded-card p-6 space-y-5"
                  style={{ background: 'var(--color-khaki)', boxShadow: 'var(--card-shadow)' }}
                >
                  <p className="text-xs font-semibold tracking-widest" style={{ color: 'var(--color-camel)' }}>
                    CONSUMIDO VS META
                  </p>
                  <div className="rounded-xl p-4 flex items-center justify-between"
                    style={{ background: 'rgba(255,255,255,0.55)' }}
                  >
                    <div>
                      <div className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: consumed.calories > plan.dailyTargets.calories ? '#E86C2C' : 'var(--color-espresso)' }}>
                        {consumed.calories}
                      </div>
                      <div className="text-xs" style={{ color: 'rgba(74,52,42,0.5)' }}>kcal consumidas de {plan.dailyTargets.calories}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold" style={{ color: 'var(--color-accent)' }}>
                        {Math.max(0, plan.dailyTargets.calories - consumed.calories)} kcal
                      </div>
                      <div className="text-xs" style={{ color: 'rgba(74,52,42,0.5)' }}>saldo restante</div>
                    </div>
                  </div>

                  {macroKeys.map((k) => (
                    <MacroBar
                      key={k}
                      label={macroLabel(k)}
                      consumed={consumed[k]}
                      target={plan.dailyTargets[k]}
                      color={macroColor(k)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB: Diário alimentar ══ */}
        {tab === 'diary' && (
          <div>
            {/* Day selector */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {diary.map((d, i) => (
                <button
                  key={d.date}
                  onClick={() => setDiaryIdx(i)}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={{
                    background: diaryIdx === i ? 'var(--color-espresso)' : 'var(--color-khaki)',
                    color:      diaryIdx === i ? 'white' : 'var(--color-espresso)',
                  }}
                >
                  {fmtDate(d.date)}
                </button>
              ))}
            </div>

            {today && (
              <div className="space-y-3">
                {today.entries.map((entry) => (
                  <div key={entry.id} className="rounded-card p-5 flex items-start gap-4"
                    style={{ background: 'var(--color-khaki)', boxShadow: 'var(--card-shadow)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(178,150,125,0.3)', color: 'var(--color-cocoa)' }}>
                          {entry.mealSlot}
                        </span>
                        <span className="text-xs" style={{ color: 'rgba(74,52,42,0.4)' }}>⏰ {entry.time}</span>
                      </div>
                      <div className="text-sm font-medium">{entry.description}</div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-lg font-bold" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-heading)' }}>
                        {entry.calories} kcal
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'rgba(74,52,42,0.5)' }}>
                        P{entry.protein}g · C{entry.carbs}g · G{entry.fat}g
                      </div>
                    </div>
                  </div>
                ))}

                {/* Day total */}
                <div className="rounded-card px-5 py-4 flex items-center justify-between"
                  style={{ background: 'linear-gradient(135deg, var(--color-hero-from), var(--color-hero-to))', boxShadow: 'var(--card-shadow-dark)' }}
                >
                  <span className="text-sm font-semibold text-white">Total do dia</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>{consumed.calories} kcal</span>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      P{consumed.protein}g · C{consumed.carbs}g · G{consumed.fat}g
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
