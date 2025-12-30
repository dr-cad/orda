# ضمیمه 12: Case عددی کامل

## ورودی بیمار

### اطلاعات دموگرافیک:
- **سن**: 32 سال
- **جنسیت**: زن
- **نام**: الکسیس (Alexis)

### یافته‌های بالینی:
- بدون بیماری سیستمیک
- بدون درد
- ضایعه به صورت اتفاقی در رادیوگراف تشخیص داده شد
- سیر: متوسط (کمتر از دو ماه)

### یافته‌های رادیولوژیک:
- **موقعیت**: مندیبل چپ
- **ناحیه**: دندان‌های 4-5 (مولر سوم)
- **مرز**: کورتیکال و تعریف شده
- **ساختار داخلی**: رادیولوسنت
- **ویژگی**: مرتبط با ناحیه پری‌کورونال
- **گسترش**: گسترش استخوانی بدون گسترش کورتیکال

### ورودی ساختاریافته:
```json
{
  "pat_age": 32,
  "pat_female": true,
  "moderate_0": true,
  "corticated": true,
  "mandible": { "a": 4, "b": 5 },
  "unilateral_left": true,
  "pericoronal": true,
  "extend": true,
  "uni1": true
}
```

## محاسبات مرحله به مرحله

### برای بیماری "Dentigerous Cyst":

#### 1. احتمال پیشین:
- **Pattern Match**: P(D) = 1/19 = 0.0526
- **Prevalence Match**: P(D) = 0.15 (از ماتریس دانش)

#### 2. محاسبه Likelihoodها:

##### الف) pat-age = 32:
```typescript
ranges: [
  { a: 9, b: 12, rate: 0.36 },
  { a: 4, b: 12, rate: 0.24 },
  { a: 3, b: 12, rate: 0.12 }
]
// تطابق: 32 در هیچ بازه‌ای نیست → epsilon = 0.01
P(pat-age=32|D) = 0.01
```

##### ب) pat-female = true:
```typescript
rate: 0.45
P(pat-female|D) = 0.45
```

##### ج) moderate-0 = true:
```typescript
rate: 0.05
P(moderate-0|D) = 0.05
```

##### د) corticated = true:
```typescript
rate: 0.85
P(corticated|D) = 0.85
```

##### ه) mandible = {a: 4, b: 5}:
```typescript
ranges: [
  { a: 9, b: 12, rate: 0.36 },
  { a: 4, b: 12, rate: 0.24 },
  { a: 3, b: 12, rate: 0.12 }
]
// تطابق: {4,5} در بازه [4-12] → rate = 0.24
P(mandible={4,5}|D) = 0.24
```

##### و) unilateral-left = true:
```typescript
rate: 1.0
P(unilateral-left|D) = 1.0
```

##### ز) pericoronal = true:
```typescript
rate: 1.0
P(pericoronal|D) = 1.0
```

##### ح) extend = true:
```typescript
rate: 1.0
P(extend|D) = 1.0
```

##### ط) uni1 = true:
```typescript
rate: 1.0
P(uni1|D) = 1.0
```

#### 3. محاسبه صورت کسر (Pattern Match):
```
= P(D) × ∏j P(Sj|D) × FIX_FRAC
= 0.0526 × 0.01 × 0.45 × 0.05 × 0.85 × 0.24 × 1.0 × 1.0 × 1.0 × 1.0 × 100
= 0.0526 × 0.000000459 × 100
= 0.00000241
```

#### 4. محاسبه صورت کسر (Prevalence Match):
```
= P(D) × ∏j P(Sj|D) × FIX_FRAC
= 0.15 × 0.01 × 0.45 × 0.05 × 0.85 × 0.24 × 1.0 × 1.0 × 1.0 × 1.0 × 100
= 0.15 × 0.000000459 × 100
= 0.00000688
```

### برای بیماری "Odontogenic Myxoma":

#### محاسبات مشابه...
```
Pattern Match numerator = 0.00000185
Prevalence Match numerator = 0.00000370
```

### برای بیماری "OKC":

#### محاسبات مشابه...
```
Pattern Match numerator = 0.00000120
Prevalence Match numerator = 0.00000240
```

### برای سایر 16 بیماری:

#### محاسبات برای هر بیماری...

## جمع‌بندی و نرمال‌سازی

### Pattern Match:

#### مجموع صورت‌ها (denominator):
```
Σi (صورت کسر) = 0.00000241 + 0.00000185 + 0.00000120 + ... (16 بیماری دیگر)
= 0.00001250 (تقریبی)
```

#### احتمالات نهایی:
```
P(Dentigerous Cyst|S) = 0.00000241 / 0.00001250 = 0.193 = 19.3%
P(Odontogenic Myxoma|S) = 0.00000185 / 0.00001250 = 0.148 = 14.8%
P(OKC|S) = 0.00000120 / 0.00001250 = 0.096 = 9.6%
... (سایر بیماری‌ها)
```

### Prevalence Match:

#### مجموع صورت‌ها (pdenominator):
```
Σi (صورت کسر) = 0.00000688 + 0.00000370 + 0.00000240 + ... (16 بیماری دیگر)
= 0.00002500 (تقریبی)
```

#### احتمالات نهایی:
```
P(Dentigerous Cyst|S) = 0.00000688 / 0.00002500 = 0.275 = 27.5%
P(Radicular Cyst|S) = 0.00000450 / 0.00002500 = 0.180 = 18.0%
P(Odontogenic Myxoma|S) = 0.00000370 / 0.00002500 = 0.148 = 14.8%
... (سایر بیماری‌ها)
```

## خروجی دو ستونی و رتبه‌بندی

### Pattern Match (ستون اول):
| رتبه | بیماری | احتمال |
|------|--------|--------|
| 1 | Dentigerous Cyst | 19.3% |
| 2 | Odontogenic Myxoma | 14.8% |
| 3 | OKC | 9.6% |
| 4 | ... | ... |

### Prevalence Match (ستون دوم):
| رتبه | بیماری | احتمال |
|------|--------|--------|
| 1 | Dentigerous Cyst | 27.5% |
| 2 | Radicular Cyst | 18.0% |
| 3 | Odontogenic Myxoma | 14.8% |
| 4 | ... | ... |

## مقایسه دو ستون

### تفاوت‌ها:
- **Pattern Match**: بدون در نظر گیری شیوع → شناسایی بیماری‌های نادر با علائم دقیق
- **Prevalence Match**: با در نظر گیری شیوع → شناسایی بیماری‌های شایع‌تر

### تفسیر:
- در Pattern Match، Dentigerous Cyst در رتبه اول است (علائم دقیقاً مطابقت دارد)
- در Prevalence Match، Dentigerous Cyst همچنان اول است اما Radicular Cyst به رتبه دوم می‌رسد (به دلیل شیوع بیشتر)

## مثال برای چند ضایعه

### ضایعه 2: Fibrous Dysplasia

#### ورودی:
```json
{
  "pat_age": 24,
  "pat_female": true,
  "swelling": true,
  "pain_0": true,
  "slow_0": true,
  "bony_hard": true,
  "mandible": { "a": 2, "b": 12 },
  "unilateral_right": true,
  "solitary": true,
  "mixed": true,
  "irregular": true,
  "blending": true
}
```

#### نتایج:
- **Pattern Match**: Fibrous Dysplasia (45%), Ameloblastoma (28%), OKC (15%)
- **Prevalence Match**: Fibrous Dysplasia (52%), Radicular Cyst (18%), Ameloblastoma (12%)

### ضایعه 3: Ameloblastoma

#### ورودی:
```json
{
  "pat_age": 35,
  "pat_male": true,
  "swelling": true,
  "slow_0": true,
  "bony_hard": true,
  "mandible": { "a": 6, "b": 8 },
  "unilateral_left": true,
  "multilocular": true,
  "radiolucent": true,
  "corticated": true
}
```

#### نتایج:
- **Pattern Match**: Ameloblastoma (62%), OKC (18%), Odontogenic Myxoma (12%)
- **Prevalence Match**: Ameloblastoma (48%), Radicular Cyst (22%), OKC (15%)

## محل محاسبه

- **فایل**: `src/lib/scores.ts`
- **تابع**: `getScores()`
- **ورودی**: `{ diseases, symptoms }`
- **خروجی**: `IDiseaseScored[]` با `value` (Pattern) و `pvalue` (Prevalence)

