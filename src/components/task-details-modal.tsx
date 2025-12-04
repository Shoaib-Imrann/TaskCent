import { Calendar, Flag, User, X, Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Task {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  status: string;
  dueDate?: string;
  category?: string;
}

interface TaskDetailsModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  allTasks?: Task[];
  onNavigateTask?: (task: Task) => void;
}

export function TaskDetailsModal({ task, isOpen, onClose, onEdit, onDelete, allTasks = [], onNavigateTask }: TaskDetailsModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA"
      );
      
      if (isTyping) return;
      
      const currentTaskIndex = allTasks.findIndex((t) => (t._id || t.id) === (task?._id || task?.id));
      const canNavigateUp = currentTaskIndex > 0;
      const canNavigateDown = currentTaskIndex < allTasks.length - 1;
      
      if (event.key === "ArrowUp" && canNavigateUp) {
        event.preventDefault();
        onNavigateTask?.(allTasks[currentTaskIndex - 1]);
      } else if (event.key === "ArrowDown" && canNavigateDown) {
        event.preventDefault();
        onNavigateTask?.(allTasks[currentTaskIndex + 1]);
      }
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, allTasks, task, onNavigateTask])

  if (!task || !isOpen) return null;

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    onDelete?.();
  };

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="relative w-full max-w-2xl">
      <div
        className="bg-white rounded-lg w-full max-h-[80vh] overflow-y-auto p-4 md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
    {/* Close button - absolute top right */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-lg text-gray-400 hover:text-gray-600 transition-colors border border-gray-200 z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Edit/Delete buttons - absolute top right edge */}
        <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-gray-400 hover:text-blue-600 transition-colors p-2"
              title="Edit task"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-gray-400 hover:text-red-600 transition-colors p-2"
              title="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2 pr-16">
              {task.title}
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {/* Properties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Flag
                className={cn(
                  "w-4 h-4 fill-current",
                  task.priority === "high"
                    ? "text-red-500"
                    : task.priority === "medium"
                      ? "text-amber-500"
                      : "text-green-500"
                )}
              />
              <div>
                <div className="text-xs text-gray-500">Priority</div>
                <div className="text-sm font-medium capitalize">{task.priority}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Due Date</div>
                <div className="text-sm font-medium">
                  {(task.dueDate || (task as any).due_date) ? new Date(task.dueDate || (task as any).due_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }) : 'No due date'}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
              <div
                className="text-sm text-gray-600 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: task.description }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation arrows - Above modal at top left */}
      {allTasks.length > 1 && onNavigateTask && (() => {
        const currentTaskIndex = allTasks.findIndex((t) => (t._id || t.id) === (task?._id || task?.id));
        const canNavigatePrev = currentTaskIndex > 0;
        const canNavigateNext = currentTaskIndex < allTasks.length - 1;
        
        if (!canNavigatePrev && !canNavigateNext) return null;
        
        return (
          <div className="absolute -top-10 left-0 flex gap-2 items-center">
            <div className="flex gap-0">
              {canNavigatePrev && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateTask(allTasks[currentTaskIndex - 1]);
                  }}
                  className={cn(
                    "h-10 w-12 bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-center",
                    canNavigateNext ? "rounded-l-lg" : "rounded-lg"
                  )}
                  title="Previous task (↑)"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
              )}
              {canNavigateNext && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateTask(allTasks[currentTaskIndex + 1]);
                  }}
                  className={cn(
                    "h-10 w-12 bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-center",
                    canNavigatePrev ? "border-l-0 rounded-r-lg" : "rounded-lg"
                  )}
                  title="Next task (↓)"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="text-xs text-gray-500 font-medium">
              {currentTaskIndex + 1}/{allTasks.length}
            </div>
          </div>
        );
      })()}
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
