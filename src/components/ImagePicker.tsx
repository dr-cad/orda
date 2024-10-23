import "@pqina/pintura/pintura.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
import "filepond/dist/filepond.min.css";
import "../config/image-picker.css";

import FilePondPluginImageEditor from "@pqina/filepond-plugin-image-editor/dist/FilePondPluginImageEditor.js";
import { ActualFileObject, FilePondFile } from "filepond";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import { FilePond, registerPlugin } from "react-filepond";

import { CircularProgress, Tooltip } from "@mui/material";
import sha256 from "crypto-js/sha256";
import { useEffect, useMemo, useRef, useState } from "react";
import { TbCloudCancel, TbCloudCheck } from "react-icons/tb";
import { Link } from "react-router-dom";
import { useSymptomValue } from "../hooks/symptom";
import { makeDeleteRequest, makeUploadRequest } from "../lib/cloudinary";
import { parseImages, stringifyImages } from "../lib/image";
import { useBufferStore } from "../store";
import { ICImage } from "../types";

registerPlugin(
  // plugins
  FilePondPluginImageEditor,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateSize
);

const sid = "pat-images";
const maxFiles = 10;
const maxFileSize = 1500 * 1024; // 1.5MB < 2.5MB cloudinary limit

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
