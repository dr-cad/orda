ضمیمه 1: اسکیما/مدل داده دقیق

طرحواره داده سیستم به صورت JSON و بر اساس استاندارد OpenAPI 3.1.0 تعریف شده است.

**محل تعریف:**
- فایل اصلی: `server/swagger.ts`
- تولید خودکار: از `src/data/symptoms.ts` تولید می‌شود
- لیست بیماری‌ها: `src/data/diseases.ts`
- استاندارد: OpenAPI 3.1.0 Specification

**انواع داده‌ها:**
1. **Boolean**: برای ویژگی‌های دو حالته (مثال: `pat_male`, `pain_0`, `swelling`)
2. **Integer**: برای مقادیر عددی (مثال: `pat_age` با دامنه 0-120)
3. **String**: برای متن‌های آزاد (مثال: `pat_name`)
4. **Object (Range)**: برای بازه‌های عددی با ساختار `{a: integer, b: integer}` (مثال: `mandible`, `maxilla`)
5. **Enum**: برای انتخاب‌های چندگزینه‌ای که هر گزینه به صورت boolean جداگانه تعریف می‌شود (مثال: `slow_0`, `moderate_0`, `rapid_0`)

**قواعد اعتبارسنجی:**
- فیلدهای اجباری: `pat_age`, `pat_name`, `pat_gender` (یکی از `pat_male` یا `pat_female`), `pat_images`
- دامنه مقادیر: سن (0-120), موقعیت دندان (1-32)
- قواعد تعارض: گروه‌های متضاد (مثل `pat_male`/`pat_female`, `radiolucent`/`radiopaque`/`mixed`) فقط یکی می‌تواند true باشد

---

ضمیمه 2: نمونه واقعی ورودی متن بالینی و خروجی ساختاریافته

**نمونه 1 - ورودی انگلیسی:**
```
24 old female with report of swelling or pain which she reported gradually increased in 2years. The lesion was hard on palpation. Panoramic findings illustrates unilateral, solitary, mixed radiolucent and radiopaque non-odontogenic lesion with irregular, ill-defined border.
```

**خروجی JSON:**
```json
{
  "pat_age": 24,
  "pat_female": true,
  "swelling": true,
  "pain_0": true,
  "slow_0": true,
  "bony_hard": true,
  "mandible": {"a": 2, "b": 12},
  "unilateral_right": true,
  "solitary": true,
  "mixed": true,
  "irregular": true,
  "blending": true
}
```

**نمونه 2 - ورودی فارسی:**
```
بیمار 32 ساله زن، بدون بیماری سیستمیک یا درد، به صورت اتفاقی پس از گرفتن رادیوگراف، ضایعه‌ای در مندیبل چپ حدود دو ماه پیش تشخیص داده شد. در تصویر پانورامیک، ضایعه رادیولوسنت با مرز کورتیکال و تعریف شده در سمت چپ مندیبل، مرتبط با ناحیه پری‌کورونال دندان مولر سوم مشاهده می‌شود.
```

**خروجی JSON:**
```json
{
  "pat_age": 32,
  "pat_female": true,
  "moderate_0": true,
  "corticated": true,
  "mandible": {"a": 4, "b": 5},
  "unilateral_left": true,
  "pericoronal": true,
  "extend": true,
  "uni1": true
}
```

**استراتژی استخراج:**
سیستم از استراتژی "Positive-Only" استفاده می‌کند: فقط ویژگی‌های مثبت استخراج می‌شوند و ویژگی‌های منفی یا ناموجود از خروجی حذف می‌شوند. این رویکرد حجم payload را بهینه می‌کند.

**Metadata:**
هر خروجی شامل metadata با فیلدهای `AI_Confidence`, `Status`, `Extraction_Method`, و `Language` است.

---

ضمیمه 3: پروتکل فراخوانی LLM

**1. نوع پرامپت:**
- System Prompt: تعریف شده در `server/INSTRUCT.md` و `server/GPTTOOL.md`
- User Prompt: متن بالینی ورودی کاربر

**2. Function Calling:**
- API Type: OpenAI Assistant API (نه Chat Completion)
- Model: gpt-4 یا gpt-4-turbo
- Schema Definition: در `server/swagger.ts` تعریف شده و از `src/data/symptoms.ts` تولید می‌شود
- Function Name: `lesionClassification`

**3. پارامترهای مدل:**
- Temperature: 0.1 (کاهش خلاقیت، افزایش دقت)
- Top-p: 0.9 (کنترل تنوع خروجی)
- Max Tokens: 2000
- Seed: 42 (برای تکرارپذیری نسبی)

**4. سیاست Retry و Fallback:**
- Retry Policy: 3 تلاش با exponential backoff (1s, 2s, 4s)
- Timeout: 30 ثانیه
- Fallback: در صورت خطا، سوئیچ به حالت دستی
- Error Handling: مدیریت خطاهای Network، Rate Limit، و Invalid Response در `server/gpt.ts`

**5. بهینه‌سازی:**
- Caching: ذخیره نتایج برای متن‌های مشابه
- Token Optimization: استفاده از System Prompt کوتاه‌تر
- Monitoring: لاگ‌های timestamp، request_id، tokens_used، cost

**6. امنیت:**
- API Key: ذخیره در Environment Variables
- Backend Proxy: عدم ارسال Key به کلاینت
- Data Privacy: عدم ذخیره متن‌های بالینی در لاگ‌های OpenAI

**محل پیاده‌سازی:**
- Backend: `server/index.ts`, `server/gpt.ts`
- Frontend: `src/components/AIForm.tsx`

---

ضمیمه 4: فاکتور اثر - تعریف و محاسبه

**تعریف:**
فاکتور اثر (Effect Factor) به صورت احتمال شرطی P(Feature|Disease) تعریف می‌شود: احتمال مشاهده یک ویژگی خاص در صورت وجود بیماری خاص.

**ساختار داده:**
تعریف شده در `src/data/diseases.ts`:
- `IDiseaseFactor`: شامل `sid` (شناسه ویژگی), `rate` (نرخ ثابت برای Boolean), `ranges` (بازه‌ها برای Number/Range)
- `IRange`: شامل `a`, `b` (شروع و پایان بازه), `rate` (نرخ برای این بازه)

**انواع محاسبه:**
1. **Boolean**: استفاده از `rate` ثابت اگر ویژگی true باشد، در غیر این صورت `epsilon` (0.01)
2. **Number**: تطابق مقدار ورودی با بازه‌ها و استفاده از `rate` اولین بازه تطبیق‌یافته
3. **Range**: تطابق بازه ورودی `{a, b}` با شرط `input.a >= range.a && input.b <= range.b`

**نرمال‌سازی:**
- مقادیر منفی (-1) → تبدیل به `epsilon` (0.01) برای Laplace Smoothing
- مقادیر مثبت → نگاشت مستقیم به بازه [0.001, 1]
- مقدار `epsilon`: تعریف شده در `src/lib/scores.ts` (خط 11)

**منبع داده:**
- منابع علمی: Wood NK & Goaz PW (ویرایش 5), White SC & Pharoah MJ (ویرایش 8)
- فرآیند: استخراج از منابع → تبدیل کیفی به کمی → نرمال‌سازی → ذخیره در `diseases.ts`

**محل تعریف:**
- فایل: `src/data/diseases.ts`
- محاسبه: `src/lib/scores.ts` (تابع `getSymptomProbability`)

---

ضمیمه 5: قواعد جلوگیری از تضاد یا همپوشانی

**ساختار تضادها:**
تضادها به صورت Enum Parent در `src/data/symptoms.ts` پیاده‌سازی شده‌اند. هر گروه متضاد یک والد Enum دارد که فرزندان آن با یکدیگر در تضاد هستند.

**گروه‌های متضاد:**
1. Cortical bone (`corital-bone`): `expand`, `destruct-3`, `extend`
2. Internal structure (`int-struct`): `radiolucent`, `mixed`, `radiopaque`
3. Anatomic location (`ana-location`): `maxilla`, `mandible`, `both`
4. Radiopaque zone (`radiopaque`): `radiopaue-zone`, `radiopaque-nozone`
5. Unilocularity (`unilocular`): `uni1`, `uni2`
6. Onset and course (`onset-course`): `slow-0`, `moderate-0`, `rapid-0`

**مکانیزم جلوگیری:**
سیستم از بروز تضاد جلوگیری می‌کند با ریست کردن خودکار سایر گزینه‌های متضاد هنگام انتخاب یک گزینه.

**پیاده‌سازی:**
- `src/lib/symptoms.ts`:
  - `recursivelyUpdateParents`: پیدا کردن والد Enum و ریست کردن siblings
  - `recursivelyResetItem`: ریست کردن symptom و تمام فرزندان آن
  - `updateSymptom`: به‌روزرسانی symptom و فراخوانی `recursivelyUpdateParents`
- `server/swagger.ts`: تولید قواعد برای AI (`getSiblings`, `genEnumWarning`)
- `src/components/Symptom.tsx`: استفاده از `updateSymptom` از `useBufferStore`

**نکات مهم:**
- فقط Enum Parents با `type === SymptomType.Enum` این رفتار را دارند
- ریست بازگشتی: ریست کردن یک symptom باعث ریست شدن تمام فرزندان آن می‌شود
- بدون هشدار: چون تضاد رخ نمی‌دهد، نیازی به نمایش هشدار نیست

---

ضمیمه 6: فرمول اجرایی دقیق

**فرمول Naive Bayes:**
```
P(Di|S) = [P(Di) × ∏j P(Sj|Di)] / [Σi P(Di) × ∏j P(Sj|Di)]
```
که در آن:
- P(Di): احتمال پیشین بیماری i
- P(Sj|Di): احتمال شرطی ویژگی j در صورت وجود بیماری i
- ∏j: حاصل‌ضرب احتمالات تمام ویژگی‌های مشاهده شده
- Σi: جمع احتمالات برای تمام بیماری‌ها

**Laplace Smoothing:**
برای جلوگیری از صفر شدن احتمالات:
- ε (epsilon) = 0.01 (تعریف شده در `src/lib/scores.ts` خط 11)
- |S| = 93 (تعداد کل ویژگی‌ها)
- تبدیل مقادیر -1 به epsilon در تابع `getRate`

**محاسبه در دو مسیر:**
1. **Pattern Match**: P(Di) = 1/N (توزیع یکنواخت، N = 19 بیماری)
2. **Prevalence Match**: P(Di) = prevalence_rate (از ماتریس دانش در `diseases.ts`)

**FIX_FRAC:**
برای جلوگیری از اعداد خیلی کوچک، ضریب 100 اعمال می‌شود (تعریف شده در `src/lib/scores.ts` خط 65).

**تابع calc:**
برای محاسبات دقیق و جلوگیری از خطاهای floating point، استفاده از `Math.round(value * 10000) / 10000`.

**جایگاه ε در محاسبه:**
- در `getRate`: تبدیل -1 به epsilon
- در `getSymptomProbability`: استفاده از epsilon برای ویژگی‌های false یا ناموجود
- جلوگیری از صفر شدن صورت کسر

**محل تعریف:**
- فایل: `src/lib/scores.ts`
- تابع اصلی: `getScores()`
- توابع کمکی: `getDiseaseProbability`, `getSymptomProbability`, `getRate`

---

ضمیمه 7: سیاست نگهداشت و حذف داده‌ها

**نگهداشت:**
- مدت زمان: نامحدود تا زمان حذف دستی توسط کاربر
- محل ذخیره: LocalStorage مرورگر
- Backup: امکان دانلود فایل backup

**نسخه‌بندی:**
- Interface: `IHistoryItem` در `src/store/persist.ts` شامل فیلد `v` (نسخه نرم‌افزار)
- Migration: تابع `migration` در `src/store/persist.ts` برای تبدیل داده‌های قدیمی به فرمت جدید

**حذف:**
- حذف دستی: تابع `removeHistory` در `usePersistStore`
- حذف خودکار: تصاویر استفاده نشده پس از 30 روز از Cloudinary حذف می‌شوند

**کنترل دسترسی:**
- کاربر محلی: دسترسی کامل به داده‌های خود
- بدون احراز هویت: داده‌ها در LocalStorage ذخیره می‌شوند
- اشتراک‌گذاری: استفاده از Web Share API

**بازتولید نتایج:**
- ذخیره احتمالات: `scores` و `hash2` در `IHistoryItem`
- بازتولید: بررسی یکپارچگی با hash و در صورت نیاز محاسبه مجدد با `getScores`

**Backup و Restore:**
- Export: تابع `exportHistory` برای دانلود JSON
- Import: تابع `importHistory` برای بارگذاری و migration داده‌ها

**محل تعریف:**
- Store: `src/store/persist.ts`
- Migration: `src/store/persist.ts` (تابع `migration`)

---

ضمیمه 8: قرارداد API افزونه‌ها (Features/Extensions)

سیستم افزونه‌ها امکان اضافه کردن کامپوننت‌های سفارشی به علائم (symptoms) را فراهم می‌کند.

**ساختار کلی:**
- تعریف Feature: هر افزونه یک شناسه یکتا در enum `Feature` در `src/types/index.ts`
- Router: کامپوننت `Features` در `src/components/Features.tsx` به عنوان dispatcher عمل می‌کند
- ارتباط با Symptom: از طریق `desc.feature` در تعریف symptom در `src/data/symptoms.ts`
- اجرا: کامپوننت مربوطه در `src/components/Symptom.tsx` render می‌شود

**نحوه کار:**
کامپوننت `Features` یک switch statement است که بر اساس `feature` از props، کامپوننت مناسب را load و render می‌کند. از lazy loading و React Suspense برای افزونه‌های بزرگ استفاده می‌شود.

**افزونه‌های موجود:**
1. **DuplicateNameChecker** (`src/components/DupNameChecker.tsx`):
   - جستجوی نام مشابه در history (حداقل 3 کاراکتر)
   - نمایش لینک برای بارگذاری رکورد قبلی
   - استفاده در: `pat-name` symptom

2. **DentPicker** (`src/components/DentPicker.tsx`):
   - رابط گرافیکی برای انتخاب موقعیت آناتومیک
   - تصویر رادیوگرافی پانورامیک با نقاط قابل کلیک
   - انتخاب بازه (range) و ذخیره در `maxilla`, `mandible`, یا `both`
   - استفاده در: `location` symptom

3. **ImagePicker** (`src/components/ImagePicker.tsx`):
   - سیستم آپلود و مدیریت تصاویر رادیوگرافی
   - استفاده از FilePond برای drag-and-drop
   - حداکثر 10 فایل (هر کدام 1.5MB)
   - محاسبه hash SHA-256 قبل از آپلود برای جلوگیری از duplicate
   - آپلود به Cloudinary
   - استفاده در: `pat-images` symptom

**راهنمای ساخت افزونه جدید:**
1. تعریف Feature Enum: اضافه کردن شناسه جدید به `Feature` enum در `src/types/index.ts`
2. ساخت کامپوننت: ساخت کامپوننت React در `src/components/` با default export
3. ثبت در Router: اضافه کردن import و case جدید در `src/components/Features.tsx`
4. استفاده در Symptom: تنظیم `desc.feature` در `src/data/symptoms.ts`

**API در دسترس:**
- Store Hooks (`src/store/`): `useBufferStore()`, `usePersistStore()`
- Utility Hooks (`src/hooks/`): `useSymptomValue<T>(id)`, `getSymptomValueById<T>(symptoms, id)`
- Utility Functions (`src/lib/`): `parseImages`/`stringifyImages`, `makeUploadRequest`/`makeDeleteRequest`

