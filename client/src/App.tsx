import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useState, useEffect, useRef } from "react";
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, where, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Task, Course, User, CourseMember, insertTaskSchema, insertCourseSchema, insertCourseMemberSchema } from "@shared/schema";
import { TaskDialog } from "@/components/TaskDialog";
import { CourseDialog } from "@/components/CourseDialog";
import { useToast } from "@/hooks/use-toast";
import Login from "@/pages/login";
import Register from "@/pages/register";
import VerifyEmail from "@/pages/verify-email";
import Dashboard from "@/pages/dashboard";
import CoursePage from "@/pages/course";
import CourseDirectory from "@/pages/course-directory";
import NotFound from "@/pages/not-found";

function AppContent() {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [myMemberships, setMyMemberships] = useState<CourseMember[]>([]);
  const [allMemberships, setAllMemberships] = useState<CourseMember[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>();

  const tasksUnsubscribeRef = useRef<(() => void) | null>(null);

  const myCourses = allCourses.filter((course) =>
    myMemberships.some((m) => m.courseId === course.id)
  );

  useEffect(() => {
    if (!currentUser?.emailVerified) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const unsubscribeAllCourses = onSnapshot(
        query(collection(db, "courses")),
        {
          next: (snapshot) => {
            const coursesData = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            })) as Course[];
            setAllCourses(coursesData);
          },
          error: (err) => {
            console.error("Error fetching courses:", err);
            setError("Failed to load courses");
            toast({
              title: "Error loading courses",
              description: err.message,
              variant: "destructive",
            });
          },
        }
      );

      const unsubscribeMyMemberships = onSnapshot(
        query(collection(db, "courseMembers"), where("userId", "==", currentUser.uid)),
        {
          next: (snapshot) => {
            const membershipsData = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            })) as CourseMember[];
            setMyMemberships(membershipsData);

            if (tasksUnsubscribeRef.current) {
              tasksUnsubscribeRef.current();
              tasksUnsubscribeRef.current = null;
            }

            const courseIds = membershipsData.map((m) => m.courseId);

            if (courseIds.length === 0) {
              setTasks([]);
              setLoading(false);
              return;
            }

            const unsubscribeTasks = onSnapshot(
              query(collection(db, "tasks"), where("courseId", "in", courseIds)),
              {
                next: (tasksSnapshot) => {
                  const tasksData = tasksSnapshot.docs.map((doc) => ({
                    ...doc.data(),
                    id: doc.id,
                  })) as Task[];
                  setTasks(tasksData);
                  setLoading(false);
                },
                error: (err) => {
                  console.error("Error fetching tasks:", err);
                  setError("Failed to load tasks");
                  setLoading(false);
                },
              }
            );

            tasksUnsubscribeRef.current = unsubscribeTasks;
          },
          error: (err) => {
            console.error("Error fetching memberships:", err);
            setError("Failed to load memberships");
            setLoading(false);
            toast({
              title: "Error loading memberships",
              description: err.message,
              variant: "destructive",
            });
          },
        }
      );

      const unsubscribeUsers = onSnapshot(
        query(collection(db, "users")),
        {
          next: (snapshot) => {
            const usersData = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            })) as User[];
            setUsers(usersData);
          },
          error: (err) => {
            console.error("Error fetching users:", err);
            toast({
              title: "Error loading users",
              description: err.message,
              variant: "destructive",
            });
          },
        }
      );

      const unsubscribeAllMemberships = onSnapshot(
        query(collection(db, "courseMembers")),
        {
          next: (snapshot) => {
            const membershipsData = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            })) as CourseMember[];
            setAllMemberships(membershipsData);
          },
          error: (err) => {
            console.error("Error fetching all memberships:", err);
          },
        }
      );

      return () => {
        unsubscribeAllCourses();
        unsubscribeMyMemberships();
        unsubscribeUsers();
        unsubscribeAllMemberships();
        if (tasksUnsubscribeRef.current) {
          tasksUnsubscribeRef.current();
        }
      };
    } catch (err: any) {
      console.error("Error setting up listeners:", err);
      setError("Failed to initialize data");
      setLoading(false);
      toast({
        title: "Error initializing app",
        description: err.message,
        variant: "destructive",
      });
    }
  }, [currentUser, toast]);

  const handleCreateCourse = async (courseData: any) => {
    try {
      const validated = insertCourseSchema.parse(courseData);
      const courseRef = await addDoc(collection(db, "courses"), {
        ...validated,
        createdAt: new Date().toISOString(),
      });

      const membershipId = `${courseRef.id}_${currentUser!.uid}`;
      await setDoc(doc(db, "courseMembers", membershipId), {
        id: membershipId,
        courseId: courseRef.id,
        userId: currentUser!.uid,
        role: "owner",
        joinedAt: new Date().toISOString(),
      });

      toast({
        title: "Course created",
        description: `${validated.name} has been added`,
      });
    } catch (error: any) {
      console.error("Error creating course:", error);
      toast({
        title: "Error creating course",
        description: error.message || "Failed to create course",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleJoinCourse = async (courseId: string) => {
    try {
      const membershipId = `${courseId}_${currentUser!.uid}`;
      await setDoc(doc(db, "courseMembers", membershipId), {
        id: membershipId,
        courseId,
        userId: currentUser!.uid,
        role: "member",
        joinedAt: new Date().toISOString(),
      });

      const course = allCourses.find((c) => c.id === courseId);
      toast({
        title: "Joined course",
        description: `You've joined ${course?.name || "the course"}`,
      });
    } catch (error: any) {
      console.error("Error joining course:", error);
      toast({
        title: "Error joining course",
        description: error.message || "Failed to join course",
        variant: "destructive",
      });
    }
  };

  const handleLeaveCourse = async (courseId: string) => {
    try {
      const membership = myMemberships.find(
        (m) => m.courseId === courseId && m.userId === currentUser!.uid
      );

      if (!membership) {
        throw new Error("You are not a member of this course");
      }

      if (membership.role === "owner") {
        throw new Error("Course owners cannot leave their courses. Delete the course instead.");
      }

      await deleteDoc(doc(db, "courseMembers", membership.id));

      const course = allCourses.find((c) => c.id === courseId);
      toast({
        title: "Left course",
        description: `You've left ${course?.name || "the course"}`,
      });
    } catch (error: any) {
      console.error("Error leaving course:", error);
      toast({
        title: "Error leaving course",
        description: error.message || "Failed to leave course",
        variant: "destructive",
      });
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      const validated = insertTaskSchema.parse(taskData);

      const isMember = myMemberships.some((m) => m.courseId === validated.courseId);
      if (!isMember) {
        throw new Error("You don't have permission to add tasks to this course");
      }

      const now = new Date().toISOString();
      const taskToSave: any = {
        ...validated,
        createdAt: now,
        updatedAt: now,
      };
      
      // Remove undefined fields
      Object.keys(taskToSave).forEach((key) => {
        if (taskToSave[key] === undefined) {
          delete taskToSave[key];
        }
      });

      await addDoc(collection(db, "tasks"), taskToSave);

      toast({
        title: "Task created",
        description: `${validated.title} has been added`,
      });
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast({
        title: "Error creating task",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateTask = async (taskData: any) => {
    if (!editingTask) return;

    try {
      const validated = insertTaskSchema.parse(taskData);

      const isMember = myMemberships.some((m) => m.courseId === validated.courseId);
      if (!isMember) {
        throw new Error("You don't have permission to edit tasks in this course");
      }

      const taskToUpdate: any = {
        ...validated,
        updatedAt: new Date().toISOString(),
      };
      
      // Remove undefined fields
      Object.keys(taskToUpdate).forEach((key) => {
        if (taskToUpdate[key] === undefined) {
          delete taskToUpdate[key];
        }
      });

      await updateDoc(doc(db, "tasks", editingTask.id), taskToUpdate);

      toast({
        title: "Task updated",
        description: `${validated.title} has been updated`,
      });
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast({
        title: "Error updating task",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleToggleTask = async (task: Task) => {
    try {
      const isMember = myMemberships.some((m) => m.courseId === task.courseId);
      if (!isMember) {
        throw new Error("You don't have permission to modify this task");
      }

      const newStatus = task.status === "completed" ? "pending" : "completed";
      await updateDoc(doc(db, "tasks", task.id), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error toggling task:", error);
      toast({
        title: "Error updating task",
        description: error.message || "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      const isMember = myMemberships.some((m) => m.courseId === task.courseId);
      if (!isMember) {
        throw new Error("You don't have permission to delete this task");
      }

      await deleteDoc(doc(db, "tasks", task.id));
      toast({
        title: "Task deleted",
        description: `${task.title} has been removed`,
      });
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error deleting task",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const course = allCourses.find((c) => c.id === courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      if (course.createdBy !== currentUser!.uid) {
        throw new Error("Only the course creator can delete the course");
      }

      // Delete all tasks in the course
      const courseTasks = tasks.filter((t) => t.courseId === courseId);
      for (const task of courseTasks) {
        await deleteDoc(doc(db, "tasks", task.id));
      }

      // Delete all memberships for the course
      const courseMemberships = allMemberships.filter((m) => m.courseId === courseId);
      for (const membership of courseMemberships) {
        await deleteDoc(doc(db, "courseMembers", membership.id));
      }

      // Delete the course
      await deleteDoc(doc(db, "courses", courseId));

      toast({
        title: "Course deleted",
        description: `${course.name} has been deleted`,
      });
    } catch (error: any) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error deleting course",
        description: error.message || "Failed to delete course",
        variant: "destructive",
      });
    }
  };

  const openTaskDialog = (courseId?: string) => {
    setEditingTask(undefined);
    setSelectedCourseId(courseId);
    setTaskDialogOpen(true);
  };

  const openEditTaskDialog = (task: Task) => {
    setEditingTask(task);
    setSelectedCourseId(task.courseId);
    setTaskDialogOpen(true);
  };

  const taskCounts = myCourses.reduce((acc, course) => {
    acc[course.id] = tasks.filter((t) => t.courseId === course.id && t.status === "pending").length;
    return acc;
  }, {} as Record<string, number>);

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/verify-email" component={VerifyEmail} />

      <Route path="/">
        <ProtectedRoute>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar
                courses={myCourses}
                onCreateCourse={() => setCourseDialogOpen(true)}
                taskCounts={taskCounts}
              />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between p-3 border-b shrink-0">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                </header>
                <main className="flex-1 overflow-auto">
                  <Dashboard
                    tasks={tasks}
                    courses={myCourses}
                    allCourses={allCourses}
                    myMemberships={myMemberships}
                    users={users}
                    onToggleTask={handleToggleTask}
                    onEditTask={openEditTaskDialog}
                    onDeleteTask={handleDeleteTask}
                    onCreateTask={() => openTaskDialog()}
                    onJoinCourse={handleJoinCourse}
                    onLeaveCourse={handleLeaveCourse}
                    loading={loading}
                  />
                </main>
              </div>
            </div>
          </SidebarProvider>

          <TaskDialog
            open={taskDialogOpen}
            onOpenChange={setTaskDialogOpen}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            task={editingTask}
            courseId={selectedCourseId}
            courses={myCourses}
            users={users}
            currentUserId={currentUser?.uid || ""}
          />

          <CourseDialog
            open={courseDialogOpen}
            onOpenChange={setCourseDialogOpen}
            onSubmit={handleCreateCourse}
            currentUserId={currentUser?.uid || ""}
          />
        </ProtectedRoute>
      </Route>

      <Route path="/courses">
        <ProtectedRoute>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar
                courses={myCourses}
                onCreateCourse={() => setCourseDialogOpen(true)}
                taskCounts={taskCounts}
              />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between p-3 border-b shrink-0">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                </header>
                <main className="flex-1 overflow-auto">
                  <CourseDirectory
                    allCourses={allCourses}
                    myMemberships={myMemberships}
                    users={users}
                    onJoinCourse={handleJoinCourse}
                    onLeaveCourse={handleLeaveCourse}
                    loading={loading}
                    allMemberships={allMemberships}
                  />
                </main>
              </div>
            </div>
          </SidebarProvider>

          <CourseDialog
            open={courseDialogOpen}
            onOpenChange={setCourseDialogOpen}
            onSubmit={handleCreateCourse}
            currentUserId={currentUser?.uid || ""}
          />
        </ProtectedRoute>
      </Route>

      <Route path="/course/:id">
        <ProtectedRoute>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar
                courses={myCourses}
                onCreateCourse={() => setCourseDialogOpen(true)}
                taskCounts={taskCounts}
              />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between p-3 border-b shrink-0">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                </header>
                <main className="flex-1 overflow-auto">
                  <CoursePage
                    tasks={tasks}
                    courses={myCourses}
                    users={users}
                    onToggleTask={handleToggleTask}
                    onEditTask={openEditTaskDialog}
                    onDeleteTask={handleDeleteTask}
                    onCreateTask={openTaskDialog}
                    onDeleteCourse={handleDeleteCourse}
                    currentUserId={currentUser?.uid || ""}
                    loading={loading}
                  />
                </main>
              </div>
            </div>
          </SidebarProvider>

          <TaskDialog
            open={taskDialogOpen}
            onOpenChange={setTaskDialogOpen}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            task={editingTask}
            courseId={selectedCourseId}
            courses={myCourses}
            users={users}
            currentUserId={currentUser?.uid || ""}
          />

          <CourseDialog
            open={courseDialogOpen}
            onOpenChange={setCourseDialogOpen}
            onSubmit={handleCreateCourse}
            currentUserId={currentUser?.uid || ""}
          />
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
