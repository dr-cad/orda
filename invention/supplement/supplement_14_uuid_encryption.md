# ضمیمه 14: شناسه یکتای پرونده و رمزنگاری

## 1. تولید شناسه یکتا

### الف) الگوریتم:
- **استاندارد**: UUID Version 4 (RFC 4122)
- **پیاده‌سازی**: استفاده از کتابخانه `uuid4`
- **فرمت**: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`

### ب) کد پیاده‌سازی:
```typescript
import uuid4 from "uuid4";

// تولید UUID جدید
const newUUID = uuid4();
// مثال: "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f789"
```

### ج) استفاده در سیستم:
```typescript
// در buffer store
export const useBufferStore = create(
  persist<BufferStore>(
    (set, get) => ({
      uuid: uuid4(),  // تولید خودکار
      // ...
    })
  )
);
```

### د) ویژگی‌ها:
- **یکتایی**: احتمال تداخل تقریباً صفر (2^122)
- **غیرقابل پیش‌بینی**: تصادفی بودن
- **استاندارد**: RFC 4122 compliant

## 2. رمزنگاری در حال انتقال

### الف) پروتکل:
- **HTTPS/TLS 1.3**: برای انتقال امن داده‌ها
- **Certificate**: Let's Encrypt (یا معادل)

### ب) پیاده‌سازی:
```typescript
// درخواست‌های API از طریق HTTPS
const apiUrl = "https://orda-api.dr-cad.ir";

fetch(apiUrl + "/process", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(data)
});
```

### ج) امنیت:
- **Certificate Validation**: بررسی صحت گواهینامه
- **HSTS**: HTTP Strict Transport Security
- **CORS**: کنترل دسترسی Cross-Origin

## 3. رمزنگاری در حالت سکون

### الف) الگوریتم:
- **AES-256**: Advanced Encryption Standard با کلید 256 بیتی
- **پیاده‌سازی**: استفاده از Web Crypto API

### ب) محل ذخیره‌سازی:

#### 1. LocalStorage (مرورگر):
```typescript
// استفاده از zustand persist با encryption
import { persist } from "zustand/middleware";

export const usePersistStore = create(
  persist<PersistStore>(
    (set, get) => ({
      // ...
    }),
    {
      name: "orda-storage",
      storage: createStorage(true)  // با compression و encryption
    }
  )
);
```

#### 2. پایگاه داده:
```typescript
// رمزنگاری قبل از ذخیره
async function encryptData(data: any): Promise<string> {
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
  
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: crypto.getRandomValues(new Uint8Array(12))
    },
    key,
    new TextEncoder().encode(JSON.stringify(data))
  );
  
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}
```

### ج) Key Management:
```typescript
// استفاده از Web Crypto API
async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
}

// ذخیره کلید در secure storage
async function storeKey(key: CryptoKey) {
  const exported = await crypto.subtle.exportKey("raw", key);
  // ذخیره در secure storage (مثلاً IndexedDB با encryption)
}
```

## 4. مثال عملی

### الف) تولید UUID:
```typescript
// هنگام ایجاد پرونده جدید
const newRecord: IHistoryItem = {
  uuid: uuid4(),  // "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f789"
  symptoms: [...],
  scores: [...],
  createdAt: Date.now(),
  // ...
};
```

### ب) رمزنگاری داده:
```typescript
// قبل از ذخیره در LocalStorage
const encrypted = await encryptData(newRecord);
localStorage.setItem("record_" + newRecord.uuid, encrypted);
```

### ج) رمزگشایی:
```typescript
// هنگام خواندن از LocalStorage
const encrypted = localStorage.getItem("record_" + uuid);
const decrypted = await decryptData(encrypted);
const record: IHistoryItem = JSON.parse(decrypted);
```

## 5. امنیت اضافی

### الف) Hash برای Integrity:
```typescript
import sha256 from "crypto-js/sha256";

// تولید hash برای بررسی یکپارچگی
const hash = sha256(JSON.stringify(symptoms)).toString();
const hash2 = sha256(JSON.stringify(scores)).toString();

const record = {
  uuid,
  symptoms,
  scores,
  hash,    // برای symptoms
  hash2    // برای scores
};
```

### ب) بررسی یکپارچگی:
```typescript
function verifyIntegrity(record: IHistoryItem): boolean {
  const currentHash = sha256(JSON.stringify(record.symptoms)).toString();
  const currentHash2 = sha256(JSON.stringify(record.scores)).toString();
  
  return currentHash === record.hash && currentHash2 === record.hash2;
}
```

## 6. HIPAA Compliance

### الف) الزامات:
- **Encryption at Rest**: رمزنگاری داده‌ها در حالت سکون ✓
- **Encryption in Transit**: رمزنگاری در حال انتقال ✓
- **Access Control**: کنترل دسترسی ✓
- **Audit Logs**: ثبت لاگ دسترسی ✓

### ب) پیاده‌سازی:
```typescript
// Audit Log
interface AuditLog {
  timestamp: number;
  userId: string;
  action: "create" | "read" | "update" | "delete";
  recordId: string;
  ipAddress?: string;
}

function logAccess(action: string, recordId: string) {
  const log: AuditLog = {
    timestamp: Date.now(),
    userId: getCurrentUserId(),
    action,
    recordId,
    ipAddress: getClientIP()
  };
  
  // ذخیره در secure log storage
  saveAuditLog(log);
}
```

## 7. محل پیاده‌سازی

- **UUID Generation**: `src/store/buffer.ts` (خط 46)
- **Encryption**: `src/store/create.ts`
- **Hash**: `src/store/buffer.ts` (خط 83-84)
- **Storage**: `src/store/history.ts`

## 8. کتابخانه‌های استفاده شده

```json
{
  "dependencies": {
    "uuid4": "^2.0.2",
    "crypto-js": "^4.1.1"
  }
}
```

