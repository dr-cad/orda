# ضمیمه 17: قرارداد API افزونه‌ها (Features/Extensions)

سیستم افزونه‌ها در این پروژه به صورت **Features** یا **Extensions** پیاده‌سازی شده است. این سیستم امکان اضافه کردن کامپوننت‌های سفارشی به علائم (symptoms) را فراهم می‌کند.

## 1. ساختار کلی

سیستم افزونه‌ها بر اساس یک الگوی ساده و مستقیم کار می‌کند:

1. **تعریف Feature**: هر افزونه یک شناسه یکتا در enum `Feature` دارد
2. **ثبت در Router**: کامپوننت `Features` به عنوان router عمل می‌کند
3. **ارتباط با Symptom**: از طریق `desc.feature` در تعریف symptom
4. **اجرای کامپوننت**: کامپوننت مربوطه render می‌شود

**فایل‌های مرتبط**:
- `src/types/index.ts`: تعریف `Feature` enum و `Desc` type
- `src/components/Features.tsx`: کامپوننت router/dispatcher
- `src/components/Symptom.tsx`: استفاده از Features در render symptom
- `src/data/symptoms.ts`: تعریف symptoms با feature

## 2. نحوه کار

کامپوننت `Features` در `src/components/Features.tsx` به صورت یک switch statement عمل می‌کند:
- مقدار `feature` را از props دریافت می‌کند
- بر اساس مقدار، کامپوننت مناسب را load و render می‌کند
- برای افزونه‌های بزرگ از lazy loading استفاده می‌کند
- برای نمایش loading state از React Suspense استفاده می‌کند

برای استفاده از یک افزونه در یک symptom، در `src/data/symptoms.ts` فیلد `desc` را با `feature` تنظیم کنید. هنگام render کردن symptom، اگر `desc.feature` وجود داشته باشد، کامپوننت `Features` فراخوانی می‌شود و افزونه مربوطه نمایش داده می‌شود.

## 3. افزونه‌های موجود

### DuplicateNameChecker
**مسیر**: `src/components/DupNameChecker.tsx`

**عملکرد**: برای فیلد نام بیمار استفاده می‌شود. نام وارد شده را در history جستجو می‌کند و اگر نام مشابهی پیدا شود (حداقل 3 کاراکتر)، لینکی نمایش می‌دهد که با کلیک روی آن، رکورد قبلی در buffer بارگذاری می‌شود.

**استفاده در**: `pat-name` symptom

### DentPicker
**مسیر**: `src/components/DentPicker.tsx`

**عملکرد**: رابط گرافیکی برای انتخاب موقعیت آناتومیک ضایعه. یک تصویر رادیوگرافی پانورامیک با نقاط قابل کلیک نمایش می‌دهد. کاربر با کلیک روی دو نقطه، یک بازه (range) انتخاب می‌کند که به صورت خودکار در `maxilla`، `mandible`، یا `both` ذخیره می‌شود.

**استفاده در**: `location` symptom

### ImagePicker
**مسیر**: `src/components/ImagePicker.tsx`

**عملکرد**: سیستم آپلود و مدیریت تصاویر رادیوگرافی. از FilePond برای drag-and-drop استفاده می‌کند. حداکثر 10 فایل (هر کدام 1.5MB) را پشتیبانی می‌کند. قبل از آپلود، hash SHA-256 محاسبه می‌شود تا از duplicate upload جلوگیری شود. تصاویر به Cloudinary آپلود می‌شوند.

**استفاده در**: `pat-images` symptom

## 4. راهنمای ساخت افزونه جدید

برای ساخت یک افزونه جدید:

1. **تعریف Feature Enum**: در `src/types/index.ts`، یک شناسه جدید به `Feature` enum اضافه کنید

2. **ساخت کامپوننت**: در `src/components/` یک کامپوننت React بسازید که به صورت default export شود. می‌تواند از hooks برای دسترسی به store استفاده کند.

3. **ثبت در Router**: در `src/components/Features.tsx`، import کامپوننت جدید و یک case جدید در switch statement اضافه کنید

4. **استفاده در Symptom**: در `src/data/symptoms.ts`، در فیلد `desc`، `feature` را تنظیم کنید

## 5. API در دسترس

### Store Hooks (از `src/store/`):
- **`useBufferStore()`**: دسترسی به buffer store
  - `symptoms`: لیست symptoms فعلی
  - `updateSymptom(id, value)`: به‌روزرسانی مقدار symptom
  - `loadHistoryItem(item, overwrite)`: بارگذاری رکورد از history
  - `toggleExpanded(id, open)`: باز/بسته کردن symptom
- **`usePersistStore()`**: دسترسی به persist store
  - `history`: لیست رکوردهای ذخیره شده
  - `addHistory(items)`: اضافه کردن رکورد
  - `removeHistory(uuid)`: حذف رکورد

### Utility Hooks (از `src/hooks/`):
- `useSymptomValue<T>(id)`: خواندن مقدار symptom
- `getSymptomValueById<T>(symptoms, id)`: خواندن مقدار از لیست

### Utility Functions (از `src/lib/`):
- `parseImages` / `stringifyImages`: تبدیل بین string و array
- `makeUploadRequest` / `makeDeleteRequest`: ارتباط با Cloudinary

## 6. ساختار فایل‌ها

```
src/
├── types/index.ts              # Feature enum و Desc type
├── components/
│   ├── Features.tsx            # Router component
│   ├── DupNameChecker.tsx      # افزونه بررسی نام تکراری
│   ├── DentPicker.tsx          # افزونه انتخاب موقعیت
│   ├── ImagePicker.tsx         # افزونه آپلود تصویر
│   └── Symptom.tsx             # استفاده از Features
├── data/symptoms.ts            # تعریف symptoms با feature
├── store/
│   ├── buffer.ts               # BufferStore
│   └── history.ts              # PersistStore
├── hooks/symptom.ts            # useSymptomValue hook
└── lib/
    ├── image.ts                # parseImages, stringifyImages
    └── cloudinary.ts           # Cloudinary API functions
```

## 7. محدودیت‌ها

- نیاز به ثبت دستی در `Features.tsx`
- بدون ایزولاسیون: افزونه‌ها دسترسی کامل دارند
- بدون Sandbox: هیچ مکانیزمی برای محدود کردن دسترسی وجود ندارد
- بدون Plugin Registry: سیستم registry برای افزونه‌های خارجی وجود ندارد
