# ضمیمه 8: برخورد با چندانتخابی‌ها و متغیرهای پیوسته

## 1. چندانتخابی‌ها (Multi-select)

### الف) در سطح UI:
- استفاده از **Checkbox Group** برای انتخاب چندگانه
- هر گزینه به صورت Boolean جداگانه ذخیره می‌شود

### ب) در سطح داده:
```typescript
// مثال: شکایت اصلی
{
  "pain-0": true,
  "swelling": true,
  "bleeding": true
  // می‌توانند همزمان true باشند
}
```

### ج) قواعد تعارض:
برخی گزینه‌ها متقابلاً انحصاری هستند:

```typescript
// فقط یکی می‌تواند true باشد
const exclusiveGroups = [
  ["radiolucent", "radiopaque", "mixed"],
  ["slow-0", "moderate-0", "rapid-0"],
  ["expand", "destruct-3", "extend"],
  ["maxilla", "mandible", "both"],
  ["uni1", "uni2"],
  ["pat-male", "pat-female"]
];
```

### د) اعتبارسنجی:
```typescript
function validateExclusive(symptoms: ISymptom[]) {
  exclusiveGroups.forEach(group => {
    const selected = group.filter(sid => 
      symptoms.find(s => s.id === sid && s.value === true)
    );
    if (selected.length > 1) {
      throw new Error(`Conflict: ${selected.join(', ')} cannot be true simultaneously`);
    }
  });
}
```

## 2. متغیرهای پیوسته (Continuous Variables)

### الف) Binning (تبدیل به بازه‌های گسسته):

#### مثال: سن
```typescript
function binAge(age: number): string {
  if (age < 20) return "young";
  if (age < 40) return "adult";
  if (age < 60) return "middle-aged";
  return "elderly";
}
```

#### در ماتریس دانش:
```typescript
{
  sid: "pat-age",
  ranges: [
    { a: 20, b: 60, rate: 0.75 },  // بازه اصلی
    { a: 15, b: 75, rate: 0.5 },   // بازه گسترده‌تر
    { a: 0, b: 100, rate: 0.25 }  // بازه کلی
  ]
}
```

### ب) Scaling (نرمال‌سازی):

#### Min-Max Scaling:
```typescript
function scaleTo01(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

// مثال: سن 0-120 → 0-1
const scaledAge = scaleTo01(age, 0, 120);
```

#### Z-Score Normalization:
```typescript
function zScore(value: number, mean: number, std: number): number {
  return (value - mean) / std;
}
```

## 3. متغیرهای Range

### الف) ساختار داده:
```typescript
interface IRange {
  a: number;  // نقطه شروع
  b: number;  // نقطه پایان
}

// مثال: موقعیت ضایعه
{
  mandible: { a: 4, b: 5 }  // دندان‌های 4 تا 5
}
```

### ب) تطابق با بازه‌های تعریف شده:
```typescript
function matchRange(input: IRange, ranges: IRange[]): number {
  for (const range of ranges) {
    // شرط: input کاملاً درون range باشد
    if (input.a >= range.a && input.b <= range.b) {
      return range.rate;
    }
  }
  return epsilon; // در صورت عدم تطابق
}
```

### ج) مثال:
```typescript
// ورودی کاربر
const userInput = { mandible: { a: 4, b: 5 } };

// بازه‌های تعریف شده
const ranges = [
  { a: 9, b: 12, rate: 0.36 },
  { a: 4, b: 12, rate: 0.24 },
  { a: 3, b: 12, rate: 0.12 }
];

// تطابق: input.a=4 >= range.a=4 && input.b=5 <= range.b=12
// نتیجه: rate = 0.24
```

## 4. پردازش در سیستم

### الف) برای Boolean (چندانتخابی):
```typescript
// UI: Checkbox Group
<CheckboxGroup
  options={["pain-0", "swelling", "bleeding"]}
  selected={selected}
  onChange={handleChange}
/>

// Data: هر گزینه به صورت جداگانه
{
  "pain-0": true,
  "swelling": true,
  "bleeding": false
}
```

### ب) برای Number (پیوسته):
```typescript
// UI: Number Input
<NumberInput
  value={age}
  min={0}
  max={120}
  onChange={handleAgeChange}
/>

// Data: مقدار عددی
{
  "pat-age": 32
}

// Processing: تطابق با ranges
const rate = matchRange(32, ageRanges);
```

### ج) برای Range:
```typescript
// UI: Range Picker (Canvas/SVG)
<RangePicker
  min={1}
  max={32}
  value={range}
  onChange={handleRangeChange}
/>

// Data: بازه
{
  "mandible": { a: 4, b: 5 }
}

// Processing: تطابق با ranges
const rate = matchRange({ a: 4, b: 5 }, mandibleRanges);
```

## 5. مثال کامل

### ورودی کاربر:
```json
{
  "pat-age": 32,
  "chief-complaint": ["pain-0", "swelling"],
  "mandible": { "a": 4, "b": 5 }
}
```

### پردازش:

#### 1. سن (Number):
```typescript
const age = 32;
const ageRanges = [
  { a: 20, b: 60, rate: 0.75 },
  { a: 15, b: 75, rate: 0.5 }
];
// تطابق: 32 در بازه [20-60] → rate = 0.75
```

#### 2. شکایت اصلی (Multi-select):
```typescript
const complaints = {
  "pain-0": true,
  "swelling": true
};
// هر دو به صورت جداگانه پردازش می‌شوند
```

#### 3. موقعیت (Range):
```typescript
const position = { a: 4, b: 5 };
const mandibleRanges = [
  { a: 9, b: 12, rate: 0.36 },
  { a: 4, b: 12, rate: 0.24 }
];
// تطابق: {4,5} در بازه [4-12] → rate = 0.24
```

## 6. محل پیاده‌سازی

- **UI Components**: `src/components/`
- **Data Processing**: `src/lib/scores.ts`
- **Validation**: `src/lib/symptoms.ts`
- **Data Structure**: `src/data/symptoms.ts`, `src/data/diseases.ts`

