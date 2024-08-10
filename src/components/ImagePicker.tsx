import "@pqina/pintura/pintura.css";
// import "filepond-plugin-file-poster/dist/filepond-plugin-file-poster.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
import "filepond/dist/filepond.min.css";
import "../config/image-picker.css";

import FilePondPluginImageEditor from "@pqina/filepond-plugin-image-editor/dist/FilePondPluginImageEditor.js";
import { ActualFileObject, FilePondFile } from "filepond";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import { FilePond, registerPlugin } from "react-filepond";

import sha256 from "crypto-js/sha256";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../config/store";
import { useSymptomValue } from "../hooks/symptom";
import { makeUploadRequest } from "../lib/cloudinary";
import { parseImages, stringifyImages } from "../lib/image";
import { calcStorageSpace } from "../lib/storage";
import { ICImage } from "../types/interfaces";

registerPlugin(
  // plugins
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
  const imagesParsed = useMemo(() => parseImages(imagesRaw), [imagesRaw]);

  const filepond = useRef<FilePond>(null);
  const { free } = useMemo(calcStorageSpace, []);
  const [files, setFiles] = useState<ActualFileObject[]>();
  const initialized = useRef(false);

  useEffect(() => {
    console.log({ imagesParsed });
  }, [imagesParsed]);

  useEffect(() => {
    const setImagesOnInit = async () => {
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
    };

    console.log("INITIALIZE");
    setImagesOnInit();

    return () => {
      // TODO clean up
    };
  }, []);

  // cloudinary + store

  const updateImages = async () => {
    const newImages: ICImage[] = [];

    for await (const file of files || []) {
      const hash = await fileHash(file);
      const existing = imagesParsed.find((x) => x.hash === hash);
      if (existing) {
        // don't upload again just use previous
        newImages.push(existing);
        console.log({ existing });
      } else {
        // upload
        await new Promise((resolve) =>
          makeUploadRequest({
            file: file as File,
            fieldName: file.name,
            successCallback: (data) => {
              console.log(data);
              newImages.push({
                hash,
                url: data.url,
                deleteToken: data.delete_token,
              });
              resolve(data);
            },
            errorCallback: (err) => {
              console.log("error", err);
            },
            progressCallback: () => {},
          })
        );
      }
    }

    updateSymptom(sid, stringifyImages(newImages));
  };

  useEffect(() => {
    if (initialized.current) updateImages();
  }, [files?.length]);

  const onFilesUpdate = async (newFiles: FilePondFile[]) => {
    console.log({ newFiles });
    setFiles(newFiles.map((f) => f.file));
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
          files={files} // initial files
          name="files" /* sets the file input name, it's filepond by default */
          labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
          onupdatefiles={onFilesUpdate}
          onaddfile={(err, file) => {
            console.log("add", file);
          }}
          // beforeRemoveFile={(file) => {}}
          onremovefile={(err, file) => {
            console.log("remove", file);
          }}
          // allowReorder
          allowMultiple
          acceptedFileTypes={["image/jpeg"]} // FIXME not working
          maxFiles={maxFiles}
          maxTotalFileSize={Math.min(free, maxTotalFileSize) / 1024 + "KB"}
          imagePreviewMaxHeight={150}
          instantUpload={false}
          server={{ revert: null }}
        />
      )}
    </div>
  );
}

async function fileHash(file: File | ActualFileObject): Promise<string> {
  return new Promise((res) => {
    //Instantiate a reader
    const reader = new FileReader();

    //What to do when we gets data?
    reader.onload = function (e) {
      const hash = sha256(e.target?.result?.toString() || "");
      res(hash.toString());
    };

    reader.readAsBinaryString(file);
  });
}
