# ضمیمه 4: پروتکل فراخوانی LLM

## 1. نوع پرامپت/سیستم پرامپت

### System Prompt:
```
You are an expert assistant for extracting pathological data from clinical notes about jaw bone lesions. Your role is to extract only positive findings and omit negative or absent findings. Extract data according to the provided API schema.
```

### User Prompt:
متن بالینی ورودی کاربر که شامل توصیف بیمار و ضایعه است.

## 2. Function Calling

### استفاده از OpenAI Assistant API:
- **API Type**: OpenAI Assistant API (نه Chat Completion)
- **Model**: `gpt-4` یا `gpt-4-turbo`
- **Function Calling**: فعال

### Schema Definition:
```json
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
```

### محل تعریف Schema:
- فایل: `server/swagger.ts`
- استاندارد: OpenAPI 3.1.0
- تولید خودکار: از `src/data/symptoms.ts`

## 3. پارامترهای Top-p

### تنظیمات:
```javascript
const openAIConfig = {
  model: "gpt-4",
  temperature: 0.1,  // کاهش خلاقیت، افزایش دقت
  top_p: 0.9,        // کنترل تنوع خروجی
  max_tokens: 2000,
  frequency_penalty: 0.0,
  presence_penalty: 0.0
};
```

### توضیحات:
- **Temperature: 0.1**: برای کاهش خلاقیت و افزایش دقت در استخراج داده
- **Top-p: 0.9**: برای کنترل تنوع خروجی و حفظ دقت
- **Max Tokens: 2000**: برای پاسخ‌های کامل

## 4. قیود تکرارپذیری

### Deterministic Mode:
```javascript
const config = {
  seed: 42,  // Seed ثابت برای نتایج قابل تکرار
  temperature: 0.1  // دما پایین برای تکرارپذیری بیشتر
};
```

### محدودیت‌ها:
- تکرارپذیری کامل در LLM‌ها ممکن نیست
- با Temperature پایین و Seed ثابت، تکرارپذیری افزایش می‌یابد
- برای تست‌های دقیق، از Test Cases با خروجی‌های شناخته شده استفاده می‌شود

## 5. سیاست Retry و Fallback

### Retry Policy:
```javascript
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
```

### Fallback Strategy:
```javascript
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
```

### Timeout:
- **Timeout**: 30 ثانیه
- در صورت timeout، Fallback به حالت دستی فعال می‌شود

## 6. Error Handling

### انواع خطاها:

#### 1. Network Error:
- Retry با exponential backoff
- پس از 3 تلاش ناموفق → Fallback

#### 2. API Error (Rate Limit):
- Retry با delay بیشتر
- پس از 5 دقیقه → Retry مجدد

#### 3. Invalid Response:
- Validation بر روی خروجی
- در صورت نامعتبر بودن → Retry یا Fallback

### کد نمونه:
```javascript
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
```

## 7. Cost Optimization

### استراتژی‌های بهینه‌سازی هزینه:

1. **Caching**: ذخیره نتایج استخراج برای متن‌های مشابه
2. **Batch Processing**: پردازش چندین درخواست به صورت batch
3. **Token Optimization**: استفاده از System Prompt کوتاه‌تر
4. **Selective Extraction**: استخراج فقط ویژگی‌های ضروری

## 8. Monitoring و Logging

### لاگ‌های ثبت شده:
```javascript
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
```

### Metrics:
- تعداد درخواست‌ها
- نرخ موفقیت
- زمان پاسخ
- هزینه هر درخواست
- نرخ خطا

## 9. Security

### API Key Management:
- ذخیره API Key در Environment Variables
- عدم ارسال Key به کلاینت
- استفاده از Backend Proxy

### Data Privacy:
- عدم ذخیره متن‌های بالینی در لاگ‌های OpenAI
- حذف داده‌های حساس قبل از ارسال (در صورت نیاز)
- رعایت HIPAA Compliance

## 10. Integration با سیستم

### جریان کار:
1. کاربر متن بالینی را وارد می‌کند
2. Frontend متن را به Backend ارسال می‌کند
3. Backend متن را به OpenAI API ارسال می‌کند
4. OpenAI با Function Calling داده‌ها را استخراج می‌کند
5. Backend خروجی را اعتبارسنجی می‌کند
6. Frontend نتایج را به کاربر نمایش می‌دهد
7. کاربر نتایج را تأیید یا ویرایش می‌کند

### محل پیاده‌سازی:
- **Backend**: `server/index.ts`
- **Frontend**: `src/components/AIForm.tsx`
- **Configuration**: Environment Variables

