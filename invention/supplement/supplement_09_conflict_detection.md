# ضمیمه 9: قواعد جلوگیری از تضاد یا همپوشانی

## 1. ساختار تضادها در کد

تضادها در سیستم به صورت **Enum Parent** پیاده‌سازی شده‌اند، نه به صورت گروه‌های مستقل. هر گروه متضاد یک والد Enum دارد که فرزندان آن با یکدیگر در تضاد هستند.

### گروه‌های متضاد در `src/data/symptoms.ts`:

#### 1. Cortical bone (corital-bone)
```typescript
{
  id: "corital-bone",
  name: "Cortial bone (Jaws and maxillary sinus)",
  type: SymptomType.Enum,
  options: ["expand", "destruct-3", "extend"],
}
```

#### 2. Internal structure (int-struct)
```typescript
{
  id: "int-struct",
  name: "Internal structure",
  required: true,
  type: SymptomType.Enum,
  options: ["radiolucent", "mixed", "radiopaque"],
}
```

#### 3. Anatomic location (ana-location)
```typescript
{
  id: "ana-location",
  name: "Anatomic Location",
  type: SymptomType.Enum,
  options: ["maxilla", "mandible", "both"],
}
```

#### 4. Radiopaque zone (radiopaque)
```typescript
{
  id: "radiopaque",
  name: "Radiopaque",
  type: SymptomType.Enum,
  options: ["radiopaue-zone", "radiopaque-nozone"],
}
```

#### 5. Unilocularity (unilocular)
```typescript
{
  id: "unilocular",
  name: "Unilocular",
  type: SymptomType.Enum,
  options: ["uni1", "uni2"],
}
```

#### 6. Onset and course (onset-course)
```typescript
{
  id: "onset-course",
  name: "Onset and course",
  type: SymptomType.Enum,
  options: ["slow-0", "moderate-0", "rapid-0"],
}
```

## 2. مکانیزم جلوگیری از تضاد

سیستم **تضادها را حل نمی‌کند**، بلکه **از بروز آن‌ها جلوگیری می‌کند** با ریست کردن خودکار سایر گزینه‌های متضاد هنگام انتخاب یک گزینه.

### پیاده‌سازی در `src/lib/symptoms.ts`:

#### الف) تابع `recursivelyUpdateParents`:
```80:95:src/lib/symptoms.ts
export function recursivelyUpdateParents(arr: ISymptom[], id: string, silent?: boolean) {
  // find a parent which has this id as a child
  const parent = arr.find((p) => p.options?.includes(id));
  if (!parent) return;
  if (!silent) console.log("Updating Parent", parent.id);
  parent.value = false;
  for (const option of parent.options ?? []) {
    // reset siblings of enum parent
    if (parent.type === SymptomType.Enum && option !== id) recursivelyResetItem(arr, option, silent);
    // set ancestors whom have value
    // it works: because it fills from inner parents to outer ones
    const item = arr.find((item) => item.id === option);
    if (item?.value) parent.value = true;
  }
  recursivelyUpdateParents(arr, parent.id, silent);
}
```

**نکته کلیدی**: در خط 88، هنگام انتخاب یک فرزند Enum، تمام فرزندان دیگر (siblings) به صورت خودکار ریست می‌شوند.

#### ب) تابع `recursivelyResetItem`:
```58:72:src/lib/symptoms.ts
export function recursivelyResetItem(arr: ISymptom[], id: string, silent?: boolean) {
  // populate item
  const item = arr.find((x) => x.id === id);
  // reset if found
  if (item) {
    if (!silent) console.log("Removing", item.id);
    // reset self
    item.value = undefined;
    item.open = false; // close the item
    // reset each child recursively
    if (Array.isArray(item.options)) {
      item.options.forEach((o) => recursivelyResetItem(arr, o, silent));
    }
  } else console.error("Couldn't find option", id);
}
```

این تابع مقدار symptom و تمام فرزندان آن را به `undefined` برمی‌گرداند.

#### ج) تابع `updateSymptom`:
```97:111:src/lib/symptoms.ts
export function updateSymptom(arr: ISymptom[], id: string, value: ISymptom["value"], silent?: boolean) {
  const item = arr.find((i) => i.id === id);
  if (!item) {
    console.error("Couldnt find item", id);
    return;
  }
  // NOTICE Quick fix: I excluded inputs from reseting - the reason why I did this is that, the input items don't have children.
  const { hasInput } = digestSymptom(item);
  // if unset occured and has options -> reset item -r
  if (!value && !hasInput) recursivelyResetItem(arr, item.id, silent);
  // update/reset value
  if (!silent) console.log("Updating", id, value);
  item.value = value;
  recursivelyUpdateParents(arr, item.id, silent);
}
```

هنگام به‌روزرسانی یک symptom، `recursivelyUpdateParents` فراخوانی می‌شود که به صورت خودکار siblings را ریست می‌کند.

## 3. قواعد در سطح AI (Function Calling)

قواعد تضاد در فایل‌های `server/INSTRUCT.md` و `server/GPTTOOL.md` تعریف شده و در `server/swagger.ts` به صورت خودکار از ساختار Enum parents تولید می‌شوند:

```16:23:server/swagger.ts
function genEnumWarning(s: ISymptomRaw): string {
  const [, siblings] = getSiblings(s);
  if (!siblings) return "";
  return (
    siblings.map((sid) => `'${getSId(sid)}'`).join(", ") +
    " options are in conflict. only one of them can be true, others MUST be false!"
  );
}
```

مثال قواعد تولید شده:
```
1. 'expand', 'destruct_3', 'extend' options are in conflict. only one of them can be true, others MUST be false!
2. 'radiolucent', 'mixed', 'radiopaque' options are in conflict. only one of them can be true, others MUST be false!
3. 'maxilla', 'mandible', 'both' options are in conflict. only one of them can be true, others MUST be false!
4. 'radiopaue_zone', 'radiopaque_nozone' options are in conflict. only one of them can be true, others MUST be false!
5. 'uni1', 'uni2' options are in conflict. only one of them can be true, others MUST be false!
6. 'slow_0', 'moderate_0', 'rapid_0' options are in conflict. only one of them can be true, others MUST be false!
```

## 4. مثال عملی

### سناریو: انتخاب `slow-0` زمانی که `moderate-0` قبلاً انتخاب شده است

#### وضعیت قبل از به‌روزرسانی:
```json
{
  "onset-course": true,
  "slow-0": false,
  "moderate-0": true,
  "rapid-0": false
}
```

#### فراخوانی:
```typescript
updateSymptom(symptoms, "slow-0", true);
```

#### فرآیند اجرا:
1. `item.value = true` برای `slow-0` تنظیم می‌شود
2. `recursivelyUpdateParents` برای `slow-0` فراخوانی می‌شود
3. والد `onset-course` پیدا می‌شود (یک Enum parent)
4. در حلقه `parent.options`:
   - برای `moderate-0`: چون `option !== id`، `recursivelyResetItem` فراخوانی می‌شود → `moderate-0.value = undefined`
   - برای `rapid-0`: چون `option !== id`، `recursivelyResetItem` فراخوانی می‌شود → `rapid-0.value = undefined`
   - برای `slow-0`: چون `option === id`، هیچ کاری انجام نمی‌شود

#### وضعیت بعد از به‌روزرسانی:
```json
{
  "onset-course": true,
  "slow-0": true,
  "moderate-0": undefined,  // به صورت خودکار ریست شد
  "rapid-0": undefined       // به صورت خودکار ریست شد
}
```

**نتیجه**: تضاد هرگز رخ نمی‌دهد چون siblings به صورت خودکار ریست می‌شوند.

## 5. مقایسه با رویکرد حل تضاد

### رویکرد فعلی (جلوگیری):
- ✅ تضاد هرگز رخ نمی‌دهد
- ✅ نیازی به تشخیص تضاد نیست
- ✅ نیازی به حل دستی یا خودکار تضاد نیست
- ✅ تجربه کاربری بهتر (بدون هشدار یا دیالوگ)

### رویکرد حل تضاد (که استفاده نمی‌شود):
- ❌ نیاز به تشخیص تضاد بعد از بروز آن
- ❌ نیاز به استراتژی حل (اولویت، انتخاب کاربر، ...)
- ❌ نیاز به UI برای نمایش هشدار/درخواست تصمیم
- ❌ پیچیدگی بیشتر در کد

## 6. محل تعریف در کد

- **ساختار Enum Parents**: `src/data/symptoms.ts`
  - `corital-bone` (خط ~698)
  - `int-struct` (خط ~542)
  - `ana-location` (خط ~438)
  - `radiopaque` (خط ~549)
  - `unilocular` (خط ~572)
  - `onset-course` (خط ~179)

- **منطق جلوگیری از تضاد**: `src/lib/symptoms.ts`
  - `updateSymptom` (خط ~97)
  - `recursivelyUpdateParents` (خط ~80)
  - `recursivelyResetItem` (خط ~58)

- **تولید قواعد برای AI**: `server/swagger.ts`
  - `getSiblings` (خط ~9)
  - `genEnumWarning` (خط ~16)

- **قواعد در System Prompt**: `server/INSTRUCT.md`, `server/GPTTOOL.md`

- **استفاده در UI**: `src/components/Symptom.tsx`
  - با فراخوانی `updateSymptom` از `useBufferStore`

## 7. نکات مهم

1. **فقط Enum Parents**: تنها والدهایی با `type === SymptomType.Enum` این رفتار را دارند
2. **ریست بازگشتی**: ریست کردن یک symptom باعث ریست شدن تمام فرزندان آن نیز می‌شود
3. **به‌روزرسانی والد**: والد Enum بر اساس مقدار فرزندان به‌روزرسانی می‌شود (اگر حداقل یک فرزند مقدار داشته باشد، والد `true` می‌شود)
4. **بدون هشدار**: چون تضاد رخ نمی‌دهد، نیازی به نمایش هشدار یا دیالوگ نیست
