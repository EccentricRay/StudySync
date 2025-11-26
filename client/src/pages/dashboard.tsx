import { useState, useEffect } from "react";
import { collection, query, onSnapshot, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Task, Course, User, CourseMember } from "@shared/schema";
import { TaskCard } from "@/components/TaskCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, CheckCircle2, Clock, Users, BookOpen } from "lucide-react";
import { isToday, isThisWeek, isPast } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface DashboardProps {
  tasks: Task[];
  courses: Course[];
  allCourses: Course[];
  myMemberships: CourseMember[];
  users: User[];
  onToggleTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onCreateTask: () => void;
  onJoinCourse: (courseId: string) => void;
  onLeaveCourse: (courseId: string) => void;
  loading: boolean;
}

export default function Dashboard({
  tasks,
  courses,
  allCourses,
  myMemberships,
  users,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onCreateTask,
  onJoinCourse,
  onLeaveCourse,
  loading,
}: DashboardProps) {
  const { currentUser } = useAuth();

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const todayTasks = pendingTasks.filter((t) => t.dueDate && isToday(new Date(t.dueDate)));
  const weekTasks = pendingTasks.filter((t) => t.dueDate && isThisWeek(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)));
  const overdueTasks = pendingTasks.filter((t) => t.dueDate && isPast(new Date(t.dueDate)));

  const getCourseStats = (courseId: string) => {
    const courseTasks = tasks.filter((t) => t.courseId === courseId);
    const completed = courseTasks.filter((t) => t.status === "completed").length;
    const total = courseTasks.length;
    const pending = total - completed;
    return { total, completed, pending };
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-dashboard-title">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your tasks across all courses
          </p>
        </div>
        <Button onClick={onCreateTask} data-testid="button-create-task">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-tasks">{tasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedTasks.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-today-tasks">{todayTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tasks needing attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="text-overdue-tasks">
              {overdueTasks.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Past deadline
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Due Today</h2>
            {todayTasks.length === 0 ? (
              <Card className="p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No tasks due today</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    course={courses.find((c) => c.id === task.courseId)}
                    onToggleComplete={onToggleTask}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                  />
                ))}
              </div>
            )}
          </div>

          {overdueTasks.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-destructive">Overdue</h2>
              <div className="space-y-3">
                {overdueTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    course={courses.find((c) => c.id === task.courseId)}
                    onToggleComplete={onToggleTask}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-4">This Week</h2>
            {weekTasks.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No upcoming tasks this week</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {weekTasks.slice(0, 5).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    course={courses.find((c) => c.id === task.courseId)}
                    onToggleComplete={onToggleTask}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">By Course</h2>
          {courses.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No courses yet</p>
              <p className="text-sm text-muted-foreground">
                Create a course to get started organizing your tasks
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {courses.map((course) => {
                const stats = getCourseStats(course.id);
                const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

                return (
                  <Card key={course.id} className="hover-elevate transition-all" data-testid={`card-course-${course.id}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{course.name}</CardTitle>
                      <CardDescription>
                        {stats.pending} pending · {stats.completed} completed
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
