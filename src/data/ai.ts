import { IAiForm } from "../types";

export const forms: IAiForm[] = [
  {
    content: [
      "<span>Hi, I would be happy if you give me a bit of info about the patient.</span>",
      "",
      "1. What's the chief complaint?",
      "2. what're the clinical signs?",
      "3. What're clinical examination findings?",
      "4. What're imaging findings?",
    ].join("\n"),
    placeholder:
      "24 old female with report of swelling or pain which she reported gradually increased in 2years. The lesion was hard on palpation.Panoramic findings illustrates unilateral, solitary, mixed radiolucent and radiopaque non-odontogenic lesion with irregular, ill-defined , and blending border in Rt side of mandible at ramus to incisors region with expansion of cortical bone and loss of lamina dura.",
  },
];

export const initInputs = Array(forms.length).fill("");
