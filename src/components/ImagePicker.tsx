import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../config/store";
import { useSymptomValue } from "../hooks/symptom";
import { calcStorageSpace } from "../lib/storage";

import "@pqina/pintura/pintura.css";
// import "filepond-plugin-file-poster/dist/filepond-plugin-file-poster.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
import "filepond/dist/filepond.min.css";
import "../config/image-picker.css";

import FilePondPluginImageEditor from "@pqina/filepond-plugin-image-editor/dist/FilePondPluginImageEditor.js";
import {
  ActualFileObject,
  FilePondErrorDescription,
  FilePondFile,
  LoadServerConfigFunction,
  ProcessServerConfigFunction,
  RevertServerConfigFunction,
} from "filepond";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import { FilePond, registerPlugin } from "react-filepond";
import { makeDeleteRequest, makeUploadRequest } from "../lib/cloudinary";
import { ICImage } from "../types/interfaces";
import { parseImages, stringifyImages } from "../lib/image";

// import {
//   createDefaultImageReader,
//   createDefaultImageWriter,
//   getEditorDefaults,
//   openEditor,
//   PinturaEditorHeadlessOptions,
//   processImage,
// } from "@pqina/pintura";

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

  const filepond = useRef<FilePond>(null);
  const { free } = useMemo(calcStorageSpace, []);
  const [images, setImages] = useState<ActualFileObject[]>();

  useEffect(() => {
    const setImagesOnInit = async () => {
      const images = parseImages(imagesRaw);

      const list = await Promise.all(
        images.map(async (image) => {
          const res = await fetch(image.url);
          return new File([await res.blob()], image.filename, { type: "image/jpeg" });
        })
      );

      setImages(list);
    };

    setImagesOnInit();

    return () => {
      // TODO clean up
    };
  }, []);

  // cloudinary + store

  const onAddFile = (error: FilePondErrorDescription | null, file: FilePondFile) => {
    console.log("add", { error, file });
    return;
    const abortRequest = makeUploadRequest({
      file: file.file as File,
      fieldName: file.filename,
      successCallback: (deleteToken, data) => {
        const images = parseImages(imagesRaw);
        images.push({
          url: data.url,
          deleteToken: deleteToken,
          filename: file.filename,
        });
        updateSymptom(sid, stringifyImages(images));
      },
      errorCallback: () => {},
      progressCallback: () => {},
    });
  };

  const onRemoveFile = (error: FilePondErrorDescription | null, file: FilePondFile) => {
    console.log("remove", { error, file });
    // TODO same as top with splice -> get returned item from splice and
  };

  // methods

  const revert: RevertServerConfigFunction = (token, successCallback, errorCallback) => {
    makeDeleteRequest({
      token,
      successCallback,
      errorCallback,
    });
  };

  const process: ProcessServerConfigFunction = (
    fieldName,
    file,
    _metadata,
    load,
    error,
    progress,
    abort,
    _transfer,
    _options
  ) => {
    console.log({ _metadata });

    const abortRequest = makeUploadRequest({
      file: file as File,
      fieldName,
      successCallback: (deleteToken, data) => {
        load(deleteToken);
      },
      errorCallback: error,
      progressCallback: progress,
    });

    return {
      abort: () => {
        abortRequest();
        abort();
      },
    };
  };

  const load: LoadServerConfigFunction = (source, load, error, progress, abort, headers) => {
    console.log({ source, headers });
    fetch(source).then(async (res) => {
      const file = new File([await res.blob()], "image", { type: "image/jpg" });
      load(file);
    });
  };

  const onFilesUpdate = (files: FilePondFile[]) => {
    console.log({ files });
    setImages(files.map((f) => f.file));
  };

  // ui

  const maxTotalFileSize = maxFileSize * maxFiles; // B

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
          ref={filepond}
          files={images} // initial files
          name="files" /* sets the file input name, it's filepond by default */
          labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
          onupdatefiles={onFilesUpdate}
          onprocessfile={(err, file) => console.log("proc", { err, file })}
          // onaddfile={onAddFile}
          onremovefile={onRemoveFile}
          // allowReorder
          allowMultiple
          acceptedFileTypes={["image/jpeg"]} // FIXME not working
          maxFiles={maxFiles}
          maxTotalFileSize={Math.min(free, maxTotalFileSize) / 1024 + "KB"}
          imagePreviewMaxHeight={150}
          // instantUpload={false}
          // server={{ process, revert, load }}
        />
      )}
    </div>
  );
}
