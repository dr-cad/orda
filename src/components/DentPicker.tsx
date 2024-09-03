import { RestartAltRounded } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import clsx from "clsx";
import { useMemo, useState } from "react";
import AnaLocImage from "../assets/ana-loc.webp";
import { useBufferStore } from "../config/store";
import { useSymptomValue } from "../hooks/symptom";
import { IRange } from "../types";

enum AnaLocation {
  Root = "ana-location",
  Maxilla = "maxilla",
  Mandible = "mandible",
  Both = "both",
}

enum JawType {
  Maxilla,
  Mandible,
  Both,
}

interface IPoint {
  j: JawType;
  x: number;
  y: number;
  n: number;
}

const points: IPoint[] = [
  { j: JawType.Both, n: 1, x: 3, y: 26.3 },
  { j: JawType.Both, n: 2, x: 16.5, y: 30 },
  { j: JawType.Both, n: 3, x: 34.2, y: 35.8 },

  { j: JawType.Maxilla, n: 4, x: 45, y: 40 },
  { j: JawType.Maxilla, n: 5, x: 51, y: 41.5 },
  { j: JawType.Maxilla, n: 6, x: 58, y: 43.25 },
  { j: JawType.Maxilla, n: 7, x: 67, y: 45 },
  { j: JawType.Maxilla, n: 8, x: 72.5, y: 45.8 },
  { j: JawType.Maxilla, n: 9, x: 78.2, y: 46.2 },
  { j: JawType.Maxilla, n: 10, x: 83.2, y: 46.4 },
  { j: JawType.Maxilla, n: 11, x: 88.5, y: 46.5 },
  { j: JawType.Maxilla, n: 12, x: 96, y: 46.5 },

  { j: JawType.Mandible, n: 4, x: 41.2, y: 64.5 },
  { j: JawType.Mandible, n: 5, x: 49, y: 68.5 },
  { j: JawType.Mandible, n: 6, x: 58, y: 72 },
  { j: JawType.Mandible, n: 7, x: 67.25, y: 75.5 },
  { j: JawType.Mandible, n: 8, x: 74.85, y: 77.25 },
  { j: JawType.Mandible, n: 9, x: 81.5, y: 78.2 },
  { j: JawType.Mandible, n: 10, x: 87.5, y: 79 },
  { j: JawType.Mandible, n: 11, x: 92.25, y: 79 },
  { j: JawType.Mandible, n: 12, x: 97, y: 79 },
];

export default function DentPicker() {
  const updateSymptom = useBufferStore((s) => s.updateSymptom);
  const toggleExpanded = useBufferStore((s) => s.toggleExpanded);
  const { max, man, both } = useAnaLoc();

  const [start, setStart] = useState<IPoint>(); // tmp cache

  const onSelect = (p: IPoint) => {
    if (!start) return setStart(p);

    const _start = start.n < p.n ? start : p;
    const _end = start.n < p.n ? p : start;

    if (!(_start.j === JawType.Both || _start.j === _end.j)) return; // invalid

    toggleExpanded(AnaLocation.Root, true);

    // if end was both -> choose mandible
    if (_end.j === JawType.Both) {
      const range = { a: _start.n, b: _end.n };
      toggleExpanded(AnaLocation.Mandible, true);
      updateSymptom(AnaLocation.Mandible, range);
    }

    if (_end.j === JawType.Maxilla) {
      if (man) {
        const range = { a: Math.min(_start.n, man.a), b: Math.max(_end.n, man.b) };
        toggleExpanded(AnaLocation.Both, true);
        updateSymptom(AnaLocation.Both, range);
      } else {
        const range = { a: _start.n, b: _end.n };
        toggleExpanded(AnaLocation.Maxilla, true);
        updateSymptom(AnaLocation.Maxilla, range);
      }
    }

    if (_end.j === JawType.Mandible) {
      if (max) {
        const range = { a: Math.min(_start.n, max.a), b: Math.max(_end.n, max.b) };
        toggleExpanded(AnaLocation.Both, true);
        updateSymptom(AnaLocation.Both, range);
      } else {
        const range = { a: _start.n, b: _end.n };
        toggleExpanded(AnaLocation.Mandible, true);
        updateSymptom(AnaLocation.Mandible, range);
      }
    }

    setStart(undefined);
  };

  const onReset = () => {
    setStart(undefined);
    updateSymptom("ana-location", false);
  };

  return (
    <div className="dent-picker">
      <img alt="Radiography Anatomic Location" src={AnaLocImage} />
      {points.map((p, i) => (
        <Point key={i} p={p} onSelect={onSelect} start={start} />
      ))}
      {(max || man || both || start) && (
        <Tooltip title="Clear Selection" className="clear-btn">
          <IconButton
            onClick={onReset}
            size="small"
            sx={{
              background: "#00000086",
              "&:hover": {
                background: "#6e002a9d",
              },
            }}>
            <RestartAltRounded />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
}

function Point({ p, start: anchor, onSelect }: { p: IPoint; start?: IPoint; onSelect: (p: IPoint) => void }) {
  const { max, man, both } = useAnaLoc();

  const { start, between, end } = useMemo(
    () => ({
      start:
        p.n === both?.a ||
        (p.j === JawType.Maxilla && p.n === max?.a) ||
        (p.j === JawType.Mandible && p.n === man?.a) ||
        (p.j === JawType.Both && (p.n === max?.a || p.n === man?.a)),
      end:
        p.n === both?.b ||
        (p.j === JawType.Maxilla && p.n === max?.b) ||
        (p.j === JawType.Mandible && p.n === man?.b) ||
        (p.j === JawType.Both && (p.n === max?.b || p.n === man?.b)),
      between:
        isBetween(p, both) ||
        (p.j === JawType.Maxilla && isBetween(p, max)) ||
        (p.j === JawType.Mandible && isBetween(p, man)) ||
        (p.j === JawType.Both && (isBetween(p, max) || isBetween(p, man))),
    }),
    [both, man, max, p]
  );

  return (
    <div
      className={clsx("circle", {
        "circle-start": start,
        "circle-end": end,
        "circle-between": between,
        "circle-select": (p.j === anchor?.j || p.j === JawType.Both) && p.n === anchor?.n,
      })}
      style={{ left: p.x + "%", top: p.y + "%" }}
      onClick={() => onSelect(p)}>
      <span className="no">{p.n}</span>
    </div>
  );
}

function useAnaLoc() {
  const max = useSymptomValue<IRange>(AnaLocation.Maxilla);
  const man = useSymptomValue<IRange>(AnaLocation.Mandible);
  const both = useSymptomValue<IRange>(AnaLocation.Both);
  return { max, man, both };
}

function isBetween(p?: IPoint, r?: IRange) {
  return p && r && p.n > r.a && p.n < r.b;
}
