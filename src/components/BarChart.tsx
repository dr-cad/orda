import { ResponsiveBar, ResponsiveBarSvgProps } from "@nivo/bar";
import { BarDatum, Keys } from "../types/interfaces";

type Props = ResponsiveBarSvgProps<BarDatum> & {
  darkMode?: boolean;
  compact?: boolean;
};

export default function BarChart({ data, darkMode = true, compact }: Props) {
  return (
    <ResponsiveBar
      theme={{
        tooltip: {
          container: {
            background: darkMode ? "#000a" : undefined,
            borderRadius: 14,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          },
        },
        axis: {
          ticks: { text: { fill: "white" } },
        },
        grid: {
          line: { stroke: "#fff1" },
        },
      }}
      data={data}
      keys={[Keys.raw, Keys.pval]}
      indexBy={Keys.title}
      margin={{ top: compact ? 40 : 80, right: 0, bottom: 50, left: 0 }}
      padding={0.3}
      groupMode="grouped"
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={{ scheme: "accent" }}
      defs={[
        {
          id: "lines",
          type: "patternLines",
          background: "inherit",
          color: "#ee7c1244",
          rotation: -45,
          lineWidth: 6,
          spacing: 10,
        },
      ]}
      fill={[
        {
          match: { id: Keys.pval },
          id: "lines",
        },
      ]}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 8,
        tickPadding: 5,
        renderTick({ x, y, value }) {
          const text = value as string;
          const truncate = 12;
          const list = text.split(" ");
          let [line1, line2] = ["", ""];
          let line1used = false;
          for (const word of list) {
            const line1space = line1.length ? " " : "";
            const line2space = line2.length ? " " : "";
            const line1length = line1.length + line1space.length + word.length;
            if (!line1used && (line1length < truncate || list.length === 1)) {
              line1 += line1space + word;
            } else {
              line1used = true;
              line2 += line2space + word;
            }
          }
          const ellipsis = line2.length > truncate - 3 ? "..." : "";
          line2 = line2.slice(0, truncate - 3) + ellipsis;
          return (
            <g transform={`translate(${x},${y})`}>
              {!!line1.length && (
                <text
                  dominantBaseline="central"
                  textAnchor="middle"
                  transform="translate(0,13)"
                  style={{
                    fill: darkMode ? "white" : "black",
                    fontSize: "11px",
                    outlineWidth: "0px",
                    outlineColor: "transparent",
                  }}>
                  {line1}
                </text>
              )}
              {!!line2.length && (
                <text
                  dominantBaseline="central"
                  textAnchor="middle"
                  transform={`translate(0,${compact ? 25 : 28})`}
                  style={{
                    fill: darkMode ? "white" : "black",
                    fontSize: "11px",
                    outlineWidth: "0px",
                    outlineColor: "transparent",
                  }}>
                  {line2}
                </text>
              )}
            </g>
          );
        },
      }}
      axisLeft={null}
      valueFormat=" >-1.0%"
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
        from: "color",
        modifiers: [["darker", 3]],
      }}
      legends={[
        {
          dataFrom: "keys",
          anchor: "top-right",
          direction: "column",
          justify: false,
          translateX: compact ? -6 : 0,
          translateY: compact ? -18 : -70,
          itemsSpacing: 4,
          itemWidth: 100,
          itemHeight: 18,
          itemDirection: "left-to-right",
          itemOpacity: 1,
          symbolSize: 12,
          symbolShape: "circle",
          itemTextColor: darkMode ? "white" : undefined,
          effects: [
            {
              on: "hover",
              style: {
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
      role="application"
    />
  );
}
