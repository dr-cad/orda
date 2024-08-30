import { Box, Checkbox, FormControlLabel, Radio, Stack, TextField, Typography } from "@mui/material";
import _ from "lodash";
import {
  ChangeEventHandler,
  Fragment,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useStore } from "../config/store";
import { digestSymptom } from "../lib/symptoms";
import { IRange, ISymptom, SymptomType, Value } from "../types";
import Features from "./Features";
import { StyledTreeItem } from "./styled";

interface IProps {
  id: string;
  parent: ISymptom;
}

interface IInnerProps {
  symptom: ISymptom;
  parent: ISymptom;
}

function useDigestSymptom(symptom: ISymptom | undefined) {
  return useMemo(() => digestSymptom(symptom), [symptom]);
}

function Symptom({ id, parent }: IProps) {
  const toggleExpanded = useStore((s) => s.toggleExpanded);
  const symptoms = useStore((s) => s.symptoms);
  const updateSymptom = useStore((s) => s.updateSymptom);

  const symptom = useMemo(() => symptoms.find((i) => i.id === id), [id, symptoms]);
  const { expandable, isEnumParent, hasInput, hasDesc, hasOptions } = useDigestSymptom(symptom);

  const handleClick: MouseEventHandler = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!symptom) return;
      const isBoolLeaf = (parent.type === SymptomType.Enum || symptom.type === SymptomType.None) && !symptom.options;
      if (isBoolLeaf) updateSymptom(id, !symptom.value); // for radio or checkbox
      toggleExpanded(symptom.id);
    },
    [id, parent, symptom, toggleExpanded, updateSymptom]
  );

  const [mt, mb] = useMemo(() => {
    const firstOption = parent.options!.indexOf(id) === 0;
    const space = expandable ? (parent.page ? (firstOption ? 0 : 4) : 1) : 1;
    return [space, expandable ? space : 0];
  }, [expandable, id, parent.options, parent.page]);

  if (!symptom) return null;

  return (
    <StyledTreeItem
      id={"symptom:" + symptom.id}
      nodeId={symptom.id}
      onClick={handleClick}
      label={<Label symptom={symptom} parent={parent} />}
      children={
        expandable && (
          <Fragment>
            {hasDesc && <Desc {...symptom} />}
            {hasInput && <Input symptom={symptom} parent={parent} />}
            {hasOptions && <SymptomsGroup symptom={symptom} />}
          </Fragment>
        )
      }
      sx={{ mt, mb }}
      className={isEnumParent ? "enum-parent" : ""}
    />
  );
}

const Label = ({ symptom, parent }: IInnerProps) => {
  const { inputable, isEnumParent } = useDigestSymptom(symptom);
  const isParent = Array.isArray(symptom.options);
  const noButton = inputable || isParent;
  const bold = isParent;
  return (
    <FormControlLabel
      value={symptom.id}
      sx={{ alignItems: "flex-start" }}
      label={
        <Typography
          className={bold ? "header header-bold" : "header"}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            fontWeight: bold ? 800 : 400,
            lineHeight: "1.3em",
          }}
          color={symptom.value ? (isEnumParent ? "warning.light" : "primary") : undefined}>
          {symptom.name}
          {symptom.required && <span style={{ color: "#ff576e" }}>&nbsp;&nbsp;*</span>}
        </Typography>
      }
      control={
        noButton ? (
          <Box sx={{ width: 12 }} />
        ) : parent.type === SymptomType.Enum && parent.options?.length !== 1 ? (
          <Radio sx={{ py: 0 }} size="small" checked={!!symptom.value} />
        ) : (
          <Checkbox sx={{ py: 0 }} size="small" checked={!!symptom.value} />
        )
      }
    />
  );
};

const Desc = (symptom: ISymptom) => {
  if (!symptom.desc) return null;
  if (!symptom.desc.title && !symptom.desc.image && !symptom.desc.feature) return null;
  return (
    <Stack p={2} pb={0}>
      <Box display="flex" flexDirection="column" overflow="hidden" gap={1}>
        {symptom.desc.title && <div>{symptom.desc.title}</div>}
        {symptom.desc.image && <img alt={symptom.desc.title} src={symptom.desc.image} className="desc-img" />}
        {symptom.desc.feature && (
          <Features value={symptom.desc.feature} symptom={symptom} params={symptom.desc.params} />
        )}
      </Box>
    </Stack>
  );
};

const Input = ({ symptom }: IInnerProps) => {
  const updateSymptom = useStore((s) => s.updateSymptom);
  const [value, setValue] = useState<Value | undefined>(symptom.value);

  const t0 = useRef<number>();
  const throttle = (fn: () => void) => {
    window.clearTimeout(t0.current);
    t0.current = window.setTimeout(fn, 1000);
  };

  useEffect(() => {
    setValue(symptom.value ?? "");
  }, [symptom.value]);

  const handleChange = useCallback(
    (value: Value) => updateSymptom(symptom.id, value), //
    [symptom.id, updateSymptom]
  );

  const handleChangeRangeA: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const v = parseInt(e.target.value);
      const lim = (symptom.value as IRange)?.b;
      const [min, max] = [symptom.min!, symptom.max!];
      setValue({ a: v, b: lim });
      if (!v) return;
      throttle(() => {
        handleChange({
          a: _.clamp(v || min, min, lim || max),
          b: lim,
        });
      });
    },
    [handleChange, symptom.max, symptom.min, symptom.value]
  );

  const handleChangeRangeB: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const v = parseInt(e.target.value);
      const lim = (symptom.value as IRange)?.a;
      const [min, max] = [symptom.min!, symptom.max!];
      setValue({ a: lim, b: v });
      if (!v) return;
      throttle(() => {
        handleChange({
          a: lim,
          b: _.clamp(v || max, lim || min, max),
        });
      });
    },
    [handleChange, symptom.max, symptom.min, symptom.value]
  );

  return (
    <Stack p={2}>
      {symptom.type === SymptomType.String ? (
        <TextField
          id={symptom.id + "-textfield"}
          size="small"
          type="text"
          placeholder={symptom.name}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
        />
      ) : symptom.type === SymptomType.Number ? (
        <TextField
          id={symptom.id + "-textfield"}
          size="small"
          type="tel"
          placeholder={symptom.name}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
        />
      ) : symptom.type === SymptomType.Range ? (
        <Stack direction="row" gap={1}>
          <TextField
            id={symptom.id + "-textfield-1"}
            size="small"
            type="tel"
            placeholder="Start"
            value={(value as IRange)?.a || ""}
            onChange={handleChangeRangeA}
          />
          <TextField
            id={symptom.id + "-textfield-2"}
            size="small"
            type="tel"
            placeholder="End"
            value={(value as IRange)?.b || ""}
            onChange={handleChangeRangeB}
          />
        </Stack>
      ) : null}
    </Stack>
  );
};

export default function SymptomsGroup({ symptom }: { symptom: ISymptom }) {
  if (!symptom.options?.length) return null;
  return (
    <Fragment key={symptom.id}>
      {symptom.options!.map((id) => (
        <Symptom key={id} id={id} parent={symptom} />
      ))}
    </Fragment>
  );
}
