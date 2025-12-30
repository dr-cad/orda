# ضمیمه 17: قرارداد API افزونه‌ها (Features/Extensions)

سیستم افزونه‌ها در این پروژه به صورت **Features** یا **Extensions** پیاده‌سازی شده است. این سیستم امکان اضافه کردن کامپوننت‌های سفارشی به علائم (symptoms) را فراهم می‌کند.

## 1. ساختار کلی

### الف) تعریف Feature Enum در `src/types/index.ts`:

```39:43:src/types/index.ts
export enum Feature {
  DuplicateNameChecker = "dup-name-checker",
  DentPicker = "dent-picker",
  ImagePicker = "image-picker",
}
```

### ب) تعریف Desc Type:

```47:52:src/types/index.ts
export type Desc = {
  title?: string;
  image?: string;
  feature?: Feature;
  params?: any[]; // passed to feature component
};
```

### ج) استفاده در ISymptomRaw:

هر symptom می‌تواند یک `desc` با `feature` داشته باشد که مشخص می‌کند چه افزونه‌ای باید نمایش داده شود.

## 2. Router Component (Features)

کامپوننت `Features` به عنوان یک router/dispatcher عمل می‌کند که بر اساس مقدار `feature`، کامپوننت مناسب را بارگذاری و نمایش می‌دهد:

```1:37:src/components/Features.tsx
import { lazy, memo, Suspense } from "react";
import { Feature, ISymptom } from "../types";
import DupNameChecker from "./DupNameChecker";
const DentPicker = lazy(() => import("./DentPicker"));
const ImagePicker = lazy(() => import("./ImagePicker"));

interface Props {
  value: Feature | string;
  symptom: ISymptom;
  params?: any[];
}

export default memo(function Features({ value }: Props) {
  switch (value) {
    case Feature.DuplicateNameChecker:
      return (
        <Suspense>
          <DupNameChecker />
        </Suspense>
      );
    case Feature.DentPicker:
      return (
        <Suspense fallback={<p>Loading dent picker...</p>}>
          <DentPicker />
        </Suspense>
      );
    case Feature.ImagePicker:
      return (
        <Suspense fallback={<p>Loading image picker...</p>}>
          <ImagePicker />
        </Suspense>
      );

    default:
      return <p>Feature not found!</p>;
  }
});
```

**نکات مهم**:
- `DupNameChecker` به صورت synchronous import می‌شود
- `DentPicker` و `ImagePicker` به صورت lazy-loaded هستند (code splitting)
- `Suspense` برای نمایش loading state استفاده می‌شود
- کامپوننت `memo` شده است برای جلوگیری از re-render غیرضروری

## 3. نحوه استفاده در Symptoms

### الف) در `src/data/symptoms.ts`:

```11:20:src/data/symptoms.ts
  {
    id: "pat-name",
    name: "Full Name",
    desc: { feature: Feature.DuplicateNameChecker },
    required: true,
    type: SymptomType.String,
    open: true,
    omitHash: true,
    gpt: false,
    details: "patient name",
  },
```

```47:56:src/data/symptoms.ts
  {
    id: "pat-images",
    name: "Panaromic Images",
    desc: { feature: Feature.ImagePicker },
    type: SymptomType.String,
    required: true,
    open: true,
    noInput: true,
    gpt: false,
  },
```

```427:436:src/data/symptoms.ts
  {
    id: "location",
    name: "Location",
    desc: {
      title: "Pathologic extension",
      feature: Feature.DentPicker,
    },
    value: true,
    required: true,
    options: ["ana-location", "side", "relation-tooth"],
  },
```

### ب) در کامپوننت Symptom:

```118:132:src/components/Symptom.tsx
const Desc = (symptom: ISymptom) => {
  if (!symptom.desc) return null;
  if (!symptom.desc.title && !symptom.desc.image && !symptom.desc.feature) return null;
  return (
    <Stack p={2} pb={0}>
      <Box display="flex" flexDirection="column" overflow="hidden" gap={1}>
        {symptom.desc.title && <div>{symptom.desc.title}</div>}
        {symptom.desc.image && <img alt={symptom.desc.title} src={symptom.desc.image} className="desc-img" />}
        {symptom.desc.feature && (
          <Features value={symptom.desc.feature} symptom={symptom} params={symptom.desc.params} />
        )}
      </Box>
    </Stack>
  );
};
```

## 4. افزونه‌های موجود

### الف) DuplicateNameChecker

**هدف**: بررسی تکراری بودن نام بیمار

**موقعیت**: `src/components/DupNameChecker.tsx`

**عملکرد**:
- نام وارد شده را در history جستجو می‌کند
- اگر نام مشابه پیدا شود، لینکی نمایش می‌دهد
- با کلیک روی لینک، رکورد قبلی در buffer بارگذاری می‌شود

```7:35:src/components/DupNameChecker.tsx
export default function DupNameChecker() {
  const uuid = useBufferStore((s) => s.uuid);
  const history = usePersistStore((s) => s.history);
  const loadHistoryItem = useBufferStore((s) => s.loadHistoryItem);

  const patName = useSymptomValue<string>("pat-name");
  const index = useMemo(
    () => history.findIndex((x) => getSymptomValueById<string>(x.symptoms, "pat-name") === patName),
    [history, patName]
  );

  const load = async () => {
    if (index < 0) return;
    await loadHistoryItem(history[index], true);
  };

  if (!patName || index < 0 || patName.length < 3 || uuid === history[index].uuid) {
    return <span>Please enter the full name</span>;
  }

  return (
    <span style={{ margin: 0 }}>
      There's{" "}
      <Link sx={{ cursor: "pointer" }} onClick={load}>
        a patient with the same name
      </Link>
    </span>
  );
}
```

**API استفاده شده**:
- `useBufferStore`: دسترسی به buffer store
- `usePersistStore`: دسترسی به history
- `useSymptomValue`: خواندن مقدار symptom
- `loadHistoryItem`: بارگذاری یک رکورد در buffer

### ب) DentPicker

**هدف**: انتخاب موقعیت آناتومیک ضایعه روی تصویر رادیوگرافی

**موقعیت**: `src/components/DentPicker.tsx`

**عملکرد**:
- نمایش تصویر آناتومیک با نقاط قابل کلیک
- امکان انتخاب بازه (range) با کلیک روی دو نقطه
- به‌روزرسانی خودکار `maxilla`, `mandible`, یا `both` بر اساس انتخاب
- پشتیبانی از انتخاب در فک بالا، پایین، یا هر دو

```59:129:src/components/DentPicker.tsx
export default function DentPicker() {
  const updateSymptom = useBufferStore((s) => s.updateSymptom);
  const toggleExpanded = useBufferStore((s) => s.toggleExpanded);
  const { max, man, both } = useAnaLoc();

  const [start, setStart] = useState<IPoint>(); // tmp cache

  const onSelect = (p: IPoint) => {
    if (!start) return setStart(p);

    const _start = start.n < p.n ? start : p;
    const _end = start.n < p.n ? p : start;

    if (!(_start.j === JawType.Both || _start.j === _end.j)) return; // invalid

    toggleExpanded(AnaLocation.Root, true);

    // if end was both -> choose mandible
    if (_end.j === JawType.Both) {
      const range = { a: _start.n, b: _end.n };
      toggleExpanded(AnaLocation.Mandible, true);
      updateSymptom(AnaLocation.Mandible, range);
    }

    if (_end.j === JawType.Maxilla) {
      if (man) {
        const range = { a: Math.min(_start.n, man.a), b: Math.max(_end.n, man.b) };
        toggleExpanded(AnaLocation.Both, true);
        updateSymptom(AnaLocation.Both, range);
      } else {
        const range = { a: _start.n, b: _end.n };
        toggleExpanded(AnaLocation.Maxilla, true);
        updateSymptom(AnaLocation.Maxilla, range);
      }
    }

    if (_end.j === JawType.Mandible) {
      if (max) {
        const range = { a: Math.min(_start.n, max.a), b: Math.max(_end.n, max.b) };
        toggleExpanded(AnaLocation.Both, true);
        updateSymptom(AnaLocation.Both, range);
      } else {
        const range = { a: _start.n, b: _end.n };
        toggleExpanded(AnaLocation.Mandible, true);
        updateSymptom(AnaLocation.Mandible, range);
      }
    }

    setStart(undefined);
  };

  const onReset = () => {
    setStart(undefined);
    updateSymptom("ana-location", false);
  };

  return (
    <div className="dent-picker">
      <img alt="Radiography Anatomic Location" src={AnaLocImage} />
      {points.map((p, i) => (
        <Point key={i} p={p} onSelect={onSelect} start={start} />
      ))}
      {(max || man || both || start) && (
        <Tooltip title="Clear Selection">
          <IconButton onClick={onReset} size="small" className="clear-btn">
            <RestartAltRounded />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
}
```

**API استفاده شده**:
- `updateSymptom`: به‌روزرسانی مقدار symptom
- `toggleExpanded`: باز/بسته کردن symptom
- `useSymptomValue`: خواندن مقادیر `maxilla`, `mandible`, `both`

**خروجی**: تنظیم `IRange` برای `maxilla`, `mandible`, یا `both`

### ج) ImagePicker

**هدف**: آپلود و مدیریت تصاویر رادیوگرافی پانورامیک

**موقعیت**: `src/components/ImagePicker.tsx`

**عملکرد**:
- آپلود چندین تصویر (حداکثر 10 فایل)
- اعتبارسنجی اندازه فایل (حداکثر 1.5MB)
- Deduplication با استفاده از SHA-256 hash
- آپلود به Cloudinary
- نمایش پیشرفت آپلود
- مدیریت حذف تصاویر

```36:213:src/components/ImagePicker.tsx
export default function ImagePicker() {
  const updateSymptom = useBufferStore((s) => s.updateSymptom);
  const imagesRaw: string | undefined = useSymptomValue(sid);
  const imagesParsed = useMemo(() => parseImages(imagesRaw), [imagesRaw]);

  const filepond = useRef<FilePond>(null);
  const [files, setFiles] = useState<ActualFileObject[]>();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>();
  const initialized = useRef(false);
  const imagesSet = useRef(false); // makes sure images are loaded only once

  useEffect(() => {
    if (imagesSet.current) return;
    imagesSet.current = true;

    const setImagesOnInit = async () => {
      try {
        const list = await Promise.all(
          imagesParsed.map(async (image) => {
            const res = await fetch(image.url);
            return new File([await res.blob()], image.hash, { type: "image/jpeg" });
          })
        );

        setFiles(list);

        setTimeout(() => {
          initialized.current = true;
        }, 500);
      } catch (e) {
        console.error(e);
      }
    };

    setImagesOnInit();
  }, [imagesParsed]);

  // cloudinary + store

  const updateImages = async () => {
    const newImages: ICImage[] = [];

    // remove removed images from cloudinary
    for await (const image of imagesParsed) {
      const removed = !files?.find((x) => x.name === image.hash);
      if (removed) {
        makeDeleteRequest({
          token: image.deleteToken,
          successCallback: () => {
            console.log("cloud:delete", { image });
          },
          errorCallback: (error) => {
            console.error("cloud:delete", { error });
          },
        });
      }
    }

    // add new items - use existing if there is
    for await (const file of files || []) {
      const hash = await fileHash(file);
      const existing = imagesParsed.find((x) => x.hash === hash);

      // don't upload again just use previous
      if (existing) {
        newImages.push(existing);
        continue;
      }

      // upload
      await new Promise((resolve, reject) =>
        makeUploadRequest({
          file: file as File,
          fieldName: file.name,
          progressCallback: (_len, loaded, total) => {
            const percent = (loaded / total) * 100;
            setProgress(percent);
          },
          successCallback: (data) => {
            console.log("here");
            newImages.push({
              hash,
              url: data.url.replace("http://", "https://"),
              deleteToken: data.delete_token,
            });
            console.log("cloud:upload", { data });
            setProgress(0);
            resolve(data);
          },
          errorCallback: (error) => {
            console.error("cloud:upload", { error });
            setError(error);
            reject(error);
          },
        })
      );
    }

    updateSymptom(sid, stringifyImages(newImages));
  };

  useEffect(() => {
    // on-demand revalidation for upload - based on count and init
    if (files && initialized.current) updateImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files?.length]);

  const onFilesUpdate = async (newFiles: FilePondFile[]) => {
    console.log("update", { newFiles });
    const newFilesHashed = [];
    for (const f of newFiles) {
      const hash = await fileHash(f.file);
      if (f.file.name === hash) newFilesHashed.push(f.file);
      else newFilesHashed.push(new File([f.file], hash, { type: f.file.type }));
    }
    setFiles(newFilesHashed);
  };

  return (
    <div className="image-picker">
      <p style={{ marginTop: 0 }}>
        Please upload your panaromic images.
        <br />
        for image compression go to{" "}
        <Link to="https://tinypng.com" target="_blank" rel="noreferrer" style={{ color: "var(--theme-color)" }}>
          TinyPng.com
        </Link>
        .
        <br />
        <span style={{ color: "#666" }}>(preferred formats are: jpeg, webp)</span>
      </p>

      {!!progress && (
        <CircularProgress
          size="1.5rem"
          thickness={5}
          value={progress}
          variant={progress >= 100 ? "indeterminate" : "determinate"}
          color={progress >= 100 ? "success" : "primary"}
          sx={{ position: "fixed", top: "-1.5rem", right: "1rem" }}
        />
      )}

      {!!imagesRaw && !progress && (
        <TbCloudCheck //
          size="1.5rem"
          color="#4fe2a5"
          style={{ position: "fixed", top: "-1.5rem", right: "1rem" }}
        />
      )}

      {!!error && (
        <Tooltip title={error}>
          <div style={{ position: "fixed", top: "-1.5rem", right: "1rem" }}>
            <TbCloudCancel size="1.5rem" color="#e24f5b" cursor="pointer" />
          </div>
        </Tooltip>
      )}

      <FilePond
        ref={filepond}
        files={files} // initial files
        name="files" /* sets the file input name, it's filepond by default */
        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
        onupdatefiles={onFilesUpdate}
        // allowReorder
        allowMultiple
        acceptedFileTypes={["image/jpeg"]} // FIXME not working
        maxFiles={maxFiles}
        maxFileSize={maxFileSize / 1024 + "KB"}
        imagePreviewMaxHeight={150}
        instantUpload={false}
        server={{ revert: null }}
      />
    </div>
  );
}
```

**API استفاده شده**:
- `updateSymptom`: ذخیره لیست تصاویر در symptom
- `useSymptomValue`: خواندن تصاویر فعلی
- `parseImages` / `stringifyImages`: تبدیل بین string و array
- `makeUploadRequest` / `makeDeleteRequest`: ارتباط با Cloudinary

**خروجی**: ذخیره لیست `ICImage[]` به صورت string در symptom

## 5. قوانین و محدودیت‌ها

### قوانین:

1. **هر Feature یک React Component است**: باید یک کامپوننت React معتبر باشد
2. **دسترسی به Store**: می‌توانند از hooks برای دسترسی به store استفاده کنند:
   - `useBufferStore`: دسترسی به buffer (symptoms فعلی)
   - `usePersistStore`: دسترسی به history (رکوردهای ذخیره شده)
3. **خواندن/نوشتن Symptoms**: می‌توانند از `useSymptomValue` و `updateSymptom` استفاده کنند
4. **Params**: می‌توانند از `params` از `desc.params` استفاده کنند (فعلاً استفاده نمی‌شود)

### محدودیت‌ها:

1. **ثبت دستی**: باید در `Features` component ثبت شوند (switch case)
2. **بدون ایزولاسیون**: اجرا در همان context اصلی برنامه
3. **بدون Sandbox**: دسترسی کامل به تمام منابع
4. **بدون Plugin Registry**: سیستم registry برای افزونه‌های خارجی وجود ندارد

## 6. راهنمای ساخت افزونه جدید

### مراحل:

1. **تعریف Feature Enum**:
```typescript
// src/types/index.ts
export enum Feature {
  // ... existing
  MyNewFeature = "my-new-feature",
}
```

2. **ساخت کامپوننت**:
```typescript
// src/components/MyNewFeature.tsx
export default function MyNewFeature() {
  const updateSymptom = useBufferStore((s) => s.updateSymptom);
  const symptomValue = useSymptomValue<string>("my-symptom-id");
  
  // ... component logic
  
  return <div>My Feature Component</div>;
}
```

3. **ثبت در Features**:
```typescript
// src/components/Features.tsx
import MyNewFeature from "./MyNewFeature";

// در switch:
case Feature.MyNewFeature:
  return <MyNewFeature />;
```

4. **استفاده در Symptom**:
```typescript
// src/data/symptoms.ts
{
  id: "my-symptom",
  name: "My Symptom",
  desc: { feature: Feature.MyNewFeature },
  // ...
}
```

## 7. API در دسترس برای افزونه‌ها

### Store Hooks:

- `useBufferStore()`: دسترسی به buffer store
  - `symptoms`: لیست symptoms فعلی
  - `updateSymptom(id, value)`: به‌روزرسانی symptom
  - `loadHistoryItem(item, overwrite)`: بارگذاری رکورد از history
  - `toggleExpanded(id, open)`: باز/بسته کردن symptom

- `usePersistStore()`: دسترسی به persist store
  - `history`: لیست رکوردهای ذخیره شده

### Utility Hooks:

- `useSymptomValue<T>(id)`: خواندن مقدار یک symptom
- `getSymptomValueById<T>(symptoms, id)`: خواندن مقدار از لیست symptoms

### Types:

- `ISymptom`: نوع symptom
- `IHistoryItem`: نوع رکورد history
- `IRange`: نوع بازه (برای موقعیت)
- `ICImage`: نوع تصویر

## 8. مثال عملی: افزونه جدید

فرض کنید می‌خواهید یک افزونه برای انتخاب تاریخ اضافه کنید:

```typescript
// 1. اضافه به Feature enum
export enum Feature {
  // ...
  DatePicker = "date-picker",
}

// 2. ساخت کامپوننت
export default function DatePicker() {
  const updateSymptom = useBufferStore((s) => s.updateSymptom);
  const date = useSymptomValue<string>("visit-date");
  
  return (
    <input
      type="date"
      value={date || ""}
      onChange={(e) => updateSymptom("visit-date", e.target.value)}
    />
  );
}

// 3. ثبت در Features
case Feature.DatePicker:
  return <DatePicker />;

// 4. استفاده در symptom
{
  id: "visit-date",
  name: "Visit Date",
  desc: { feature: Feature.DatePicker },
  type: SymptomType.String,
}
```

## 9. محل تعریف در کد

- **Feature Enum**: `src/types/index.ts` (خط ~39)
- **Desc Type**: `src/types/index.ts` (خط ~47)
- **Features Router**: `src/components/Features.tsx`
- **DuplicateNameChecker**: `src/components/DupNameChecker.tsx`
- **DentPicker**: `src/components/DentPicker.tsx`
- **ImagePicker**: `src/components/ImagePicker.tsx`
- **استفاده در Symptom**: `src/components/Symptom.tsx` (خط ~118)
- **تعریف در Symptoms**: `src/data/symptoms.ts`

## 10. مقایسه با Plugin API کامل

### سیستم فعلی:
- ✅ ساده و مستقیم
- ✅ عملکرد سریع (بدون overhead)
- ✅ دسترسی مستقیم به store
- ❌ نیاز به ثبت دستی
- ❌ بدون ایزولاسیون
- ❌ بدون سیستم مدیریت چرخه حیات
- ❌ عدم پشتیبانی از افزونه‌های خارجی

### Plugin API کامل (فرضی):
- ✅ سیستم ثبت خودکار
- ✅ ایزولاسیون و امنیت
- ✅ مدیریت چرخه حیات
- ✅ پشتیبانی از افزونه‌های خارجی
- ❌ پیچیدگی بیشتر
- ❌ overhead بیشتر

## 11. نتیجه‌گیری

سیستم فعلی یک راه‌حل ساده و موثر برای افزودن قابلیت‌های سفارشی به علائم است. این سیستم برای افزونه‌های داخلی که توسط تیم توسعه ساخته می‌شوند مناسب است. برای نیاز به افزونه‌های خارجی یا ایزولاسیون کامل، نیاز به طراحی یک Plugin API کامل‌تر وجود دارد.
