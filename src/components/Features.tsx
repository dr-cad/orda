import { lazy, memo, Suspense } from "react";
import { Feature, ISymptom } from "../types";
import DupNameChecker from "./DupNameChecker";
const DentPicker = lazy(() => import("./DentPicker"));
const ImagePicker = lazy(() => import("./ImagePicker"));

interface Props {
  value: Feature | string;
  symptom: ISymptom;
  params?: any[];
}

export default memo(function Features({ value }: Props) {
  switch (value) {
    case Feature.DuplicateNameChecker:
      return (
        <Suspense>
          <DupNameChecker />
        </Suspense>
      );
    case Feature.DentPicker:
      return (
        <Suspense fallback={<p>Loading dent picker...</p>}>
          <DentPicker />
        </Suspense>
      );
    case Feature.ImagePicker:
      return (
        <Suspense fallback={<p>Loading image picker...</p>}>
          <ImagePicker />
        </Suspense>
      );

    default:
      return <p>Feature not found!</p>;
  }
});
