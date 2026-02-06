import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "candidate"] }).notNull().default("candidate"),
  candidateId: text("candidate_id").unique(), // Unique ID for candidates (e.g., C-123)
  fullName: text("full_name").notNull(),
  profilePhoto: text("profile_photo"),
  mobileNumber: text("mobile_number"),
  dateOfBirth: timestamp("date_of_birth"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  assignedToId: integer("assigned_to_id").references(() => users.id), // Null means assigned to ALL candidates
  deadline: timestamp("deadline").notNull(),
  status: text("status", { enum: ["active", "archived"] }).notNull().default("active"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id), // Link with task
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  photoUrl: text("photo_url").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  ipAddress: text("ip_address").notNull(),
  deviceDetails: text("device_details").notNull(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  candidateId: integer("candidate_id").references(() => users.id).notNull(),
  content: text("content"), // Text submission
  fileUrl: text("file_url"), // Path to uploaded file
  fileName: text("file_name"), // Original filename
  fileType: text("file_type"), // MIME type or extension
  submittedAt: timestamp("submitted_at").defaultNow(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  feedback: text("feedback"),
  score: integer("score"),
});

// === SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export const insertSubmissionSchema = createInsertSchema(submissions).omit({ id: true, submittedAt: true });
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true, timestamp: true });

// === EXPLICIT TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

// API Types

// Auth
export type LoginRequest = { username: string; password: string };
export type RegisterRequest = InsertUser;

// Task types
export type CreateTaskRequest = InsertTask;
export type UpdateTaskRequest = Partial<InsertTask>;

// Submission types
// Note: CreateSubmissionRequest is handled via FormData for file uploads, but we can type the JSON parts
export type CreateSubmissionJson = {
  taskId: number;
  content?: string;
};
export type UpdateSubmissionRequest = {
  status?: "pending" | "approved" | "rejected";
  feedback?: string;
  score?: number;
};
