# ضمیمه 18: مستندات افزونه نمونه - تشخیص موقعیت ضایعه

## 1. شناسه افزونه

- **ID**: `lesion-locator`
- **نام**: Lesion Location Detector
- **نسخه**: 1.0.0
- **نوع**: افزونه پردازشی و تشخیصی

## 2. ورودی دقیق

### الف) ساختار ورودی:
```typescript
interface LesionLocatorInput {
  mandible?: {
    a: number;  // نقطه شروع (عدد دندان: 1-16)
    b: number;  // نقطه پایان (عدد دندان: 1-16)
  };
  maxilla?: {
    a: number;  // نقطه شروع (عدد دندان: 17-32)
    b: number;  // نقطه پایان (عدد دندان: 17-32)
  };
  side: "unilateral-left" | "unilateral-right" | "bilateral";
}
```

### ب) مثال ورودی:
```json
{
  "mandible": {
    "a": 4,
    "b": 5
  },
  "side": "unilateral-left"
}
```

### ج) استخراج از PatientState:
```typescript
function extractLocationData(state: PatientState): LesionLocatorInput {
  const mandible = state.symptoms.find(s => s.id === "mandible");
  const maxilla = state.symptoms.find(s => s.id === "maxilla");
  const side = state.symptoms.find(s => 
    ["unilateral-left", "unilateral-right", "bilateral"].includes(s.id)
  );
  
  return {
    mandible: mandible?.value as IRange | undefined,
    maxilla: maxilla?.value as IRange | undefined,
    side: side?.id as string
  };
}
```

## 3. الگوریتم مورد استفاده

### الف) Mapping بر روی Canvas/SVG:

#### 1. تعریف مناطق آناتومیک:
```typescript
interface ToothRegion {
  numbers: number[];      // اعداد دندان
  name: string;           // نام ناحیه
  anatomicalName: string; // نام آناتومیک
}

const mandibleRegions: ToothRegion[] = [
  { numbers: [1, 2, 3, 4, 5], name: "incisor", anatomicalName: "Incisor" },
  { numbers: [6, 7, 8], name: "canine", anatomicalName: "Canine" },
  { numbers: [9, 10, 11, 12], name: "premolar", anatomicalName: "Premolar" },
  { numbers: [13, 14, 15, 16], name: "molar", anatomicalName: "Molar" }
];

const maxillaRegions: ToothRegion[] = [
  { numbers: [17, 18, 19, 20, 21], name: "incisor", anatomicalName: "Incisor" },
  { numbers: [22, 23, 24], name: "canine", anatomicalName: "Canine" },
  { numbers: [25, 26, 27, 28], name: "premolar", anatomicalName: "Premolar" },
  { numbers: [29, 30, 31, 32], name: "molar", anatomicalName: "Molar" }
];
```

#### 2. تعیین ناحیه:
```typescript
function determineRegion(
  range: IRange,
  jaw: "mandible" | "maxilla"
): string {
  const regions = jaw === "mandible" ? mandibleRegions : maxillaRegions;
  
  // پیدا کردن ناحیه‌ای که range در آن قرار دارد
  for (const region of regions) {
    if (range.a >= Math.min(...region.numbers) && 
        range.b <= Math.max(...region.numbers)) {
      return region.anatomicalName;
    }
  }
  
  // اگر در چند ناحیه قرار دارد
  return "Multiple regions";
}
```

#### 3. تبدیل به مختصات Canvas:
```typescript
function rangeToCanvasCoordinates(
  range: IRange,
  jaw: "mandible" | "maxilla"
): { x: number; y: number; width: number; height: number } {
  // تبدیل اعداد دندان به مختصات Canvas
  const toothWidth = 20;
  const startX = (range.a - 1) * toothWidth;
  const endX = range.b * toothWidth;
  
  const jawY = jaw === "mandible" ? 100 : 200;
  
  return {
    x: startX,
    y: jawY,
    width: endX - startX,
    height: 30
  };
}
```

### ب) تولید متن موقعیت:

#### الگوریتم:
```typescript
function generateLocationText(input: LesionLocatorInput): string {
  const location = input.mandible || input.maxilla;
  if (!location) {
    return "Location not specified";
  }
  
  const jaw = input.mandible ? "mandible" : "maxilla";
  const region = determineRegion(location, jaw);
  const sideText = getSideText(input.side);
  
  return `${region} ${jaw} ${sideText} side (teeth ${location.a}-${location.b})`;
}

function getSideText(side?: string): string {
  switch (side) {
    case "unilateral-left":
      return "left";
    case "unilateral-right":
      return "right";
    case "bilateral":
      return "bilateral";
    default:
      return "";
  }
}
```

## 4. خروجی استاندارد

### الف) فرمت خروجی:
```typescript
interface LesionLocatorOutput {
  text: string;                    // متن موقعیت آناتومیک
  coordinates?: {                  // مختصات Canvas (اختیاری)
    x: number;
    y: number;
    width: number;
    height: number;
  };
  region?: string;                 // نام ناحیه
  jaw?: "mandible" | "maxilla";    // فک
  side?: string;                   // طرف
}
```

### ب) مثال خروجی:

#### ورودی:
```json
{
  "mandible": { "a": 4, "b": 5 },
  "side": "unilateral-left"
}
```

#### خروجی:
```json
{
  "text": "Premolar mandible left side (teeth 4-5)",
  "region": "Premolar",
  "jaw": "mandible",
  "side": "left",
  "coordinates": {
    "x": 60,
    "y": 100,
    "width": 40,
    "height": 30
  }
}
```

### ج) مثال‌های دیگر:

#### مثال 1:
- ورودی: `{ mandible: {a: 9, b: 12}, side: "unilateral-right" }`
- خروجی: `"Premolar mandible right side (teeth 9-12)"`

#### مثال 2:
- ورودی: `{ maxilla: {a: 17, b: 21}, side: "bilateral" }`
- خروجی: `"Incisor maxilla bilateral (teeth 17-21)"`

#### مثال 3:
- ورودی: `{ mandible: {a: 2, b: 12}, side: "unilateral-left" }`
- خروجی: `"Multiple regions mandible left side (teeth 2-12)"`

## 5. استفاده در سیستم

### الف) در Template Engine:
```typescript
function generateReportText(record: IHistoryItem): string {
  const locationData = extractLocationData({
    symptoms: record.symptoms,
    scores: record.scores,
    metadata: {
      uuid: record.uuid,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    }
  });
  
  const locationText = generateLocationText(locationData);
  
  return `Lesion location: ${locationText}`;
}
```

### ب) در UI:
```typescript
function LesionLocationDisplay({ symptoms }: { symptoms: ISymptom[] }) {
  const locationData = extractLocationData({ symptoms, scores: null, metadata: {} });
  const locationText = generateLocationText(locationData);
  
  return (
    <div>
      <h3>Lesion Location</h3>
      <p>{locationText}</p>
    </div>
  );
}
```

## 6. خطاها و استثناها

### الف) داده ناقص:
```typescript
if (!location) {
  return {
    text: "Location not specified",
    error: "Missing location data"
  };
}
```

### ب) داده نامعتبر:
```typescript
if (location.a < 1 || location.b > 32 || location.a > location.b) {
  return {
    text: "Invalid location data",
    error: "Tooth numbers out of range"
  };
}
```

## 7. تست

### الف) Test Cases:
```typescript
const testCases = [
  {
    input: { mandible: {a: 4, b: 5}, side: "unilateral-left" },
    expected: "Premolar mandible left side (teeth 4-5)"
  },
  {
    input: { maxilla: {a: 17, b: 21}, side: "bilateral" },
    expected: "Incisor maxilla bilateral (teeth 17-21)"
  }
];

testCases.forEach(({ input, expected }) => {
  const result = generateLocationText(input);
  assert(result.text === expected);
});
```

## 8. محل پیاده‌سازی

- **Component**: `src/components/LesionLocator.tsx` (فرضی)
- **Algorithm**: در همان کامپوننت یا `src/lib/location.ts`
- **Integration**: در `src/lib/report.ts` برای تولید گزارش

