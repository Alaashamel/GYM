/* ============================================
   IRON FORGE GYM — Mock Auth (localStorage only)
   ملاحظة: ده نظام وهمي بالكامل لأغراض العرض، مفيش تشفير
   حقيقي ولا سيرفر يتحقق من البيانات. لمشروع حقيقي لازم Backend.
   ============================================ */

const USERS_KEY = 'if_users';
const SESSION_KEY = 'if_session';

function getUsers(){
  try{ return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch(e){ return []; }
}

function registerUser({ name, email, password, goal }){
  const users = getUsers();
  if(users.find(u => u.email === email)) return { ok:false, error:'EMAIL_EXISTS' };
  const user = { id: Date.now(), name, email, password, goal: goal || 'general', plan: 'basic', joined: new Date().toISOString().slice(0,10) };
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
  return { ok:true, user };
}

function loginUser(email, password){
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if(!user) return { ok:false, error:'INVALID_CREDENTIALS' };
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
  return { ok:true, user };
}

function logoutUser(){ localStorage.removeItem(SESSION_KEY); }

function getCurrentUser(){
  try{
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if(!session) return null;
    return getUsers().find(u => u.email === session.email) || null;
  }catch(e){ return null; }
}
