import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { calcStorageSpace } from "../lib/storage";

import FilePondPluginImageEditor from "@pqina/filepond-plugin-image-editor/dist/FilePondPluginImageEditor.js";
import {
  createDefaultImageReader,
  createDefaultImageWriter,
  getEditorDefaults,
  openEditor,
  processImage,
} from "@pqina/pintura";
import { ActualFileObject, FilePondFile } from "filepond";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginImageEdit from "filepond-plugin-image-edit";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import { FilePond, registerPlugin } from "react-filepond";

import "@pqina/pintura/";
import "@pqina/pintura/pintura.css";
import "filepond-plugin-image-edit/dist/filepond-plugin-image-edit.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import "filepond/dist/filepond.min.css";
import "../config/image-picker.css";
import { useStore } from "../config/store";
import { useSymptomValue } from "../hooks/symptom";

registerPlugin(
  FilePondPluginImageEdit,
  FilePondPluginImageEditor,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateSize
);

const sid = "panaromic-images";
const maxFiles = 5;
const maxFileSize = 100 * 1024; // 100 KB

export default function ImagePicker() {
  const updateSymptom = useStore((s) => s.updateSymptom);
  const imagesRaw: string | undefined = useSymptomValue(sid);

  const { free } = useMemo(calcStorageSpace, []);

  const [images, setImages] = useState<ActualFileObject[]>(() => {
    // load initial images
    if (!imagesRaw) return [];
    const base64List: string[] = JSON.parse(imagesRaw);
    return base64List.map((dataURL, i) => {
      return dataURLToFile(dataURL, `image-${i + 1}`);
    });
  });

  const onFilesAdded = useCallback(
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
          files={images}
          onupdatefiles={onFilesAdded}
          allowMultiple
          // imageEditorInstantEdit
          maxFiles={maxFiles}
          maxTotalFileSize={Math.min(free, maxTotalFileSize) / 1024 + "KB"}
          imagePreviewHeight={150}
          imageEditor={{
            // Maps legacy data objects to new imageState objects (optional)
            // legacyDataToImageState: legacyDataToImageState,
            // Used to create the editor (required)
            createEditor: openEditor,
            // Used for reading the image data. See JavaScript installation for details on the `imageReader` property (required)
            imageReader: [createDefaultImageReader, {}],
            // Required when generating a preview thumbnail and/or output image
            imageWriter: [createDefaultImageWriter, {}],
            // Used to create poster and output images, runs an invisible "headless" editor instance
            imageProcessor: processImage,
            // Pintura Image Editor options
            editorOptions: {
              // Pass the editor default configuration options
              ...getEditorDefaults(),
              // This will set a square crop aspect ratio
              // imageCropAspectRatio: 1,
            },
          }}
          name="files" /* sets the file input name, it's filepond by default */
          labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
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
