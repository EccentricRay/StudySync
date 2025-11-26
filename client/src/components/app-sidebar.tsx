import {
  BookOpen,
  LayoutDashboard,
  Plus,
  LogOut,
  User,
  Library,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Course } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface AppSidebarProps {
  courses: Course[];
  onCreateCourse: () => void;
  taskCounts: Record<string, number>;
}

export function AppSidebar({ courses, onCreateCourse, taskCounts }: AppSidebarProps) {
  const [location] = useLocation();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out successfully",
      });
    } catch (error) {
      toast({
        title: "Error logging out",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
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
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">StudySync</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/"} data-testid="link-dashboard">
                  <Link href="/">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/courses"} data-testid="link-course-directory">
                  <Link href="/courses">
                    <Library className="w-4 h-4" />
                    <span>Course Directory</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between px-2">
            <SidebarGroupLabel>Courses</SidebarGroupLabel>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={onCreateCourse}
              data-testid="button-create-course"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {courses.length === 0 ? (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No courses yet
                </div>
              ) : (
                courses.map((course) => (
                  <SidebarMenuItem key={course.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === `/course/${course.id}`}
                      data-testid={`link-course-${course.id}`}
                    >
                      <Link href={`/course/${course.id}`}>
                        <BookOpen className="w-4 h-4" />
                        <span className="flex-1 truncate">{course.name}</span>
                        {taskCounts[course.id] > 0 && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {taskCounts[course.id]}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {currentUser?.displayName ? getInitials(currentUser.displayName) : <User className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-user-name">
              {currentUser?.displayName || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate" data-testid="text-user-email">
              {currentUser?.email}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleLogout}
            className="h-8 w-8 shrink-0"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
