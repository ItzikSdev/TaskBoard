import {
  Button,
  IconButton,
  Typography,
  CardHeader,
  Card,
  TabsHeader,
  Tabs,
  Tab,
  Input,
  CardBody,
  CardFooter,
  Spinner,
  Badge,
} from "@material-tailwind/react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import debounce from "lodash.debounce";
import { fetchTasks } from "../services/Taskservice";
import {
  setError,
  setLoading,
  setTasks,
  setTotalPages,
} from "../redux/slices/TasksSlice";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../hooks/storHooks";
import { useNavigate } from "react-router-dom";
const TABS = [
    { label: "5", value: "5" },
    { label: "10", value: "10" },
    { label: "20", value: "20" },
];

interface DefaultPaginationProps {
    handleOpenDialog: () => void;
}

export function DefaultPagination({
    handleOpenDialog,
}: DefaultPaginationProps) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(1);
  const [filterByPriority, setFilterByPriority] = useState("");
  const [filterByTitle, setFilterByTitle] = useState("");
  const [sort, setSort] = useState<{ priority?: number; createdAt?: number }>(
    {}
  );

  const [selectedTab, setSelectedTab] = useState(TABS[2].value);
  const { tasks, totalPages, loading, error, messageWorn, messageOk } =
    useAppSelector((state) => state.tasksSlice);
  const { data, isLoading, isError } = useQuery(
    ["tasks", page, limit, filterByPriority, filterByTitle, sort],
    () => fetchTasks(page, limit, filterByPriority, filterByTitle, sort),
    {
      keepPreviousData: true,
      onSuccess: (data) => {  
        dispatch(setTotalPages(data?.totalPages));
        dispatch(setTasks(data));
        dispatch(setLoading(false));
      },
      onError: () => {
        dispatch(setError("Failed to get Tasks"));
        dispatch(setLoading(false));
      },
    }
  );

  useEffect(() => {
    if (data) {        
      dispatch(setTotalPages(data?.totalPages));
      dispatch(setTasks(data));
      dispatch(setLoading(false));
    }
    if (isLoading) {
      dispatch(setLoading(true));
    }
    if (isError) {
      dispatch(setError("Failed to get Tasks"));
      dispatch(setLoading(false));
    }
  }, [data, isLoading, isError, dispatch]);

  const debouncedSetFilterByTitle = debounce((value: string) => {
    setFilterByTitle(value);
  }, 300);

  const debouncedSetFilterByPriority = debounce((value: string) => {
    setFilterByPriority(value);
  }, 300);

  const handleFilterTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    debouncedSetFilterByTitle(event.target.value);
  };

  const handleFilterPriorityChange = (
    event: React.ChangeEvent<HTMLButtonElement>
  ) => {
    debouncedSetFilterByPriority(event.target.value);
  };

  const handleSortPriority = () => {
    setSort((prev) => ({
      ...prev,
      priority: prev.priority === 1 ? -1 : 1,
      lastSortField: 'priority',
    }));
  };
  
  const handleSortDate = () => {
    setSort((prev) => ({
      ...prev,
      createdAt: prev.createdAt === 1 ? -1 : 1,
      lastSortField: 'createdAt',
    }));
  };

  const TABLE_HEAD = [
    {
      label: "Title",
      input: (
        <Input
          label="Filter by Title"
          onChange={handleFilterTitleChange}
          icon={<MagnifyingGlassIcon className="h-5 w-5" />}
        />
      ),
    },
    {
      label: "Priority",
      buttonSort: (
        <IconButton onClick={handleSortPriority} variant="text">
          <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
        </IconButton>
      ),
      input: (
        <Input
          label="Filter by Priority"
          onChange={handleFilterPriorityChange}
          icon={<MagnifyingGlassIcon className="h-5 w-5" />}
        />
      ),
    },
    {
      label: "Date",
      buttonSort: (
        <IconButton variant="text" onClick={handleSortDate}>
          <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
        </IconButton>
      ),
    },
  ];
  const TABLE_ROWS: [] = tasks?.tasks;

  useEffect(() => {
    if (selectedTab) {
      setLimit(parseInt(selectedTab));
    }
  }, [selectedTab]);

  const next = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const prev = () => {
    if (page > 1) setPage(page - 1);
  };

  if (loading || isLoading)
    return (
      <Typography variant="h4">
        <Spinner />
      </Typography>    );

    const handleMoveToTaskPage = (id: string) => {        
        navigate(`/task/${id}`)
    }
  return (
    <>
      <Card
        color="transparent"
        shadow={false}
        className=""
        style={{ width: "55rem" }}
      >
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <Typography variant="h3" color="blue-gray">
            TaskBoard
          </Typography>
          <div className="mb-8 flex items-center justify-between gap-8">
            <div>
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <label htmlFor="limit" className="mr-2">
                  Tasks per page:
                </label>
                <Tabs className="w-auto" value={selectedTab}>
                  <TabsHeader>
                    {TABS.map(({ label, value }) => (
                      <Tab
                        key={value}
                        value={value}
                        onClick={() => setSelectedTab(value)}
                      >
                        &nbsp;&nbsp;{label}&nbsp;&nbsp;
                      </Tab>
                    ))}
                  </TabsHeader>
                </Tabs>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button
                className="flex items-center gap-3"
                size="sm"
                onClick={handleOpenDialog}
              >
                <PlusIcon strokeWidth={2} className="h-4 w-4" /> Add Task
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-auto px-0" style={{ height: "70vh" }}>
          <table className="mt-4 w-full min-w-60 table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head, _) => (
                  <th
                    key={head.label}
                    className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors hover:bg-blue-gray-50"
                  >
                    <Typography
                      as="div"
                      variant="small"
                      color="blue-gray"
                      className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
                    >
                      {head.label}
                      {head.buttonSort}
                      <div className="w-[20rem]">{head.input}</div>
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TABLE_ROWS.length >= 1 ? TABLE_ROWS && TABLE_ROWS.map(
                  (
                    {
                      title,
                      description,
                      priority,
                      createdAt,
                      _id,
                    }: {
                        _id: string;
                      title: string;
                      description: string;
                      priority: string;
                      createdAt: string;
                    },
                    index: number
                  ) => {
                    const isLast = index === TABLE_ROWS.length - 1;
                    const classes = isLast
                      ? "p-4"
                      : "p-4 border-b border-blue-gray-50";

                    return (
                      <tr key={_id} onClick={() => handleMoveToTaskPage(_id)} 
                      className="transition-colors hover:bg-blue-gray-50">
                      <td className={classes}>
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal"
                              >
                                {title}
                              </Typography>
                            </div>
                          </div>
                        </td>
                        <td className={classes}>
                          <div className="flex flex-col">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {description}
                            </Typography>
                            <Badge    color={
                                    parseInt(priority) >= 1 ? "red" :      // 100% or more
                                    parseInt(priority) >= 0.6 ? "orange" : // 60% to 99%
                                    "green"                      // less than 60%
                                }>
                                <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal opacity-70"
                                >
                                {(parseFloat(priority) *100).toFixed(1)}%
                                </Typography>
                            </Badge>
                          </div>
                        </td>
                        <td className={classes}>
                          <div className="flex flex-col">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {new Date(createdAt).toLocaleString()}
                            </Typography>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                ): (
                    <tr key={'not found'}>
                         <td>
                          <div className="flex flex-col">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                             No results found
                            </Typography>
                          </div>
                        </td>
                    </tr>
                )}
            </tbody>
          </table>
        </CardBody>
        <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
          <Typography variant="small" color="blue-gray" className="font-normal">
            Page {page} of {totalPages}
          </Typography>
          <div className="flex gap-2">
            <Button
              className="flex items-center gap-3"
              size="sm"
              onClick={prev}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              className="flex items-center gap-3"
              size="sm"
              onClick={next}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
