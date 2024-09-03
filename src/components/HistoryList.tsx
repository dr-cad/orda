import { Box, IconButton, ListItem, ListItemText, Tooltip } from "@mui/material";
import _ from "lodash";
import moment from "moment";
import { CSSProperties, forwardRef, memo, MouseEvent, MouseEventHandler, useMemo, useState } from "react";
import { FcAreaChart, FcFullTrash, FcPrint } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import { useBufferStore, usePersistStore } from "../config/store";
import { appName } from "../config/strings";
import { getSymptomsErrors, getSymptomValueById } from "../lib/symptoms";
import { getId } from "../lib/utils";
import { IHistoryItem, SortDir, SortType } from "../types";

const GUTTER_SIZE = 6;
const ITEM_HEIGHT = 64;

const HistoryList = memo(({ query, sortType, sortDir }: { query: string; sortType: SortType; sortDir: SortDir }) => {
  const history = usePersistStore((s) => s.history);

  const list = useMemo(() => {
    // search
    let result = history.filter((h) => {
      const patName = getSymptomValueById<string>(h.symptoms, "pat-name");
      const matchPatName = patName?.includes(query);
      const matchUUID = h.uuid.includes(query);
      return matchPatName || matchUUID;
    });
    // sort - type, dir
    if (sortType === SortType.AZ) {
      result = _.sortBy(result, [(o) => getSymptomValueById(o.symptoms, "pat-name") || "zzz"]);
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
}: IHistoryItem & { style: CSSProperties; selected: boolean; handleSelect: MouseEventHandler }) => {
  const navigate = useNavigate();
  const removeHistory = usePersistStore((s) => s.removeHistory);
  const loadHistory = useBufferStore((s) => s.loadHistory);
  const reportDisabled = useMemo(() => getSymptomsErrors(item.symptoms).length, [item.symptoms]);

  const title = useMemo(() => {
    return getSymptomValueById<string>(item.symptoms, "pat-name") || appName;
  }, [item.symptoms]);

  const handleLoadAndGo = (e: MouseEvent, to: string) => {
    e.preventDefault();
    e.stopPropagation();
    loadHistory(item);
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

  const isDraft = !item.scores;

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
          {!isDraft && !reportDisabled && (
            <Tooltip title="Report">
              <IconButton size="small" color="primary" onClick={handleReport}>
                <FcPrint fontSize="1.25rem" />
              </IconButton>
            </Tooltip>
          )}
          {!isDraft && (
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
          bgcolor: isDraft ? "warning.dark" : reportDisabled ? "primary.dark" : "success.dark",
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 20,
        }}
      />
      <ListItemText
        primary={title.toString()}
        secondary={isDraft ? "(unsaved draft)" : moment(item.createdAt).format("DD MMM YYYY")}
        secondaryTypographyProps={{ fontSize: "0.65rem", color: isDraft ? "warning.main" : "#fff6" }}
      />
    </ListItem>
  );
};
