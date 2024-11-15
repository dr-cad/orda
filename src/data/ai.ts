import { IAiForm } from "../types";

export const forms: IAiForm[] = [
  {
    content: `<span>Hi, I would be happy if you give me a bit of info about the patient.</span>
    
1. What's their name?  
2. How old are they?  
3. What's their name?  
4. What's their gender?  
5. What's their name?`,
    placeholder: "Smith 25 male",
  },
];

export const initInputs = Array(forms.length).fill("");
