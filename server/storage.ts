import { users, tasks, submissions, type User, type InsertUser, type Task, type InsertTask, type Submission, type InsertSubmission } from "@shared/schema";
import { db } from "./db";
import { eq, or } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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
      ...submissions,
      candidate: users,
      task: tasks,
    })
    .from(submissions)
    .innerJoin(users, eq(submissions.candidateId, users.id))
    .innerJoin(tasks, eq(submissions.taskId, tasks.id));

    if (taskId) {
      query = query.where(eq(submissions.taskId, taskId));
    }
    
    // If both filters are present, we need to chain where clauses correctly
    // The simplified logic above assumes one or the other or both. 
    // Drizzle query builder allows chaining .where() which acts as AND.
    
    if (candidateId) {
      // Re-apply taskId filter if needed because 'query' variable reassignment might lose context if not handled carefully in raw sql, 
      // but Drizzle query builder is mutable for chains usually, or returns new instance. 
      // Let's be explicit.
      
      // Let's restart the query construction for safety to handle combinations
      const baseQuery = db.select({
          ...submissions, // Spread all submission fields
          // We need to map the join results to nested objects manually or let Drizzle handle it if we structured the select differently.
          // However, the return type expects { ...submission, candidate: User, task: Task }
          // Standard Drizzle join returns a flat object with table keys if using .select().from().innerJoin() without arguments to select()
          // But here we passed arguments to select().
          
          // Actually, the spread `...submissions` will put submission fields at top level.
          // `candidate: users` will put user fields in a `candidate` object.
          // `task: tasks` will put task fields in a `task` object.
          // This matches the return type.
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
        return await baseQuery.where(conditions.reduce((acc, condition) => 
             // Logic to combine conditions. But drizzle where() takes one condition. 
             // We can use the helper above but simpler:
             // just chain where.
             undefined, undefined
        ));
      }
    }
    
    // Retry robust implementation
    const result = await db.select({
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
        task: tasks
    })
    .from(submissions)
    .innerJoin(users, eq(submissions.candidateId, users.id))
    .innerJoin(tasks, eq(submissions.taskId, tasks.id));

    return result.filter(row => {
        if (taskId && row.taskId !== taskId) return false;
        if (candidateId && row.candidateId !== candidateId) return false;
        return true;
    });
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
}

export const storage = new DatabaseStorage();
