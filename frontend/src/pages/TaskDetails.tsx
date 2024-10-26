import { Card, CardBody, CardFooter, Typography, Button, Input, Spinner } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/storHooks';
import { useMutation, useQuery } from 'react-query';
import { setError, setLoading, setMessageError, setMessageOk, setMessageWorn, setTask } from '../redux/slices/TasksSlice';
import { deleteTaskById, fetchTaskById, putTaskById } from '../services/Taskservice';
import { useRef, useEffect, useState } from 'react';
import AlertMessage from '../components/AlertMessage';

export function TaskDetails() {
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { task, loading, error, messageWorn, messageOk, messageError } = useAppSelector((state) => state.tasksSlice);
    const { data, isLoading, isError } = useQuery(["task", id], () => fetchTaskById(id!));
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const undoRef = useRef(false)
    const [isUpdating, setIsUpdating] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(setError(null));
            dispatch(setMessageOk(''));
            dispatch(setMessageWorn(''));
        }, messageWorn === "Description is empty" || messageWorn === "Title is empty" ? 6000 : 3000);
        
        return () => clearTimeout(timer);
    }, [error, messageOk, messageWorn]);

    useEffect(() => {
        if (task) {
            setTitle(task.title || "");
            setDescription(task.description || "");
        }
    }, [task]);

    useEffect(() => {
        if (data) {
            dispatch(setTask(data));
            dispatch(setLoading(false));
        }
        if (isLoading) {
            dispatch(setLoading(true));
        }
        if (isError) {
            dispatch(setError("Failed to fetch task details."));
            dispatch(setLoading(false));
        }
    }, [data, isLoading, isError, dispatch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(setError(null));
            dispatch(setMessageOk(''));
            dispatch(setMessageWorn(''));
        }, 3000);
        return () => clearTimeout(timer);
    }, [error, messageOk, messageWorn]);

    const updateMutation = useMutation(({ id, data }: { id: string; data: { title: string; description: string } }) => putTaskById(id, data),
        {
            onSuccess: (data) => {
                dispatch(setMessageOk('Task updated successfully!'));
                dispatch(setTask(data));
                dispatch(setLoading(false));
            },
            onError: (error) => {
                console.error("Error updating task", error);
                dispatch(setError("Failed to update task."));
                dispatch(setLoading(false));
            }
        }
    );

    const deleteMutation = useMutation(({ id }: { id: string; }) => deleteTaskById(id),
        {
            onSuccess: (data) => {
                dispatch(setMessageOk('Task delete successfully!'));
                dispatch(setTask(data));
                navigate('/')
            },
            onError: (error) => {
                console.error("Error deleting task", error);
                dispatch(setError("Failed to delete task."));
                dispatch(setLoading(false));
            }
        }
    );

    const handleTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    };

    const handleDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(event.target.value);
    };

    const handleDelete = () => {
        setIsUpdating(true); 
        dispatch(setMessageWorn("Deleting..."));
        undoRef.current =false
        setTimeout(() => {
            if (!undoRef.current && task?._id) {                
                deleteMutation.mutate({ id: task._id, data: { title, description } });
                dispatch(setMessageOk("Task deleted successfully!"));
            } else {
                dispatch(setMessageError("Deleted canceled"));
            }
            setIsUpdating(false);
        }, 4000);
    }

    const handleUpdate = () => {
        setIsUpdating(true); 
        dispatch(setMessageWorn("Updating..."));
        undoRef.current =false
        setTimeout(() => {
            if (!undoRef.current && task?._id) {
                if (task.title && title.trim() !== "") {
                    if (task.description && description.trim() !== "") {
                        updateMutation.mutate(
                            { id: task._id, data: { title, description } },
                            {
                                onSuccess: (data) => {
                                    dispatch(setMessageOk("Task updated successfully!"));
                                    dispatch(setTask(data));
                                    dispatch(setLoading(false));
                                },
                                onError: () => {
                                    dispatch(setMessageError("Update failed."));
                                }
                            }
                        );
                    } else {
                        dispatch(setMessageWorn("Description is empty"));
                        setTimeout(() => dispatch(setMessageWorn('')), 6000);
                    }
                } else {
                    dispatch(setMessageWorn("Title is empty"));
                    setTimeout(() => dispatch(setMessageWorn('')), 6000);
                }
            }
        }, 4000);
    };

    const undoOption = (value: boolean) => {
        undoRef.current = value
        if (value) {
            dispatch(setMessageWorn("Update canceled"));
            setIsUpdating(false);
        }
    };

    if (loading || isLoading) return <Typography variant='h4'><Spinner /></Typography>;

    return (
        <div>
            <Card className="mt-6 w-96" color="transparent" shadow={false}>
               <Typography variant='h3'>Task Detail View</Typography>
                <CardBody>
                    <Typography variant='h6' className='relative flex '>Priority: {task?.priority}</Typography>
                    <div className="relative flex items-center w-full mt-4 max-w-[24rem] space-x-4">
                        <Input
                        required={true} 
                            type="text"
                            label="Title"
                            value={title}
                            onChange={handleTitle}
                            className="pr-20"
                            containerProps={{
                                className: "min-w-0",
                            }}
                        />
                        <Button size="sm" className="!absolute right-1 top-1 rounded"  onClick={handleUpdate}>
                            Update
                        </Button>
                    </div>
                    <div className="relative flex items-center w-full mt-4 max-w-[24rem] space-x-4">
                        <Input
                            type="text"
                            required={true}
                            label="Description"
                            value={description}
                            onChange={handleDescription}
                            className="pr-10"
                            containerProps={{
                                className: "min-w-0",
                            }}
                        />
                        <Button size="sm" className="!absolute right-1 top-1 rounded" onClick={handleUpdate}>
                            Update
                        </Button>
                    </div>
                    <Button size="sm" className=" mt-4 rounded " color="red" onClick={handleDelete}>
                            Delete
                        </Button>
                </CardBody>
                <CardFooter className="pt-0">
                    <Typography variant='h6'>
                        Created: {new Date(task?.createdAt).toLocaleString()}
                    </Typography>
                    <Typography variant='h6'>
                        Last Update: {new Date(task?.updatedAt).toLocaleString()}
                    </Typography>
                </CardFooter>
            </Card>
            {messageOk && <AlertMessage message={messageOk} color="green" type="success" />}
            {messageWorn && !undoRef.current && isUpdating && (
                <AlertMessage message={messageWorn} color="amber" type="warning" name="alertUndo" undoOption={undoOption} />
            )}
            {messageError && <AlertMessage message={messageError} color="red" type="error" />}
        </div>
    )
}