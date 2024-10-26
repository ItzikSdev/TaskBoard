import {
  Card,
  Input,
  Button,
  Typography,
  DialogBody,
  DialogFooter,
  Dialog,
  DialogHeader,
} from "@material-tailwind/react";
import { useMutation } from "react-query";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/storHooks";
import { createTask } from "../services/TaskService";
import { setTask, setError, setLoading } from "../redux/slices/TasksSlice";
import AlertMessage from "../components/AlertMessage";
import { DefaultPagination } from "../components/Pagination";
import { useEffect, useState } from "react";

export function TaskForm() {
  const dispatch = useAppDispatch();
  const { task } = useAppSelector((state) => state.tasksSlice);
  const [open, setOpen] = useState(false);
  const handleOpenDialog = () => setOpen(!open);
  const [isClick, setIsClick] = useState(false);



  const mutation = useMutation(createTask, {
    onSuccess: (data) => {
      dispatch(setTask(data));
      setIsClick(true)
      dispatch(setLoading(false));
    },
    onError: () => {
      dispatch(setError("Failed to create task."));
      dispatch(setLoading(false));
    },
  });


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formElements = form.elements as typeof form.elements & {
      title: HTMLInputElement;
      description: HTMLInputElement;
    };
    const titleValue = formElements.title?.value;
    const descriptionValue = formElements.description?.value;
    mutation.mutate({ title: titleValue, description: descriptionValue });
  };

  const displayTask = () => {
    if (!isClick) return null

    return (
      <div className="mt-4">
        <Typography variant="h6">Task Created:</Typography>
        <div key={task?._id}>
          <Typography variant="paragraph">Title: {task?.title}</Typography>
          <Typography variant="paragraph">
            Description: {task?.description}
          </Typography>
          <div>
            <Typography variant="paragraph">
              More details:{" "}
              <Link
                to={`/task/${task?._id}`}
                onClick={() => setIsClick(false)}
                className="text-blue-500 underline"
              >
                {task?._id}
              </Link>
            </Typography>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div>
      <Dialog open={open} handler={handleOpenDialog}>
        <DialogHeader>
          <Typography variant="h3" color="black">
            Add Task
          </Typography>
        </DialogHeader>
        <DialogBody>
          <Card color="transparent" shadow={false} className="top-0">
            <form
              className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96"
              onSubmit={handleSubmit}
            >
              <div className="mb-2 flex flex-col gap-6">
                <Typography variant="h6" color="blue-gray" className="-mb-3">
                  Title
                </Typography>
                <Input
                  size="lg"
                  name="title"
                  variant="outlined"
                  label="Title"
                  placeholder="Title"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                />

                <Typography variant="h6" color="blue-gray" className="-mb-3">
                  Description
                </Typography>
                <Input
                  size="lg"
                  name="description"
                  variant="outlined"
                  label="Description"
                  placeholder="Description"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900 w-16"
                />
              </div>
              <div className="flex justify-center">
                <Button
                  className="mt-4 w-64"
                  fullWidth
                  type="submit"
                >
                  Add Task
                </Button>

              </div>
            </form>
            {displayTask()}
          </Card>
        </DialogBody>
        <DialogFooter>
          {mutation.isError && (
            <AlertMessage
              message="Error creating task. Please try again."
              color="red"
              type="error"
              name="error"
            />
          )}
           {mutation.isSuccess && (
            <AlertMessage
                message="Task created successfully!"
                color="green"
                type="success"
                name="success"
            />
            )}
        </DialogFooter>
      </Dialog>
      <DefaultPagination handleOpenDialog={handleOpenDialog} />
    </div>
  );
}
