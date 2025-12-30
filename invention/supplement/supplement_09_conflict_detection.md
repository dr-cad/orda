# ضمیمه 9: قواعد تشخیص تضاد یا همپوشانی

## 1. قواعد تشخیص تضاد

قواعد تشخیص تضاد در فایل‌های `server/INSTRUCT.md` و `server/GPTTOOL.md` تعریف شده است:

### گروه‌های متضاد:

#### 1. expand, destruct_3, extend
```typescript
// فقط یکی می‌تواند true باشد
const group1 = ["expand", "destruct-3", "extend"];
```

#### 2. radiolucent, mixed, radiopaque
```typescript
// فقط یکی می‌تواند true باشد
const group2 = ["radiolucent", "mixed", "radiopaque"];
```

#### 3. maxilla, mandible, both
```typescript
// فقط یکی می‌تواند true باشد
const group3 = ["maxilla", "mandible", "both"];
```

#### 4. radiopaque_zone, radiopaque_nozone
```typescript
// فقط یکی می‌تواند true باشد
const group4 = ["radiopaque-zone", "radiopaque-nozone"];
```

#### 5. uni1, uni2
```typescript
// فقط یکی می‌تواند true باشد
const group5 = ["uni1", "uni2"];
```

#### 6. slow_0, moderate_0, rapid_0
```typescript
// فقط یکی می‌تواند true باشد
const group6 = ["slow-0", "moderate-0", "rapid-0"];
```

## 2. سیاست هشدار/اصلاح

### الف) در سطح UI:

#### غیرفعال کردن خودکار:
```typescript
function handleOptionSelect(selectedId: string, group: string[]) {
  // غیرفعال کردن سایر گزینه‌های گروه
  group.forEach(id => {
    if (id !== selectedId) {
      setOptionDisabled(id, true);
      setOptionValue(id, false);
    }
  });
}
```

#### نمایش هشدار:
```typescript
function validateConflicts(symptoms: ISymptom[]): string[] {
  const warnings: string[] = [];
  
  conflictGroups.forEach(group => {
    const selected = group.filter(sid => 
      symptoms.find(s => s.id === sid && s.value === true)
    );
    if (selected.length > 1) {
      warnings.push(
        `تضاد: ${selected.map(s => getSymptomName(s)).join(' و ')} نمی‌توانند همزمان انتخاب شوند`
      );
    }
  });
  
  return warnings;
}
```

### ب) در سطح AI (Function Calling):

#### بررسی و اصلاح خودکار:
```typescript
// در System Prompt
const systemPrompt = `
Rules:
1. expand, destruct_3, extend options are in conflict. only one of them can be true, others MUST be false!
2. radiolucent, mixed, radiopaque options are in conflict. only one of them can be true, others MUST be false!
3. maxilla, mandible, both options are in conflict. only one of them can be true, others MUST be false!
4. radiopaque_zone, radiopaque_nozone options are in conflict. only one of them can be true, others MUST be false!
5. uni1, uni2 options are in conflict. only one of them can be true, others MUST be false!
6. slow_0, moderate_0, rapid_0 options are in conflict. only one of them can be true, others MUST be false!

NOTE: DOUBLE-CHECK that you have followed these rules.
`;
```

### ج) در سطح Backend:

#### اعتبارسنجی نهایی:
```typescript
function validateBeforeCalculation(symptoms: ISymptom[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // بررسی تعارض‌ها
  conflictGroups.forEach((group, index) => {
    const selected = group.filter(sid => 
      symptoms.find(s => s.id === sid && s.value === true)
    );
    
    if (selected.length > 1) {
      errors.push(`Conflict in group ${index + 1}: ${selected.join(', ')}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
```

## 3. الگوریتم تشخیص

### کد پیاده‌سازی:
```typescript
interface ConflictGroup {
  name: string;
  options: string[];
}

const conflictGroups: ConflictGroup[] = [
  { name: "Expansion", options: ["expand", "destruct-3", "extend"] },
  { name: "Internal Structure", options: ["radiolucent", "mixed", "radiopaque"] },
  { name: "Location", options: ["maxilla", "mandible", "both"] },
  { name: "Radiopaque Zone", options: ["radiopaque-zone", "radiopaque-nozone"] },
  { name: "Unilocularity", options: ["uni1", "uni2"] },
  { name: "Onset", options: ["slow-0", "moderate-0", "rapid-0"] }
];

function detectConflicts(symptoms: ISymptom[]): Conflict[] {
  const conflicts: Conflict[] = [];
  
  conflictGroups.forEach(group => {
    const selected = group.options.filter(optionId => {
      const symptom = symptoms.find(s => s.id === optionId);
      return symptom && symptom.value === true;
    });
    
    if (selected.length > 1) {
      conflicts.push({
        group: group.name,
        conflictingOptions: selected,
        severity: "error"
      });
    }
  });
  
  return conflicts;
}
```

## 4. اصلاح خودکار

### استراتژی اصلاح:

#### 1. اولویت بر اساس ترتیب:
```typescript
function autoResolveConflict(group: string[], selected: string[]): string {
  // انتخاب اولین گزینه انتخاب شده
  return selected[0];
}
```

#### 2. اولویت بر اساس اهمیت:
```typescript
const priority = {
  "slow-0": 3,
  "moderate-0": 2,
  "rapid-0": 1
};

function autoResolveByPriority(group: string[], selected: string[]): string {
  return selected.sort((a, b) => 
    (priority[b] || 0) - (priority[a] || 0)
  )[0];
}
```

#### 3. درخواست از کاربر:
```typescript
function requestUserResolution(conflict: Conflict): Promise<string> {
  return new Promise((resolve) => {
    showDialog({
      title: "تضاد تشخیص داده شد",
      message: `کدام گزینه را انتخاب می‌کنید؟`,
      options: conflict.conflictingOptions,
      onSelect: resolve
    });
  });
}
```

## 5. مثال عملی

### ورودی با تضاد:
```json
{
  "slow-0": true,
  "moderate-0": true,  // تضاد!
  "rapid-0": false
}
```

### تشخیص:
```typescript
const conflicts = detectConflicts(symptoms);
// نتیجه: [{ group: "Onset", conflictingOptions: ["slow-0", "moderate-0"] }]
```

### اصلاح خودکار:
```typescript
// گزینه اول (slow-0) نگه داشته می‌شود
{
  "slow-0": true,
  "moderate-0": false,  // اصلاح شد
  "rapid-0": false
}
```

## 6. UI/UX

### نمایش در رابط کاربری:
```typescript
<ConflictWarning
  conflicts={detectedConflicts}
  onResolve={handleResolve}
  onIgnore={handleIgnore}
/>
```

### مثال UI:
```
┌─────────────────────────────────────┐
│ ⚠️ تضاد تشخیص داده شد              │
├─────────────────────────────────────┤
│ گزینه‌های زیر نمی‌توانند همزمان   │
│ انتخاب شوند:                        │
│ • کند (slow-0)                      │
│ • متوسط (moderate-0)                │
│                                     │
│ [نگه‌داشتن کند] [نگه‌داشتن متوسط]  │
└─────────────────────────────────────┘
```

## 7. محل تعریف

- **قواعد**: `server/INSTRUCT.md`, `server/GPTTOOL.md`
- **پیاده‌سازی UI**: `src/components/`
- **اعتبارسنجی**: `src/lib/symptoms.ts`
- **تولید خودکار**: از `src/data/symptoms.ts` در `server/swagger.ts`

