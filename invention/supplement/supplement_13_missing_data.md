# ضمیمه 13: مدیریت داده ناقص/ناموجود

## 1. سیاست مدیریت

### الف) ویژگی‌های Required (اجباری):

#### فهرست ویژگی‌های اجباری:
- `pat-age`: سن (الزامی)
- `pat-name`: نام (الزامی)
- `pat-gender`: جنسیت (الزامی - یکی از `pat-male` یا `pat-female`)
- `pat-images`: تصاویر پانورامیک (الزامی)

#### اعتبارسنجی:
```typescript
function validateRequired(symptoms: ISymptom[]): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const required = ["pat-age", "pat-name", "pat-gender", "pat-images"];
  
  required.forEach(sid => {
    const symptom = symptoms.find(s => s.id === sid);
    if (!symptom || !symptom.value) {
      errors.push({
        field: sid,
        message: `${getSymptomName(sid)} الزامی است`
      });
    }
  });
  
  return errors;
}
```

### ب) ویژگی‌های Optional (اختیاری):

#### رفتار سیستم:
- در صورت عدم وجود → استفاده از مقدار پیش‌فرض
- مقدار پیش‌فرض: `epsilon` (0.01) برای محاسبات

```typescript
function getSymptomValue(symptom: ISymptom | undefined): number {
  if (!symptom || !symptom.value) {
    return epsilon;  // مقدار پیش‌فرض
  }
  return getRate(symptom.value);
}
```

## 2. وابستگی بین ویژگی‌ها

### الف) درخت تصمیم UI:

#### ساختار سلسله‌مراتبی:
```typescript
{
  id: "soft-tissue",
  name: "Soft Tissue Lesion",
  options: ["consistency", "appearance"]
}

{
  id: "consistency",
  name: "Consistency",
  options: ["soft", "rubbery", "firm", "bony-hard"]
}
```

#### منطق فعال‌سازی:
- ویژگی‌های فرزند تنها در صورت انتخاب والد فعال می‌شوند
- مثال: `consistency` تنها در صورت انتخاب `soft-tissue` نمایش داده می‌شود

```typescript
function isSymptomVisible(symptom: ISymptom, symptoms: ISymptom[]): boolean {
  const parent = getParent(symptom);
  if (!parent) return true;
  
  const parentSymptom = symptoms.find(s => s.id === parent.id);
  return parentSymptom?.value === true;
}
```

### ب) نقض استقلال:

#### مشکل:
- Naive Bayes فرض استقلال ویژگی‌ها را دارد
- در عمل، ویژگی‌ها وابسته هستند

#### راه‌حل:
- استفاده از **Conditional Probabilities** در ماتریس دانش
- تعریف روابط وابستگی به صورت صریح

```typescript
// مثال: وابستگی بین location و side
{
  sid: "mandible",
  ranges: [
    { a: 9, b: 12, rate: 0.36 },  // با unilateral-left
    { a: 4, b: 12, rate: 0.24 }   // با unilateral-right
  ]
}
```

## 3. کالیبراسیون

### الف) مقایسه دو ستون:

#### Pattern Match vs Prevalence Match:
- مقایسه نتایج دو ستون برای اعتبارسنجی
- در صورت تفاوت زیاد → بررسی مجدد داده‌ها

```typescript
function calibrateResults(patternResults: IDiseaseScored[], prevalenceResults: IDiseaseScored[]): CalibrationResult {
  const differences = patternResults.map((p, i) => ({
    disease: p.name,
    pattern: p.value,
    prevalence: prevalenceResults[i].pvalue,
    difference: Math.abs(p.value - prevalenceResults[i].pvalue)
  }));
  
  return {
    averageDifference: differences.reduce((a, b) => a + b.difference, 0) / differences.length,
    maxDifference: Math.max(...differences.map(d => d.difference)),
    differences
  };
}
```

### ب) Test Cases:

#### استفاده از Case Studies شناخته شده:
- مقایسه نتایج سیستم با تشخیص متخصصان
- تنظیم پارامترها در صورت نیاز

```typescript
const testCases = [
  {
    input: { /* ... */ },
    expected: {
      pattern: "Dentigerous Cyst",
      prevalence: "Dentigerous Cyst"
    },
    actual: getScores({ diseases, symptoms: testInput })
  }
];
```

## 4. مقایسه‌پذیری بین دو ستون

### الف) تفسیر نتایج:

#### Pattern Match:
- بدون در نظر گیری شیوع
- شناسایی بیماری‌های نادر با علائم دقیق
- مفید برای موارد غیرمعمول

#### Prevalence Match:
- با در نظر گیری شیوع
- شناسایی بیماری‌های شایع‌تر
- مفید برای موارد معمول

### ب) استراتژی تصمیم‌گیری:

```typescript
function interpretResults(pattern: IDiseaseScored[], prevalence: IDiseaseScored[]): Interpretation {
  const patternTop = pattern[0];
  const prevalenceTop = prevalence[0];
  
  if (patternTop.id === prevalenceTop.id) {
    return {
      confidence: "high",
      diagnosis: patternTop.name,
      reasoning: "Both methods agree"
    };
  }
  
  if (patternTop.value > 0.5 && prevalenceTop.pvalue > 0.3) {
    return {
      confidence: "medium",
      diagnosis: patternTop.name,
      reasoning: "Pattern match suggests rare disease, but prevalence suggests common one"
    };
  }
  
  return {
    confidence: "low",
    diagnosis: "Further investigation needed",
    reasoning: "Significant disagreement between methods"
  };
}
```

## 5. مدیریت داده ناقص در محاسبات

### الف) Missing Values:

```typescript
function handleMissingValue(factor: IDiseaseFactor, symptoms: ISymptom[]): number {
  const symptom = symptoms.find(s => s.id === factor.sid);
  
  if (!symptom || symptom.value === undefined || symptom.value === null) {
    // مقدار ناقص → استفاده از epsilon
    return epsilon;
  }
  
  return getSymptomProbability(factor, symptoms);
}
```

### ب) Partial Data:

```typescript
// اگر فقط بخشی از داده‌ها موجود باشد
function calculateWithPartialData(symptoms: ISymptom[], diseases: IDisease[]): IDiseaseScored[] {
  // محاسبه با داده‌های موجود
  // ویژگی‌های ناقص با epsilon جایگزین می‌شوند
  
  return diseases.map(disease => {
    const factors = disease.factors.map(factor => 
      handleMissingValue(factor, symptoms)
    );
    
    const likelihood = factors.reduce((a, b) => a * b, 1);
    const probability = (disease.preval * likelihood) / total;
    
    return { ...disease, value: probability };
  });
}
```

## 6. UI/UX برای داده ناقص

### الف) نمایش هشدار:

```typescript
function showMissingDataWarning(errors: ValidationError[]) {
  return (
    <Alert severity="warning">
      <AlertTitle>داده‌های ناقص</AlertTitle>
      <ul>
        {errors.map(error => (
          <li key={error.field}>
            {error.message}
          </li>
        ))}
      </ul>
    </Alert>
  );
}
```

### ب) لینک به فیلد ناقص:

```typescript
function linkToMissingField(fieldId: string) {
  // اسکرول به فیلد و highlight کردن
  const element = document.getElementById(fieldId);
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  element?.focus();
}
```

## 7. مثال عملی

### ورودی ناقص:
```json
{
  "pat_age": 32,
  "pat_female": true
  // سایر فیلدها ناقص هستند
}
```

### پردازش:
```typescript
// فیلدهای ناقص با epsilon جایگزین می‌شوند
const processedSymptoms = [
  { id: "pat-age", value: 32 },
  { id: "pat-female", value: true },
  { id: "pain-0", value: epsilon },      // ناقص
  { id: "swelling", value: epsilon },    // ناقص
  // ...
];

// محاسبه با داده‌های موجود
const results = getScores({ diseases, symptoms: processedSymptoms });
```

### خروجی:
- نتایج با اطمینان پایین‌تر
- هشدار به کاربر برای تکمیل داده‌ها
- پیشنهاد فیلدهای مهم برای پر کردن

## 8. محل پیاده‌سازی

- **اعتبارسنجی**: `src/lib/symptoms.ts`
- **مدیریت ناقص**: `src/lib/scores.ts`
- **UI**: `src/components/`
- **درخت تصمیم**: `src/data/symptoms.ts`

