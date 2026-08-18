/* ============================================
   IRON FORGE GYM — Calculators Logic
   ============================================ */

function calcBMI(weightKg, heightCm){
  const h = heightCm/100;
  const bmi = weightKg / (h*h);
  let cat, catAr, catEn, color;
  if(bmi < 18.5){ catAr='نحافة'; catEn='Underweight'; color='var(--warning)'; }
  else if(bmi < 25){ catAr='طبيعي'; catEn='Normal'; color='var(--success)'; }
  else if(bmi < 30){ catAr='زيادة وزن'; catEn='Overweight'; color='var(--warning)'; }
  else { catAr='سمنة'; catEn='Obese'; color='var(--danger)'; }
  return { bmi: Math.round(bmi*10)/10, catAr, catEn, color };
}

function calcIdealWeight(heightCm, gender){
  // Devine formula
  const inches = heightCm/2.54;
  const over5ft = Math.max(0, inches - 60);
  const base = gender === 'male' ? 50 : 45.5;
  const kg = base + 2.3*over5ft;
  return Math.round(kg*10)/10;
}

function calcBMR(weightKg, heightCm, age, gender){
  // Mifflin-St Jeor
  const s = gender === 'male' ? 5 : -161;
  return (10*weightKg) + (6.25*heightCm) - (5*age) + s;
}

const ACTIVITY_FACTORS = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryactive: 1.9
};

function calcTDEE(bmr, activity){
  return bmr * (ACTIVITY_FACTORS[activity] || 1.2);
}

function calcGoalCalories(tdee, goal){
  // goal: lose | maintain | gain
  if(goal === 'lose') return Math.round(tdee - 500);
  if(goal === 'gain') return Math.round(tdee + 400);
  return Math.round(tdee);
}

function calcMacros(calories, goal){
  // returns grams { protein, carbs, fat }
  let proteinPct = .30, carbPct = .40, fatPct = .30;
  if(goal === 'gain'){ proteinPct=.27; carbPct=.48; fatPct=.25; }
  if(goal === 'lose'){ proteinPct=.35; carbPct=.35; fatPct=.30; }
  return {
    protein: Math.round((calories*proteinPct)/4),
    carbs: Math.round((calories*carbPct)/4),
    fat: Math.round((calories*fatPct)/9),
  };
}

function calc1RM(weight, reps){
  if(reps <= 1) return Math.round(weight);
  // Epley formula
  return Math.round(weight * (1 + reps/30));
}

const MET_VALUES = {
  running: 9.8, cycling: 7.5, swimming: 8.0, weights: 5.0, walking: 3.5, jumprope: 11.0, yoga: 2.5, hiit: 8.5
};

function calcCaloriesBurned(activity, weightKg, minutes){
  const met = MET_VALUES[activity] || 5;
  return Math.round(met * weightKg * (minutes/60));
}
