
let _mobilenetModel = null;
let _modelLoadingPromise = null;

async function loadFoodModel(){
  if(_mobilenetModel) return _mobilenetModel;
  if(!_modelLoadingPromise){
    _modelLoadingPromise = mobilenet.load({ version: 2, alpha: 1.0 }).then(m => {
      _mobilenetModel = m;
      return m;
    });
  }
  return _modelLoadingPromise;
}

// قاعدة بيانات تقديرية للسعرات لأشهر الأكلات اللي النموذج يقدر يتعرف عليها
// (تقديرات تقريبية لحصة نموذجية، مش تحليل مخبري دقيق)
const FOOD_NUTRITION_DB = {
  'cheeseburger':  { nameAr:'تشيز برجر', nameEn:'Cheeseburger', kcal:540, protein:28, carbs:35, fat:31 },
  'hotdog':        { nameAr:'هوت دوج', nameEn:'Hot Dog', kcal:290, protein:12, carbs:24, fat:17 },
  'hot dog':       { nameAr:'هوت دوج', nameEn:'Hot Dog', kcal:290, protein:12, carbs:24, fat:17 },
  'pizza':         { nameAr:'بيتزا', nameEn:'Pizza', kcal:285, protein:12, carbs:36, fat:10 },
  'potpie':        { nameAr:'فطيرة محشية', nameEn:'Pot Pie', kcal:450, protein:15, carbs:40, fat:25 },
  'burrito':       { nameAr:'بوريتو', nameEn:'Burrito', kcal:420, protein:16, carbs:55, fat:15 },
  'mashed potato': { nameAr:'بطاطس مهروسة', nameEn:'Mashed Potato', kcal:220, protein:4, carbs:35, fat:8 },
  'french fries':  { nameAr:'بطاطس مقلية', nameEn:'French Fries', kcal:365, protein:4, carbs:48, fat:17 },
  'consomme':      { nameAr:'شوربة', nameEn:'Soup', kcal:90, protein:6, carbs:9, fat:3 },
  'hot pot':       { nameAr:'حساء ساخن', nameEn:'Hot Pot', kcal:320, protein:22, carbs:20, fat:16 },
  'trifle':        { nameAr:'حلوى تريفل', nameEn:'Trifle', kcal:380, protein:5, carbs:52, fat:16 },
  'ice cream':     { nameAr:'آيس كريم', nameEn:'Ice Cream', kcal:270, protein:5, carbs:32, fat:14 },
  'ice lolly':     { nameAr:'آيس لولي', nameEn:'Ice Lolly', kcal:80, protein:0, carbs:20, fat:0 },
  'french loaf':   { nameAr:'خبز فرنساوي', nameEn:'French Loaf', kcal:270, protein:9, carbs:52, fat:2 },
  'bagel':         { nameAr:'بيجل', nameEn:'Bagel', kcal:280, protein:11, carbs:55, fat:2 },
  'pretzel':       { nameAr:'بريتزل', nameEn:'Pretzel', kcal:340, protein:8, carbs:70, fat:3 },
  'meat loaf':     { nameAr:'لحمة مفرومة مخبوزة', nameEn:'Meat Loaf', kcal:330, protein:24, carbs:12, fat:20 },
  'cucumber':      { nameAr:'خيار', nameEn:'Cucumber', kcal:16, protein:1, carbs:4, fat:0 },
  'artichoke':     { nameAr:'خرشوف', nameEn:'Artichoke', kcal:60, protein:4, carbs:13, fat:0 },
  'bell pepper':   { nameAr:'فلفل ألوان', nameEn:'Bell Pepper', kcal:30, protein:1, carbs:7, fat:0 },
  'mushroom':      { nameAr:'مشروم', nameEn:'Mushroom', kcal:22, protein:3, carbs:3, fat:0 },
  'granny smith':  { nameAr:'تفاحة', nameEn:'Apple', kcal:95, protein:0, carbs:25, fat:0 },
  'strawberry':    { nameAr:'فراولة', nameEn:'Strawberry', kcal:50, protein:1, carbs:12, fat:0 },
  'orange':        { nameAr:'برتقالة', nameEn:'Orange', kcal:62, protein:1, carbs:15, fat:0 },
  'lemon':         { nameAr:'ليمونة', nameEn:'Lemon', kcal:17, protein:0, carbs:5, fat:0 },
  'fig':           { nameAr:'تين', nameEn:'Fig', kcal:74, protein:1, carbs:19, fat:0 },
  'pineapple':     { nameAr:'أناناس', nameEn:'Pineapple', kcal:82, protein:1, carbs:22, fat:0 },
  'banana':        { nameAr:'موزة', nameEn:'Banana', kcal:105, protein:1, carbs:27, fat:0 },
  'jackfruit':     { nameAr:'جاك فروت', nameEn:'Jackfruit', kcal:155, protein:2, carbs:38, fat:0 },
  'custard apple': { nameAr:'قشطة', nameEn:'Custard Apple', kcal:100, protein:2, carbs:25, fat:0 },
  'pomegranate':   { nameAr:'رمان', nameEn:'Pomegranate', kcal:105, protein:2, carbs:26, fat:1 },
  'carbonara':     { nameAr:'باستا كاربونارا', nameEn:'Carbonara', kcal:520, protein:22, carbs:55, fat:24 },
  'chocolate sauce': { nameAr:'صوص شوكولاتة', nameEn:'Chocolate Sauce', kcal:150, protein:2, carbs:24, fat:5 },
  'guacamole':     { nameAr:'جواكامولي', nameEn:'Guacamole', kcal:230, protein:3, carbs:12, fat:20 },
  'corn':          { nameAr:'ذرة', nameEn:'Corn', kcal:125, protein:4, carbs:27, fat:1 },
  'head cabbage':  { nameAr:'كرنب', nameEn:'Cabbage', kcal:22, protein:1, carbs:5, fat:0 },
  'broccoli':      { nameAr:'بروكلي', nameEn:'Broccoli', kcal:35, protein:3, carbs:7, fat:0 },
  'cauliflower':   { nameAr:'قرنبيط', nameEn:'Cauliflower', kcal:27, protein:2, carbs:5, fat:0 },
  'zucchini':      { nameAr:'كوسة', nameEn:'Zucchini', kcal:20, protein:1, carbs:4, fat:0 },
  'espresso':      { nameAr:'إسبريسو', nameEn:'Espresso', kcal:5, protein:0, carbs:1, fat:0 },
  'eggnog':        { nameAr:'إيج نوج', nameEn:'Eggnog', kcal:220, protein:6, carbs:20, fat:12 },
  'dough':         { nameAr:'عجينة', nameEn:'Dough', kcal:280, protein:8, carbs:52, fat:4 },
};

function matchFoodLabel(className){
  const lower = className.toLowerCase();
  const keys = Object.keys(FOOD_NUTRITION_DB).sort((a,b)=>b.length-a.length);
  for(const key of keys){
    if(lower.includes(key)) return FOOD_NUTRITION_DB[key];
  }
  return null;
}

/**
 * يحلل عنصر <img> محمّل بالفعل في الصفحة ويرجع بيانات غذائية تقديرية.
 * @param {HTMLImageElement} imgEl
 * @param {'ar'|'en'} lang
 */
async function analyzeFoodImage(imgEl, lang){
  const model = await loadFoodModel();
  const predictions = await model.classify(imgEl, 8);

  let match = null, usedPrediction = null;
  for(const p of predictions){
    const found = matchFoodLabel(p.className);
    if(found){ match = found; usedPrediction = p; break; }
  }

  if(!match){
    const err = new Error('NOT_FOOD_RECOGNIZED');
    err.topGuess = predictions[0]?.className || '';
    throw err;
  }

  const calories = match.kcal;
  const warnings = [];
  if(calories > 450) warnings.push('high_calorie');
  if(match.carbs > 45) warnings.push('high_sugar');
  if(match.fat > 20) warnings.push('high_satfat');

  return {
    name: lang === 'ar' ? match.nameAr : match.nameEn,
    calories, protein: match.protein, carbs: match.carbs, fat: match.fat,
    confidence: Math.round(usedPrediction.probability * 100),
    warnings,
  };
}
