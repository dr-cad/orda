import { useCallback, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../config/store";
import { useSymptomValue } from "../hooks/symptom";
import { calcStorageSpace } from "../lib/storage";

import FilePondPluginImageEditor from "@pqina/filepond-plugin-image-editor/dist/FilePondPluginImageEditor.js";
import { ActualFileObject, FilePondFile } from "filepond";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import { FilePond, registerPlugin } from "react-filepond";

import "@pqina/pintura/pintura.css";
// import "filepond-plugin-file-poster/dist/filepond-plugin-file-poster.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
import "filepond/dist/filepond.min.css";
import "../config/image-picker.css";

registerPlugin(
  // plugins
  FilePondPluginImageEditor,
  FilePondPluginImagePreview,
  // FilePondPluginFilePoster,
  FilePondPluginFileValidateSize
);

const sid = "panaromic-images";
const maxFiles = 5;
const maxFileSize = 100 * 1024; // 100 KB

export default function ImagePicker() {
  const updateSymptom = useStore((s) => s.updateSymptom);
  const imagesRaw: string | undefined = useSymptomValue(sid);

  const fielpond = useRef<FilePond>(null);

  const { free } = useMemo(calcStorageSpace, []);

  const [images, setImages] = useState<ActualFileObject[]>(() => {
    // load initial images
    if (!imagesRaw) return [];
    const base64List: string[] = JSON.parse(imagesRaw);
    return base64List.map((dataURL, i) => {
      return dataURLToFile(dataURL, `image-${i + 1}`);
    });
  });

  const onFilesUpdate = useCallback(
    async (files: FilePondFile[]) => {
      setImages(files.map((f) => f.file));
      const base64PromiseList = files.map((f) => fileToDataURL(f.file));
      const base64List = await Promise.all(base64PromiseList);
      const base64ListStringify = files.length ? JSON.stringify(base64List) : false;
      updateSymptom(sid, base64ListStringify);
    },
    [updateSymptom]
  );

  const maxTotalFileSize = maxFileSize * maxFiles; // B

  return (
    <div className="image-picker">
      <p style={{ marginTop: 0 }}>
        Please upload your panaromic image.
        <br />
        for image compression go to{" "}
        <Link to="https://tinypng.com" target="_blank" rel="noreferrer" style={{ color: "var(--theme-color)" }}>
          TinyPng.com
        </Link>
        <br />
        <span style={{ color: "#666" }}>(preferred formats are: jpeg, webp)</span>
      </p>
      {free < maxFileSize ? (
        <p>
          You have used all your storage, please{" "}
          <Link className="link" to="/history">
            delete some records
          </Link>{" "}
          to continue!
        </p>
      ) : (
        <FilePond
          ref={fielpond}
          files={images} // initial files
          name="files" /* sets the file input name, it's filepond by default */
          labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
          onupdatefiles={onFilesUpdate}
          onprocessfile={() => onFilesUpdate(fielpond.current?.getFiles() || [])}
          allowReorder
          allowMultiple
          maxFiles={maxFiles}
          maxTotalFileSize={Math.min(free, maxTotalFileSize) / 1024 + "KB"}
          imagePreviewMaxHeight={150}
          // filePosterMaxHeight={150}
          // imageEditor={{
          //   // Maps legacy data objects to new imageState objects (optional)
          //   // legacyDataToImageState: legacyDataToImageState,
          //   // Used to create the editor (required)
          //   createEditor: openEditor,
          //   // Used for reading the image data. See JavaScript installation for details on the `imageReader` property (required)
          //   imageReader: [createDefaultImageReader],
          //   // Required when generating a preview thumbnail and/or output image
          //   imageWriter: [createDefaultImageWriter],
          //   // Used to create poster and output images, runs an invisible "headless" editor instance
          //   imageProcessor: async (src: File, options: PinturaEditorHeadlessOptions) => {
          //     console.log({ src, options, size: src.size });
          //     const res = await processImage(src, options);
          //     console.log(res, res.dest.size);
          //     const index = images.findIndex(async (x) => (await x.text()) === (await src.text()));
          //     if (index > -1) fielpond.current?.removeFile(index);
          //     fielpond.current?.addFile(res.dest);
          //     return res.dest;
          //   },
          //   // Pintura Image Editor options
          //   editorOptions: {
          //     // Pass the editor default configuration options
          //     ...getEditorDefaults(),
          //     // This will set a square crop aspect ratio
          //     // imageCropAspectRatio: 1,
          //   },
          // }}
          // imageEditorAfterWriteImage={(res) => {
          //   console.log("After write", res.dest.fileSize);
          //   return res.dest;
          // }}
          // workaround
          // instantUpload={false}
          // server={{
          //   process: (name, file, metadata, load) => {
          //     setTimeout(() => {
          //       load(Date.now().toString());
          //     }, 500);
          //   },
          //   // FilePond will try to revert earlier uploads, if you've supplied a
          //   // URL to `server.url` or `server` you need to set `revert` to null prevent
          //   // FilePond from calling the server to DELETE the file
          //   revert: null,
          // }}
        />
      )}
    </div>
  );
}

async function fileToDataURL(file: ActualFileObject): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const url = event.target?.result?.toString();
      if (!url) return reject("Couldn't read file: " + file.name);
      resolve(url);
    };
    reader.readAsDataURL(file);
  });
}

function dataURLToFile(dataURL: string, filename: string): File {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[arr.length - 1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}
