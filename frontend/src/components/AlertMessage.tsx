import { Alert, Button, Typography } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../hooks/storHooks";
import {
  setError,
  setMessageOk,
  setMessageWorn,
} from "../redux/slices/TasksSlice";

interface AlertMessageProps {
  message: string | null;
  color: "blue" | "red" | "green" | "amber";
  type: "error" | "success" | "warning";
  name: string;
  undoOption: (undo: boolean) => void;
//   isSend: boolean;
}

const AlertMessage = ({
  message,
  color,
  type,
  name,
  undoOption,
//   isSend,
}: AlertMessageProps) => {
  const dispatch = useAppDispatch();
  const [show, setShow] = useState(!!message);
  const [open, setOpen] = useState(false);

  const handleUndo = () => {
    undoOption(true);
    setOpen(false);
  };

//   useEffect(() => {
//     setOpen(isSend);
//   }, [isSend]);

  useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => {
          if (type === "error") {
            dispatch(setError(null));
          } else if (type === "success") {
            dispatch(setMessageOk(""));
          } else if (type === "warning") {
            dispatch(setMessageWorn(""));
          }
        }, 500);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message, type, dispatch]);

  if (!message || !show) return null;


  return (
    <div
      className={`flex w-full flex-col gap-2 transition-opacity duration-300 ease-in-out ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      {name === "alertUndo" ? (
        <Alert key={"alertUndo"} action={
            <Button
              variant="text"
              color="white"
              size="sm"
              className="!absolute top-3 right-3"
              onClick={handleUndo}
            >
              Undo
            </Button>
          }
        >
          <Typography>{message}</Typography>
        </Alert>
      ) : (
        <Alert key={"alert"} color={color}>
          <Typography>{message}</Typography>
        </Alert>
      )}
    </div>
  );
};

export default AlertMessage;
