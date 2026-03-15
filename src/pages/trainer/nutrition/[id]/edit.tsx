import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../../../../components/Header';
import Card from '../../../../components/Card';
import { Button } from '../../../../components/Button';

type MacroKey = 'protein' | 'carbs' | 'fat';
type FoodItem = { name: string; calories: number; protein: number; carbs: number; fat: number };
type Meal = { id: string; name: string; time: string; emoji: string; items: FoodItem[] };
type Plan = {
  title: string; updatedBy: string; updatedAt: string;
  dailyTargets: { calories: number; protein: number; carbs: number; fat: number };
  meals: Meal[];
};

const MEAL_EMOJIS = ['☕', '🍎', '🍽️', '🥤', '🌙', '🌛', '🥗'];

function uid() { return 'm' + Math.random().toString(36).slice(2, 8); }
function fuid() { return 'f' + Math.random().toString(36).slice(2, 8); }

export default function TrainerNutritionEdit() {
  const { query } = useRouter();
  const studentId = query.id as string | undefined;

  const [plan, setPlan] = useState<Plan>({
    title: 'Plano Alimentar — Semana',
    updatedBy: 'Ana Paula Souza',
    updatedAt: new Date().toISOString().slice(0, 10),
    dailyTargets: { calories: 1800, protein: 130, carbs: 200, fat: 55 },
    meals: [],
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/nutrition?section=plan')
      .then((r) => r.json())
      .then((p: Plan) => setPlan(p))
      .catch(() => null);
  }, [studentId]);

  function setTarget(key: MacroKey | 'calories', value: number) {
    setPlan((prev) => ({ ...prev, dailyTargets: { ...prev.dailyTargets, [key]: value } }));
  }

  function addMeal() {
    setPlan((prev) => ({
      ...prev,
      meals: [...prev.meals, {
        id: uid(), name: 'Nova refeição', time: '12:00',
        emoji: MEAL_EMOJIS[prev.meals.length % MEAL_EMOJIS.length], items: [],
      }],
    }));
  }

  function updateMeal(idx: number, field: keyof Omit<Meal, 'items'>, value: string) {
    setPlan((prev) => ({
      ...prev,
      meals: prev.meals.map((m, i) => i === idx ? { ...m, [field]: value } : m),
    }));
  }

  function removeMeal(idx: number) {
    setPlan((prev) => ({ ...prev, meals: prev.meals.filter((_, i) => i !== idx) }));
  }

  function addItem(mealIdx: number) {
    setPlan((prev) => ({
      ...prev,
      meals: prev.meals.map((m, i) => i === mealIdx
        ? { ...m, items: [...m.items, { name: '', calories: 0, protein: 0, carbs: 0, fat: 0 }] }
        : m),
    }));
  }

  function updateItem(mealIdx: number, itemIdx: number, field: keyof FoodItem, value: string | number) {
    setPlan((prev) => ({
      ...prev,
      meals: prev.meals.map((m, i) => i === mealIdx
        ? { ...m, items: m.items.map((it, j) => j === itemIdx ? { ...it, [field]: value } : it) }
        : m),
    }));
  }

  function removeItem(mealIdx: number, itemIdx: number) {
    setPlan((prev) => ({
      ...prev,
      meals: prev.meals.map((m, i) => i === mealIdx
        ? { ...m, items: m.items.filter((_, j) => j !== itemIdx) }
        : m),
    }));
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
          <Link href={`/trainer/students/${studentId}`} className="text-xs font-semibold tracking-widest mb-3 inline-block opacity-60 hover:opacity-100 text-white">
            ← Voltar para aluno
          </Link>
          <h1 className="text-3xl font-bold text-white mt-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Plano Alimentar
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Aluno ID: {studentId}</p>
        </div>
      </div>

      <div className="app-container py-8 space-y-6">

        {/* Plan info */}
        <Card>
          <p className="text-xs font-semibold tracking-widest mb-5" style={{ color: 'var(--color-camel)' }}>INFORMAÇÕES DO PLANO</p>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Título</label>
              <input className="field" value={plan.title}
                onChange={(e) => setPlan((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>Data de atualização</label>
              <input type="date" className="field" value={plan.updatedAt}
                onChange={(e) => setPlan((p) => ({ ...p, updatedAt: e.target.value }))} />
            </div>
          </div>
        </Card>

        {/* Daily targets */}
        <Card>
          <p className="text-xs font-semibold tracking-widest mb-5" style={{ color: 'var(--color-camel)' }}>METAS DIÁRIAS</p>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {([
              { key: 'calories', label: 'Calorias (kcal)' },
              { key: 'protein',  label: 'Proteína (g)' },
              { key: 'carbs',    label: 'Carboidrato (g)' },
              { key: 'fat',      label: 'Gordura (g)' },
            ] as { key: MacroKey | 'calories'; label: string }[]).map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(74,52,42,0.65)' }}>{label}</label>
                <input type="number" className="field" value={plan.dailyTargets[key]}
                  onChange={(e) => setTarget(key, Number(e.target.value))} min={0} />
              </div>
            ))}
          </div>
        </Card>

        {/* Meals */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Refeições ({plan.meals.length})</h2>
          <Button variant="ghost" onClick={addMeal}>+ Adicionar refeição</Button>
        </div>

        {plan.meals.map((meal, mi) => (
          <Card key={meal.id}>
            {/* Meal header */}
            <div className="flex items-center gap-3 flex-wrap mb-5">
              <select className="field !w-16 !text-center !text-lg"
                value={meal.emoji} onChange={(e) => updateMeal(mi, 'emoji', e.target.value)}>
                {MEAL_EMOJIS.map((em) => <option key={em}>{em}</option>)}
              </select>
              <div className="flex-1 grid grid-cols-2 gap-3">
                <input className="field" value={meal.name}
                  onChange={(e) => updateMeal(mi, 'name', e.target.value)} placeholder="Nome da refeição" />
                <input type="time" className="field" value={meal.time}
                  onChange={(e) => updateMeal(mi, 'time', e.target.value)} />
              </div>
              <button onClick={() => removeMeal(mi)}
                className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ color: 'var(--color-accent)', background: 'rgba(232,108,44,0.08)' }}>
                Remover
              </button>
            </div>

            {/* Items */}
            <div className="space-y-2 mb-3">
              {meal.items.map((item, ii) => (
                <div key={ii} className="flex items-center gap-2 flex-wrap p-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.55)' }}>
                  <input className="field flex-1 min-w-[140px] !text-sm"
                    value={item.name}
                    onChange={(e) => updateItem(mi, ii, 'name', e.target.value)}
                    placeholder="Alimento" />
                  {(['calories', 'protein', 'carbs', 'fat'] as (keyof FoodItem)[]).filter(k => k !== 'name').map((k) => (
                    <div key={k} className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] font-semibold uppercase" style={{ color: 'rgba(74,52,42,0.4)' }}>
                        {k === 'calories' ? 'kcal' : k === 'protein' ? 'prot' : k === 'carbs' ? 'carb' : 'gord'}
                      </span>
                      <input type="number" min={0}
                        className="field !w-16 !text-xs !py-1 !px-2"
                        value={item[k] as number}
                        onChange={(e) => updateItem(mi, ii, k, Number(e.target.value))} />
                    </div>
                  ))}
                  <button onClick={() => removeItem(mi, ii)}
                    className="text-xs px-2 py-1 rounded-lg"
                    style={{ color: 'rgba(232,108,44,0.7)', background: 'rgba(232,108,44,0.08)' }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <Button variant="ghost" onClick={() => addItem(mi)}>+ Adicionar alimento</Button>
          </Card>
        ))}

        {/* Save */}
        <div className="flex gap-3 justify-end">
          <Link href={`/trainer/students/${studentId}`}>
            <Button variant="ghost">Cancelar</Button>
          </Link>
          <Button variant="accent" onClick={handleSave}>
            {saved ? '✓ Salvo!' : 'Salvar plano'}
          </Button>
        </div>
      </div>
    </div>
  );
}
