import { Course, User, CourseMember } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface CourseDirectoryProps {
  allCourses: Course[];
  myMemberships: CourseMember[];
  users: User[];
  onJoinCourse: (courseId: string) => void;
  onLeaveCourse: (courseId: string) => void;
  loading: boolean;
  allMemberships?: CourseMember[];
}

export default function CourseDirectory({
  allCourses,
  myMemberships,
  users,
  onJoinCourse,
  onLeaveCourse,
  loading,
  allMemberships = [],
}: CourseDirectoryProps) {
  const isJoined = (courseId: string) => {
    return myMemberships.some((m) => m.courseId === courseId);
  };

  const allMemberCounts = allMemberships.reduce((acc, m) => {
    acc[m.courseId] = (acc[m.courseId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-directory-title">
          Course Directory
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse and join courses to collaborate with other students
        </p>
      </div>

      {allCourses.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
          <p className="text-muted-foreground">
            Be the first to create a course!
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allCourses.map((course) => {
            const joined = isJoined(course.id);
            const displayCreatorName = course.creatorName || "Unknown";

            return (
              <Card key={course.id} className="hover-elevate" data-testid={`card-course-${course.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Created by {displayCreatorName}
                      </CardDescription>
                    </div>
                    {joined && (
                      <Badge variant="secondary" className="shrink-0">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Joined
                      </Badge>
                    )}
                  </div>
                  {course.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {course.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-1" />
                      <span data-testid={`text-members-${course.id}`}>
                        {allMemberCounts[course.id] || 0} member(s)
                      </span>
                    </div>
                    {joined ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onLeaveCourse(course.id)}
                        data-testid={`button-leave-${course.id}`}
                      >
                        Leave
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => onJoinCourse(course.id)}
                        data-testid={`button-join-${course.id}`}
                      >
                        Join Course
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
