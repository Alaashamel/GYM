/* ============================================
   IRON FORGE GYM — Challenges & Streaks
   ============================================ */

const CHALLENGES_KEY = 'if_challenges';

const CHALLENGE_LIST = [
  { id:'plank-30', ar:'تحدي البلانك 30 يوم', en:'30-Day Plank Challenge', days:30, icon:'🧘' },
  { id:'water-14', ar:'شرب مياه كافية 14 يوم', en:'14-Day Hydration Challenge', days:14, icon:'💧' },
  { id:'steps-21', ar:'10000 خطوة يوميًا لمدة 21 يوم', en:'10K Steps for 21 Days', days:21, icon:'🚶' },
  { id:'nosugar-10', ar:'تحدي بدون سكر 10 أيام', en:'10-Day No-Sugar Challenge', days:10, icon:'🚫🍬' },
];

function getChallengeState(){
  try{ return JSON.parse(localStorage.getItem(CHALLENGES_KEY)) || {}; }
  catch(e){ return {}; }
}

function saveChallengeState(state){
  localStorage.setItem(CHALLENGES_KEY, JSON.stringify(state));
}

function joinChallenge(id){
  const state = getChallengeState();
  if(!state[id]) state[id] = { joined: new Date().toISOString().slice(0,10), checks: [] };
  saveChallengeState(state);
  return state;
}

function checkInToday(id){
  const state = getChallengeState();
  if(!state[id]) joinChallenge(id);
  const today = new Date().toISOString().slice(0,10);
  const st = getChallengeState();
  if(!st[id].checks.includes(today)) st[id].checks.push(today);
  saveChallengeState(st);
  return st;
}

function getStreak(id){
  const state = getChallengeState();
  const ch = state[id];
  if(!ch) return 0;
  return ch.checks.length;
}
