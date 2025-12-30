# ضمیمه 10: فرمول اجرایی دقیق

## 1. فرمول Naive Bayes

فرمول اصلی Naive Bayes با جمع لاگ احتمالات:

```
P(Di|S) = [P(Di) × ∏j P(Sj|Di)] / [Σi P(Di) × ∏j P(Sj|Di)]
```

### نمادها:
- **P(Di)**: احتمال پیشین بیماری i
- **P(Sj|Di)**: احتمال شرطی ویژگی j در صورت وجود بیماری i
- **∏j**: حاصل‌ضرب احتمالات تمام ویژگی‌های مشاهده شده
- **Σi**: جمع احتمالات برای تمام بیماری‌ها

## 2. Laplace Smoothing

برای جلوگیری از صفر شدن احتمالات، از Laplace Smoothing استفاده می‌شود:

```
P(Sj|Di) = (count(Sj, Di) + ε) / (count(Di) + ε × |S|)
```

### پارامترها:
- **ε (epsilon)**: مقدار smoothing = 0.01
- **|S|**: تعداد کل ویژگی‌ها = 93

### در کد:
```typescript
export const epsilon = 0.01; // NOTICE: lower number may cause NaN issue

const getRate = (rate: number) => (rate === -1 ? epsilon : rate);
```

## 3. محاسبه در دو مسیر

### الف) Pattern Match (تطابق الگو):

```
P(Di) = 1/N  (توزیع یکنواخت)
```

که در آن N = تعداد کل بیماری‌ها (19)

```typescript
const getDiseaseProbability = (disease: IDisease, symptoms: ISymptom[]): number => {
  // P(Di) = 1/19 (uniform)
  const prior = 1 / diseases.length;
  
  // ∏j P(Sj|Di)
  const likelihood = disease.factors.reduce((v, factor) => 
    v * getSymptomProbability(factor, symptoms) * FIX_FRAC, 
    1
  );
  
  return prior * likelihood;
};
```

### ب) Prevalence Match (تطابق شیوع):

```
P(Di) = prevalence_rate  (از ماتریس دانش)
```

```typescript
const getDiseaseProbability_Prevalence = (disease: IDisease, symptoms: ISymptom[]): number => {
  // P(Di) = prevalence from database
  const prior = disease.preval;
  
  // ∏j P(Sj|Di)
  const likelihood = disease.factors.reduce((v, factor) => 
    v * getSymptomProbability(factor, symptoms) * FIX_FRAC, 
    1
  );
  
  return prior * likelihood;
};
```

## 4. محاسبه نهایی

### Pattern Match:
```typescript
const nominators: number[] = diseases.map(disease => 
  getDiseaseProbability_FIX_FRAC(disease, symptoms)
);
const denominator = nominators.reduce((a, b) => calc(a + b), 0);

const probabilities = diseases.map((disease, i) => ({
  ...disease,
  value: calc(nominators[i] / denominator)  // P(Di|S) برای Pattern Match
}));
```

### Prevalence Match:
```typescript
const pnominators: number[] = diseases.map(disease =>
  calc(disease.preval * getDiseaseProbability_FIX_FRAC(disease, symptoms))
);
const pdenominator = pnominators.reduce((a, b) => calc(a + b), 0);

const probabilities = diseases.map((disease, i) => ({
  ...disease,
  pvalue: calc(pnominators[i] / pdenominator)  // P(Di|S) برای Prevalence Match
}));
```

## 5. FIX_FRAC

برای جلوگیری از اعداد خیلی کوچک:

```typescript
const FIX_FRAC = 100;

const getDiseaseProbability_FIX_FRAC = (disease: IDisease, symptoms: ISymptom[]): number =>
  getDiseaseProbability(disease, symptoms) * FIX_FRAC;
```

## 6. تابع calc

برای محاسبات دقیق و جلوگیری از خطاهای floating point:

```typescript
function calc(value: number): number {
  // استفاده از کتابخانه‌ای برای محاسبات دقیق
  // یا گرد کردن به تعداد اعشار مشخص
  return Math.round(value * 10000) / 10000;
}
```

## 7. جایگاه ε در محاسبه

### الف) در getRate:
```typescript
const getRate = (rate: number) => (rate === -1 ? epsilon : rate);
```

- اگر `rate = -1` (غیرفعال) → تبدیل به `epsilon`
- در غیر این صورت → استفاده از `rate` اصلی

### ب) در getSymptomProbability:
```typescript
const getSymptomProbability = (factor: IDiseaseFactor, symptoms: ISymptom[]) => {
  // ...
  if (symptom.value) {
    return getRate(factor.rate!);  // استفاده از epsilon برای -1
  }
  return epsilon;  // در صورت عدم وجود مقدار
};
```

### ج) جلوگیری از صفر شدن:
```typescript
// بدون epsilon: اگر یک ویژگی false باشد → کل صورت کسر صفر می‌شود
// با epsilon: حتی اگر ویژگی false باشد → مقدار epsilon استفاده می‌شود
```

## 8. مثال محاسبه کامل

### ورودی:
```typescript
const symptoms = [
  { id: "pat-age", value: 32, type: SymptomType.Number },
  { id: "pat-female", value: true, type: SymptomType.Boolean },
  { id: "corticated", value: true, type: SymptomType.Boolean },
  { id: "mandible", value: { a: 4, b: 5 }, type: SymptomType.Range }
];
```

### برای بیماری "Dentigerous Cyst":

#### محاسبه Pattern Match:

1. **P(D) = 1/19 = 0.0526**

2. **محاسبه ∏j P(Sj|Di)**:
   - P(pat-age=32|D): تطابق با range [20-60] → rate = 0.75
   - P(pat-female|D): rate = 0.45
   - P(corticated|D): rate = 0.85
   - P(mandible={4,5}|D): تطابق با range [3-12] → rate = 0.12

3. **صورت کسر**:
   ```
   = 0.0526 × 0.75 × 0.45 × 0.85 × 0.12 × 100
   = 0.0526 × 0.034425 × 100
   = 0.1811
   ```

4. **محاسبه برای تمام بیماری‌ها و جمع‌بندی**:
   ```
   denominator = Σi (صورت کسر برای تمام بیماری‌ها)
   ```

5. **احتمال نهایی**:
   ```
   P(Dentigerous Cyst|S) = 0.1811 / denominator
   ```

#### محاسبه Prevalence Match:

1. **P(D) = 0.15** (prevalence از ماتریس دانش)

2. **صورت کسر**:
   ```
   = 0.15 × 0.75 × 0.45 × 0.85 × 0.12 × 100
   = 0.15 × 0.034425 × 100
   = 0.5164
   ```

3. **احتمال نهایی**:
   ```
   P(Dentigerous Cyst|S) = 0.5164 / pdenominator
   ```

## 9. کد کامل

```typescript
export const epsilon = 0.01;
const FIX_FRAC = 100;

const getRate = (rate: number) => (rate === -1 ? epsilon : rate);

const getSymptomProbability = (factor: IDiseaseFactor, symptoms: ISymptom[]): number => {
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

const getDiseaseProbability = (disease: IDisease, symptoms: ISymptom[]): number => {
  const mul = disease.factors.reduce(
    (v, factor) => v * getSymptomProbability(factor, symptoms) * FIX_FRAC,
    1
  );
  return mul; // P(Di) * ∏j{P(Sj|Di)}
};

export default function getScores({ diseases, symptoms }: IProps): IDiseaseScored[] {
  // Pattern Match
  const nominators = diseases.map(disease => 
    (1 / diseases.length) * getDiseaseProbability(disease, symptoms)
  );
  const denominator = nominators.reduce((a, b) => calc(a + b), 0);
  
  // Prevalence Match
  const pnominators = diseases.map(disease =>
    calc(disease.preval * getDiseaseProbability(disease, symptoms))
  );
  const pdenominator = pnominators.reduce((a, b) => calc(a + b), 0);
  
  return diseases.map((disease, i) => ({
    ...disease,
    value: calc(nominators[i] / denominator),      // Pattern Match
    pvalue: calc(pnominators[i] / pdenominator)   // Prevalence Match
  }));
}
```

## 10. محل تعریف

- **فایل**: `src/lib/scores.ts`
- **epsilon**: خط 11 (`export const epsilon = 0.01`)
- **FIX_FRAC**: خط 65 (`const FIX_FRAC = 100`)
- **تابع اصلی**: `getScores()`

