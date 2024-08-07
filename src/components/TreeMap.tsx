import { ResponsiveTreeMap, TreeMapDataProps } from "@nivo/treemap";

interface BaseTreeMapItem {
  name: string;
  color?: string;
}

interface TreeMapChild extends BaseTreeMapItem {
  value?: number;
}

interface TreeMapParent extends BaseTreeMapItem {
  children?: TreeMapItem[];
}

export type TreeMapItem = TreeMapChild | TreeMapParent;

export default function TreeMap({ data }: TreeMapDataProps<TreeMapItem>) {
  return (
    <ResponsiveTreeMap
      theme={{
        tooltip: {
          container: {
            background: "#000a",
            borderRadius: 14,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          },
        },
      }}
      data={data}
      identity="name"
      value="value"
      valueFormat=" >-1.0%"
      tile="binary"
      leavesOnly={true}
      innerPadding={5}
      label={(e) => e.data.name + " (" + e.formattedValue + ")"}
      labelSkipSize={15}
      labelTextColor={{
        from: "color",
        modifiers: [["darker", 3]],
      }}
      orientLabel={false}
      parentLabelPosition="left"
      parentLabelTextColor={{
        from: "color",
        modifiers: [["brighter", 2]],
      }}
      // colors={({ data }) => data.color ?? "red"}
      colors={{ scheme: "accent" }}
      nodeOpacity={1}
      borderWidth={0}
    />
  );
}
