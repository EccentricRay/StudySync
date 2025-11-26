import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task, Course, User, InsertTask, Priority } from "@shared/schema";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: Partial<InsertTask>) => Promise<void>;
  task?: Task;
  courseId?: string;
  courses: Course[];
  users: User[];
  currentUserId: string;
}

export function TaskDialog({
  open,
  onOpenChange,
  onSubmit,
  task,
  courseId,
  courses,
  users,
  currentUserId,
}: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(courseId || "");
  const [priority, setPriority] = useState<Priority>("medium");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setSelectedCourseId(task.courseId);
      setPriority(task.priority);
      setAssignedTo(task.assignedTo || "");
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    } else {
      setTitle("");
      setDescription("");
      setSelectedCourseId(courseId || "");
      setPriority("medium");
      setAssignedTo("");
      setDueDate(undefined);
    }
    setIsSubmitting(false);
  }, [task, courseId, currentUserId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedCourseId) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description?.trim() ? description.trim() : undefined,
        courseId: selectedCourseId,
        priority,
        assignedTo: assignedTo || undefined,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        status: task?.status || "pending",
        createdBy: currentUserId,
      });
      setIsSubmitting(false);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error submitting task:", error);
      setIsSubmitting(false);
    }
  };

  const availableUsers = users;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-task">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update task details below" : "Add a new task to your course"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
              data-testid="input-task-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add task description (optional)"
              rows={3}
              data-testid="input-task-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course *</Label>
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
                required
              >
                <SelectTrigger data-testid="select-course">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id} data-testid={`option-course-${course.id}`}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger data-testid="select-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low" data-testid="option-priority-low">Low</SelectItem>
                  <SelectItem value="medium" data-testid="option-priority-medium">Medium</SelectItem>
                  <SelectItem value="high" data-testid="option-priority-high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                    data-testid="button-due-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned-to">Assigned To</Label>
              <Textarea
                id="assigned-to"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Enter the name of the person to assign this task to"
                rows={1}
                data-testid="input-assigned-to"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              data-testid="button-cancel-task"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} data-testid="button-save-task">
              {isSubmitting ? "Saving..." : task ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
