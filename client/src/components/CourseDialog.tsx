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
import { Label } from "@/components/ui/label";
import { Course, InsertCourse } from "@shared/schema";

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (course: Partial<InsertCourse>) => Promise<void>;
  course?: Course;
  currentUserId: string;
}

export function CourseDialog({
  open,
  onOpenChange,
  onSubmit,
  course,
  currentUserId,
}: CourseDialogProps) {
  const [name, setName] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (course) {
      setName(course.name);
      setCreatorName(course.creatorName || "");
    } else {
      setName("");
      setCreatorName("");
    }
    setIsSubmitting(false);
  }, [course, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !creatorName.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        creatorName: creatorName.trim(),
        createdBy: currentUserId,
      });
      setIsSubmitting(false);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error submitting course:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-course">
        <DialogHeader>
          <DialogTitle>{course ? "Edit Course" : "Create New Course"}</DialogTitle>
          <DialogDescription>
            {course ? "Update course details" : "Add a new course to organize your tasks"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course-name">Course Name *</Label>
            <Input
              id="course-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., CS 101 - Introduction to Computer Science"
              required
              data-testid="input-course-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="creator-name">Your Name *</Label>
            <Input
              id="creator-name"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="e.g., John Doe"
              required
              data-testid="input-creator-name"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              data-testid="button-cancel-course"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} data-testid="button-save-course">
              {isSubmitting ? "Saving..." : course ? "Update Course" : "Create Course"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
