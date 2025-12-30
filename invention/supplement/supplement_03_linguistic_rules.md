# ضمیمه 3: قواعد استخراج زبانی

## 1. مدیریت نفی (Negation)

### الگوهای نفی در فارسی:
- "ندارد"
- "وجود ندارد"
- "منفی است"
- "غیر موجود"
- "فاقد"

### الگوهای نفی در انگلیسی:
- "no"
- "not present"
- "absent"
- "lack of"
- "without"

### منطق پردازش:
```javascript
if (text.contains(negation_patterns)) {
  feature_value = false;
  // یا از خروجی حذف می‌شود (Positive-Only Strategy)
}
```

### مثال:
- ورودی: "بیمار درد ندارد"
- خروجی: `pain_0` از خروجی حذف می‌شود (نه `pain_0: false`)

## 2. عدم قطعیت (Uncertainty)

### الگوهای عدم قطعیت در فارسی:
- "مشکوک به"
- "احتمالاً"
- "ممکن است"
- "به نظر می‌رسد"
- "احتمال وجود دارد"

### الگوهای عدم قطعیت در انگلیسی:
- "suspicious"
- "possibly"
- "may be"
- "suggestive of"
- "could be"

### منطق پردازش:
```javascript
if (text.contains(uncertainty_patterns)) {
  confidence_score = 0.5; // کاهش اطمینان
  feature_value = true; // اما همچنان استخراج می‌شود
}
```

### مثال:
- ورودی: "مشکوک به تورم"
- خروجی: `swelling: true` با `confidence: 0.6`

## 3. زمانمندی (Temporality)

### الگوهای زمانمندی:

#### کند (Slow - ماه‌ها تا سال‌ها):
- فارسی: "از X ماه/سال قبل", "طی چند ماه", "به تدریج"
- انگلیسی: "gradually increased in X years", "over months", "slowly"

#### متوسط (Moderate - هفته‌ها):
- فارسی: "طی چند هفته", "از X هفته قبل"
- انگلیسی: "over weeks", "for X weeks"

#### سریع (Rapid - روزها):
- فارسی: "طی چند روز", "ناگهانی", "سریع"
- انگلیسی: "rapidly", "over days", "sudden"

### نگاشت:
```javascript
if (text.contains("gradually") || text.contains("months to years")) {
  slow_0 = true;
  moderate_0 = false;
  rapid_0 = false;
}
```

### مثال:
- ورودی: "gradually increased in 2years"
- خروجی: `slow_0: true`

## 4. شدت/مقیاس (Intensity/Scale)

### الگوهای شدت:

#### خفیف (Mild):
- فارسی: "خفیف", "کم"
- انگلیسی: "mild", "slight", "minimal"

#### متوسط (Moderate):
- فارسی: "متوسط", "معمولی"
- انگلیسی: "moderate", "average"

#### شدید (Severe):
- فارسی: "شدید", "زیاد"
- انگلیسی: "severe", "intense", "marked"

### نگاشت به مقادیر عددی:
```javascript
intensity_map = {
  "mild": 0.3,
  "moderate": 0.6,
  "severe": 0.9
};
```

## 5. مترادفها و املای متغیر

### دیکشنری مترادف برای ویژگی‌های کلیدی:

#### درد (Pain):
- فارسی: درد، سوزش، ناراحتی
- انگلیسی: pain, ache, discomfort, tenderness

#### تورم (Swelling):
- فارسی: تورم، برآمدگی، ورم
- انگلیسی: swelling, enlargement, expansion, bulge

#### رادیولوسنت (Radiolucent):
- انگلیسی: radiolucent, radio-lucent, radio lucent, lucent

### نرمال‌سازی:
```javascript
function normalize(text) {
  // تبدیل به lowercase
  text = text.toLowerCase();
  
  // حذف فاصله‌های اضافی
  text = text.replace(/\s+/g, ' ');
  
  // جایگزینی مترادف‌ها
  synonyms.forEach(synonym => {
    text = text.replace(synonym.variants, synonym.standard);
  });
  
  return text;
}
```

## 6. واژگان تخصصی دهان و رادیولوژی

### واژه‌نامه تخصصی:

#### اصطلاحات رادیولوژیک:
- **Corticated**: مرز کورتیکال، حاشیه مشخص
- **Radiolucent**: رادیولوسنت، تیره در تصویر
- **Radiopaque**: رادیواپک، روشن در تصویر
- **Mixed**: ترکیبی، مخلوط
- **Pericoronal**: پری‌کورونال، اطراف تاج
- **Odontogenic**: ادونتوژنیک، مرتبط با دندان
- **Non-odontogenic**: غیر ادونتوژنیک

#### اصطلاحات بالینی:
- **Bony-hard**: سخت استخوانی
- **Rubbery**: لاستیکی
- **Firm**: محکم
- **Soft**: نرم
- **Trismus**: تریسموس، محدودیت باز شدن دهان

### نگاشت خودکار:
```javascript
const terminology_map = {
  "corticated": "corticated",
  "well-defined": "corticated",
  "مرز مشخص": "corticated",
  "radiolucent": "radiolucent",
  "lucent": "radiolucent",
  "رادیولوسنت": "radiolucent"
};
```

## 7. پردازش چندزبانه

### تشخیص زبان:
```javascript
function detectLanguage(text) {
  const persianPattern = /[\u0600-\u06FF]/;
  return persianPattern.test(text) ? 'fa' : 'en';
}
```

### پردازش:
- سیستم هر دو زبان فارسی و انگلیسی را پشتیبانی می‌کند
- نگاشت خودکار به شناسه‌های استاندارد (SId) انجام می‌شود
- مترادف‌ها در هر دو زبان تعریف شده‌اند

## 8. مثال کامل پردازش

### ورودی:
```
بیمار 24 ساله زن با گزارش تورم یا درد که به تدریج طی 2 سال افزایش یافته است. ضایعه در لمس سخت استخوانی بود. یافته‌های پانورامیک نشان‌دهنده ضایعه یک‌طرفه، منفرد، مخلوط رادیولوسنت و رادیواپک غیر ادونتوژنیک با مرز نامنظم و نامشخص است.
```

### مراحل پردازش:
1. تشخیص زبان: فارسی
2. استخراج سن: 24 → `pat_age: 24`
3. استخراج جنسیت: زن → `pat_female: true`
4. استخراج شکایت: تورم، درد → `swelling: true`, `pain_0: true`
5. استخراج زمانمندی: "به تدریج طی 2 سال" → `slow_0: true`
6. استخراج قوام: "سخت استخوانی" → `bony_hard: true`
7. استخراج یافته‌های رادیولوژیک: "یک‌طرفه، منفرد، مخلوط" → `unilateral_right: true`, `solitary: true`, `mixed: true`
8. استخراج مرز: "نامنظم و نامشخص" → `irregular: true`, `blending: true`

### خروجی نهایی:
```json
{
  "pat_age": 24,
  "pat_female": true,
  "swelling": true,
  "pain_0": true,
  "slow_0": true,
  "bony_hard": true,
  "unilateral_right": true,
  "solitary": true,
  "mixed": true,
  "irregular": true,
  "blending": true
}
```

