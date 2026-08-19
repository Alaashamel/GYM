/* ============================================
   IRON FORGE GYM — Favorites (مفضلة التمارين)
   ميزة موحّدة عبر الموقع كله: حفظ التمارين المفضلة
   في localStorage، مربوطة بحساب المستخدم لو مسجل دخول،
   وبتترجع Guest bucket لو لسه مسجلش.
   ============================================ */

const FAV_KEY = 'if_favorites';

function _favBucketKey(){
  try{
    const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    return user ? `user:${user.email}` : 'guest';
  }catch(e){ return 'guest'; }
}

function getAllFavorites(){
  try{ return JSON.parse(localStorage.getItem(FAV_KEY)) || {}; }
  catch(e){ return {}; }
}

function getFavorites(){
  const all = getAllFavorites();
  return all[_favBucketKey()] || [];
}

function isFavorite(exerciseId){
  return getFavorites().includes(exerciseId);
}

function toggleFavorite(exerciseId){
  const all = getAllFavorites();
  const key = _favBucketKey();
  const list = all[key] || [];
  const idx = list.indexOf(exerciseId);
  if(idx > -1){ list.splice(idx, 1); } else { list.push(exerciseId); }
  all[key] = list;
  localStorage.setItem(FAV_KEY, JSON.stringify(all));
  document.dispatchEvent(new CustomEvent('if:favoriteschange', { detail: { favorites: list } }));
  return list.includes(exerciseId);
}

function getFavoriteCount(){
  return getFavorites().length;
}

/* لو المستخدم سجّل دخول لأول مرة وكان عنده مفضلة كـ Guest، ندمجها في حسابه */
function migrateGuestFavorites(){
  try{
    const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    if(!user) return;
    const all = getAllFavorites();
    const guestList = all['guest'] || [];
    if(!guestList.length) return;
    const userKey = `user:${user.email}`;
    const merged = Array.from(new Set([...(all[userKey] || []), ...guestList]));
    all[userKey] = merged;
    all['guest'] = [];
    localStorage.setItem(FAV_KEY, JSON.stringify(all));
  }catch(e){ /* silent */ }
}
