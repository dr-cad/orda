# ضمیمه 17: قرارداد API افزونه‌ها

## 1. رابط برنامه‌نویسی (Interface)

### الف) تعریف TypeScript:
```typescript
interface Plugin {
  id: string;                    // شناسه یکتای افزونه
  name: string;                  // نام افزونه
  version: string;               // نسخه
  input: (state: PatientState) => PluginInput;
  output: (result: PluginResult) => PluginOutput;
  isolation: 'sandbox' | 'trusted';
  accessLevel: 'read' | 'write' | 'admin';
}
```

### ب) PatientState:
```typescript
interface PatientState {
  symptoms: ISymptom[];
  scores: IDiseaseScored[] | null;
  metadata: {
    uuid: string;
    createdAt: number;
    updatedAt: number;
  };
}
```

### ج) PluginInput:
```typescript
interface PluginInput {
  data: any;           // داده‌های ورودی
  config?: any;        // تنظیمات افزونه
}
```

### د) PluginResult:
```typescript
interface PluginResult {
  success: boolean;
  data?: any;
  error?: string;
  warnings?: string[];
}
```

### ه) PluginOutput:
```typescript
interface PluginOutput {
  text?: string;       // متن خروجی
  alert?: string;      // هشدار
  data?: any;          // داده‌های اضافی
}
```

## 2. ایزولاسیون

### الف) Sandbox:
- **محدودیت**: دسترسی فقط خواندنی به داده‌ها
- **امنیت**: اجرا در محیط ایزوله
- **استفاده**: برای افزونه‌های شخص ثالث

```typescript
const sandboxPlugin: Plugin = {
  id: "external-plugin",
  isolation: "sandbox",
  accessLevel: "read",
  // ...
};
```

### ب) Trusted:
- **دسترسی**: دسترسی کامل به داده‌ها
- **استفاده**: برای افزونه‌های داخلی سیستم

```typescript
const trustedPlugin: Plugin = {
  id: "internal-plugin",
  isolation: "trusted",
  accessLevel: "write",
  // ...
};
```

## 3. سطح دسترسی

### الف) Read:
- فقط خواندن داده‌ها
- عدم امکان تغییر

### ب) Write:
- خواندن و نوشتن
- امکان تغییر داده‌ها

### ج) Admin:
- دسترسی کامل
- امکان تغییر تنظیمات سیستم

## 4. مثال: افزونه Lesion Locator

### الف) تعریف:
```typescript
const lesionLocatorPlugin: Plugin = {
  id: "lesion-locator",
  name: "Lesion Location Detector",
  version: "1.0.0",
  isolation: "sandbox",
  accessLevel: "read",
  
  input: (state: PatientState) => {
    // استخراج مختصات از state
    const mandible = state.symptoms.find(s => s.id === "mandible");
    const maxilla = state.symptoms.find(s => s.id === "maxilla");
    const side = state.symptoms.find(s => 
      s.id === "unilateral-left" || s.id === "unilateral-right"
    );
    
    return {
      data: {
        mandible: mandible?.value,
        maxilla: maxilla?.value,
        side: side?.id
      }
    };
  },
  
  output: (result: PluginResult) => {
    if (result.success && result.data) {
      return {
        text: generateLocationText(result.data)
      };
    }
    return {
      alert: "Unable to determine lesion location"
    };
  }
};
```

### ب) الگوریتم:
```typescript
function generateLocationText(data: {
  mandible?: IRange;
  maxilla?: IRange;
  side?: string;
}): string {
  const location = data.mandible || data.maxilla;
  if (!location) return "Location not specified";
  
  const region = getToothRegion(location.a, location.b);
  const jaw = data.mandible ? "mandible" : "maxilla";
  const sideText = data.side === "unilateral-left" ? "left" : 
                   data.side === "unilateral-right" ? "right" : "";
  
  return `${region} ${jaw} ${sideText} side`;
}

function getToothRegion(a: number, b: number): string {
  // تبدیل اعداد دندان به نام ناحیه
  if (a >= 1 && b <= 5) return "incisor";
  if (a >= 6 && b <= 8) return "canine";
  if (a >= 9 && b <= 12) return "premolar";
  if (a >= 13 && b <= 16) return "molar";
  return "unknown";
}
```

## 5. مثال: افزونه Duplicate Detection

### الف) تعریف:
```typescript
const duplicateDetectionPlugin: Plugin = {
  id: "duplicate-detector",
  name: "Duplicate Record Detector",
  version: "1.0.0",
  isolation: "trusted",
  accessLevel: "read",
  
  input: (state: PatientState) => {
    return {
      data: {
        patName: state.symptoms.find(s => s.id === "pat-name")?.value,
        symptoms: state.symptoms
      }
    };
  },
  
  output: (result: PluginResult) => {
    if (result.success && result.data?.duplicates) {
      return {
        alert: `Found ${result.data.duplicates.length} similar records`
      };
    }
    return {};
  }
};
```

### ب) الگوریتم:
```typescript
function detectDuplicates(
  currentName: string,
  history: IHistoryItem[]
): IHistoryItem[] {
  return history.filter(item => {
    const similarity = calculateSimilarity(
      currentName,
      item.patName
    );
    return similarity > 0.8;  // 80% similarity
  });
}
```

## 6. ثبت و بارگذاری افزونه‌ها

### الف) Registry:
```typescript
class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  
  register(plugin: Plugin): void {
    this.plugins.set(plugin.id, plugin);
  }
  
  get(id: string): Plugin | undefined {
    return this.plugins.get(id);
  }
  
  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }
}

const registry = new PluginRegistry();
```

### ب) اجرا:
```typescript
function executePlugin(
  pluginId: string,
  state: PatientState
): PluginOutput {
  const plugin = registry.get(pluginId);
  if (!plugin) {
    throw new Error(`Plugin ${pluginId} not found`);
  }
  
  const input = plugin.input(state);
  const result = processPlugin(plugin, input);
  return plugin.output(result);
}
```

## 7. امنیت

### الف) Validation:
```typescript
function validatePlugin(plugin: Plugin): boolean {
  // بررسی ساختار
  if (!plugin.id || !plugin.name) return false;
  
  // بررسی توابع
  if (typeof plugin.input !== 'function') return false;
  if (typeof plugin.output !== 'function') return false;
  
  // بررسی سطح دسترسی
  if (!['read', 'write', 'admin'].includes(plugin.accessLevel)) {
    return false;
  }
  
  return true;
}
```

### ب) Sandbox Execution:
```typescript
function executeInSandbox(plugin: Plugin, input: PluginInput): PluginResult {
  try {
    // اجرا در محیط محدود
    const result = plugin.input(input);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

## 8. مستندات API

### الف) مثال کامل:
```typescript
// افزونه نمونه: Location Text Generator
const locationTextGenerator: Plugin = {
  id: "location-text-generator",
  name: "Location Text Generator",
  version: "1.0.0",
  isolation: "sandbox",
  accessLevel: "read",
  
  input: (state) => ({
    data: {
      mandible: state.symptoms.find(s => s.id === "mandible")?.value,
      maxilla: state.symptoms.find(s => s.id === "maxilla")?.value,
      side: state.symptoms.find(s => 
        ["unilateral-left", "unilateral-right", "bilateral"].includes(s.id)
      )?.id
    }
  }),
  
  output: (result) => {
    if (result.success) {
      const location = generateAnatomicalText(result.data);
      return { text: location };
    }
    return { alert: "Location data incomplete" };
  }
};
```

## 9. محل پیاده‌سازی

- **Interface Definition**: `src/types/plugin.ts` (فرضی)
- **Plugin Registry**: `src/lib/plugins.ts` (فرضی)
- **Execution**: در کامپوننت‌های مربوطه

