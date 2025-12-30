# ضمیمه 17: قرارداد API افزونه‌ها (Features/Extensions)

سیستم افزونه‌ها در این پروژه به صورت **Features** یا **Extensions** پیاده‌سازی شده است. این سیستم امکان اضافه کردن کامپوننت‌های سفارشی به علائم (symptoms) را فراهم می‌کند.

## 1. ساختار کلی

سیستم افزونه‌ها بر اساس یک الگوی ساده و مستقیم کار می‌کند:

1. **تعریف Feature**: هر افزونه یک شناسه یکتا در enum `Feature` دارد
2. **ثبت در Router**: کامپوننت `Features` به عنوان router عمل می‌کند
3. **ارتباط با Symptom**: از طریق `desc.feature` در تعریف symptom
4. **اجرای کامپوننت**: کامپوننت مربوطه render می‌شود

### فایل‌های مرتبط:
- `src/types/index.ts`: تعریف `Feature` enum و `Desc` type
- `src/components/Features.tsx`: کامپوننت router/dispatcher
- `src/components/Symptom.tsx`: استفاده از Features در render symptom
- `src/data/symptoms.ts`: تعریف symptoms با feature

## 2. نحوه کار Router

کامپوننت `Features` در `src/components/Features.tsx` به صورت یک switch statement عمل می‌کند. این کامپوننت:
- مقدار `feature` را از props دریافت می‌کند
- بر اساس مقدار، کامپوننت مناسب را load و render می‌کند
- برای افزونه‌های بزرگ (DentPicker, ImagePicker) از lazy loading استفاده می‌کند
- برای نمایش loading state از React Suspense استفاده می‌کند
- با `memo` بهینه‌سازی شده تا از re-render غیرضروری جلوگیری کند

### الگوی بارگذاری:
- افزونه‌های کوچک (مثل DuplicateNameChecker) به صورت synchronous import می‌شوند
- افزونه‌های بزرگ به صورت lazy-loaded هستند تا bundle size کاهش یابد

## 3. نحوه استفاده در Symptoms

برای استفاده از یک افزونه در یک symptom، باید:

1. در `src/data/symptoms.ts`، فیلد `desc` را با `feature` تنظیم کنید
2. می‌توانید `title` و `image` را هم اضافه کنید
3. `params` برای پاس دادن پارامترهای اضافی وجود دارد (فعلاً استفاده نمی‌شود)

هنگام render کردن symptom در `src/components/Symptom.tsx`، اگر `desc.feature` وجود داشته باشد، کامپوننت `Features` فراخوانی می‌شود و افزونه مربوطه نمایش داده می‌شود.

## 4. افزونه‌های موجود

### الف) DuplicateNameChecker

**مسیر**: `src/components/DupNameChecker.tsx`

**عملکرد**: این افزونه برای فیلد نام بیمار استفاده می‌شود و:
- نام وارد شده را در history جستجو می‌کند
- اگر نام مشابهی پیدا شود (حداقل 3 کاراکتر)، لینکی نمایش می‌دهد
- با کلیک روی لینک، رکورد قبلی با همان نام در buffer بارگذاری می‌شود
- اگر نام کمتر از 3 کاراکتر باشد یا هیچ رکوردی پیدا نشود، پیام راهنما نمایش می‌دهد

**استفاده در**: `pat-name` symptom

**API استفاده شده**:
- `useBufferStore`: برای دسترسی به buffer و `loadHistoryItem`
- `usePersistStore`: برای دسترسی به history
- `useSymptomValue`: برای خواندن مقدار `pat-name`

### ب) DentPicker

**مسیر**: `src/components/DentPicker.tsx`

**عملکرد**: این افزونه یک رابط گرافیکی برای انتخاب موقعیت آناتومیک ضایعه ارائه می‌دهد:
- یک تصویر رادیوگرافی پانورامیک نمایش می‌دهد با نقاط قابل کلیک
- کاربر با کلیک روی دو نقطه، یک بازه (range) انتخاب می‌کند
- بر اساس فک انتخاب شده (maxilla, mandible, یا both) و موقعیت قبلی:
  - اگر فقط یک فک انتخاب شده باشد → مقدار آن فک به‌روزرسانی می‌شود
  - اگر قبلاً فک دیگری انتخاب شده باشد → به `both` تبدیل می‌شود
- با دکمه reset می‌توان انتخاب را پاک کرد
- نقاط انتخاب شده به صورت visual highlight می‌شوند

**استفاده در**: `location` symptom (با عنوان "Pathologic extension")

**API استفاده شده**:
- `useBufferStore`: برای `updateSymptom` و `toggleExpanded`
- `useSymptomValue`: برای خواندن مقادیر `maxilla`, `mandible`, `both`

**خروجی**: به‌روزرسانی `IRange` برای `maxilla`, `mandible`, یا `both` symptoms

### ج) ImagePicker

**مسیر**: `src/components/ImagePicker.tsx`

**عملکرد**: این افزونه سیستم آپلود و مدیریت تصاویر را فراهم می‌کند:
- از کتابخانه FilePond برای drag-and-drop استفاده می‌کند
- حداکثر 10 فایل را پشتیبانی می‌کند
- اندازه هر فایل حداکثر 1.5MB است (محدودیت Cloudinary)
- Deduplication: قبل از آپلود، hash SHA-256 محاسبه می‌شود
  - اگر تصویری با همان hash قبلاً آپلود شده باشد، دوباره آپلود نمی‌شود
- آپلود به Cloudinary با نمایش progress bar
- مدیریت حذف: اگر تصویری حذف شود، از Cloudinary هم حذف می‌شود
- نمایش وضعیت: success (✓) یا error (✗) با آیکون‌های visual
- پشتیبانی از فرمت JPEG

**استفاده در**: `pat-images` symptom

**API استفاده شده**:
- `useBufferStore`: برای `updateSymptom`
- `useSymptomValue`: برای خواندن تصاویر فعلی
- `parseImages` / `stringifyImages`: تبدیل بین string و array (از `src/lib/image.ts`)
- `makeUploadRequest` / `makeDeleteRequest`: ارتباط با Cloudinary (از `src/lib/cloudinary.ts`)

**خروجی**: ذخیره لیست `ICImage[]` به صورت JSON string در symptom

**کتابخانه‌های استفاده شده**:
- `react-filepond`: کامپوننت آپلود فایل
- `@pqina/filepond-plugin-image-editor`: ویرایشگر تصویر
- `filepond-plugin-image-preview`: پیش‌نمایش تصویر
- `filepond-plugin-file-validate-size`: اعتبارسنجی اندازه

## 5. قوانین و محدودیت‌ها

### قوانین:

1. **هر Feature یک React Component است**: باید یک کامپوننت React معتبر باشد که به صورت default export شود
2. **دسترسی به Store**: افزونه‌ها می‌توانند از hooks برای دسترسی به store استفاده کنند
3. **خواندن/نوشتن Symptoms**: افزونه‌ها می‌توانند مقادیر symptoms را بخوانند و بنویسند
4. **Params (آینده)**: ساختار برای پاس دادن params وجود دارد اما فعلاً استفاده نمی‌شود

### محدودیت‌ها:

1. **ثبت دستی**: برای هر افزونه جدید باید در `Features.tsx` یک case جدید اضافه شود
2. **بدون ایزولاسیون**: افزونه‌ها در همان context اصلی برنامه اجرا می‌شوند و دسترسی کامل دارند
3. **بدون Sandbox**: هیچ مکانیزمی برای محدود کردن دسترسی افزونه‌ها وجود ندارد
4. **بدون Plugin Registry**: سیستم registry برای افزونه‌های خارجی یا dynamic loading وجود ندارد
5. **بدون مدیریت چرخه حیات**: lifecycle hooks یا cleanup mechanisms وجود ندارد

## 6. راهنمای ساخت افزونه جدید

برای ساخت یک افزونه جدید:

1. **تعریف Feature Enum**: در `src/types/index.ts`، یک شناسه جدید به `Feature` enum اضافه کنید

2. **ساخت کامپوننت**: در `src/components/` یک کامپوننت React بسازید
   - باید به صورت default export باشد
   - می‌تواند از hooks برای دسترسی به store استفاده کند
   - می‌تواند از `useSymptomValue` برای خواندن و `updateSymptom` برای نوشتن استفاده کند

3. **ثبت در Features Router**: در `src/components/Features.tsx`:
   - import کامپوننت جدید
   - یک case جدید در switch statement اضافه کنید

4. **استفاده در Symptom**: در `src/data/symptoms.ts`:
   - در فیلد `desc`، `feature` را تنظیم کنید

### مثال مفهومی:

فرض کنید می‌خواهید یک DatePicker اضافه کنید:
- در `Feature` enum: `DatePicker = "date-picker"`
- کامپوننت: `DatePicker.tsx` که یک input type="date" render می‌کند و با `updateSymptom` مقدار را ذخیره می‌کند
- در `Features.tsx`: case برای `Feature.DatePicker`
- در `symptoms.ts`: یک symptom با `desc: { feature: Feature.DatePicker }`

## 7. API در دسترس برای افزونه‌ها

### Store Hooks (از `src/store/`):

**`useBufferStore()`**: دسترسی به buffer store که شامل:
- `symptoms`: لیست symptoms فعلی (ISymptom[])
- `updateSymptom(id, value)`: به‌روزرسانی مقدار یک symptom
- `loadHistoryItem(item, overwrite)`: بارگذاری یک رکورد از history به buffer
- `toggleExpanded(id, open)`: باز یا بسته کردن یک symptom در UI
- `uuid`: شناسه یکتای رکورد فعلی

**`usePersistStore()`**: دسترسی به persist store که شامل:
- `history`: لیست تمام رکوردهای ذخیره شده (IHistoryItem[])
- `addHistory(items)`: اضافه کردن رکوردهای جدید
- `removeHistory(uuid)`: حذف یک رکورد

### Utility Hooks (از `src/hooks/`):

- **`useSymptomValue<T>(id)`**: خواندن مقدار یک symptom با type safety
- **`getSymptomValueById<T>(symptoms, id)`**: خواندن مقدار از یک لیست symptoms

### Utility Functions (از `src/lib/`):

- **`parseImages` / `stringifyImages`** (از `src/lib/image.ts`): تبدیل بین string و array برای تصاویر
- **`makeUploadRequest` / `makeDeleteRequest`** (از `src/lib/cloudinary.ts`): ارتباط با Cloudinary API

### Types (از `src/types/index.ts`):

- `ISymptom`: ساختار یک symptom
- `IHistoryItem`: ساختار یک رکورد history
- `IRange`: ساختار بازه (برای موقعیت‌ها)
- `ICImage`: ساختار تصویر (url, hash, deleteToken)
- `Value`: نوع مقدار symptom (string | number | IRange | boolean)

## 8. ساختار فایل‌ها

```
src/
├── types/
│   └── index.ts                    # Feature enum و Desc type
├── components/
│   ├── Features.tsx                # Router component
│   ├── DupNameChecker.tsx          # افزونه بررسی نام تکراری
│   ├── DentPicker.tsx              # افزونه انتخاب موقعیت
│   ├── ImagePicker.tsx             # افزونه آپلود تصویر
│   └── Symptom.tsx                 # استفاده از Features
├── data/
│   └── symptoms.ts                 # تعریف symptoms با feature
├── store/
│   ├── buffer.ts                   # BufferStore (useBufferStore)
│   └── history.ts                  # PersistStore (usePersistStore)
├── hooks/
│   └── symptom.ts                  # useSymptomValue hook
└── lib/
    ├── image.ts                    # parseImages, stringifyImages
    └── cloudinary.ts               # makeUploadRequest, makeDeleteRequest
```

## 9. جریان کار (Workflow)

### برای افزونه‌های خواندن (Read-only):
1. کاربر symptom را expand می‌کند
2. کامپوننت `Symptom` render می‌شود
3. اگر `desc.feature` وجود داشته باشد، `Features` فراخوانی می‌شود
4. `Features` کامپوننت افزونه را render می‌کند
5. افزونه با `useSymptomValue` یا `usePersistStore` داده می‌خواند
6. اطلاعات را به کاربر نمایش می‌دهد

### برای افزونه‌های نوشتن (Write):
1. کاربر با افزونه تعامل می‌کند
2. افزونه از `useBufferStore` برای دسترسی به `updateSymptom` استفاده می‌کند
3. `updateSymptom` مقدار symptom را به‌روزرسانی می‌کند
4. تغییرات در store reflect می‌شود
5. UI به صورت خودکار به‌روز می‌شود (به دلیل reactive nature Zustand)

## 10. مثال‌های استفاده

### مثال 1: DuplicateNameChecker
- کاربر نام را در فیلد `pat-name` وارد می‌کند
- افزونه به صورت real-time در history جستجو می‌کند
- اگر نام مشابه پیدا شود، لینک نمایش داده می‌شود
- با کلیک، رکورد قبلی load می‌شود

### مثال 2: DentPicker
- کاربر روی symptom "Location" کلیک می‌کند
- افزونه DentPicker نمایش داده می‌شود
- کاربر روی دو نقطه در تصویر کلیک می‌کند
- بازه انتخاب شده به صورت خودکار در `maxilla`، `mandible`، یا `both` ذخیره می‌شود
- سایر symptoms مرتبط (مثل `side`) هم به‌روزرسانی می‌شوند

### مثال 3: ImagePicker
- کاربر روی "Panoramic Images" کلیک می‌کند
- افزونه ImagePicker با drag-and-drop interface نمایش داده می‌شود
- کاربر فایل‌ها را آپلود می‌کند
- پیشرفت آپلود نمایش داده می‌شود
- پس از آپلود، تصاویر در symptom ذخیره می‌شوند
- اگر تصویری حذف شود، از Cloudinary هم حذف می‌شود

## 11. مقایسه با Plugin API کامل

### سیستم فعلی (Feature-based):
**مزایا**:
- ساده و مستقیم
- عملکرد سریع بدون overhead
- دسترسی مستقیم به store و APIs
- مناسب برای افزونه‌های داخلی

**معایب**:
- نیاز به ثبت دستی
- بدون ایزولاسیون
- بدون سیستم مدیریت چرخه حیات
- عدم پشتیبانی از افزونه‌های خارجی
- عدم امکان dynamic loading

### Plugin API کامل (فرضی):
**مزایا**:
- سیستم ثبت خودکار
- ایزولاسیون و امنیت
- مدیریت چرخه حیات
- پشتیبانی از افزونه‌های خارجی
- Dynamic loading
- Version management

**معایب**:
- پیچیدگی بیشتر
- Overhead بیشتر
- نیاز به infrastructure بیشتر

## 12. نتیجه‌گیری

سیستم فعلی یک راه‌حل ساده و موثر برای افزودن قابلیت‌های سفارشی به علائم است. این سیستم برای افزونه‌های داخلی که توسط تیم توسعه ساخته می‌شوند و نیاز به دسترسی مستقیم به store دارند، مناسب است. 

برای نیازهای آینده که شامل افزونه‌های خارجی، ایزولاسیون کامل، یا dynamic loading باشد، نیاز به طراحی یک Plugin API کامل‌تر با ساختار registry، sandbox execution، و lifecycle management وجود دارد.

## 13. مراجع

- **Feature Enum**: `src/types/index.ts` (خط ~39)
- **Router Component**: `src/components/Features.tsx`
- **DuplicateNameChecker**: `src/components/DupNameChecker.tsx`
- **DentPicker**: `src/components/DentPicker.tsx`
- **ImagePicker**: `src/components/ImagePicker.tsx`
- **استفاده در Symptom**: `src/components/Symptom.tsx` (خط ~118)
- **تعریف در Symptoms**: `src/data/symptoms.ts`
