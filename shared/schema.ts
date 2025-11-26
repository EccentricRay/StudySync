import { z } from "zod";

export const priorityLevels = ["low", "medium", "high"] as const;
export const taskStatuses = ["pending", "completed"] as const;

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  emailVerified: z.boolean(),
  createdAt: z.string(),
});

export const courseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdBy: z.string(),
  creatorName: z.string().optional(),
  accentColor: z.string().optional(),
  createdAt: z.string(),
});

export const courseMemberSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  userId: z.string(),
  role: z.enum(["owner", "member"]),
  joinedAt: z.string(),
});

export const taskSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(priorityLevels),
  assignedTo: z.string().optional(),
  status: z.enum(taskStatuses),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertUserSchema = userSchema.omit({ id: true, createdAt: true });
export const insertCourseSchema = courseSchema.omit({ id: true, createdAt: true });
export const insertCourseMemberSchema = courseMemberSchema.omit({ id: true, joinedAt: true });
export const insertTaskSchema = taskSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Course = z.infer<typeof courseSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type CourseMember = z.infer<typeof courseMemberSchema>;
export type InsertCourseMember = z.infer<typeof insertCourseMemberSchema>;
export type Task = z.infer<typeof taskSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Priority = typeof priorityLevels[number];
export type TaskStatus = typeof taskStatuses[number];
