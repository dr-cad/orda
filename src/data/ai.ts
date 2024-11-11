import { IAiForm } from "../types";

export const forms: IAiForm[] = [
  {
    title: "Hi, I would be happy if you give me a bit of info about the patient.",
    questions: [
      "What's their name?",
      "How old are they?",
      "What's their name?",
      "What's their gender?",
      "What's their name?",
    ],
    placeholder: "Smith 25 male",
  },
  // {
  //   title: "Provide the main symptoms.",
  //   questions: ["Is there any pain or swelling?", "qestion 2?", "question 3?"],
  //   placeholder: "Bleeding",
  // },
  // {
  //   title: "I would like to know more about the anatomic location.",
  //   questions: ["In which side is the lesion appearing?", "question 2?", "question 3?"],
  //   placeholder: "Left mandible third molar",
  // },
];

export const initInputs = Array(forms.length).fill("");
