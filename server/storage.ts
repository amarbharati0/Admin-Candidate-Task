import { users, tasks, submissions, attendance, type User, type InsertUser, type Task, type InsertTask, type Submission, type InsertSubmission, type Attendance, type InsertAttendance } from "@shared/schema";
import { db } from "./db";
import { eq, or, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getUsersByRole(role?: 'admin' | 'candidate'): Promise<User[]>;

  // Tasks
  getTasks(): Promise<Task[]>; // Admin sees all
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<void>;
  
  // Submissions
  getSubmissions(taskId?: number, candidateId?: number): Promise<(Submission & { candidate: User, task: Task })[]>;
  getSubmission(id: number): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmission(id: number, submission: Partial<InsertSubmission>): Promise<Submission | undefined>;

  // Attendance
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  getAttendance(userId?: number, taskId?: number): Promise<Attendance[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }
  
  async getUsersByRole(role?: 'admin' | 'candidate'): Promise<User[]> {
    if (role) {
      return await db.select().from(users).where(eq(users.role, role));
    }
    return await db.select().from(users);
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(tasks.deadline);
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return task;
  }
  
  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Submissions
  async getSubmissions(taskId?: number, candidateId?: number): Promise<(Submission & { candidate: User, task: Task })[]> {
    let query = db.select({
      id: submissions.id,
      taskId: submissions.taskId,
      candidateId: submissions.candidateId,
      content: submissions.content,
      fileUrl: submissions.fileUrl,
      fileName: submissions.fileName,
      fileType: submissions.fileType,
      submittedAt: submissions.submittedAt,
      status: submissions.status,
      feedback: submissions.feedback,
      score: submissions.score,
      candidate: users,
      task: tasks,
    })
    .from(submissions)
    .innerJoin(users, eq(submissions.candidateId, users.id))
    .innerJoin(tasks, eq(submissions.taskId, tasks.id));

    const conditions = [];
    if (taskId) conditions.push(eq(submissions.taskId, taskId));
    if (candidateId) conditions.push(eq(submissions.candidateId, candidateId));

    if (conditions.length > 0) {
      // @ts-ignore
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async getSubmission(id: number): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission;
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const [submission] = await db.insert(submissions).values(insertSubmission).returning();
    return submission;
  }

  async updateSubmission(id: number, updates: Partial<InsertSubmission>): Promise<Submission | undefined> {
    const [submission] = await db.update(submissions).set(updates).where(eq(submissions.id, id)).returning();
    return submission;
  }

  // Attendance
  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const [record] = await db.insert(attendance).values(insertAttendance).returning();
    return record;
  }

  async getAttendance(userId?: number, taskId?: number): Promise<Attendance[]> {
    let query = db.select().from(attendance);
    const conditions = [];
    if (userId) conditions.push(eq(attendance.userId, userId));
    if (taskId) conditions.push(eq(attendance.taskId, taskId));
    
    if (conditions.length > 0) {
      // @ts-ignore
      query = query.where(and(...conditions));
    }
    
    return await query;
  }
}

export const storage = new DatabaseStorage();
