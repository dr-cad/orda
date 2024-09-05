import { Box, IconButton, ListItem, ListItemText, Tooltip } from "@mui/material";
import _ from "lodash";
import moment from "moment";
import { CSSProperties, forwardRef, memo, MouseEvent, MouseEventHandler, useMemo, useState } from "react";
import { FcAreaChart, FcFullTrash, FcPrint } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import { appName, VERSION } from "../config/strings";
import { getId } from "../lib/utils";
import { useBufferStore, usePersistStore } from "../store";
import { useAppStore } from "../store/app";
import { IHistoryItemBase, SortDir, SortType } from "../types";

const GUTTER_SIZE = 6;
const ITEM_HEIGHT = 64;

const HistoryList = memo(({ query, sortType, sortDir }: { query: string; sortType: SortType; sortDir: SortDir }) => {
  const history = useAppStore((s) => s.history);

  const list = useMemo(() => {
    // search
    let result = history.filter((h) => {
      const patName = h.patName;
      const matchPatName = patName?.includes(query);
      const matchUUID = h.uuid.includes(query);
      return matchPatName || matchUUID;
    });
    // sort - type, dir
    if (sortType === SortType.AZ) {
      result = _.sortBy(result, [(o) => o.patName]);
    }
    if (sortType === SortType.Created) {
      result = _.orderBy(result, [(o) => o.createdAt], ["desc"]);
    }
    if (sortDir === SortDir.Asc) _.reverse(result);
    return result;
  }, [history, query, sortType, sortDir]);

  const [selection, setSelection] = useState<number[]>([]);

  const handleSelect = (e: MouseEvent, i: number) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("here", i);
    setSelection((s) => {
      if (s.includes(i)) return _.filter(s, (x) => x !== i);
      return _.uniq([...s, i]);
    });
  };

  return (
    <AutoSizer>
      {({ height, width }) => (
        <FixedSizeList //
          height={height}
          width={width}
          overscanCount={8}
          innerElementType={innerElementType}
          itemCount={list.length}
          itemSize={ITEM_HEIGHT}>
          {({ index: i, style }) => (
            <HistoryItem
              style={style}
              selected={selection.includes(i)}
              handleSelect={(e) => handleSelect(e, i)}
              {...list[i]}
            />
          )}
        </FixedSizeList>
      )}
    </AutoSizer>
  );
});

export default HistoryList;

const innerElementType = forwardRef<HTMLDivElement, JSX.IntrinsicElements["div"]>(({ style, ...rest }, ref) => (
  <div
    ref={ref}
    style={{
      ...style,
      height: Number(style?.height ?? 0) + 16,
      paddingTop: GUTTER_SIZE,
      paddingRight: 16,
      paddingLeft: 16,
    }}
    {...rest}
  />
));

const HistoryItem = ({
  style,
  selected,
  handleSelect,
  ...item
}: IHistoryItemBase & { style: CSSProperties; selected: boolean; handleSelect: MouseEventHandler }) => {
  const navigate = useNavigate();
  const removeHistory = usePersistStore((s) => s.removeHistory);
  const loadHistoryItem = useBufferStore((s) => s.loadHistoryItem);
  const reportDisabled = item.errors?.length;

  const handleLoadAndGo = async (e: MouseEvent, to: string) => {
    e.preventDefault();
    e.stopPropagation();
    await loadHistoryItem(item);
    navigate(to);
  };

  const handleReport = (e: MouseEvent) => {
    handleLoadAndGo(e, "/report/" + getId(item.uuid));
  };

  const handleLoad = (e: MouseEvent) => {
    handleLoadAndGo(e, "/result/" + getId(item.uuid));
  };

  const handleEdit = (e: MouseEvent) => {
    handleLoadAndGo(e, "/list/1");
  };

  const handleRemove = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeHistory(item.uuid);
  };

  const v = item.v ?? "0";
  const outdated = v !== VERSION;

  const color = item.draft ? "warning" : outdated ? "error" : reportDisabled ? "primary" : "success";
  const caption =
    moment(item.createdAt).format("DD MMM YYYY") + (item.draft ? " (draft)" : outdated ? ` (outdated) v${v}` : "");

  return (
    <ListItem
      sx={{
        // borderBottom: "var(--app-border)",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#ffffff08",
        borderRadius: 3,
        border: selected ? "2px dashed #fff5" : undefined,
        boxSizing: "border-box",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "#ffffff12",
        },
      }}
      style={{
        ...style,
        top: Number(style.top!) + GUTTER_SIZE + 0,
        height: Number(style.height!) - GUTTER_SIZE,
        width: "auto",
        right: 16,
        left: 16,
      }}
      onClick={handleEdit}
      onContextMenu={handleSelect}
      secondaryAction={
        <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
          {!item.draft && !reportDisabled && (
            <Tooltip title="Report">
              <IconButton size="small" color="primary" onClick={handleReport}>
                <FcPrint fontSize="1.25rem" />
              </IconButton>
            </Tooltip>
          )}
          {!item.draft && (
            <Tooltip title="Results" onClick={handleLoad}>
              <IconButton size="small" color="success">
                <FcAreaChart fontSize="1.25rem" />
              </IconButton>
            </Tooltip>
          )}
          <Box flex="0 0 1px" sx={{ height: "1.5rem", bgcolor: "#fff2" }} />
          <Tooltip title="Delete">
            <IconButton size="small" onClick={handleRemove}>
              <FcFullTrash fontSize="large" filter="hue-rotate(90deg)" />
            </IconButton>
          </Tooltip>
        </Box>
      }>
      <Box flex="0 0 6px" />
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 7,
          mr: 1,
          bgcolor: color + ".main",
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 20,
        }}
      />
      <ListItemText
        primary={item.patName || appName}
        secondary={caption}
        secondaryTypographyProps={{
          fontSize: "0.65rem",
          color: color + ".light",
          sx: { opacity: 0.75 },
        }}
      />
    </ListItem>
  );
};
