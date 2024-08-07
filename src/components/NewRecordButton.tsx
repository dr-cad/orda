import { AddRounded } from "@mui/icons-material";
import { Button, ButtonTypeMap, ExtendButtonBase, Typography } from "@mui/material";
import useAppHistory from "../hooks/history";

interface IProps {
  draft?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NewRecordButton: ExtendButtonBase<ButtonTypeMap<IProps, "button">> = ({ draft, ...props }: any) => {
  const { handleNewRecord } = useAppHistory();

  return (
    <Button onClick={() => handleNewRecord(draft)} startIcon={<AddRounded />} sx={{ borderRadius: 4 }} {...props}>
      <Typography fontSize="0.65rem" className="text-ellipsis">
        New Record
      </Typography>
    </Button>
  );
};

export default NewRecordButton;
