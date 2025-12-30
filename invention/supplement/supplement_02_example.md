# ضمیمه 2: نمونه واقعی ورودی متن بالینی و خروجی ساختاریافته

## ورودی: متن بالینی

```
24 old female with report of swelling or pain which she reported gradually increased in 2years. The lesion was hard on palpation. Panoramic findings illustrates unilateral, solitary, mixed radiolucent and radiopaque non-odontogenic lesion with irregular, ill-defined border.
```

## خروجی: JSON ساختاریافته

```json
{
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
}
```

## توضیحات نگاشت

| متن بالینی | شناسه ویژگی | مقدار |
|------------|--------------|-------|
| "24 old female" | `pat_age` | 24 |
| "female" | `pat_female` | true |
| "swelling or pain" | `swelling`, `pain_0` | true, true |
| "gradually increased in 2years" | `slow_0` | true |
| "hard on palpation" | `bony_hard` | true |
| "unilateral" | `unilateral_right` | true |
| "solitary" | `solitary` | true |
| "mixed radiolucent and radiopaque" | `mixed` | true |
| "irregular, ill-defined border" | `irregular`, `blending` | true, true |

## نمونه دیگر: ورودی فارسی

```
بیمار 32 ساله زن، بدون بیماری سیستمیک یا درد، به صورت اتفاقی پس از گرفتن رادیوگراف، ضایعه‌ای در مندیبل چپ حدود دو ماه پیش تشخیص داده شد. در تصویر پانورامیک، ضایعه رادیولوسنت با مرز کورتیکال و تعریف شده در سمت چپ مندیبل، مرتبط با ناحیه پری‌کورونال دندان مولر سوم مشاهده می‌شود. ضایعه گسترش استخوانی نشان می‌دهد اما باعث گسترش استخوانی نشده است.
```

## خروجی متناظر

```json
{
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
}
```

## استراتژی استخراج

سیستم از استراتژی "Positive-Only" استفاده می‌کند:
- **فقط ویژگی‌های مثبت** استخراج می‌شوند
- ویژگی‌های منفی یا ناموجود از خروجی حذف می‌شوند
- این رویکرد حجم payload را بهینه می‌کند

## Metadata

هر خروجی شامل metadata زیر است:

```json
{
  "Meta_Data": {
    "AI_Confidence": 0.98,
    "Status": "Pending_User_Confirmation",
    "Extraction_Method": "OpenAI_Assistant_API",
    "Language": "English"
  }
}
```

