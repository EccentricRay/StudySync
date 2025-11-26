import { Task, Course, User } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Flag, MoreVertical, Pencil, Trash2, User as UserIcon } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TaskCardProps {
  task: Task;
  course?: Course;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskCard({
  task,
  course,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const isCompleted = task.status === "completed";
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isCompleted;
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      className={cn(
        "p-4 hover-elevate transition-all",
        isCompleted && "opacity-60",
        isOverdue && "border-destructive/50"
      )}
      data-testid={`card-task-${task.id}`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={() => onToggleComplete(task)}
          className="mt-1"
          data-testid={`checkbox-task-${task.id}`}
        />

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                "font-medium text-base leading-tight",
                isCompleted && "line-through"
              )}
              data-testid={`text-task-title-${task.id}`}
            >
              {task.title}
            </h3>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0"
                  data-testid={`button-task-menu-${task.id}`}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)} data-testid={`button-edit-task-${task.id}`}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(task)}
                  className="text-destructive focus:text-destructive"
                  data-testid={`button-delete-task-${task.id}`}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-task-description-${task.id}`}>
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getPriorityColor(task.priority)} className="text-xs" data-testid={`badge-priority-${task.id}`}>
              <Flag className="w-3 h-3 mr-1" />
              {task.priority}
            </Badge>

            {task.dueDate && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  isOverdue && "border-destructive text-destructive",
                  isDueToday && "border-primary text-primary"
                )}
                data-testid={`badge-due-date-${task.id}`}
              >
                <Calendar className="w-3 h-3 mr-1" />
                {format(new Date(task.dueDate), "MMM d")}
              </Badge>
            )}

            {course && (
              <Badge variant="secondary" className="text-xs" data-testid={`badge-course-${task.id}`}>
                <BookOpen className="w-3 h-3 mr-1" />
                {course.name}
              </Badge>
            )}

            {task.assignedTo && (
              <div className="flex items-center gap-1.5" data-testid={`text-assignee-${task.id}`}>
                <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {task.assignedTo}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function BookOpen({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}
