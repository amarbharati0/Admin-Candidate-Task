import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import passport from "passport";

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({ 
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  })
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  const crypto = setupAuth(app);

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));

  // === AUTH API ===
  
  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await crypto.hash(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        // Auto-generate Candidate ID if not provided and role is candidate
        candidateId: req.body.role === 'candidate' && !req.body.candidateId 
          ? `C-${Date.now().toString().slice(-4)}` 
          : req.body.candidateId
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
       res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post(api.auth.login.path, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      req.login(user, (err) => {
        if (err) return next(err);
        res.json(user);
      });
    })(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // Middleware to ensure authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    next();
  };
  
  const requireAdmin = (req: any, res: any, next: any) => {
     if (!req.isAuthenticated() || req.user.role !== 'admin') return res.sendStatus(403);
     next();
  };

  // === USERS API ===

  app.get(api.users.list.path, requireAdmin, async (req, res) => {
    const role = req.query.role as 'admin' | 'candidate' | undefined;
    const users = await storage.getUsersByRole(role);
    res.json(users);
  });

  app.get(api.users.get.path, requireAuth, async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) return res.sendStatus(404);
    res.json(user);
  });

  // === TASKS API ===

  app.get(api.tasks.list.path, requireAuth, async (req, res) => {
    const allTasks = await storage.getTasks();
    if (req.user!.role === 'admin') {
      // Admins see all tasks
      // Fetch assignedTo user details manually if needed, or update getTasks to join.
      // For now, returning tasks is enough.
      res.json(allTasks);
    } else {
      // Candidates see tasks assigned to them OR globally assigned (null)
      const myTasks = allTasks.filter(t => t.assignedToId === null || t.assignedToId === req.user!.id);
      res.json(myTasks);
    }
  });

  app.post(api.tasks.create.path, requireAdmin, async (req, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask({
        ...input,
        createdBy: req.user!.id
      });
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.tasks.update.path, requireAdmin, async (req, res) => {
    const task = await storage.updateTask(Number(req.params.id), req.body);
    if (!task) return res.sendStatus(404);
    res.json(task);
  });

  app.delete(api.tasks.delete.path, requireAdmin, async (req, res) => {
    await storage.deleteTask(Number(req.params.id));
    res.sendStatus(204);
  });

  // === SUBMISSIONS API ===

  app.get(api.submissions.list.path, requireAuth, async (req, res) => {
    // Admins can see all. Candidates can only see their own.
    const taskId = req.query.taskId ? Number(req.query.taskId) : undefined;
    const candidateId = req.query.candidateId ? Number(req.query.candidateId) : undefined;

    if (req.user!.role !== 'admin') {
      // Force candidateId to be current user for non-admins
      if (candidateId && candidateId !== req.user!.id) {
         return res.sendStatus(403);
      }
      const mySubmissions = await storage.getSubmissions(taskId, req.user!.id);
      return res.json(mySubmissions);
    }

    const submissions = await storage.getSubmissions(taskId, candidateId);
    res.json(submissions);
  });

  // Handle file uploads for submission creation
  app.post(api.submissions.create.path, requireAuth, upload.single('file'), async (req, res) => {
    try {
      // Manually parse body parts because multer processes the request first
      const taskId = Number(req.body.taskId);
      const content = req.body.content;
      
      if (!taskId) return res.status(400).json({ message: "TaskId is required" });

      const submission = await storage.createSubmission({
        taskId,
        candidateId: req.user!.id,
        content,
        fileUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
        fileName: req.file ? req.file.originalname : undefined,
        fileType: req.file ? req.file.mimetype : undefined,
        status: "pending"
      });
      res.status(201).json(submission);
    } catch (err) {
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  app.patch(api.submissions.update.path, requireAdmin, async (req, res) => {
     const submission = await storage.updateSubmission(Number(req.params.id), req.body);
     if (!submission) return res.sendStatus(404);
     res.json(submission);
  });

  // Seed Data
  if ((await storage.getUsersByRole('admin')).length === 0) {
    console.log("Seeding database...");
    const adminPassword = await crypto.hash("admin123");
    const admin = await storage.createUser({
      username: "admin",
      password: adminPassword,
      role: "admin",
      fullName: "System Admin"
    });

    const candidatePassword = await crypto.hash("candidate123");
    const candidate = await storage.createUser({
      username: "candidate",
      password: candidatePassword,
      role: "candidate",
      candidateId: "C-001",
      fullName: "John Candidate"
    });

    const task1 = await storage.createTask({
      title: "Complete Onboarding",
      description: "Please fill out the onboarding form and upload your resume.",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdBy: admin.id,
      assignedToId: candidate.id,
      status: "active"
    });

    const task2 = await storage.createTask({
      title: "System Design Challenge",
      description: "Design a scalable system for a URL shortener.",
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      createdBy: admin.id,
      assignedToId: null, // Assigned to all
      status: "active"
    });
    
    console.log("Database seeded!");
  }

  return httpServer;
}
