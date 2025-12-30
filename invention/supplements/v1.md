ضمیمه 1: اسکیما/مدل داده دقیق
طرحواره داده سیستم
طرحواره داده سیستم به صورت JSON و بر اساس استاندارد OpenAPI 3.1.0 تعریف شده است. ساختار کامل در فایل server/swagger.ts موجود است.
ساختار کلی OpenAPI Schema
{
  "openapi": "3.1.0",
  "info": {
    "title": "Jaw bone lesion detection app",
    "summary": "A jaw bone lesion detection program.",
    "description": "This is an app that classifies jaw bone lesions.",
    "version": "1.0.2"
  },
  "servers": [ ... ],
  "paths": { ... },
  "components": {
    "schemas": {
      "Symptoms": {
        "type": "object",
        "properties": { ... }
      },
      "Scores": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "name": {
              "type": "string",
              "description": "Name of the lesion"
            },
            "probablity": {
              "type": "integer",
              "format": "int32",
              "description": "Probablity score of the lesion"
            }
          }
        }
      }
    }
  }
}

------->>>>>>>> swagger.json
لیست بیماری های به کار برده شده در Scores
----->>>>>>> diseases.ts

انواع داده‌ها
1. Boolean
نوع: boolean
استفاده: برای ویژگی‌های دو حالته (وجود/عدم وجود)
مثال: pat_male, pain_0, swelling
2. Integer
نوع: integer
فرمت: int32
دامنه: بسته به ویژگی (مثلاً سن: 0-120)
مثال: pat_age
3. String
نوع: string
استفاده: برای متن‌های آزاد
مثال: pat_name
4. Object (Range)
نوع: object
ویژگی‌ها: {a: integer, b: integer}
استفاده: برای بازه‌های عددی (مثلاً موقعیت ضایعه)
مثال: mandible, maxilla
5. Enum
نوع: boolean (هر گزینه به صورت جداگانه)
استفاده: برای انتخاب‌های چندگزینه‌ای
مثال: slow_0, moderate_0, rapid_0
قواعد اعتبارسنجی
فیلدهای اجباری (Required):
pat_age: الزامی
pat_name: الزامی
pat_gender: الزامی (یکی از pat_male یا pat_female)
pat_images: الزامی
دامنه مقادیر:
سن: 0 ≤ age ≤ 120
موقعیت دندان: 1 ≤ a, b ≤ 32
قواعد تعارض:
pat_male و pat_female: فقط یکی می‌تواند true باشد
radiolucent, radiopaque, mixed: فقط یکی می‌تواند true باشد
slow_0, moderate_0, rapid_0: فقط یکی می‌تواند true باشد
محل تعریف
فایل اصلی: server/swagger.ts
تولید خودکار: از src/data/symptoms.ts تولید می‌شود
استاندارد: OpenAPI 3.1.0 Specification

ضمیمه 2: نمونه واقعی ورودی متن بالینی و خروجی ساختاریافته
ورودی: متن بالینی
24 old female with report of swelling or pain which she reported gradually increased in 2years. The lesion was hard on palpation. Panoramic findings illustrates unilateral, solitary, mixed radiolucent and radiopaque non-odontogenic lesion with irregular, ill-defined border.
خروجی: JSON ساختاریافته
  "pat_age": 24,
  "pat_female": true,
  "swelling": true,
  "pain_0": true,
  "slow_0": true,
  "bony_hard": true,
  "mandible": {
    "a": 2,
    "b": 12
  },
  "unilateral_right": true,
  "solitary": true,
  "mixed": true,
  "irregular": true,
  "blending": true,
  "related": true,
  "expand": true,
  "dura": true
توضیحات نگاشت
متن بالینی
شناسه ویژگی
مقدار
"24 old female"
pat_age
24
"female"
pat_female
true
"swelling or pain"
swelling, pain_0
true, true
"gradually increased in 2years"
slow_0
true
"hard on palpation"
bony_hard
true
"unilateral"
unilateral_right
true
"solitary"
solitary
true
"mixed radiolucent and radiopaque"
mixed
true
"irregular, ill-defined border"
irregular, blending
true, true

نمونه دیگر: ورودی فارسی
بیمار 32 ساله زن، بدون بیماری سیستمیک یا درد، به صورت اتفاقی پس از گرفتن رادیوگراف، ضایعه‌ای در مندیبل چپ حدود دو ماه پیش تشخیص داده شد. در تصویر پانورامیک، ضایعه رادیولوسنت با مرز کورتیکال و تعریف شده در سمت چپ مندیبل، مرتبط با ناحیه پری‌کورونال دندان مولر سوم مشاهده می‌شود. ضایعه گسترش استخوانی نشان می‌دهد اما باعث گسترش استخوانی نشده است.
خروجی متناظر
  "pat_age": 32,
  "pat_female": true,
  "moderate_0": true,
  "corticated": true,
  "mandible": {
    "a": 4,
    "b": 5
  },
  "unilateral_left": true,
  "pericoronal": true,
  "extend": true,
  "uni1": true
استراتژی استخراج
سیستم از استراتژی "Positive-Only" استفاده می‌کند:
فقط ویژگی‌های مثبت استخراج می‌شوند
ویژگی‌های منفی یا ناموجود از خروجی حذف می‌شوند
این رویکرد حجم payload را بهینه می‌کند
Metadata
هر خروجی شامل metadata زیر است:
  "Meta_Data": {
    "AI_Confidence": 0.98,
    "Status": "Pending_User_Confirmation",
    "Extraction_Method": "OpenAI_Assistant_API",
    "Language": "English"
  }

ضمیمه 4: پروتکل فراخوانی LLM
1. نوع پرامپت/سیستم پرامپت
System Prompt:
You are an expert assistant for extracting pathological data from clinical notes about jaw bone lesions. Your role is to extract only positive findings and omit negative or absent findings. Extract data according to the provided API schema.


User Prompt:
متن بالینی ورودی کاربر که شامل توصیف بیمار و ضایعه است.
2. Function Calling
استفاده از OpenAI Assistant API:
API Type: OpenAI Assistant API (نه Chat Completion)
Model: gpt-4 یا gpt-4-turbo
Function Calling: فعال
Schema Definition:
{
  "type": "function",
  "function": {
    "name": "lesionClassification",
    "description": "Extract clinical features from patient description",
    "parameters": {
      "type": "object",
      "properties": {
        // ... تمام ویژگی‌های 93 گانه
      }
    }
  }
}
محل تعریف Schema:
فایل: server/swagger.ts
استاندارد: OpenAPI 3.1.0
تولید خودکار: از src/data/symptoms.ts
3. پارامترهای Top-p
تنظیمات:
const openAIConfig = {
  model: "gpt-4",
  temperature: 0.1,  // کاهش خلاقیت، افزایش دقت
  top_p: 0.9,        // کنترل تنوع خروجی
  max_tokens: 2000,
  frequency_penalty: 0.0,
  presence_penalty: 0.0
};
توضیحات:
Temperature: 0.1: برای کاهش خلاقیت و افزایش دقت در استخراج داده
Top-p: 0.9: برای کنترل تنوع خروجی و حفظ دقت
Max Tokens: 2000: برای پاسخ‌های کامل
4. قیود تکرارپذیری
Deterministic Mode:
const config = {
  seed: 42,  // Seed ثابت برای نتایج قابل تکرار
  temperature: 0.1  // دما پایین برای تکرارپذیری بیشتر
};
محدودیت‌ها:
تکرارپذیری کامل در LLM‌ها ممکن نیست
با Temperature پایین و Seed ثابت، تکرارپذیری افزایش می‌یابد
برای تست‌های دقیق، از Test Cases با خروجی‌های شناخته شده استفاده می‌شود
5. سیاست Retry و Fallback
Retry Policy:
async function callOpenAIWithRetry(prompt, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.assistants.create({
        // ... config
      });
      return response;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      // Exponential backoff
      await sleep(Math.pow(2, attempt) * 1000); // 1s, 2s, 4s
    }
  }
}
Fallback Strategy:
async function extractFeatures(text) {
  try {
    // تلاش با OpenAI
    return await callOpenAIWithRetry(text);
  } catch (error) {
    // Fallback: سوئیچ به حالت دستی
    console.error("AI extraction failed, switching to manual mode");
    return {
      mode: "manual",
      message: "لطفاً اطلاعات را به صورت دستی وارد کنید"
    };
  }
}
Timeout:
Timeout: 30 ثانیه
در صورت timeout، Fallback به حالت دستی فعال می‌شود
6. Error Handling
انواع خطاها:
1. Network Error:
Retry با exponential backoff
پس از 3 تلاش ناموفق → Fallback
2. API Error (Rate Limit):
Retry با delay بیشتر
پس از 5 دقیقه → Retry مجدد
3. Invalid Response:
Validation بر روی خروجی
در صورت نامعتبر بودن → Retry یا Fallback
کد نمونه:
async function handleAPIError(error) {
  if (error.code === 'rate_limit_exceeded') {
    await sleep(60000); // 1 minute
    return retry();
  }
  if (error.code === 'timeout') {
    return fallbackToManual();
  }
  if (error.code === 'invalid_response') {
    return retry();
  }
  return fallbackToManual();
}
7. Cost Optimization
استراتژی‌های بهینه‌سازی هزینه:
Caching: ذخیره نتایج استخراج برای متن‌های مشابه
Batch Processing: پردازش چندین درخواست به صورت batch
Token Optimization: استفاده از System Prompt کوتاه‌تر
Selective Extraction: استخراج فقط ویژگی‌های ضروری
8. Monitoring و Logging
لاگ‌های ثبت شده:
{
  timestamp: "2024-01-15T10:30:00Z",
  request_id: "req_123",
  prompt_length: 250,
  response_time: 1.2,
  tokens_used: 150,
  cost: 0.002,
  success: true,
  error: null
}
Metrics:
تعداد درخواست‌ها
نرخ موفقیت
زمان پاسخ
هزینه هر درخواست
نرخ خطا
9. Security
API Key Management:
ذخیره API Key در Environment Variables
عدم ارسال Key به کلاینت
استفاده از Backend Proxy
Data Privacy:
عدم ذخیره متن‌های بالینی در لاگ‌های OpenAI
حذف داده‌های حساس قبل از ارسال (در صورت نیاز)
رعایت HIPAA Compliance
10. Integration با سیستم
جریان کار:
کاربر متن بالینی را وارد می‌کند
Frontend متن را به Backend ارسال می‌کند
Backend متن را به OpenAI API ارسال می‌کند
OpenAI با Function Calling داده‌ها را استخراج می‌کند
Backend خروجی را اعتبارسنجی می‌کند
Frontend نتایج را به کاربر نمایش می‌دهد
کاربر نتایج را تأیید یا ویرایش می‌کند
محل پیاده‌سازی:
Backend: server/index.ts
Frontend: src/components/AIForm.tsx
Configuration: Environment Variables

ضمیمه 7: فاکتور اثر - تعریف و محاسبه
1. تعریف فاکتور اثر
فاکتور اثر (Effect Factor) به صورت احتمال شرطی P(Feature|Disease) تعریف می‌شود:
P(Feature|Disease) = احتمال مشاهده یک ویژگی خاص در صورت وجود بیماری خاص
2. ساختار داده
فاکتور اثر در فایل src/data/diseases.ts به صورت زیر تعریف می‌شود:
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
3. انواع محاسبه
الف) ویژگی‌های Boolean:
{
  sid: "pain-0",
  rate: 0.7  // مقدار ثابت
}
اگر ویژگی true باشد → استفاده از rate
اگر ویژگی false باشد → استفاده از epsilon (0.01)
ب) ویژگی‌های Number:
{
  sid: "pat-age",
  ranges: [
    { a: 20, b: 60, rate: 0.75 },
    { a: 15, b: 75, rate: 0.5 },
    { a: 0, b: 100, rate: 0.25 }
  ]
}
تطابق مقدار ورودی با بازه‌ها
استفاده از rate مربوط به اولین بازه تطبیق‌یافته
ج) ویژگی‌های Range:
{
  sid: "mandible",
  ranges: [
    { a: 9, b: 12, rate: 0.36 },
    { a: 4, b: 12, rate: 0.24 },
    { a: 3, b: 12, rate: 0.12 }
  ]
}
تطابق بازه ورودی {a, b} با بازه‌های تعریف شده
شرط: input.a >= range.a && input.b <= range.b
4. نرمال‌سازی
تبدیل مقادیر منفی:
const epsilon = 0.01;

function getRate(rate: number): number {
  return rate === -1 ? epsilon : rate;
}
منطق:
مقادیر منفی (-1) → تبدیل به epsilon (0.01) برای Laplace Smoothing
مقادیر مثبت → نگاشت مستقیم به بازه [0.001, 1]
مقادیر صفر → تبدیل به epsilon
5. منبع داده
منابع علمی:
Wood NK, Goaz PW. Differential diagnosis of oral and maxillofacial lesions (ویرایش 5)
White SC, Pharoah MJ. White and Pharoah's oral radiology (ویرایش 8)
فرآیند کمی‌سازی:
استخراج اطلاعات از منابع علمی
تبدیل توصیفات کیفی به مقادیر کمی
نرمال‌سازی به بازه [0.001, 1]
ذخیره در ماتریس دانش (diseases.ts)
7. وزن ثابت vs تابع
وزن ثابت:
برای ویژگی‌های Boolean: rate ثابت
مثال: pain-0 → همیشه 0.7 (برای بیماری خاص)
تابع (بازه‌ای):
برای ویژگی‌های Number/Range: تابع بازه‌ای
مثال: pat-age → تابعی از سن با نرخ‌های مختلف
احتمال شرطی:
در هر دو حالت، نتیجه به صورت احتمال شرطی P(Feature|Disease) است
تفاوت در نحوه محاسبه: ثابت vs بازه‌ای
8. فرمول نگاشت
برای Boolean:
P(S|D) = rate  (اگر S = true)
P(S|D) = epsilon  (اگر S = false)
برای Number:
P(S|D) = rate_i  (اگر S در range_i قرار گیرد)
P(S|D) = epsilon  (اگر S در هیچ range قرار نگیرد)
برای Range:
P(S|D) = rate_i  (اگر S.a >= range_i.a && S.b <= range_i.b)
P(S|D) = epsilon  (اگر هیچ تطابقی وجود نداشته باشد)
10. محل تعریف
فایل: src/data/diseases.ts
نوع داده: IDiseaseFactor
محاسبه: src/lib/scores.ts
مقدار epsilon: src/lib/scores.ts (0.01)

ضمیمه 9: قواعد جلوگیری از تضاد یا همپوشانی
1. ساختار تضادها در کد
تضادها در سیستم به صورت Enum Parent پیاده‌سازی شده‌اند، نه به صورت گروه‌های مستقل. هر گروه متضاد یک والد Enum دارد که فرزندان آن با یکدیگر در تضاد هستند.
گروه‌های متضاد در src/data/symptoms.ts:
1. Cortical bone (corital-bone)
{
  id: "corital-bone",
  name: "Cortial bone (Jaws and maxillary sinus)",
  type: SymptomType.Enum,
  options: ["expand", "destruct-3", "extend"],
}
2. Internal structure (int-struct)
{
  id: "int-struct",
  name: "Internal structure",
  required: true,
  type: SymptomType.Enum,
  options: ["radiolucent", "mixed", "radiopaque"],
}
3. Anatomic location (ana-location)
{
  id: "ana-location",
  name: "Anatomic Location",
  type: SymptomType.Enum,
  options: ["maxilla", "mandible", "both"],
}
4. Radiopaque zone (radiopaque)
{
  id: "radiopaque",
  name: "Radiopaque",
  type: SymptomType.Enum,
  options: ["radiopaue-zone", "radiopaque-nozone"],
}
5. Unilocularity (unilocular)
{
  id: "unilocular",
  name: "Unilocular",
  type: SymptomType.Enum,
  options: ["uni1", "uni2"],
}
6. Onset and course (onset-course)
{
  id: "onset-course",
  name: "Onset and course",
  type: SymptomType.Enum,
  options: ["slow-0", "moderate-0", "rapid-0"],
}
2. مکانیزم جلوگیری از تضاد
سیستم تضادها را حل نمی‌کند، بلکه از بروز آن‌ها جلوگیری می‌کند با ریست کردن خودکار سایر گزینه‌های متضاد هنگام انتخاب یک گزینه.
پیاده‌سازی در src/lib/symptoms.ts:
الف) تابع recursivelyUpdateParents:
export function recursivelyUpdateParents(arr: ISymptom[], id: string, silent?: boolean) {
  // find a parent which has this id as a child
  const parent = arr.find((p) => p.options?.includes(id));
  if (!parent) return;
  if (!silent) console.log("Updating Parent", parent.id);
  parent.value = false;
  for (const option of parent.options ?? []) {
    // reset siblings of enum parent
    if (parent.type === SymptomType.Enum && option !== id) recursivelyResetItem(arr, option, silent);
    // set ancestors whom have value
    // it works: because it fills from inner parents to outer ones
    const item = arr.find((item) => item.id === option);
    if (item?.value) parent.value = true;
  }
  recursivelyUpdateParents(arr, parent.id, silent);
}
نکته کلیدی: در خط 88، هنگام انتخاب یک فرزند Enum، تمام فرزندان دیگر (siblings) به صورت خودکار ریست می‌شوند.
ب) تابع recursivelyResetItem:
export function recursivelyResetItem(arr: ISymptom[], id: string, silent?: boolean) {
  // populate item
  const item = arr.find((x) => x.id === id);
  // reset if found
  if (item) {
    if (!silent) console.log("Removing", item.id);
    // reset self
    item.value = undefined;
    item.open = false; // close the item
    // reset each child recursively
    if (Array.isArray(item.options)) {
      item.options.forEach((o) => recursivelyResetItem(arr, o, silent));
    }
  } else console.error("Couldn't find option", id);
}
این تابع مقدار symptom و تمام فرزندان آن را به undefined برمی‌گرداند.
ج) تابع updateSymptom:
export function updateSymptom(arr: ISymptom[], id: string, value: ISymptom["value"], silent?: boolean) {
  const item = arr.find((i) => i.id === id);
  if (!item) {
    console.error("Couldnt find item", id);
    return;
  }
  // NOTICE Quick fix: I excluded inputs from reseting - the reason why I did this is that, the input items don't have children.
  const { hasInput } = digestSymptom(item);
  // if unset occured and has options -> reset item -r
  if (!value && !hasInput) recursivelyResetItem(arr, item.id, silent);
  // update/reset value
  if (!silent) console.log("Updating", id, value);
  item.value = value;
  recursivelyUpdateParents(arr, item.id, silent);
}
هنگام به‌روزرسانی یک symptom، recursivelyUpdateParents فراخوانی می‌شود که به صورت خودکار siblings را ریست می‌کند.
6. محل تعریف در کد
ساختار Enum Parents: src/data/symptoms.ts
corital-bone (خط ~698)
int-struct (خط ~542)
ana-location (خط ~438)
radiopaque (خط ~549)
unilocular (خط ~572)
onset-course (خط ~179)
منطق جلوگیری از تضاد: src/lib/symptoms.ts
updateSymptom (خط ~97)
recursivelyUpdateParents (خط ~80)
recursivelyResetItem (خط ~58)
تولید قواعد برای AI: server/swagger.ts
getSiblings (خط ~9)
genEnumWarning (خط ~16)
قواعد در System Prompt: server/INSTRUCT.md, server/GPTTOOL.md
استفاده در UI: src/components/Symptom.tsx
با فراخوانی updateSymptom از useBufferStore
7. نکات مهم
فقط Enum Parents: تنها والدهایی با type === SymptomType.Enum این رفتار را دارند
ریست بازگشتی: ریست کردن یک symptom باعث ریست شدن تمام فرزندان آن نیز می‌شود
به‌روزرسانی والد: والد Enum بر اساس مقدار فرزندان به‌روزرسانی می‌شود (اگر حداقل یک فرزند مقدار داشته باشد، والد true می‌شود)
بدون هشدار: چون تضاد رخ نمی‌دهد، نیازی به نمایش هشدار یا دیالوگ نیست

ضمیمه 10: فرمول اجرایی دقیق
1. فرمول Naive Bayes
فرمول اصلی Naive Bayes با جمع لاگ احتمالات:
P(Di|S) = [P(Di) × ∏j P(Sj|Di)] / [Σi P(Di) × ∏j P(Sj|Di)]
نمادها:
P(Di): احتمال پیشین بیماری i
P(Sj|Di): احتمال شرطی ویژگی j در صورت وجود بیماری i
∏j: حاصل‌ضرب احتمالات تمام ویژگی‌های مشاهده شده
Σi: جمع احتمالات برای تمام بیماری‌ها
2. Laplace Smoothing
برای جلوگیری از صفر شدن احتمالات، از Laplace Smoothing استفاده می‌شود:
P(Sj|Di) = (count(Sj, Di) + ε) / (count(Di) + ε × |S|)
پارامترها:
ε (epsilon): مقدار smoothing = 0.01
|S|: تعداد کل ویژگی‌ها = 93
در کد:
export const epsilon = 0.01; // NOTICE: lower number may cause NaN issue

const getRate = (rate: number) => (rate === -1 ? epsilon : rate);
3. محاسبه در دو مسیر
الف) Pattern Match (تطابق الگو):
P(Di) = 1/N  (توزیع یکنواخت)

که در آن N = تعداد کل بیماری‌ها (19)
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
ب) Prevalence Match (تطابق شیوع):
P(Di) = prevalence_rate  (از ماتریس دانش)

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
4. محاسبه نهایی
Pattern Match:
const nominators: number[] = diseases.map(disease => 
  getDiseaseProbability_FIX_FRAC(disease, symptoms)
);
const denominator = nominators.reduce((a, b) => calc(a + b), 0);

const probabilities = diseases.map((disease, i) => ({
  ...disease,
  value: calc(nominators[i] / denominator)  // P(Di|S) برای Pattern Match
}));
Prevalence Match:
const pnominators: number[] = diseases.map(disease =>
  calc(disease.preval * getDiseaseProbability_FIX_FRAC(disease, symptoms))
);
const pdenominator = pnominators.reduce((a, b) => calc(a + b), 0);

const probabilities = diseases.map((disease, i) => ({
  ...disease,
  pvalue: calc(pnominators[i] / pdenominator)  // P(Di|S) برای Prevalence Match
}));
5. FIX_FRAC
برای جلوگیری از اعداد خیلی کوچک:
const FIX_FRAC = 100;

const getDiseaseProbability_FIX_FRAC = (disease: IDisease, symptoms: ISymptom[]): number =>
  getDiseaseProbability(disease, symptoms) * FIX_FRAC;
6. تابع calc
برای محاسبات دقیق و جلوگیری از خطاهای floating point:
function calc(value: number): number {
  // استفاده از کتابخانه‌ای برای محاسبات دقیق
  // یا گرد کردن به تعداد اعشار مشخص
  return Math.round(value * 10000) / 10000;
}
7. جایگاه ε در محاسبه
الف) در getRate:
const getRate = (rate: number) => (rate === -1 ? epsilon : rate);
اگر rate = -1 (غیرفعال) → تبدیل به epsilon
در غیر این صورت → استفاده از rate اصلی
ب) در getSymptomProbability:
const getSymptomProbability = (factor: IDiseaseFactor, symptoms: ISymptom[]) => {
  // ...
  if (symptom.value) {
    return getRate(factor.rate!);  // استفاده از epsilon برای -1
  }
  return epsilon;  // در صورت عدم وجود مقدار
};
ج) جلوگیری از صفر شدن:
// بدون epsilon: اگر یک ویژگی false باشد → کل صورت کسر صفر می‌شود
// با epsilon: حتی اگر ویژگی false باشد → مقدار epsilon استفاده می‌شود
8. مثال محاسبه کامل
ورودی:
const symptoms = [
  { id: "pat-age", value: 32, type: SymptomType.Number },
  { id: "pat-female", value: true, type: SymptomType.Boolean },
  { id: "corticated", value: true, type: SymptomType.Boolean },
  { id: "mandible", value: { a: 4, b: 5 }, type: SymptomType.Range }
];
برای بیماری "Dentigerous Cyst":
محاسبه Pattern Match:
P(D) = 1/19 = 0.0526
محاسبه ∏j P(Sj|Di):
P(pat-age=32|D): تطابق با range [20-60] → rate = 0.75
P(pat-female|D): rate = 0.45
P(corticated|D): rate = 0.85
P(mandible={4,5}|D): تطابق با range [3-12] → rate = 0.12
صورت کسر:
= 0.0526 × 0.75 × 0.45 × 0.85 × 0.12 × 100
= 0.0526 × 0.034425 × 100
= 0.1811


محاسبه برای تمام بیماری‌ها و جمع‌بندی:
denominator = Σi (صورت کسر برای تمام بیماری‌ها)


احتمال نهایی:
P(Dentigerous Cyst|S) = 0.1811 / denominator


محاسبه Prevalence Match:
P(D) = 0.15 (prevalence از ماتریس دانش)
صورت کسر:
= 0.15 × 0.75 × 0.45 × 0.85 × 0.12 × 100
= 0.15 × 0.034425 × 100
= 0.5164


احتمال نهایی:
P(Dentigerous Cyst|S) = 0.5164 / pdenominator


10. محل تعریف
فایل: src/lib/scores.ts
epsilon: خط 11 (export const epsilon = 0.01)
FIX_FRAC: خط 65 (const FIX_FRAC = 100)
تابع اصلی: getScores()

ضمیمه 16: سیاست نگهداشت و حذف داده‌ها
1. نگهداشت
الف) مدت زمان:
نامحدود: تا زمان حذف دستی توسط کاربر
ذخیره محلی: در LocalStorage مرورگر
Backup: امکان دانلود فایل backup
ب) نسخه‌بندی:
interface IHistoryItem {
  uuid: string;
  symptoms: ISymptom[];
  scores: IDiseaseScored[] | null;
  hash: string;
  hash2: string;
  createdAt: number;
  updatedAt: number;
  v: string;  // نسخه نرم‌افزار
  // ...
}
ج) Migration:
function migration(item: IHistoryItem, index: number) {
  // تبدیل داده‌های قدیمی به فرمت جدید
  if (item.v < VERSION) {
    // اعمال تغییرات schema
    item.v = VERSION;
    // تبدیل داده‌ها
    item.symptoms = migrateSymptoms(item.symptoms, item.v);
  }
}
2. حذف
الف) حذف دستی:
function removeHistory(uuid: string) {
  set((state) => ({
    history: state.history.filter((item) => item.uuid !== uuid)
  }));
}
ب) حذف خودکار:
تصاویر استفاده نشده: پس از 30 روز از Cloudinary حذف می‌شوند
Draft Records: امکان حذف خودکار پس از مدت زمان مشخص
34. کنترل دسترسی
الف) سطح دسترسی:
کاربر محلی: دسترسی کامل به داده‌های خود
بدون احراز هویت: داده‌ها در LocalStorage ذخیره می‌شوند
ب) اشتراک‌گذاری:
// استفاده از Web Share API
async function shareRecord(record: IHistoryItem) {
  if (navigator.share) {
    await navigator.share({
      title: `Record: ${record.patName}`,
      text: JSON.stringify(record),
      url: window.location.href
    });
  }
}
5. نسخه‌بندی اسکیما
الف) Version Field:
const VERSION = "1.0.0";

interface IHistoryItem {
  v: string;  // نسخه
  // ...
}
ب) Migration Scripts:
function migrateData(oldData: any, fromVersion: string, toVersion: string): any {
  // تبدیل داده‌های قدیمی به فرمت جدید
  if (fromVersion === "0.9.0" && toVersion === "1.0.0") {
    // تغییرات schema
    return {
      ...oldData,
      v: toVersion,
      // تبدیل فیلدها
    };
  }
  return oldData;
}
ج) Schema Evolution:
// مثال: اضافه شدن فیلد جدید
interface IHistoryItemV1 {
  v: "1.0.0";
  uuid: string;
  symptoms: ISymptom[];
  // فیلد جدید
  metadata?: any;
}
6. بازتولید نتایج
الف) ذخیره احتمالات:
interface IHistoryItem {
  scores: IDiseaseScored[] | null;  // احتمالات محاسبه شده
  hash2: string;  // hash از scores برای یکپارچگی
}
ب) بازتولید:
function reproduceResults(record: IHistoryItem): IDiseaseScored[] {
  // اگر scores موجود باشد
  if (record.scores) {
    // بررسی یکپارچگی
    const currentHash = sha256(JSON.stringify(record.scores)).toString();
    if (currentHash === record.hash2) {
      return record.scores;  // استفاده از نتایج ذخیره شده
    }
  }
  
  // محاسبه مجدد
  return getScores({
    diseases: getDiseases(),
    symptoms: record.symptoms
  });
}
7. Backup و Restore
الف) Export:
function exportHistory(history: IHistoryItem[]): void {
  const dataStr = JSON.stringify(history, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `orda-backup-${Date.now()}.json`;
  link.click();
}
ب) Import:
function importHistory(file: File): Promise<IHistoryItem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const history = JSON.parse(e.target?.result as string);
        // اعتبارسنجی و migration
        const migrated = history.map((item: IHistoryItem) => 
          migration(item, 0)
        );
        resolve(migrated);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsText(file);
  });
}

ضمیمه 17: قرارداد API افزونه‌ها (Features/Extensions)
سیستم افزونه‌ها در این پروژه به صورت Features یا Extensions پیاده‌سازی شده است. این سیستم امکان اضافه کردن کامپوننت‌های سفارشی به علائم (symptoms) را فراهم می‌کند.
1. ساختار کلی
سیستم افزونه‌ها بر اساس یک الگوی ساده و مستقیم کار می‌کند:
تعریف Feature: هر افزونه یک شناسه یکتا در enum Feature دارد
ثبت در Router: کامپوننت Features به عنوان router عمل می‌کند
ارتباط با Symptom: از طریق desc.feature در تعریف symptom
اجرای کامپوننت: کامپوننت مربوطه render می‌شود
فایل‌های مرتبط:
src/types/index.ts: تعریف Feature enum و Desc type
src/components/Features.tsx: کامپوننت router/dispatcher
src/components/Symptom.tsx: استفاده از Features در render symptom
src/data/symptoms.ts: تعریف symptoms با feature
2. نحوه کار
کامپوننت Features در src/components/Features.tsx به صورت یک switch statement عمل می‌کند:
مقدار feature را از props دریافت می‌کند
بر اساس مقدار، کامپوننت مناسب را load و render می‌کند
برای افزونه‌های بزرگ از lazy loading استفاده می‌کند
برای نمایش loading state از React Suspense استفاده می‌کند
برای استفاده از یک افزونه در یک symptom، در src/data/symptoms.ts فیلد desc را با feature تنظیم کنید. هنگام render کردن symptom، اگر desc.feature وجود داشته باشد، کامپوننت Features فراخوانی می‌شود و افزونه مربوطه نمایش داده می‌شود.
3. افزونه‌های موجود
DuplicateNameChecker
مسیر: src/components/DupNameChecker.tsx
عملکرد: برای فیلد نام بیمار استفاده می‌شود. نام وارد شده را در history جستجو می‌کند و اگر نام مشابهی پیدا شود (حداقل 3 کاراکتر)، لینکی نمایش می‌دهد که با کلیک روی آن، رکورد قبلی در buffer بارگذاری می‌شود.
استفاده در: pat-name symptom
DentPicker
مسیر: src/components/DentPicker.tsx
عملکرد: رابط گرافیکی برای انتخاب موقعیت آناتومیک ضایعه. یک تصویر رادیوگرافی پانورامیک با نقاط قابل کلیک نمایش می‌دهد. کاربر با کلیک روی دو نقطه، یک بازه (range) انتخاب می‌کند که به صورت خودکار در maxilla، mandible، یا both ذخیره می‌شود.
استفاده در: location symptom
ImagePicker
مسیر: src/components/ImagePicker.tsx
عملکرد: سیستم آپلود و مدیریت تصاویر رادیوگرافی. از FilePond برای drag-and-drop استفاده می‌کند. حداکثر 10 فایل (هر کدام 1.5MB) را پشتیبانی می‌کند. قبل از آپلود، hash SHA-256 محاسبه می‌شود تا از duplicate upload جلوگیری شود. تصاویر به Cloudinary آپلود می‌شوند.
استفاده در: pat-images symptom
4. راهنمای ساخت افزونه جدید
برای ساخت یک افزونه جدید:
تعریف Feature Enum: در src/types/index.ts، یک شناسه جدید به Feature enum اضافه کنید
ساخت کامپوننت: در src/components/ یک کامپوننت React بسازید که به صورت default export شود. می‌تواند از hooks برای دسترسی به store استفاده کند.
ثبت در Router: در src/components/Features.tsx، import کامپوننت جدید و یک case جدید در switch statement اضافه کنید
استفاده در Symptom: در src/data/symptoms.ts، در فیلد desc، feature را تنظیم کنید
5. API در دسترس
Store Hooks (از src/store/):
useBufferStore(): دسترسی به buffer store
symptoms: لیست symptoms فعلی
updateSymptom(id, value): به‌روزرسانی مقدار symptom
loadHistoryItem(item, overwrite): بارگذاری رکورد از history
toggleExpanded(id, open): باز/بسته کردن symptom
usePersistStore(): دسترسی به persist store
history: لیست رکوردهای ذخیره شده
addHistory(items): اضافه کردن رکورد
removeHistory(uuid): حذف رکورد
Utility Hooks (از src/hooks/):
useSymptomValue<T>(id): خواندن مقدار symptom
getSymptomValueById<T>(symptoms, id): خواندن مقدار از لیست
Utility Functions (از src/lib/):
parseImages / stringifyImages: تبدیل بین string و array
makeUploadRequest / makeDeleteRequest: ارتباط با Cloudinary
