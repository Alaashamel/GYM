# آيرون فورج (Iron Forge) — موقع جيم متكامل

موقع Frontend بالكامل (HTML + CSS + JavaScript فقط، بدون أي Backend) لجيم متكامل: تمارين، برامج تدريبية، حاسبات، محلل أكل بالصور، تتبع تقدم، وصفات، وتحديات.

المؤسس: **عبدالرحمن إبراهيم سفيان**

## طريقة التشغيل
افتح `index.html` مباشرة في المتصفح، أو شغّل سيرفر محلي بسيط (مستحسن عشان بعض المتصفحات بتمنع بعض الميزات على `file://`):

```
cd gym-site
python3 -m http.server 8000
```
وبعدين افتح `http://localhost:8000` في المتصفح.

## هيكل المشروع
```
index.html              الصفحة الرئيسية
css/style.css            كل تصميم الموقع (متغيرات، مكونات، ريسبونسيف)
js/main.js                النافبار، الفوتر، اللغة، الوضع الليلي/النهاري
js/data.js                 قاعدة بيانات التمارين، البرامج، المدربين، الخطط، الجدول، الوصفات، الأسئلة الشائعة
js/calculators.js       منطق حاسبات BMI, TDEE, 1RM, السعرات المحروقة
js/progress.js            تتبع التقدم (localStorage) + الرسم البياني
js/food-analyzer.js    محلل صورة الأكل (يحتاج API Key — التفاصيل تحت)
js/auth.js                  تسجيل دخول وهمي (localStorage فقط)
js/timer.js                 مؤقت الراحة بين المجموعات
js/challenges.js         نظام التحديات والستريك
pages/*.html              كل صفحات الموقع الفرعية
```

## ⚠️ إعداد ميزة محلل الأكل بالصورة (مهم)
الميزة دي بتتصل بـ API خارجي حقيقي (LogMeal) لتحليل صور الطعام. عشان تشتغل:

1. سجّل حساب مجاني على https://logmeal.com/api/
2. هتلاقي الـ API Token في لوحة التحكم بتاعتك
3. افتح ملف `js/food-analyzer.js`
4. استبدل السطر:
   ```js
   const FOOD_API_KEY = "ضع_مفتاحك_هنا";
   ```
   بمفتاحك الحقيقي.

**تنبيه أمان:** بما إن الموقع Frontend بالكامل من غير سيرفر، مفتاح الـ API هيكون ظاهر في كود الجافاسكريبت اللي بيوصل للمتصفح (أي حد يقدر يشوفه من Developer Tools). ده مقبول للاستخدام الشخصي أو التجريبي، لكنه مش آمن لمشروع تجاري بيتعرض لعدد كبير من المستخدمين. لو حبيت تطور المشروع لاحقًا، الأفضل تعمل سيرفر بسيط (حتى Serverless Function زي Cloudflare Worker) يستقبل الصورة ويبعتها هو لـ API بمفتاح مخبّى في السيرفر.

## ملاحظات عامة
- كل البيانات الشخصية (تسجيل دخول، تقدم، تحديات) بتتحفظ محليًا في متصفح المستخدم عن طريق `localStorage`، مفيش قاعدة بيانات حقيقية.
- تسجيل الدخول نظام وهمي بالكامل لأغراض العرض (مفيش تشفير حقيقي لكلمة المرور)، مش مناسب لمشروع حقيقي بدون Backend وتشفير صحيح.
- الموقع يدعم العربية (RTL) والإنجليزية (LTR) بالكامل، والوضع الليلي/النهاري، وهو Responsive بالكامل مع أولوية لشاشات الموبايل.

## Exercise Motion Visuals

The exercise library now uses a lightweight, offline-friendly **Motion Lab** visual system instead of broken GIF placeholders or YouTube embeds.

- 17 exercise-specific animated SVG scenes
- No external video host or API required
- Works directly from the local project
- Responsive 16:9 media cards
- Motion pauses automatically for users who prefer reduced motion
- Arabic/English labels remain integrated with the existing language switcher

Open `pages/exercises.html` to preview the updated exercise library.
