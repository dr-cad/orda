const cloudName = "dta443kr0";
const uploadPreset = "orda-cloud";
const baseUrl = `https://api.cloudinary.com/v1_1/${cloudName}`;

export const makeUploadRequest = ({
  file,
  progressCallback,
  successCallback,
  errorCallback,
}: {
  file: File;
  fieldName: string;
  progressCallback: (lengthComputable: boolean, loaded: number, total: number) => void;
  successCallback: (deleteToken: string, data: any) => void;
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
    const data = JSON.parse(request.response);
    console.log({ data });
    if (request.status >= 200 && request.status < 300) {
      const { delete_token: deleteToken } = JSON.parse(request.response);
      successCallback(deleteToken, data);
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
