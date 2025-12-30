# ضمیمه 16: سیاست نگهداشت و حذف داده‌ها

## 1. نگهداشت

### الف) مدت زمان:
- **نامحدود**: تا زمان حذف دستی توسط کاربر
- **ذخیره محلی**: در LocalStorage مرورگر
- **Backup**: امکان دانلود فایل backup

### ب) نسخه‌بندی:
```typescript
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
```

### ج) Migration:
```typescript
function migration(item: IHistoryItem, index: number) {
  // تبدیل داده‌های قدیمی به فرمت جدید
  if (item.v < VERSION) {
    // اعمال تغییرات schema
    item.v = VERSION;
    // تبدیل داده‌ها
    item.symptoms = migrateSymptoms(item.symptoms, item.v);
  }
}
```

## 2. حذف

### الف) حذف دستی:
```typescript
function removeHistory(uuid: string) {
  set((state) => ({
    history: state.history.filter((item) => item.uuid !== uuid)
  }));
}
```

### ب) حذف خودکار:
- **تصاویر استفاده نشده**: پس از 30 روز از Cloudinary حذف می‌شوند
- **Draft Records**: امکان حذف خودکار پس از مدت زمان مشخص

## 3. ثبت لاگ رویدادها

### الف) انواع رویدادها:
```typescript
type EventType = 
  | "create"      // ایجاد پرونده
  | "read"        // مشاهده پرونده
  | "update"      // به‌روزرسانی
  | "delete"      // حذف
  | "export"      // خروجی
  | "share";      // اشتراک‌گذاری
```

### ب) ساختار لاگ:
```typescript
interface EventLog {
  timestamp: number;
  eventType: EventType;
  recordId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
}
```

### ج) ثبت لاگ:
```typescript
function logEvent(eventType: EventType, recordId: string, details?: any) {
  const log: EventLog = {
    timestamp: Date.now(),
    eventType,
    recordId,
    userId: getCurrentUserId(),
    ipAddress: getClientIP(),
    userAgent: navigator.userAgent,
    details
  };
  
  // ذخیره در LocalStorage یا ارسال به سرور
  saveEventLog(log);
}
```

## 4. کنترل دسترسی

### الف) سطح دسترسی:
- **کاربر محلی**: دسترسی کامل به داده‌های خود
- **بدون احراز هویت**: داده‌ها در LocalStorage ذخیره می‌شوند

### ب) اشتراک‌گذاری:
```typescript
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
```

## 5. نسخه‌بندی اسکیما

### الف) Version Field:
```typescript
const VERSION = "1.0.0";

interface IHistoryItem {
  v: string;  // نسخه
  // ...
}
```

### ب) Migration Scripts:
```typescript
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
```

### ج) Schema Evolution:
```typescript
// مثال: اضافه شدن فیلد جدید
interface IHistoryItemV1 {
  v: "1.0.0";
  uuid: string;
  symptoms: ISymptom[];
  // فیلد جدید
  metadata?: any;
}
```

## 6. بازتولید نتایج

### الف) ذخیره احتمالات:
```typescript
interface IHistoryItem {
  scores: IDiseaseScored[] | null;  // احتمالات محاسبه شده
  hash2: string;  // hash از scores برای یکپارچگی
}
```

### ب) بازتولید:
```typescript
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
```

## 7. Backup و Restore

### الف) Export:
```typescript
function exportHistory(history: IHistoryItem[]): void {
  const dataStr = JSON.stringify(history, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `orda-backup-${Date.now()}.json`;
  link.click();
}
```

### ب) Import:
```typescript
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
```

## 8. مثال عملی

### الف) ایجاد و ذخیره:
```typescript
const newRecord: IHistoryItem = {
  uuid: uuid4(),
  symptoms: currentSymptoms,
  scores: calculatedScores,
  hash: sha256(JSON.stringify(currentSymptoms)).toString(),
  hash2: sha256(JSON.stringify(calculatedScores)).toString(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
  v: VERSION,
  patName: "Alexis",
  draft: false
};

// ذخیره
await persist.addHistory([newRecord]);

// ثبت لاگ
logEvent("create", newRecord.uuid);
```

### ب) به‌روزرسانی:
```typescript
const updatedRecord = {
  ...existingRecord,
  symptoms: newSymptoms,
  scores: recalculatedScores,
  updatedAt: Date.now()
};

await persist.addHistory([updatedRecord]);
logEvent("update", updatedRecord.uuid);
```

## 9. محل پیاده‌سازی

- **History Store**: `src/store/history.ts`
- **Buffer Store**: `src/store/buffer.ts`
- **Migration**: `src/store/history.ts` (خط 33)
- **Export/Import**: `src/lib/history.ts`

