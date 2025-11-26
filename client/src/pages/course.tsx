import { useState } from "react";
import { useRoute } from "wouter";
import { Task, Course, User } from "@shared/schema";
import { TaskCard } from "@/components/TaskCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Filter, ArrowUpDown, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface CoursePageProps {
  tasks: Task[];
  courses: Course[];
  users: User[];
  onToggleTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onCreateTask: (courseId: string) => void;
  onDeleteCourse: (courseId: string) => void;
  currentUserId: string;
  loading: boolean;
}

export default function CoursePage({
  tasks,
  courses,
  users,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onCreateTask,
  onDeleteCourse,
  currentUserId,
  loading,
}: CoursePageProps) {
  const [, params] = useRoute("/course/:id");
  const courseId = params?.id;

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dueDate");

  const course = courses.find((c) => c.id === courseId);
  const courseTasks = tasks.filter((t) => t.courseId === courseId);

  let filteredTasks = courseTasks;
  if (filterStatus !== "all") {
    filteredTasks = filteredTasks.filter((t) => t.status === filterStatus);
  }
  if (filterPriority !== "all") {
    filteredTasks = filteredTasks.filter((t) => t.priority === filterPriority);
  }

  filteredTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "dueDate") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (sortBy === "priority") {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return 0;
  });

  const pendingTasks = filteredTasks.filter((t) => t.status === "pending");
  const completedTasks = filteredTasks.filter((t) => t.status === "completed");

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Course not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-course-title">{course.name}</h1>
          <p className="text-muted-foreground mt-1">
            {pendingTasks.length} pending · {completedTasks.length} completed
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onCreateTask(courseId!)} data-testid="button-create-task">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
          {course.createdBy === currentUserId && (
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm(`Are you sure you want to delete "${course.name}"? This action cannot be undone.`)) {
                  onDeleteCourse(courseId!);
                }
              }}
              data-testid="button-delete-course"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Course
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32" data-testid="select-filter-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-32" data-testid="select-filter-priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32" data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No tasks found</h3>
          <p className="text-muted-foreground mb-4">
            {courseTasks.length === 0
              ? "Create your first task to get started"
              : "Try adjusting your filters"}
          </p>
          {courseTasks.length === 0 && (
            <Button onClick={() => onCreateTask(courseId!)} data-testid="button-create-first-task">
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {pendingTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Pending Tasks</h2>
                <span className="text-sm text-muted-foreground">({pendingTasks.length})</span>
              </div>
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    course={course}
                    onToggleComplete={onToggleTask}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                  />
                ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <>
              {pendingTasks.length > 0 && <Separator className="my-6" />}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Completed Tasks</h2>
                  <span className="text-sm text-muted-foreground">({completedTasks.length})</span>
                </div>
                <div className="space-y-3">
                  {completedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      course={course}
                      onToggleComplete={onToggleTask}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
