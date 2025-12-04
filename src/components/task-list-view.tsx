import { ChevronDown, Edit, Eye, Flag, RotateCcw, Trash2, Clock } from "lucide-react";
import { CountdownTimer } from "@/components/countdown-timer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAvatarColor, getInitials } from "@/lib/avatar-utils";
import { getDDMDateString } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface Task {
  _id?: string;
  id?: string;
  project_id?: {
    _id: string;
    title: string;
  } | null;
  created_by?: {
    _id: string;
    name: string;
    email: string;
    profile_pic?: string;
  };
  title: string;
  description?: string;
  estimated_hours?: number;
  priority: "high" | "medium" | "low";
  status: string;
  dueDate?: string;
  createdAt?: string;
  completed_at?: string;
  reworked?: boolean;
  category?: string;
}

interface TaskListViewProps {
  todoTasks: Task[];
  inProgressTasks: Task[];
  completedTasks: Task[];
  todoOpen: boolean;
  inProgressOpen: boolean;
  completedOpen: boolean;
  setTodoOpen: (open: boolean) => void;
  setInProgressOpen: (open: boolean) => void;
  setCompletedOpen: (open: boolean) => void;
  selectedTasks: string[];
  onTaskSelect: (taskId: string) => void;
  onSelectAllInSection: (tasks: Task[]) => void;
  onTaskClick: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, status: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
  loading: boolean;
  visibleColumns: {
    task: boolean;
    category: boolean;
    priority: boolean;
    due: boolean;
    countdown: boolean;
    status: boolean;
  };
  isMyTasksView: boolean;
  currentUser: any;
  doneHasMore: boolean;
  loadingMore: boolean;
  onLoadMoreDone: () => void;
}

export function TaskListView({
  todoTasks,
  inProgressTasks,
  completedTasks,
  todoOpen,
  inProgressOpen,
  completedOpen,
  setTodoOpen,
  setInProgressOpen,
  setCompletedOpen,
  selectedTasks,
  onTaskSelect,
  onSelectAllInSection,
  onTaskClick,
  onUpdateTaskStatus,
  onEditTask,
  onDeleteTask,
  loading,
  visibleColumns,
  isMyTasksView,
  currentUser,
  doneHasMore,
  loadingMore,
  onLoadMoreDone,
}: TaskListViewProps) {
  const renderTaskTable = (
    tasks: Task[],
    bgColor: string,
    statusColor: string,
    showCompletedAt: boolean = false,
    startIndex: number = 0
  ) => (
    <Table className="w-full">
      <TableHeader>
        <TableRow className={bgColor}>
          <TableHead className="w-12 min-w-12 max-w-12 text-xs">
            #
          </TableHead>
          {visibleColumns.task && (
            <TableHead className="w-72 min-w-72 max-w-72 text-xs">
              Task
            </TableHead>
          )}
          {isMyTasksView && (
            <TableHead className="w-20 min-w-20 max-w-20 text-xs">
              Project
            </TableHead>
          )}
          {visibleColumns.category && (
            <TableHead className="w-24 min-w-24 max-w-24 text-xs">
              Category
            </TableHead>
          )}
          {visibleColumns.priority && (
            <TableHead className="w-20 min-w-20 max-w-20 text-xs">
              Priority
            </TableHead>
          )}
          {visibleColumns.due && (
            <TableHead className="w-16 min-w-16 max-w-16 text-xs">
              Due
            </TableHead>
          )}
          {visibleColumns.countdown && (
            <TableHead className="w-24 min-w-24 max-w-24 text-xs">
              Countdown
            </TableHead>
          )}
          {visibleColumns.status && (
            <TableHead className="w-24 min-w-24 max-w-24 text-xs">
              Status
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell className="py-2"><Skeleton className="h-4 w-4" /></TableCell>
              {visibleColumns.task && <TableCell className="py-2"><Skeleton className="h-4 w-48" /></TableCell>}
              {visibleColumns.category && <TableCell className="py-2"><Skeleton className="h-4 w-20" /></TableCell>}
              {visibleColumns.priority && <TableCell className="py-2"><Skeleton className="h-4 w-16" /></TableCell>}
              {visibleColumns.due && <TableCell className="py-2"><Skeleton className="h-4 w-16" /></TableCell>}
              {visibleColumns.countdown && <TableCell className="py-2"><Skeleton className="h-4 w-20" /></TableCell>}
              {visibleColumns.status && <TableCell className="py-2"><Skeleton className="h-7 w-24 rounded-md" /></TableCell>}
            </TableRow>
          ))
        ) : tasks.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={showCompletedAt ? 9 : 8}
              className="text-center py-4"
            >
              <p className="text-gray-500 text-sm font-medium">
                No tasks found
              </p>
            </TableCell>
          </TableRow>
        ) : (
          tasks.map((task, index) => (
            <ContextMenu key={task._id}>
              <ContextMenuTrigger asChild>
                <TableRow
                  className={`hover:${bgColor} cursor-pointer h-8`}
                  onClick={() => onTaskClick(task)}
                >
                  <TableCell className="w-12 min-w-12 max-w-12 py-1">
                    <span className="text-xs text-gray-500 font-medium">
                      {startIndex + index + 1}
                    </span>
                  </TableCell>
                  {visibleColumns.task && (
                    <TableCell className="w-72 min-w-72 max-w-72 py-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <TooltipProvider>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <div className="text-xs font-medium text-gray-900 hover:text-gray-600 transition-colors truncate cursor-pointer">
                                {task.title}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-black text-white min-w-48 max-w-80">
                              <p>{task.title}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {task.reworked && (
                          <TooltipProvider>
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <span className="text-xs bg-gray-600 text-white px-1.5 py-0.5 rounded font-medium flex-shrink-0 flex items-center cursor-pointer">
                                  <RotateCcw className="w-3 h-3" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-black text-white">
                                <p>Rework</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {(task.created_by as any)?.role === "qa" && (
                          <TooltipProvider>
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <span className="text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded font-medium flex-shrink-0 cursor-pointer">
                                  QA
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-black text-white">
                                <p>Quality Assurance/Testing</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                  )}
                  {isMyTasksView && (
                    <TableCell className="w-20 min-w-20 max-w-20 py-1">
                      <span
                        className="text-xs text-gray-900 truncate block"
                        title={task.project_id?.title || "No Project"}
                      >
                        {task.project_id?.title || "No Project"}
                      </span>
                    </TableCell>
                  )}
                  {visibleColumns.category && (
                    <TableCell className="w-24 min-w-24 max-w-24 py-1">
                      <span className="text-xs text-gray-700 truncate block">
                        {task.category || "-"}
                      </span>
                    </TableCell>
                  )}
                  {visibleColumns.priority && (
                    <TableCell className="w-20 min-w-20 max-w-20 py-1">
                      <div className="flex items-center gap-1.5">
                        <Flag
                          className={cn(
                            "w-3 h-3 fill-current flex-shrink-0",
                            task.priority === "high"
                              ? "text-red-500"
                              : task.priority === "medium"
                                ? "text-amber-500"
                                : "text-green-500"
                          )}
                        />
                        <span className="text-xs text-gray-700 capitalize">
                          {task.priority}
                        </span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.due && (
                    <TableCell className="w-20 min-w-20 max-w-20 py-1">
                      {!task.dueDate && !(task as any).due_date ? (
                        <span className="text-xs text-gray-400">-</span>
                      ) : (
                        <div
                          className={cn(
                            "text-xs",
                            (() => {
                              const dueDate = new Date(task.dueDate || (task as any).due_date);
                              const today = new Date();
                              const dueDateOnly = new Date(
                                dueDate.getFullYear(),
                                dueDate.getMonth(),
                                dueDate.getDate()
                              );
                              const todayOnly = new Date(
                                today.getFullYear(),
                                today.getMonth(),
                                today.getDate()
                              );
                              if (
                                task.status === "done" ||
                                task.status === "testing" ||
                                task.status === "completed"
                              ) {
                                return "text-gray-600";
                              }
                              if (dueDateOnly < todayOnly) {
                                return "text-red-600 font-medium";
                              }
                              if (dueDateOnly.getTime() === todayOnly.getTime()) {
                                return "text-yellow-500 font-bold";
                              }
                              return "text-gray-600";
                            })()
                          )}
                        >
                          {(() => {
                            const dueDate = new Date(task.dueDate || (task as any).due_date);
                            const today = new Date();
                            const yesterday = new Date(today);
                            yesterday.setDate(today.getDate() - 1);
                            const tomorrow = new Date(today);
                            tomorrow.setDate(today.getDate() + 1);
                            const dueDateOnly = new Date(
                              dueDate.getFullYear(),
                              dueDate.getMonth(),
                              dueDate.getDate()
                            );
                            const todayOnly = new Date(
                              today.getFullYear(),
                              today.getMonth(),
                              today.getDate()
                            );
                            const yesterdayOnly = new Date(
                              yesterday.getFullYear(),
                              yesterday.getMonth(),
                              yesterday.getDate()
                            );
                            const tomorrowOnly = new Date(
                              tomorrow.getFullYear(),
                              tomorrow.getMonth(),
                              tomorrow.getDate()
                            );
                            if (
                              task.status === "done" ||
                              task.status === "testing" ||
                              task.status === "completed"
                            ) {
                              return dueDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              });
                            }
                            if (dueDateOnly.getTime() === todayOnly.getTime())
                              return "Today";
                            if (dueDateOnly.getTime() === tomorrowOnly.getTime())
                              return "Tomorrow";
                            if (dueDateOnly.getTime() === yesterdayOnly.getTime())
                              return "Yesterday";
                            return dueDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            });
                          })()}
                        </div>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.countdown && (
                    <TableCell className="w-24 min-w-24 max-w-24 py-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        {task.dueDate ? (
                          <CountdownTimer 
                            dueDate={task.dueDate} 
                            isCompleted={task.status === "completed"}
                          />
                        ) : '-'}
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.status && (
                    <TableCell className="w-24 min-w-24 max-w-24 py-1">
                      {currentUser?.role === "employee" &&
                      task.created_by?._id !== currentUser._id ? (
                        <div className="flex items-center gap-2 text-xs text-gray-600 opacity-75">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              task.status === "completed"
                                ? "bg-emerald-500"
                                : task.status === "in-progress"
                                  ? "bg-blue-500"
                                  : "bg-gray-500"
                            )}
                          ></div>
                          {task.status === "pending"
                            ? "To Do"
                            : task.status === "in-progress"
                              ? "In Progress"
                              : "Completed"}
                        </div>
                      ) : (
                        <Select
                          value={task.status}
                          onValueChange={(value) =>
                            onUpdateTaskStatus(task._id || task.id || '', value)
                          }
                        >
                          <SelectTrigger
                            className="h-7 w-20 sm:w-28 text-xs border-gray-200 hover:border-gray-300 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <SelectValue>
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className={cn(
                                    "w-2 h-2 rounded-full flex-shrink-0",
                                    task.status === "completed"
                                      ? "bg-emerald-500"
                                      : task.status === "in-progress"
                                        ? "bg-blue-500"
                                        : "bg-gray-500"
                                  )}
                                ></div>
                                <span className="truncate">
                                  {task.status === "pending"
                                    ? "To Do"
                                    : task.status === "in-progress"
                                      ? "In Progress"
                                      : "Completed"}
                                </span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                To Do
                              </div>
                            </SelectItem>
                            <SelectItem value="in-progress">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                In Progress
                              </div>
                            </SelectItem>
                            <SelectItem value="completed">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                Completed
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(task);
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </ContextMenuItem>
                {onEditTask && (
                  <ContextMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditTask(task);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Task
                  </ContextMenuItem>
                )}
                {!(
                  currentUser?.role === "employee" &&
                  task.created_by?._id !== currentUser._id
                ) && (
                  <>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateTaskStatus(task._id || task.id || '', "pending");
                      }}
                      disabled={task.status === "pending"}
                    >
                      Mark as To Do
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateTaskStatus(task._id || task.id || '', "in-progress");
                      }}
                      disabled={task.status === "in-progress"}
                    >
                      Mark as In Progress
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateTaskStatus(task._id || task.id || '', "completed");
                      }}
                      disabled={task.status === "completed"}
                    >
                      Mark as Completed
                    </ContextMenuItem>
                  </>
                )}
                {onDeleteTask && (
                  <>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTask(task);
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Task
                    </ContextMenuItem>
                  </>
                )}
              </ContextMenuContent>
            </ContextMenu>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <>
      <div className="mb-8">
        <div className="px-6 flex gap-3 items-center">
          <div className="flex items-center gap-3 bg-gray-100 w-fit pl-2 pr-3 py-1.5 rounded-lg">
            <button
              onClick={() => setTodoOpen(!todoOpen)}
              className="flex items-center gap-2 text-xs text-gray-700 font-medium transition-colors"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  todoOpen ? "" : "-rotate-90"
                )}
              />
              <span>TO DO</span>
            </button>
          </div>
          <div className="text-xs font-semibold text-gray-600">
            {todoTasks.length}
          </div>
        </div>
        {todoOpen && (
          <div className="bg-white overflow-hidden rounded-lg border border-gray-200">
            {renderTaskTable(
              todoTasks,
              "bg-gradient-to-t from-gray-50 to-white",
              "border-gray-600",
              false,
              0
            )}
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="px-6 flex gap-3 items-center">
          <div className="flex items-center gap-3 bg-blue-50 w-fit pl-2 pr-3 py-1.5 rounded-lg">
            <button
              onClick={() => setInProgressOpen(!inProgressOpen)}
              className="flex items-center gap-2 font-medium text-xs text-blue-700 transition-colors"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  inProgressOpen ? "" : "-rotate-90"
                )}
              />
              <span>IN PROGRESS</span>
            </button>
          </div>
          <div className="text-xs font-semibold text-gray-600">
            {inProgressTasks.length}
          </div>
        </div>
        {inProgressOpen && (
          <div className="bg-white overflow-hidden rounded-lg border border-gray-200">
            {renderTaskTable(
              inProgressTasks,
              "bg-gradient-to-t from-blue-50 to-white",
              "border-blue-600",
              false,
              0
            )}
          </div>
        )}
      </div>

      <div>
        <div className="px-6 flex gap-3 items-center">
          <div className="flex items-center gap-3 bg-green-50 w-fit pl-2 pr-3 py-1.5 rounded-lg">
            <button
              onClick={() => setCompletedOpen(!completedOpen)}
              className="flex items-center gap-2 font-medium text-xs text-green-700 transition-colors"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  completedOpen ? "" : "-rotate-90"
                )}
              />
              <span>COMPLETED</span>
            </button>
          </div>
          <div className="text-xs font-semibold text-gray-600">
            {completedTasks.length}
          </div>
        </div>
        {completedOpen && (
          <div className="bg-white overflow-hidden rounded-lg border border-gray-200">
            {renderTaskTable(
              completedTasks,
              "bg-gradient-to-t from-gray-50 to-white",
              "border-emerald-600",
              true,
              0
            )}
            {isMyTasksView && doneHasMore && (
              <div className="flex justify-center py-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLoadMoreDone}
                  disabled={loadingMore}
                  className="h-7 px-3 text-xs"
                >
                  {loadingMore ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                      Loading...
                    </div>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
