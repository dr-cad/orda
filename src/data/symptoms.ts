import { Feature, ISymptomRaw, SymptomType } from "../types";

const symptoms: ISymptomRaw[] = [
  {
    id: "pat-info",
    name: "Information",
    page: 1,
    options: ["pat-name", "pat-gender", "pat-age", "pat-images"],
  },
  {
    id: "pat-name",
    name: "Full Name",
    desc: { feature: Feature.DuplicateNameChecker },
    required: true,
    type: SymptomType.String,
    open: true,
    omitHash: true,
    gpt: false,
  },
  {
    id: "pat-age",
    name: "Age",
    required: true,
    type: SymptomType.Number,
    open: true,
  },
  {
    id: "pat-gender",
    name: "Gender",
    required: true,
    type: SymptomType.Enum,
    options: ["pat-male", "pat-female"],
    open: true,
  },
  {
    id: "pat-male",
    name: "Male",
  },
  {
    id: "pat-female",
    name: "Female",
  },
  {
    id: "pat-images",
    name: "Panaromic Images",
    desc: { feature: Feature.ImagePicker },
    type: SymptomType.String,
    required: true,
    open: true,
    noInput: true,
    gpt: false,
  },
  {
    id: "chief-comp",
    name: "Chief complaint",
    page: 2,
    options: ["pain-0", "fever-illness", "paresth-anes", "bleeding", "purulent", "swelling", "trismus"],
  },
  {
    id: "fever-illness",
    name: "Fever and Illness",
  },
  {
    id: "paresth-anes",
    name: "Paresthesia and anesthesia",
  },
  {
    id: "bleeding",
    name: "Gingival bleeding",
  },
  {
    id: "purulent",
    name: "Purulent (pus) drainage",
  },
  {
    id: "swelling",
    name: "Swelling",
  },
  {
    id: "pain-0",
    name: "Pain",
  },
  {
    id: "trismus",
    name: "Trismus",
  },
  {
    id: "pat-his-cli-fin",
    name: "History & Clinical findings",
    desc: { title: "Patient's history \nand Clinical findings" },
    page: 3,
    options: ["onset-course", "history-of-surgery", "hist-radio", "lymph", "impact", "sig-blood"],
  },
  {
    id: "lymph",
    name: "Lymph nodes involvement",
  },
  {
    id: "impact",
    name: "Impacted, unerupted or supernumerary tooth",
  },
  {
    id: "history-of-surgery",
    name: "History of surgery, trauma or tooth extraction",
  },
  {
    id: "sig-blood",
    name: "Significant blood's values change",
    options: ["calcium", "phosphorus", "alkaline"],
  },
  {
    id: "calcium",
    name: "Calcium",
    type: SymptomType.Enum,
    options: ["increase-1", "decrease-1"],
  },
  {
    id: "increase-1",
    name: "Increase",
    gpt: false,
  },
  {
    id: "decrease-1",
    name: "Decrease",
    gpt: false,
  },
  {
    id: "phosphorus",
    name: "Phosphorus",
    type: SymptomType.Enum,
    options: ["increase-2", "decrease-2"],
  },
  {
    id: "increase-2",
    name: "Increase",
    gpt: false,
  },
  {
    id: "decrease-2",
    name: "Decrease",
    gpt: false,
  },
  {
    id: "alkaline",
    name: "Alkaline phosphatase",
    type: SymptomType.Enum,
    options: ["increase-3", "decrease-3"],
  },
  {
    id: "increase-3",
    name: "Increase",
    gpt: false,
  },
  {
    id: "decrease-3",
    name: "Decrease",
    gpt: false,
  },
  {
    id: "hist-radio",
    name: "History of radiotherapy and chemotherapy",
  },
  {
    id: "onset-course",
    name: "Onset and course",
    type: SymptomType.Enum,
    options: ["slow-0", "moderate-0", "rapid-0"],
  },
  {
    id: "slow-0",
    name: "Slow (Months to years)",
  },
  {
    id: "moderate-0",
    name: "Moderate (weeks to about 2months)",
  },
  {
    id: "rapid-0",
    name: "Rapid (Hours to days)",
  },
  {
    id: "clinical-exam",
    name: "Clinical examination",
    desc: { title: "Observable Findings and Clinical examination" },
    page: 4,
    options: ["appearance", "consist", "tooth-exam", "aspiration", "auscultation"],
  },
  {
    id: "appearance",
    name: "Appearance",
    options: ["soft-tissue", "hemorrhage"],
  },
  {
    id: "hemorrhage",
    name: "Hemorrhage",
  },
  {
    id: "soft-tissue",
    name: "Soft tissue lesion",
  },
  {
    id: "tooth-exam",
    name: "Tooth examination",
    options: ["vitality", "percussion", "mobile-teeth"],
  },
  {
    id: "vitality",
    name: "Tooth vitality",
    type: SymptomType.Enum,
    options: ["nonvital"],
  },
  {
    id: "nonvital",
    name: "Nonvital tooth",
  },
  {
    id: "percussion",
    name: "Percussion",
    type: SymptomType.Enum,
    options: ["pain-1", "pump"],
  },
  {
    id: "mobile-teeth",
    name: "Tooth mobility",
  },
  {
    id: "pain-1",
    name: "Pain",
  },
  {
    id: "pump",
    name: "Pumping tooth",
  },
  {
    id: "aspiration",
    name: "Aspiration",
    type: SymptomType.Enum,
    options: ["negative", "positive"],
  },
  {
    id: "negative",
    name: "Negative",
  },
  {
    id: "positive",
    name: "Positive",
    type: SymptomType.Enum,
    options: ["blood", "serosanguinous", "serum", "cheesy-mat", "pus"],
  },
  {
    id: "blood",
    name: "Blood",
  },
  {
    id: "serosanguinous",
    name: "Serosanguinous",
  },
  {
    id: "serum",
    name: "Serum like fluid",
  },
  {
    id: "cheesy-mat",
    name: "Cheesy material",
  },
  {
    id: "pus",
    name: "Pus",
  },
  {
    id: "auscultation",
    name: "Auscultation",
  },
  {
    id: "consist",
    name: "Consistancy",
    type: SymptomType.Enum,
    options: ["soft", "rubbery", "firm", "bony-hard"],
  },
  {
    id: "soft",
    name: "Soft",
  },
  {
    id: "rubbery",
    name: "Rubbery",
  },
  {
    id: "firm",
    name: "Firm",
  },
  {
    id: "bony-hard",
    name: "Bony-hard",
  },
  {
    id: "imaging-fin",
    name: "Imaging finding",
    page: 5,
    options: ["location", "shape-size", "periphery", "type", "int-struct", "effects-surr"],
  },
  {
    id: "type",
    name: "Type",
    type: SymptomType.Enum,
    options: ["solitary", "multiple-separate", "diffuse"],
    required: true,
  },
  {
    id: "shape-size",
    name: "Shape and size",
    options: ["size", "shape"],
  },
  {
    id: "size",
    name: "Size",
    type: SymptomType.Number,
  },
  {
    id: "shape",
    name: "Shape",
    type: SymptomType.Enum,
    options: ["round", "scalloped", "irregular"],
    required: true,
  },
  {
    id: "round",
    name: "Round, Ovoid or Regular",
  },
  {
    id: "scalloped",
    name: "Scalloped",
  },
  {
    id: "irregular",
    name: "Irregular",
  },
  {
    id: "periphery",
    name: "Periphery",
    required: true,
    type: SymptomType.Enum,
    options: ["well-defined", "ill-defined"],
  },
  {
    id: "well-defined",
    name: "Well-defined",
    type: SymptomType.Enum,
    open: true,
    options: ["non-corticated", "corticated", "sclerotic", "soft-capsule"],
  },
  {
    id: "non-corticated",
    name: "Non corticated",
  },
  {
    id: "corticated",
    name: "Corticated",
  },
  {
    id: "sclerotic",
    name: "Sclerotic",
  },
  {
    id: "soft-capsule",
    name: "Radiolucent rim (Soft capsule)",
  },
  {
    id: "ill-defined",
    name: "Ill-defined",
    type: SymptomType.Enum,
    options: ["blending", "invasive"],
  },
  {
    id: "blending",
    name: "Blending border",
  },
  {
    id: "invasive",
    name: "Invasive and Destructive border",
  },
  {
    id: "location",
    name: "Location",
    desc: {
      title: "Pathologic extension",
      feature: Feature.DentPicker,
    },
    value: true,
    required: true,
    options: ["ana-location", "side", "relation-tooth"],
  },
  {
    id: "ana-location",
    name: "Anatomic Location",
    type: SymptomType.Enum,
    options: ["maxilla", "mandible", "both"],
  },
  {
    id: "maxilla",
    name: "Maxilla",
    type: SymptomType.Range,
    min: 1,
    max: 12,
    gpt: false,
  },
  {
    id: "mandible",
    name: "Mandible",
    type: SymptomType.Range,
    min: 1,
    max: 12,
    gpt: false,
  },
  {
    id: "both",
    name: "Both",
    type: SymptomType.Range,
    min: 1,
    max: 12,
    gpt: false,
  },
  {
    id: "side",
    name: "Side",
    type: SymptomType.Enum,
    options: ["unilateral", "bilateral"],
    required: true,
  },
  {
    id: "unilateral",
    name: "Unilateral",
    type: SymptomType.Enum,
    options: ["unilateral-right", "unilateral-left"],
    open: true,
  },
  {
    id: "unilateral-right",
    name: "Right",
    gpt: false,
  },
  {
    id: "unilateral-left",
    name: "Left",
    gpt: false,
  },
  {
    id: "bilateral",
    name: "Bilateral",
    gpt: false,
  },
  {
    id: "relation-tooth",
    name: "Epicenter of lesion",
    type: SymptomType.Enum,
    options: ["periapical", "pericoronal", "interradicular", "related"],
    required: true,
  },
  {
    id: "pericoronal",
    name: "Pericoronal (Coronal to CEJ)",
  },
  {
    id: "interradicular",
    name: "Root (Interradicular, Midroot or whole root)",
  },
  {
    id: "periapical",
    name: "Periapical (Only apex area)",
  },
  {
    id: "related",
    name: "Not related to tooth",
  },
  {
    id: "solitary",
    name: "Solitary",
  },
  {
    id: "multiple-separate",
    name: "Multiple seprate",
  },
  {
    id: "diffuse",
    name: "Generalized diffuse",
  },
  {
    id: "int-struct",
    name: "Internal structure",
    required: true,
    type: SymptomType.Enum,
    options: ["radiolucent", "mixed", "radiopaque"],
  },
  {
    id: "radiopaque",
    name: "Radiopaque",
    type: SymptomType.Enum,
    options: ["radiopaue-zone", "radiopaque-nozone"],
  },
  {
    id: "radiopaue-zone",
    name: "With radiolucent zone",
  },
  {
    id: "radiopaque-nozone",
    name: "No specific zone",
  },
  {
    id: "radiolucent",
    name: "Radiolucent",
    type: SymptomType.Enum,
    open: true,
    options: ["unilocular", "multilocular", "rarefaction"],
  },
  {
    id: "unilocular",
    name: "Unilocular",
    type: SymptomType.Enum,
    open: false,
    options: ["uni1", "uni2"],
  },
  {
    id: "uni1",
    name: "Completely radiolucent",
  },
  {
    id: "uni2",
    name: "Radiolucent with flecks",
  },
  {
    id: "multilocular",
    name: "Multilocular",
    type: SymptomType.Enum,
    open: false,
    options: ["linear", "curved"],
  },
  {
    id: "linear",
    name: "Curved and Linear septa",
    type: SymptomType.Enum,
    options: ["wispy1", "coarse1"],
  },
  {
    id: "wispy1",
    name: "Wispy or Thin",
  },
  {
    id: "coarse1",
    name: "Coarse or Thick",
  },
  {
    id: "curved",
    name: "Curved septa",
    type: SymptomType.Enum,
    options: ["wispy2", "coarse2"],
  },
  {
    id: "wispy2",
    name: "Wispy or Thin",
  },
  {
    id: "coarse2",
    name: "Coarse or Thick",
  },
  {
    id: "rarefaction",
    name: "Generalized rarefaction",
  },
  {
    id: "mixed",
    name: "Radiopaque and Radiolucent (Mixed)",
  },
  {
    id: "effects-surr",
    name: "Effects on surrending",
    options: ["tooth", "dura", "wide-0", "ian-canal", "sinus", "corital-bone", "necrotic", "periosteal-reaction"],
  },
  {
    id: "tooth",
    name: "Tooth",
    options: ["displace-0", "resorp-1", "eruption"],
  },
  {
    id: "eruption",
    name: "Early eruption",
  },
  {
    id: "displace-0",
    name: "Displacement",
  },
  {
    id: "resorp-1",
    name: "Root resorption",
  },
  {
    id: "dura",
    name: "Loss of lamina dura (without root resorption)",
  },
  {
    id: "wide-0",
    name: "PDL space widening",
  },
  {
    id: "ian-canal",
    name: "IAN canal",
    options: ["displace-1", "enlarge", "destruct-0"],
  },
  {
    id: "displace-1",
    name: "Displacement",
  },
  {
    id: "enlarge",
    name: "Enlargment",
  },
  {
    id: "destruct-0",
    name: "Destruction",
  },
  {
    id: "sinus",
    name: "Invagination to sinus space",
  },
  {
    id: "corital-bone",
    name: "Cortial bone (Jaws and maxillary sinus)",
    type: SymptomType.Enum,
    options: ["expand", "destruct-3", "extend"],
  },
  {
    id: "expand",
    name: "Expansion or displacement without destruction or perforation",
  },
  {
    id: "destruct-3",
    name: "Expansion or displacement with destruction or perforation",
  },
  {
    id: "extend",
    name: "Extension within bone without expansion or destruction",
  },
  {
    id: "necrotic",
    name: "Necrotic bone",
    options: ["sequestrum", "fracture"],
  },
  {
    id: "sequestrum",
    name: "Sequestrum (Bone island)",
  },
  {
    id: "fracture",
    name: "Pathologic fracture",
  },
  {
    id: "periosteal-reaction",
    name: "Periosteal reaction",
    type: SymptomType.Enum,
    options: ["single", "onion", "solid", "spiculated", "compelx", "codman"],
  },
  {
    id: "single",
    name: "Single layer",
  },
  {
    id: "onion",
    name: "Mulitlayered(Onion skin)",
  },
  {
    id: "solid",
    name: "Solid",
  },
  {
    id: "compelx",
    name: "Disorganized or Complex",
  },
  {
    id: "codman",
    name: "codman triangle",
  },
  {
    id: "spiculated",
    name: "Spiculated or Sunburst",
  },
] as const;

export default symptoms;
