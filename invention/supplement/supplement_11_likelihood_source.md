# ضمیمه 11: منبع Likelihoodها

## 1. منبع استخراج

Likelihoodها (P(Feature|Disease)) از دو منبع اصلی استخراج می‌شوند:

### الف) منابع علمی:

#### 1. Wood NK, Goaz PW
- **عنوان**: "Differential diagnosis of oral and maxillofacial lesions"
- **ویرایش**: پنجم
- **محتوای استفاده شده**: 
  - احتمالات شرطی ویژگی‌ها برای هر بیماری
  - نرخ شیوع بیماری‌ها
  - روابط بین ویژگی‌ها و بیماری‌ها

#### 2. White SC, Pharoah MJ
- **عنوان**: "White and Pharoah's oral radiology: principles and interpretation"
- **ویرایش**: هشتم
- **محتوای استفاده شده**:
  - ویژگی‌های رادیولوژیک
  - احتمالات مشاهده هر ویژگی در بیماری‌های مختلف
  - الگوهای تشخیصی

#### 3. مطالعات اپیدمیولوژیک و بالینی
- مقالات منتشر شده در مجلات معتبر
- مطالعات موردی (Case Studies)
- متاآنالیزها

### ب) فرمول نگاشت:

#### برای ویژگی‌های Boolean:
```typescript
P(Feature|Disease) = rate  // مستقیماً از ماتریس دانش
```

#### برای ویژگی‌های Number/Range:
```typescript
P(Feature|Disease) = rate_i  // rate مربوط به بازه تطبیق‌یافته
```

## 2. فرآیند کمی‌سازی

### مرحله 1: استخراج از منابع
- خواندن منابع علمی
- استخراج توصیفات کیفی
- مثال: "درد در 70% موارد آملوبلاستوما مشاهده می‌شود" → rate = 0.7

### مرحله 2: تبدیل به مقادیر کمی
- تبدیل توصیفات به اعداد
- نرمال‌سازی به بازه [0.001, 1]
- تعریف بازه‌ها برای متغیرهای پیوسته

### مرحله 3: ذخیره در ماتریس دانش
```typescript
{
  id: "ameloblastoma",
  name: "Ameloblastoma",
  preval: 0.08,
  factors: [
    { sid: "pain-0", rate: 0.7 },
    { sid: "pat-age", ranges: [
      { a: 20, b: 40, rate: 0.8 },
      { a: 15, b: 50, rate: 0.6 }
    ]}
  ]
}
```

## 3. نگاشت از فاکتور اثر

### رابطه:
```
Likelihood = Effect Factor
P(Feature|Disease) = Effect Factor
```

### توضیح:
- فاکتور اثر همان احتمال شرطی است
- در ماتریس دانش به صورت `rate` یا `ranges` ذخیره می‌شود
- در محاسبات به صورت مستقیم استفاده می‌شود

## 4. مثال نگاشت

### از منبع علمی:
> "درد در 70% موارد آملوبلاستوما و در 5% موارد کیست رادیکولار مشاهده می‌شود"

### نگاشت به ماتریس دانش:
```typescript
// برای Ameloblastoma
{
  sid: "pain-0",
  rate: 0.7  // 70%
}

// برای Radicular Cyst
{
  sid: "pain-0",
  rate: 0.05  // 5%
}
```

### استفاده در محاسبه:
```typescript
// اگر pain-0 = true
P(pain-0|Ameloblastoma) = 0.7
P(pain-0|Radicular Cyst) = 0.05

// اگر pain-0 = false
P(pain-0|Ameloblastoma) = epsilon = 0.01
P(pain-0|Radicular Cyst) = epsilon = 0.01
```

## 5. نگاشت برای متغیرهای پیوسته

### از منبع علمی:
> "آملوبلاستوما بیشتر در سنین 20-40 سال مشاهده می‌شود (80%)، در سنین 15-50 سال کمتر (60%)"

### نگاشت:
```typescript
{
  sid: "pat-age",
  ranges: [
    { a: 20, b: 40, rate: 0.8 },  // 80%
    { a: 15, b: 50, rate: 0.6 }   // 60%
  ]
}
```

### استفاده:
```typescript
// اگر pat-age = 32
// تطابق با range [20-40] → rate = 0.8
P(pat-age=32|Ameloblastoma) = 0.8
```

## 6. فرمول نگاشت دقیق

### برای Boolean:
```
P(S|D) = {
  rate,        if S = true
  epsilon,     if S = false
}
```

### برای Number:
```
P(S|D) = {
  rate_i,      if S در range_i قرار گیرد
  epsilon,     otherwise
}
```

### برای Range:
```
P(S|D) = {
  rate_i,      if S.a >= range_i.a && S.b <= range_i.b
  epsilon,     otherwise
}
```

## 7. محل ذخیره‌سازی

### فایل اصلی:
- **مسیر**: `src/data/diseases.ts`
- **ساختار**: آرایه `IDisease[]`
- **فرمت**: TypeScript/JSON

### ساختار داده:
```typescript
interface IDisease {
  id: string;
  name: string;
  preval: number;        // نرخ شیوع
  factors: IDiseaseFactor[];
}

interface IDiseaseFactor {
  sid: string;           // شناسه ویژگی
  rate?: number;         // نرخ ثابت
  ranges?: IRange[];     // بازه‌ها
}
```

## 8. اعتبارسنجی

### بررسی صحت:
- مقایسه با منابع علمی
- بررسی منطقی بودن مقادیر
- تست با Case Studies شناخته شده

### به‌روزرسانی:
- با انتشار منابع جدید
- با تجمیع داده‌های بالینی
- با بازخورد متخصصان

## 9. مثال کامل

### منبع علمی:
> "کیست رادیکولار:
> - در 75% موارد در سنین 20-60 سال مشاهده می‌شود
> - در 55% موارد در مردان
> - در 5% موارد با درد همراه است
> - در 95% موارد با سیر کند (ماه‌ها تا سال‌ها)"

### نگاشت:
```typescript
{
  id: "radicular",
  name: "Radicular Cyst",
  preval: 0.25,
  factors: [
    {
      sid: "pat-age",
      ranges: [
        { a: 20, b: 60, rate: 0.75 }
      ]
    },
    { sid: "pat-male", rate: 0.55 },
    { sid: "pat-female", rate: 0.45 },
    { sid: "pain-0", rate: 0.05 },
    { sid: "slow-0", rate: 0.95 }
  ]
}
```

## 10. خلاصه

- **منبع**: منابع علمی معتبر (Wood & Goaz, White & Pharoah)
- **فرمول نگاشت**: مستقیم از فاکتور اثر
- **ذخیره‌سازی**: `src/data/diseases.ts`
- **استفاده**: در `src/lib/scores.ts` برای محاسبه احتمالات

