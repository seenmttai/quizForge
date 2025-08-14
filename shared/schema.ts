import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("instructor"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Students table
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().unique(),
  name: varchar("name").notNull(),
  email: varchar("email").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Question templates table
export const questionTemplates = pgTable("question_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: varchar("subject").notNull(),
  topic: varchar("topic").notNull(),
  template: text("template").notNull(),
  variables: jsonb("variables").notNull(),
  difficultyRange: jsonb("difficulty_range").notNull(),
  questionType: varchar("question_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Generated questions table
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").references(() => questionTemplates.id),
  questionText: text("question_text").notNull(),
  expectedAnswer: text("expected_answer").notNull(),
  difficulty: decimal("difficulty", { precision: 3, scale: 1 }).notNull(),
  subject: varchar("subject").notNull(),
  topic: varchar("topic").notNull(),
  questionType: varchar("question_type").notNull(),
  variables: jsonb("variables").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Student assignments table
export const assignments = pgTable("assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  questionId: varchar("question_id").references(() => questions.id).notNull(),
  status: varchar("status").default("pending"),
  assignedAt: timestamp("assigned_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  studentAnswer: text("student_answer"),
  score: decimal("score", { precision: 5, scale: 2 }),
});

// Activity log table
export const activityLog = pgTable("activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  action: varchar("action").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Question generation batches
export const questionBatches = pgTable("question_batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  subject: varchar("subject").notNull(),
  topic: varchar("topic").notNull(),
  difficultyLevel: varchar("difficulty_level").notNull(),
  questionCount: integer("question_count").notNull(),
  status: varchar("status").default("generating"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Insert schemas
export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionTemplateSchema = createInsertSchema(questionTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  assignedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLog).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionBatchSchema = createInsertSchema(questionBatches).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// Question generator request schema
export const questionGeneratorRequestSchema = z.object({
  subject: z.string().min(1),
  topic: z.string().min(1),
  difficultyLevel: z.enum(["easy", "medium", "hard"]),
  questionCount: z.number().min(1).max(50),
  questionType: z.string().min(1),
  templateText: z.string().min(10),
  variableRanges: z.string().optional(),
  selectedStudents: z.array(z.string()).optional(),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type QuestionTemplate = typeof questionTemplates.$inferSelect;
export type InsertQuestionTemplate = z.infer<typeof insertQuestionTemplateSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Activity = typeof activityLog.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type QuestionBatch = typeof questionBatches.$inferSelect;
export type InsertQuestionBatch = z.infer<typeof insertQuestionBatchSchema>;
export type QuestionGeneratorRequest = z.infer<typeof questionGeneratorRequestSchema>;
