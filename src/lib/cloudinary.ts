const cloudName = "dta443kr0";
const uploadPreset = "orda-cloud";
const baseUrl = `https://api.cloudinary.com/v1_1/${cloudName}`;

interface IResponseData {
  access_mode: string;
  asset_id: string;
  public_id: string;
  bytes: number;
  created_at: string;
  url: string;
  resource_type: string;
  format: string;
  display_name: string;
  delete_token: string;
}

export const makeUploadRequest = ({
  file,
  progressCallback,
  successCallback,
  errorCallback,
}: {
  file: File;
  fieldName: string;
  progressCallback: (lengthComputable: boolean, loaded: number, total: number) => void;
  successCallback: (data: IResponseData) => void;
  errorCallback: (message: string) => void;
}) => {
  const url = `${baseUrl}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const request = new XMLHttpRequest();
  request.open("POST", url);

  request.upload.onprogress = (e) => {
    progressCallback(e.lengthComputable, e.loaded, e.total);
  };

  request.onload = () => {
    const data: IResponseData = JSON.parse(request.response);
    // console.log({ data });
    if (request.status >= 200 && request.status < 300) {
      successCallback(data);
    } else {
      errorCallback(request.responseText);
    }
  };

  request.send(formData);

  return () => {
    request.abort();
  };
};

export const makeDeleteRequest = ({
  token,
  successCallback,
  errorCallback,
}: {
  token: string;
  successCallback: () => void;
  errorCallback: (message: string) => void;
}) => {
  const url = `${baseUrl}/delete_by_token`;

  const request = new XMLHttpRequest();
  request.open("POST", url);

  request.setRequestHeader("Content-Type", "application/json");

  request.onload = () => {
    if (request.status >= 200 && request.status < 300) {
      successCallback();
    } else {
      errorCallback(request.responseText);
    }
  };
  request.send(JSON.stringify({ token }));
};
