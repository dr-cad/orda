# ضمیمه 5: منطق ادغام داده استخراج‌شده با ورودی دستی

## 1. حل تعارض‌ها (Conflict Resolution)

### استراتژی اولویت:
```
ورودی دستی کاربر > داده استخراج شده توسط AI
```

### منطق:
```javascript
function mergeData(aiData, manualData) {
  const merged = {};
  
  // اولویت با داده دستی
  Object.keys(manualData).forEach(key => {
    if (manualData[key] !== undefined && manualData[key] !== null) {
      merged[key] = manualData[key];
      merged[`${key}_source`] = 'manual';
    }
  });
  
  // سپس داده AI (فقط برای کلیدهای بدون مقدار دستی)
  Object.keys(aiData).forEach(key => {
    if (!merged[key] && aiData[key] !== undefined) {
      merged[key] = aiData[key];
      merged[`${key}_source`] = 'ai';
    }
  });
  
  return merged;
}
```

## 2. قواعد اولویت‌دهی

### سطوح اولویت:

#### سطح 1: ورودی دستی کاربر (بالاترین اولویت)
- اگر کاربر مقدار را دستی تغییر دهد → استفاده از مقدار دستی
- مقدار دستی به عنوان **Ground Truth** در نظر گرفته می‌شود

#### سطح 2: داده تأیید شده AI
- اگر AI مقدار پیشنهادی دهد و کاربر تأیید کند → استفاده از مقدار AI
- پس از تأیید، مقدار AI به بافر اضافه می‌شود

#### سطح 3: داده پیشنهادی AI (بدون تأیید)
- اگر AI مقدار پیشنهادی دهد و کاربر تأیید نکند → حذف مقدار
- مقدار پیشنهادی در UI نمایش داده می‌شود اما در بافر ذخیره نمی‌شود

### مثال:
```javascript
// حالت 1: کاربر دستی تغییر می‌دهد
aiData = { pain_0: true };
userData = { pain_0: false };
result = { pain_0: false, pain_0_source: 'manual' };

// حالت 2: کاربر تأیید می‌کند
aiData = { swelling: true };
userConfirms = true;
result = { swelling: true, swelling_source: 'ai_confirmed' };

// حالت 3: کاربر تأیید نمی‌کند
aiData = { trismus: true };
userConfirms = false;
result = {}; // حذف از خروجی
```

## 3. Merge Rules

### Union Strategy:
- ادغام ویژگی‌های مثبت از هر دو منبع
- ویژگی‌های منفی از خروجی حذف می‌شوند (Positive-Only)

### Conflict Resolution:
```javascript
function resolveConflict(aiValue, manualValue) {
  // اگر هر دو مقدار وجود دارند
  if (aiValue !== undefined && manualValue !== undefined) {
    // اولویت با مقدار دستی
    return {
      value: manualValue,
      source: 'manual_override',
      conflict: true
    };
  }
  
  // اگر فقط یکی وجود دارد
  return {
    value: aiValue || manualValue,
    source: aiValue ? 'ai' : 'manual',
    conflict: false
  };
}
```

### Sparse Data Strategy:
- تنها ویژگی‌های مثبت (true یا مقدار عددی > 0) ذخیره می‌شوند
- ویژگی‌های منفی یا null از payload حذف می‌شوند
- این رویکرد حجم داده را بهینه می‌کند

## 4. پشتیبانی از چند زبان

### تشخیص زبان:
```javascript
function detectLanguage(text) {
  const persianPattern = /[\u0600-\u06FF]/;
  return persianPattern.test(text) ? 'fa' : 'en';
}
```

### پردازش چندزبانه:
```javascript
function processMultilingual(text) {
  const language = detectLanguage(text);
  
  // استخراج با توجه به زبان
  const extracted = language === 'fa' 
    ? extractPersian(text)
    : extractEnglish(text);
  
  // نگاشت به شناسه‌های استاندارد (SId)
  return mapToStandardIds(extracted, language);
}
```

### نگاشت خودکار:
- هر زبان به شناسه‌های استاندارد (SId) نگاشت می‌شود
- مثال: "درد" (فارسی) و "pain" (انگلیسی) → `pain_0`

## 5. جریان کار ادغام

### مرحله 1: استخراج توسط AI
```javascript
const aiExtracted = await extractWithAI(clinicalText);
// نتیجه: { pat_age: 24, pat_female: true, swelling: true, ... }
```

### مرحله 2: نمایش به کاربر
```javascript
// UI نمایش داده‌های استخراج شده
<ExtractionReview 
  data={aiExtracted}
  onConfirm={handleConfirm}
  onEdit={handleEdit}
/>
```

### مرحله 3: تأیید/ویرایش کاربر
```javascript
function handleConfirm(aiData) {
  // کاربر تأیید می‌کند
  mergeToBuffer(aiData, { source: 'ai_confirmed' });
}

function handleEdit(editedData) {
  // کاربر ویرایش می‌کند
  mergeToBuffer(editedData, { source: 'manual' });
}
```

### مرحله 4: ادغام نهایی
```javascript
function mergeToBuffer(newData, metadata) {
  const currentBuffer = getBuffer();
  const merged = mergeData(newData, currentBuffer);
  
  // ذخیره در بافر
  updateBuffer(merged);
}
```

## 6. مثال عملی

### ورودی AI:
```json
{
  "pat_age": 24,
  "pat_female": true,
  "swelling": true,
  "pain_0": true
}
```

### ویرایش دستی کاربر:
- کاربر `pain_0` را به `false` تغییر می‌دهد
- کاربر `trismus` را به صورت دستی اضافه می‌کند

### نتیجه نهایی:
```json
{
  "pat_age": 24,
  "pat_female": true,
  "swelling": true,
  "pain_0": false,
  "trismus": true,
  "_metadata": {
    "pat_age": "ai_confirmed",
    "pat_female": "ai_confirmed",
    "swelling": "ai_confirmed",
    "pain_0": "manual_override",
    "trismus": "manual"
  }
}
```

## 7. اعتبارسنجی پس از ادغام

### قواعد اعتبارسنجی:
```javascript
function validateMergedData(data) {
  const errors = [];
  
  // بررسی فیلدهای اجباری
  if (!data.pat_age) errors.push("سن الزامی است");
  if (!data.pat_name) errors.push("نام الزامی است");
  
  // بررسی تعارض‌ها
  if (data.pat_male && data.pat_female) {
    errors.push("جنسیت نمی‌تواند هم مرد و هم زن باشد");
  }
  
  // بررسی دامنه مقادیر
  if (data.pat_age < 0 || data.pat_age > 120) {
    errors.push("سن باید بین 0 تا 120 باشد");
  }
  
  return errors;
}
```

## 8. UI/UX برای ادغام

### نمایش در رابط کاربری:
1. **صفحه بررسی استخراج**: نمایش داده‌های استخراج شده توسط AI
2. **قابلیت ویرایش**: امکان تغییر هر مقدار
3. **نشانگر منبع**: نمایش منبع هر مقدار (AI یا Manual)
4. **دکمه تأیید**: تأیید و انتقال به بافر
5. **دکمه Retry**: درخواست استخراج مجدد

### مثال UI:
```
┌─────────────────────────────────────┐
│ داده‌های استخراج شده توسط AI        │
├─────────────────────────────────────┤
│ سن: 24                    [AI]      │
│ جنسیت: زن                 [AI]      │
│ تورم: ✓                   [AI]      │
│ درد: ✗                    [Manual]  │
│                                     │
│ [ویرایش] [تأیید] [بازگشت]          │
└─────────────────────────────────────┘
```

