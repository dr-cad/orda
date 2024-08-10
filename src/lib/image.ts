import { ICImage } from "../types/interfaces";

export const parseImages = (str: string | undefined): ICImage[] => {
  return str ? JSON.parse(str) : [];
};

export const stringifyImages = (images: ICImage[]): string | false => {
  return images.length ? JSON.stringify(images) : false;
};
