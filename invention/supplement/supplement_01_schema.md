# ضمیمه 1: اسکیما/مدل داده دقیق

## طرحواره داده سیستم

طرحواره داده سیستم به صورت JSON و بر اساس استاندارد OpenAPI 3.1.0 تعریف شده است. ساختار کامل در فایل `server/swagger.ts` موجود است.

## ساختار کلی OpenAPI Schema

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Jaw bone lesion detection app",
    "version": "1.0.2"
  },
  "components": {
    "schemas": {
      "Symptoms": {
        "type": "object",
        "properties": {
          "pat_age": {
            "type": "integer",
            "format": "int32",
            "description": "سن بیمار",
            "minimum": 0,
            "maximum": 120
          },
          "pat_male": {
            "type": "boolean",
            "description": "جنسیت: مرد"
          },
          "pat_female": {
            "type": "boolean",
            "description": "جنسیت: زن"
          },
          "mandible": {
            "type": "object",
            "properties": {
              "a": {
                "type": "integer",
                "title": "from",
                "description": "From: Starting point number of the specific region"
              },
              "b": {
                "type": "integer",
                "title": "to",
                "description": "To: Finishing point number of the specific region"
              }
            }
          },
          "maxilla": {
            "type": "object",
            "properties": {
              "a": {"type": "integer"},
              "b": {"type": "integer"}
            }
          },
          "pain_0": {
            "type": "boolean",
            "description": "pain (facial or tooth or general pain)"
          },
          "swelling": {
            "type": "boolean",
            "description": "swelling or asymmetry of face"
          },
          "corticated": {
            "type": "boolean",
            "description": "corticated border"
          },
          "radiolucent": {
            "type": "boolean",
            "description": "radiolucent internal structure"
          },
          "radiopaque": {
            "type": "boolean",
            "description": "radiopaque internal structure"
          },
          "mixed": {
            "type": "boolean",
            "description": "mixed radiolucent and radiopaque"
          }
        }
      }
    }
  }
}
```

## انواع داده‌ها

### 1. Boolean
- **نوع**: `boolean`
- **استفاده**: برای ویژگی‌های دو حالته (وجود/عدم وجود)
- **مثال**: `pat_male`, `pain_0`, `swelling`

### 2. Integer
- **نوع**: `integer`
- **فرمت**: `int32`
- **دامنه**: بسته به ویژگی (مثلاً سن: 0-120)
- **مثال**: `pat_age`

### 3. String
- **نوع**: `string`
- **استفاده**: برای متن‌های آزاد
- **مثال**: `pat_name`

### 4. Object (Range)
- **نوع**: `object`
- **ویژگی‌ها**: `{a: integer, b: integer}`
- **استفاده**: برای بازه‌های عددی (مثلاً موقعیت ضایعه)
- **مثال**: `mandible`, `maxilla`

### 5. Enum
- **نوع**: `boolean` (هر گزینه به صورت جداگانه)
- **استفاده**: برای انتخاب‌های چندگزینه‌ای
- **مثال**: `slow_0`, `moderate_0`, `rapid_0`

## قواعد اعتبارسنجی

1. **فیلدهای اجباری (Required)**:
   - `pat_age`: الزامی
   - `pat_name`: الزامی
   - `pat_gender`: الزامی (یکی از `pat_male` یا `pat_female`)
   - `pat_images`: الزامی

2. **دامنه مقادیر**:
   - سن: 0 ≤ age ≤ 120
   - موقعیت دندان: 1 ≤ a, b ≤ 32

3. **قواعد تعارض**:
   - `pat_male` و `pat_female`: فقط یکی می‌تواند true باشد
   - `radiolucent`, `radiopaque`, `mixed`: فقط یکی می‌تواند true باشد
   - `slow_0`, `moderate_0`, `rapid_0`: فقط یکی می‌تواند true باشد

## محل تعریف

- **فایل اصلی**: `server/swagger.ts`
- **تولید خودکار**: از `src/data/symptoms.ts` تولید می‌شود
- **استاندارد**: OpenAPI 3.1.0 Specification

