import { Box, Checkbox, FormControlLabel, Radio, Stack, TextField, Typography } from "@mui/material";
import _ from "lodash";
import React, { Fragment, MouseEventHandler, useCallback, useMemo } from "react";
import { useStore } from "../config/store";
import { digestSymptom } from "../lib/symptoms";
import { IRange, ISymptom, Value } from "../types/interfaces";
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
      const isBoolLeaf = (parent.type === "enum" || symptom.type === "none") && !symptom.options;
      if (isBoolLeaf) updateSymptom(id, !symptom.value); // for radio or checkbox
      toggleExpanded(symptom.id);
    },
    [id, parent, symptom, toggleExpanded, updateSymptom]
  );

  const [mt, mb] = useMemo(() => {
    const firstOption = parent.options!.indexOf(id) === 0;
    const space = expandable ? (parent.page ? (firstOption ? 0 : 4) : 1) : 0;
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
      sx={{
        mt,
        mb,
        "&:hover > .MuiTreeItem-content > .MuiTreeItem-label > .MuiFormControlLabel-root > .header-bold": {
          textDecoration: "underline",
          textDecorationColor: "#8ad4ff",
          textUnderlineOffset: 7,
        },
      }}
      className={isEnumParent ? "enum-parent" : ""}
    />
  );
}

const Label = ({ symptom, parent }: IInnerProps) => {
  const { hasInput, isEnumParent } = useDigestSymptom(symptom);
  const isParent = Array.isArray(symptom.options);
  const noButton = hasInput || isParent;
  const bold = isParent;
  return (
    <FormControlLabel
      value={symptom.id}
      label={
        <Typography
          className={bold ? "header header-bold" : "header"}
          sx={{
            display: "flex",
            alignItems: "center",
            fontWeight: bold ? 800 : 400,
          }}
          color={symptom.value ? (isEnumParent ? "warning.light" : "primary") : undefined}>
          {symptom.name}
          {symptom.required && <span style={{ color: "#ff576e" }}>&nbsp;&nbsp;*</span>}
        </Typography>
      }
      control={
        noButton ? (
          <Box sx={{ width: 12 }} />
        ) : parent.type === "enum" && parent.options?.length !== 1 ? (
          <Radio size="small" checked={!!symptom.value} />
        ) : (
          <Checkbox size="small" checked={!!symptom.value} />
        )
      }
    />
  );
};

const Desc = (symptom: ISymptom) => {
  if (!symptom.desc) return null;

  return (
    <Stack p={2}>
      <div>
        {symptom.desc.title && (
          <>
            <div>{symptom.desc.title + ": "}</div>
            <Box sx={{ height: 18 }} />
          </>
        )}
        {symptom.desc.image && <img alt={symptom.desc.title} src={symptom.desc.image} className="desc-img" />}
        {symptom.desc.feature && (
          <Features value={symptom.desc.feature} symptom={symptom} params={symptom.desc.params} />
        )}
      </div>
    </Stack>
  );
};

const Input = React.memo(({ symptom }: IInnerProps) => {
  const updateSymptom = useStore((s) => s.updateSymptom);
  const handleChange = useCallback(
    (value: Value) => updateSymptom(symptom.id, value), //
    [symptom.id, updateSymptom]
  );
  return (
    <Stack p={2}>
      {symptom.type === "string" ? (
        <TextField
          id={symptom.id + "-textfield"}
          size="small"
          type="text"
          placeholder={symptom.name}
          value={symptom.value ?? ""}
          onChange={(e) => handleChange(e.target.value)}
        />
      ) : symptom.type === "number" ? (
        <TextField
          id={symptom.id + "-textfield"}
          size="small"
          type="tel"
          placeholder={symptom.name}
          value={symptom.value ?? ""}
          onChange={(e) => handleChange(e.target.value)}
        />
      ) : symptom.type === "range" ? (
        <Stack direction="row" gap={1}>
          <TextField
            id={symptom.id + "-textfield-1"}
            size="small"
            type="tel"
            placeholder="Start"
            value={(symptom.value as IRange)?.a ?? ""}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              const lim = (symptom.value as IRange)?.b;
              const [min, max] = [symptom.min!, symptom.max!];
              handleChange({
                a: _.clamp(v || min, min, lim || max),
                b: lim ?? "",
              });
            }}
          />
          <TextField
            id={symptom.id + "-textfield-2"}
            size="small"
            type="tel"
            placeholder="End"
            value={(symptom.value as IRange)?.b ?? ""}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              const lim = (symptom.value as IRange)?.a;
              const [min, max] = [symptom.min!, symptom.max!];
              handleChange({
                a: lim ?? "",
                b: _.clamp(v || max, lim || min, max),
              });
            }}
          />
        </Stack>
      ) : null}
    </Stack>
  );
});

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
