# ضمیمه 7: فاکتور اثر - تعریف و محاسبه

## 1. تعریف فاکتور اثر

فاکتور اثر (Effect Factor) به صورت **احتمال شرطی P(Feature|Disease)** تعریف می‌شود:

```
P(Feature|Disease) = احتمال مشاهده یک ویژگی خاص در صورت وجود بیماری خاص
```

## 2. ساختار داده

فاکتور اثر در فایل `src/data/diseases.ts` به صورت زیر تعریف می‌شود:

```typescript
interface IDiseaseFactor {
  sid: string;           // شناسه ویژگی
  rate?: number;         // نرخ ثابت (برای Boolean)
  ranges?: IRange[];     // بازه‌ها (برای Number/Range)
}

interface IRange {
  a: number;            // شروع بازه
  b: number;            // پایان بازه
  rate: number;         // نرخ برای این بازه
}
```

## 3. انواع محاسبه

### الف) ویژگی‌های Boolean:
```typescript
{
  sid: "pain-0",
  rate: 0.7  // مقدار ثابت
}
```
- اگر ویژگی true باشد → استفاده از `rate`
- اگر ویژگی false باشد → استفاده از `epsilon` (0.01)

### ب) ویژگی‌های Number:
```typescript
{
  sid: "pat-age",
  ranges: [
    { a: 20, b: 60, rate: 0.75 },
    { a: 15, b: 75, rate: 0.5 },
    { a: 0, b: 100, rate: 0.25 }
  ]
}
```
- تطابق مقدار ورودی با بازه‌ها
- استفاده از `rate` مربوط به اولین بازه تطبیق‌یافته

### ج) ویژگی‌های Range:
```typescript
{
  sid: "mandible",
  ranges: [
    { a: 9, b: 12, rate: 0.36 },
    { a: 4, b: 12, rate: 0.24 },
    { a: 3, b: 12, rate: 0.12 }
  ]
}
```
- تطابق بازه ورودی `{a, b}` با بازه‌های تعریف شده
- شرط: `input.a >= range.a && input.b <= range.b`

## 4. نرمال‌سازی

### تبدیل مقادیر منفی:
```typescript
const epsilon = 0.01;

function getRate(rate: number): number {
  return rate === -1 ? epsilon : rate;
}
```

### منطق:
- مقادیر منفی (-1) → تبدیل به `epsilon` (0.01) برای Laplace Smoothing
- مقادیر مثبت → نگاشت مستقیم به بازه [0.001, 1]
- مقادیر صفر → تبدیل به `epsilon`

## 5. منبع داده

### منابع علمی:
1. **Wood NK, Goaz PW. Differential diagnosis of oral and maxillofacial lesions** (ویرایش 5)
2. **White SC, Pharoah MJ. White and Pharoah's oral radiology** (ویرایش 8)

### فرآیند کمی‌سازی:
1. استخراج اطلاعات از منابع علمی
2. تبدیل توصیفات کیفی به مقادیر کمی
3. نرمال‌سازی به بازه [0.001, 1]
4. ذخیره در ماتریس دانش (`diseases.ts`)

## 6. مثال محاسبه

### برای بیماری "Radicular Cyst":

```typescript
{
  id: "radicular",
  name: "Radicular Cyst",
  preval: 0.25,
  factors: [
    { sid: "pat-age", ranges: [{a: 20, b: 60, rate: 0.75}] },
    { sid: "pat-male", rate: 0.55 },
    { sid: "pat-female", rate: 0.45 },
    { sid: "pain-0", rate: 0.05 },
    { sid: "swelling", rate: 0.25 },
    { sid: "slow-0", rate: 0.95 },
    { sid: "nonvital", rate: 1.0 },
    { sid: "corticated", rate: 0.85 }
  ]
}
```

### محاسبه برای بیمار 32 ساله زن:
- `pat-age = 32`: تطابق با range [20-60] → rate = 0.75
- `pat-female = true`: rate = 0.45
- `pain-0 = false`: rate = epsilon = 0.01
- `swelling = true`: rate = 0.25
- `slow-0 = true`: rate = 0.95
- `nonvital = true`: rate = 1.0
- `corticated = true`: rate = 0.85

## 7. وزن ثابت vs تابع

### وزن ثابت:
- برای ویژگی‌های Boolean: `rate` ثابت
- مثال: `pain-0` → همیشه 0.7 (برای بیماری خاص)

### تابع (بازه‌ای):
- برای ویژگی‌های Number/Range: تابع بازه‌ای
- مثال: `pat-age` → تابعی از سن با نرخ‌های مختلف

### احتمال شرطی:
- در هر دو حالت، نتیجه به صورت احتمال شرطی P(Feature|Disease) است
- تفاوت در نحوه محاسبه: ثابت vs بازه‌ای

## 8. فرمول نگاشت

### برای Boolean:
```
P(S|D) = rate  (اگر S = true)
P(S|D) = epsilon  (اگر S = false)
```

### برای Number:
```
P(S|D) = rate_i  (اگر S در range_i قرار گیرد)
P(S|D) = epsilon  (اگر S در هیچ range قرار نگیرد)
```

### برای Range:
```
P(S|D) = rate_i  (اگر S.a >= range_i.a && S.b <= range_i.b)
P(S|D) = epsilon  (اگر هیچ تطابقی وجود نداشته باشد)
```

## 9. کد پیاده‌سازی

```typescript
const getSymptomProbability = (factor: IDiseaseFactor, symptoms: ISymptom[]) => {
  for (const symptom of symptoms) {
    if (symptom.id === factor.sid) {
      switch (symptom.type) {
        case SymptomType.Range:
          if (!factor.ranges) return 1;
          for (const range of factor.ranges) {
            if (symptom.value.a >= range.a && symptom.value.b <= range.b) {
              return getRate(range.rate);
            }
          }
          return epsilon;
          
        case SymptomType.Number:
          if (!factor.ranges) return 1;
          for (const range of factor.ranges) {
            if (symptom.value >= range.a && symptom.value <= range.b) {
              return getRate(range.rate);
            }
          }
          return epsilon;
          
        default:
          if (symptom.value) return getRate(factor.rate!);
          return epsilon;
      }
    }
  }
  return 1;
};
```

## 10. محل تعریف

- **فایل**: `src/data/diseases.ts`
- **نوع داده**: `IDiseaseFactor`
- **محاسبه**: `src/lib/scores.ts`
- **مقدار epsilon**: `src/lib/scores.ts` (0.01)

