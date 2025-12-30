# ضمیمه 17: سیستم تولید گزارش (Report Generation System)

**توجه**: در حال حاضر هیچ سیستم افزونه‌ای (Plugin API) در کد پیاده‌سازی نشده است. آنچه که وجود دارد، یک سیستم تولید گزارش ساده است که از علائم (symptoms) متن گزارش تولید می‌کند.

## 1. ساختار فعلی

سیستم تولید گزارش بر اساس یک الگوی ساده (template-based) کار می‌کند که از داده‌های علائم، متن گزارش را تولید می‌کند.

### الف) تعریف Type در `src/types/index.ts`:

```140:144:src/types/index.ts
export interface IReport {
  sid?: SId;
  ranges?: (IRange & { text: string })[];
  text?: string | string[];
}
```

- `sid`: شناسه symptom (اختیاری) - اگر تعریف شده باشد، فقط زمانی که symptom مقدار داشته باشد نمایش داده می‌شود
- `ranges`: آرایه‌ای از بازه‌ها برای تبدیل مقادیر Range به متن (اختیاری)
- `text`: متن یا آرایه‌ای از متون برای انتخاب تصادفی (اختیاری)

### ب) داده گزارش در `src/data/report.ts`:

```1:89:src/data/report.ts
import { IReport } from "../types";

const report: IReport[] = [
  {
    text: [
      // static
      "Panoramic radiography revealed",
      "Panoramic examination indicates",
      "Panoramic findings illustrates",
    ],
  },

  { sid: "unilateral", text: "unilateral," },
  { sid: "bilateral", text: "bilateral," },

  { sid: "solitary", text: "solitary," },
  { sid: "multiple-separate", text: "multiple," },
  { sid: "diffuse", text: "generalized diffuse," },

  { sid: "unilocular", text: "unilocular radiolucent" },
  { sid: "multilocular", text: "multilocular radiolucent" },
  // { sid: "linear", text: "multilocular radiolucent with straight septa" },
  // { sid: "curved", text: "multilocular radiolucent" },
  { sid: "radiopaque", text: "radiopaque" },
  { sid: "mixed", text: "mixed radiolucent and radiopaque" },
  { sid: "rarefaction", text: "generalized rarefaction" },
  { text: "lesion with" },

  { sid: "round", text: "round," },
  { sid: "scalloped", text: "scalloped," },
  { sid: "irregular", text: "irregular," },

  { sid: "well-defined", text: "well-defined" },
  { sid: "non-corticated", text: ", and non-corticated border" },
  { sid: "corticated", text: ", and corticated border" },
  { sid: "sclerotic", text: ", and sclerotic border" },
  { sid: "soft-capsule", text: "border with soft-capsule" },

  { sid: "ill-defined", text: "ill-defined" },
  { sid: "blending", text: ", and blending border" },
  { sid: "invasive", text: ", and invasive border" },

  { sid: "unilateral-right", text: "in Rt side" },
  { sid: "unilateral-left", text: "in Lt side" },

  { sid: "maxilla", text: "of maxilla" },
  { sid: "mandible", text: "of mandible" },
  { sid: "both", text: "of maxilla and mandible" },

  { text: "at" },
  {
    sid: "maxilla",
    ranges: [
      { a: 3, b: 4, text: "tuberosity" },
      { a: 4, b: 7, text: "molar" },
      { a: 7, b: 9, text: "premolar" },
      { a: 9, b: 10, text: "canine" },
      { a: 10, b: 12, text: "incisors" },
    ],
  },
  {
    sid: "mandible",
    ranges: [
      { a: 1, b: 2, text: "condyle" },
      { a: 2, b: 4, text: "ramus" },
      { a: 4, b: 7, text: "molar" },
      { a: 7, b: 9, text: "premolar" },
      { a: 9, b: 10, text: "canine" },
      { a: 10, b: 12, text: "incisors" },
    ],
  },
  {
    sid: "both",
    ranges: [
      { a: 1, b: 2, text: "condyle" },
      { a: 2, b: 4, text: "ramus" },
      { a: 4, b: 7, text: "molar" },
      { a: 7, b: 9, text: "premolar" },
      { a: 9, b: 10, text: "canine" },
      { a: 10, b: 12, text: "incisors" },
    ],
  },
  { sid: "sinus", text: "and sinus" },

  { text: "region" },

  { sid: "destruct-3", text: " with expansion and destruction of cortical bone" },
  { sid: "extend", text: " with extension within bone without expand" },
  { sid: "expand", text: " with expansion of cortical bone" },
];
```

## 2. الگوریتم تولید گزارش

### تابع اصلی در `src/hooks/report.ts`:

```25:40:src/hooks/report.ts
export default function useReportFindings(sypmtoms: ISymptom[]) {
  return useMemo(() => {
    let output = "";
    for (const r of report) {
      const spaceBefore = report.indexOf(r) === 0 ? "" : " ";
      if (!r.sid) {
        output += spaceBefore + pickText(r.text!);
        continue;
      }
      const v = getSymptomValueById(sypmtoms, r.sid);
      if (v && r.text) output += spaceBefore + pickText(r.text);
      if (r.ranges && v) output += spaceBefore + pickFromRange(r.ranges, v as IRange);
    }
    return output + ".";
  }, [sypmtoms]);
}
```

### توابع کمکی:

```7:23:src/hooks/report.ts
const pickText = (text: string | string[]) => {
  if (typeof text === "string") return text;
  return _.sample(text);
};

const pickFromRange = (ranges: IReport["ranges"], v: IRange) => {
  let from = "";
  let to = "";

  for (const range of ranges!) {
    if (!from && v.a < range.b) from = range.text; // yes it's correct
    if (!to && v.b <= range.b) to = range.text;
  }

  if (from === to) return to + " ";
  return from + " to " + to + " ";
};
```

### منطق کار:

1. **متن استاتیک**: اگر `sid` تعریف نشده باشد، متن مستقیماً به خروجی اضافه می‌شود
2. **انتخاب تصادفی**: اگر `text` یک آرایه باشد، یکی از عناصر به صورت تصادفی انتخاب می‌شود
3. **بررسی شرط**: اگر `sid` تعریف شده باشد، ابتدا مقدار symptom بررسی می‌شود
4. **نمایش شرطی**: فقط در صورت وجود مقدار، متن نمایش داده می‌شود
5. **تبدیل Range**: اگر `ranges` تعریف شده و مقدار از نوع `IRange` باشد، بازه به متن تبدیل می‌شود

## 3. مثال عملی

### ورودی (Symptoms):
```json
{
  "unilateral": true,
  "unilateral-left": true,
  "solitary": true,
  "radiolucent": true,
  "uni1": true,
  "round": true,
  "well-defined": true,
  "corticated": true,
  "mandible": { "a": 4, "b": 7 },
  "extend": true
}
```

### فرآیند تولید:
1. `"Panoramic radiography revealed"` (انتخاب تصادفی از 3 گزینه)
2. `"unilateral,"` (چون `unilateral === true`)
3. `"solitary,"` (چون `solitary === true`)
4. `"unilocular radiolucent"` (چون `radiolucent === true` و `uni1 === true`)
5. `"lesion with"` (متن استاتیک)
6. `"round,"` (چون `round === true`)
7. `"well-defined"` (چون `well-defined === true`)
8. `", and corticated border"` (چون `corticated === true`)
9. `"in Lt side"` (چون `unilateral-left === true`)
10. `"of mandible"` (چون `mandible` مقدار دارد)
11. `"at"` (متن استاتیک)
12. `"molar to molar"` (تبدیل `{a: 4, b: 7}` به متن بر اساس ranges)
13. `"region"` (متن استاتیک)
14. `" with extension within bone without expand"` (چون `extend === true`)

### خروجی نهایی:
```
Panoramic radiography revealed unilateral, solitary, unilocular radiolucent lesion with round, well-defined, and corticated border in Lt side of mandible at molar to molar region with extension within bone without expand.
```

## 4. ویژگی‌ها و محدودیت‌ها

### ویژگی‌ها:
- ✅ ساده و قابل فهم
- ✅ عملکرد سریع (بدون پردازش پیچیده)
- ✅ پشتیبانی از انتخاب تصادفی متن
- ✅ تبدیل خودکار Range به متن
- ✅ شرطی‌سازی بر اساس مقدار symptoms

### محدودیت‌ها:
- ❌ ساختار ثابت و غیرقابل گسترش
- ❌ عدم پشتیبانی از منطق پیچیده
- ❌ عدم پشتیبانی از افزونه‌های خارجی
- ❌ عدم امکان سفارشی‌سازی توسط کاربر
- ❌ عدم پشتیبانی از قوانین تجاری پیچیده

## 5. استفاده در UI

### در کامپوننت ReportPage:

```typescript
// src/pages/ReportPage.tsx
import useReportFindings from "../hooks/report";

function ReportPageContent({ item }: { item: IHistoryItem }) {
  const reportText = useReportFindings(item.symptoms);
  
  return (
    <div>
      <p>{reportText}</p>
    </div>
  );
}
```

## 6. مقایسه با سیستم افزونه‌ای فرضی

### سیستم فعلی (Template-based):
- ساختار داده‌ای ساده (`IReport[]`)
- پردازش خطی و ترتیبی
- بدون انعطاف‌پذیری
- بدون ایزولاسیون
- بدون سیستم ثبت و مدیریت

### سیستم افزونه‌ای فرضی (که وجود ندارد):
- نیاز به رابط برنامه‌نویسی (API)
- نیاز به سیستم ثبت (Registry)
- نیاز به ایزولاسیون و امنیت
- نیاز به مدیریت چرخه حیات
- پیچیدگی بیشتر

## 7. محل پیاده‌سازی

- **تعریف Type**: `src/types/index.ts` (خط ~140)
- **داده گزارش**: `src/data/report.ts`
- **هوک پردازش**: `src/hooks/report.ts`
- **استفاده در UI**: `src/pages/ReportPage.tsx`

## 8. قابلیت‌های پیشنهادی برای آینده

اگر در آینده بخواهید یک سیستم افزونه‌ای واقعی پیاده‌سازی کنید، می‌توانید:

1. **ایجاد Plugin Interface**:
   - تعریف قرارداد استاندارد برای افزونه‌ها
   - پشتیبانی از ورودی و خروجی مشخص

2. **Plugin Registry**:
   - سیستم ثبت و مدیریت افزونه‌ها
   - پشتیبانی از بارگذاری پویا

3. **ایزولاسیون**:
   - اجرای افزونه‌ها در محیط محدود (sandbox)
   - کنترل دسترسی به منابع سیستم

4. **Pipeline Processing**:
   - امکان اتصال چند افزونه به صورت زنجیره‌ای
   - مدیریت وابستگی‌ها

5. **Extension Points**:
   - نقاط گسترش مشخص برای افزودن قابلیت‌های جدید
   - مثال: گزارش‌سازی، اعتبارسنجی، نمایش داده

## 9. نتیجه‌گیری

سیستم فعلی یک راه‌حل ساده و موثر برای تولید گزارش است، اما یک سیستم افزونه‌ای واقعی نیست. برای نیازهای پیچیده‌تر، نیاز به طراحی و پیاده‌سازی یک سیستم افزونه‌ای کامل وجود دارد.
