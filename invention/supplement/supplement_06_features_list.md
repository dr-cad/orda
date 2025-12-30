# ضمیمه 6: فهرست کامل 93 ویژگی

## ساختار کلی

فهرست کامل 93 ویژگی در فایل `src/data/symptoms.ts` تعریف شده است. هر ویژگی دارای:
- **شناسه یکتا (SId)**: رشته منحصر به فرد
- **نام (name)**: نام فارسی/انگلیسی
- **نوع (type)**: Boolean, Number, String, Enum, Range
- **الزامی بودن (required)**: true/false
- **دامنه مقادیر**: برای Number (min, max)، برای Range (a, b)
- **نگاشت به مدل بیزی**: در فایل `src/data/diseases.ts`

## صفحه 1: اطلاعات دموگرافیک (4 ویژگی)

| شناسه | نام | نوع | الزامی | دامنه | نگاشت بیزی |
|-------|-----|-----|--------|-------|------------|
| `pat-name` | نام کامل | String | ✓ | - | - |
| `pat-age` | سن | Number | ✓ | 0-120 | `pat-age` ranges |
| `pat-gender` | جنسیت | Enum | ✓ | male/female | `pat-male`, `pat-female` |
| `pat-images` | تصاویر پانورامیک | String | ✓ | - | - |

## صفحه 2: شکایت اصلی (7 ویژگی)

| شناسه | نام | نوع | الزامی | نگاشت بیزی |
|-------|-----|-----|--------|------------|
| `pain-0` | درد | Boolean | - | `pain-0` |
| `fever-illness` | تب و بیماری | Boolean | - | `fever-illness` |
| `paresth-anes` | پارستزی و آنستزی | Boolean | - | `paresth-anes` |
| `bleeding` | خونریزی لثه | Boolean | - | `bleeding` |
| `purulent` | ترشح چرکی | Boolean | - | `purulent` |
| `swelling` | تورم | Boolean | - | `swelling` |
| `trismus` | تریسموس | Boolean | - | `trismus` |

## صفحه 3: تاریخچه و یافته‌های بالینی (30+ ویژگی)

### شروع و سیر:
| شناسه | نام | نوع | نگاشت بیزی |
|-------|-----|-----|------------|
| `slow-0` | کند (ماه‌ها تا سال‌ها) | Boolean | `slow-0` |
| `moderate-0` | متوسط (هفته‌ها) | Boolean | `moderate-0` |
| `rapid-0` | سریع (روزها) | Boolean | `rapid-0` |

### قوام:
| شناسه | نام | نوع | نگاشت بیزی |
|-------|-----|-----|------------|
| `soft` | نرم | Boolean | `soft` |
| `rubbery` | لاستیکی | Boolean | `rubbery` |
| `firm` | محکم | Boolean | `firm` |
| `bony-hard` | سخت استخوانی | Boolean | `bony-hard` |

### سایر ویژگی‌های بالینی:
- `nonvital`, `soft-tissue`, `hemorrhage`, `pain-1`, `pump`, `negative`, `blood`, `serosanguinous`, `serum`, `cheesy-mat`, `pus`, `auscultation`, `size` (Number), `round`, `scalloped`, `irregular`, `non-corticated`, `corticated`, `sclerotic`, `soft-capsule`, `blending`, `invasive`

## صفحه 4: معاینات بالینی تکمیلی (20+ ویژگی)

### ظاهر:
- `appearance-*` (انواع مختلف ظاهر)

### سایر معاینات:
- `lymph`, `impact`, `history-of-surgery`, `increase-1`, `decrease-1`, `increase-2`, `decrease-2`, `increase-3`, `decrease-3`, `hist-radio`, `mobile-teeth`

## صفحه 5: یافته‌های تصویربرداری (30+ ویژگی)

### ساختار داخلی:
| شناسه | نام | نوع | نگاشت بیزی |
|-------|-----|-----|------------|
| `radiolucent` | رادیولوسنت | Boolean | `radiolucent` |
| `radiopaque` | رادیواپک | Boolean | `radiopaque` |
| `mixed` | ترکیبی | Boolean | `mixed` |

### مرز:
| شناسه | نام | نوع | نگاشت بیزی |
|-------|-----|-----|------------|
| `corticated` | کورتیکال | Boolean | `corticated` |
| `non-corticated` | غیر کورتیکال | Boolean | `non-corticated` |
| `sclerotic` | اسکلروتیک | Boolean | `sclerotic` |
| `blending` | مخلوط | Boolean | `blending` |
| `invasive` | تهاجمی | Boolean | `invasive` |

### موقعیت:
| شناسه | نام | نوع | نگاشت بیزی |
|-------|-----|-----|------------|
| `mandible` | مندیبل | Range | `mandible` ranges |
| `maxilla` | ماگزیلا | Range | `maxilla` ranges |
| `both` | هر دو | Range | `both` ranges |

### طرف:
| شناسه | نام | نوع | نگاشت بیزی |
|-------|-----|-----|------------|
| `unilateral-left` | یک‌طرفه چپ | Boolean | `unilateral-left` |
| `unilateral-right` | یک‌طرفه راست | Boolean | `unilateral-right` |
| `bilateral` | دوطرفه | Boolean | `bilateral` |

### سایر ویژگی‌های رادیولوژیک:
- `solitary`, `multilocular`, `pericoronal`, `related`, `extend`, `expand`, `destruct-3`, `dura`, `uni1`, `uni2`, `radiopaque-zone`, `radiopaque-nozone`

## نگاشت به مدل بیزی

هر ویژگی در فایل `src/data/diseases.ts` به صورت زیر نگاشت می‌شود:

```typescript
{
  id: "radicular",
  name: "Radicular Cyst",
  preval: 0.25,
  factors: [
    {
      sid: "pat-age",
      ranges: [
        { a: 20, b: 60, rate: 0.75 },
        { a: 15, b: 75, rate: 0.5 },
        { a: 0, b: 100, rate: 0.25 }
      ]
    },
    { sid: "pat-male", rate: 0.55 },
    { sid: "pat-female", rate: 0.45 },
    { sid: "pain-0", rate: 0.05 },
    { sid: "swelling", rate: 0.25 },
    // ... سایر ویژگی‌ها
  ]
}
```

## قواعد تعارض

برخی ویژگی‌ها متقابلاً انحصاری هستند:

1. `pat-male` و `pat-female`: فقط یکی می‌تواند true باشد
2. `radiolucent`, `radiopaque`, `mixed`: فقط یکی می‌تواند true باشد
3. `slow-0`, `moderate-0`, `rapid-0`: فقط یکی می‌تواند true باشد
4. `expand`, `destruct-3`, `extend`: فقط یکی می‌تواند true باشد
5. `maxilla`, `mandible`, `both`: فقط یکی می‌تواند true باشد
6. `uni1`, `uni2`: فقط یکی می‌تواند true باشد

## محل تعریف

- **فایل اصلی**: `src/data/symptoms.ts`
- **تعداد کل**: 93 ویژگی
- **ساختار**: TypeScript Interface `ISymptomRaw`
- **نگاشت بیزی**: `src/data/diseases.ts`

