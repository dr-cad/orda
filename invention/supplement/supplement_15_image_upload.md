# ضمیمه 15: فرآیند آپلود و ذخیره تصاویر

## 1. اعتبارسنجی

### الف) نوع فایل:
```typescript
const allowedTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png"
];

function validateFileType(file: File): boolean {
  return allowedTypes.includes(file.type);
}
```

### ب) اندازه فایل:
```typescript
const maxFileSize = 1500 * 1024; // 1.5MB

function validateFileSize(file: File): boolean {
  return file.size <= maxFileSize;
}
```

### ج) اسکن بدافزار:
- بررسی در سطح **Cloudinary** (سرویس میزبان)
- Cloudinary به صورت خودکار فایل‌های مشکوک را رد می‌کند

## 2. Dedup با SHA-256

### الف) الگوریتم:
- **SHA-256**: از کتابخانه `crypto-js`
- **فرآیند**: محاسبه hash فایل در سمت کلاینت

### ب) کد پیاده‌سازی:
```typescript
import sha256 from "crypto-js/sha256";

async function fileHash(file: File | ActualFileObject): Promise<string> {
  return new Promise((res) => {
    const reader = new FileReader();
    
    reader.onload = function (e) {
      const hash = sha256(e.target?.result?.toString() || "");
      res(hash.toString());
    };
    
    reader.readAsBinaryString(file);
  });
}
```

### ج) فرآیند Dedup:
```typescript
async function uploadImage(file: File) {
  // 1. محاسبه hash
  const hash = await fileHash(file);
  
  // 2. بررسی وجود hash در سرور
  const existing = imagesParsed.find(x => x.hash === hash);
  
  if (existing) {
    // 3. استفاده از URL موجود (بدون آپلود مجدد)
    return existing;
  }
  
  // 4. آپلود فایل جدید
  const uploaded = await uploadToCloudinary(file);
  
  // 5. ذخیره hash و URL
  return {
    hash,
    url: uploaded.url,
    deleteToken: uploaded.delete_token
  };
}
```

## 3. فشرده‌سازی

### الف) قبل از آپلود:
```typescript
// فشرده‌سازی در سمت کلاینت
function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // تنظیم اندازه
        canvas.width = img.width * 0.8;
        canvas.height = img.height * 0.8;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          }
        }, "image/jpeg", 0.8);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
```

## 4. آپلود به Cloudinary

### الف) سرویس میزبان:
- **Cloudinary**: سرویس میزبانی و پردازش تصاویر
- **API**: RESTful API

### ب) کد آپلود:
```typescript
function makeUploadRequest({
  file,
  fieldName,
  progressCallback,
  successCallback,
  errorCallback
}: UploadRequest) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  
  const xhr = new XMLHttpRequest();
  
  xhr.upload.addEventListener("progress", (e) => {
    if (e.lengthComputable) {
      const percent = (e.loaded / e.total) * 100;
      progressCallback(e.total, e.loaded, e.total);
    }
  });
  
  xhr.addEventListener("load", () => {
    if (xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      successCallback(response);
    } else {
      errorCallback(new Error("Upload failed"));
    }
  });
  
  xhr.open("POST", CLOUDINARY_UPLOAD_URL);
  xhr.send(formData);
}
```

## 5. ذخیره‌سازی

### الف) ساختار داده:
```typescript
interface ICImage {
  url: string;           // URL تصویر در Cloudinary
  deleteToken: string;   // توکن برای حذف
  hash: string;          // SHA-256 hash
}
```

### ب) ذخیره در سیستم:
```typescript
// ذخیره به صورت JSON string
const imagesString = JSON.stringify(imagesArray);
updateSymptom("pat-images", imagesString);
```

## 6. حذف تصاویر

### الف) حذف از Cloudinary:
```typescript
function makeDeleteRequest({
  token,
  successCallback,
  errorCallback
}: DeleteRequest) {
  fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/delete_by_token`, {
    method: "POST",
    body: JSON.stringify({ token }),
    headers: { "Content-Type": "application/json" }
  })
    .then(response => response.json())
    .then(successCallback)
    .catch(errorCallback);
}
```

### ب) حذف از لیست محلی:
```typescript
// هنگام حذف تصویر از UI
const updatedImages = images.filter(img => img.hash !== hashToDelete);
makeDeleteRequest({
  token: imageToDelete.deleteToken,
  successCallback: () => {
    updateSymptom("pat-images", JSON.stringify(updatedImages));
  }
});
```

## 7. مثال کامل

### الف) آپلود تصویر:
```typescript
async function handleImageUpload(file: File) {
  // 1. اعتبارسنجی
  if (!validateFileType(file)) {
    throw new Error("نوع فایل نامعتبر");
  }
  if (!validateFileSize(file)) {
    throw new Error("اندازه فایل بیش از حد مجاز");
  }
  
  // 2. فشرده‌سازی
  const compressed = await compressImage(file);
  
  // 3. محاسبه hash
  const hash = await fileHash(compressed);
  
  // 4. بررسی dedup
  const existing = findImageByHash(hash);
  if (existing) {
    return existing;  // استفاده از موجود
  }
  
  // 5. آپلود
  const uploaded = await uploadToCloudinary(compressed);
  
  // 6. ذخیره
  const newImage: ICImage = {
    hash,
    url: uploaded.url,
    deleteToken: uploaded.delete_token
  };
  
  addImageToSymptom(newImage);
  return newImage;
}
```

## 8. محدودیت‌ها

### الف) تعداد فایل:
```typescript
const maxFiles = 10;
```

### ب) اندازه فایل:
```typescript
const maxFileSize = 1500 * 1024; // 1.5MB
```

### ج) نوع فایل:
- فقط JPEG و PNG

## 9. UI Component

### استفاده از FilePond:
```typescript
import { FilePond, registerPlugin } from "react-filepond";

<FilePond
  files={files}
  onupdatefiles={setFiles}
  maxFiles={10}
  maxFileSize="1.5MB"
  acceptedFileTypes={["image/jpeg", "image/png"]}
  server={{
    process: {
      url: CLOUDINARY_UPLOAD_URL,
      method: "POST"
    }
  }}
/>
```

## 10. محل پیاده‌سازی

- **Component**: `src/components/ImagePicker.tsx`
- **Hash**: خط 215-228
- **Upload**: خط 76-136
- **Dedup**: خط 96-104
- **Validation**: خط 34

