import {
  users,
  students,
  questionTemplates,
  questions,
  assignments,
  activityLog,
  questionBatches,
  type User,
  type UpsertUser,
  type Student,
  type InsertStudent,
  type QuestionTemplate,
  type InsertQuestionTemplate,
  type Question,
  type InsertQuestion,
  type Assignment,
  type InsertAssignment,
  type ActivityLog,
  type InsertActivityLog,
  type QuestionBatch,
  type InsertQuestionBatch,
} from "@shared/schema";
import { randomUUID } from "crypto";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Student operations
  getStudents(): Promise<Student[]>;
  getStudent(id: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, updates: Partial<InsertStudent>): Promise<Student | undefined>;
  
  // Question template operations
  getQuestionTemplates(): Promise<QuestionTemplate[]>;
  getQuestionTemplate(id: string): Promise<QuestionTemplate | undefined>;
  createQuestionTemplate(template: InsertQuestionTemplate): Promise<QuestionTemplate>;
  
  // Question operations
  getQuestions(): Promise<Question[]>;
  getQuestion(id: string): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  getQuestionsByBatch(batchId: string): Promise<Question[]>;
  
  // Assignment operations
  getAssignments(): Promise<Assignment[]>;
  getAssignment(id: string): Promise<Assignment | undefined>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: string, updates: Partial<InsertAssignment>): Promise<Assignment | undefined>;
  getAssignmentsByStudent(studentId: string): Promise<Assignment[]>;
  
  // Activity log operations
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
  
  // Question batch operations
  createQuestionBatch(batch: InsertQuestionBatch): Promise<QuestionBatch>;
  updateQuestionBatch(id: string, updates: Partial<InsertQuestionBatch>): Promise<QuestionBatch | undefined>;
  getQuestionBatch(id: string): Promise<QuestionBatch | undefined>;
  getQuestionBatches(): Promise<QuestionBatch[]>;
  
  // Analytics operations
  getStats(): Promise<{
    totalQuestions: number;
    activeStudents: number;
    avgDifficulty: number;
    completedAssignments: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private students: Map<string, Student> = new Map();
  private questionTemplates: Map<string, QuestionTemplate> = new Map();
  private questions: Map<string, Question> = new Map();
  private assignments: Map<string, Assignment> = new Map();
  private activityLogs: Activity[] = [];
  private questionBatches: Map<string, QuestionBatch> = new Map();

  constructor() {
    // Initialize with some sample templates
    this.initializeTemplates();
  }

  private initializeTemplates() {
    const templates: InsertQuestionTemplate[] = [
      {
        subject: "Chemistry",
        topic: "Acid-Base Titration",
        template: "You are performing a titration of {volume} mL of {concentration1} M {acid} with {concentration2} M {base}. Calculate the volume of {base} required to reach the equivalence point.",
        variables: {
          volume: { type: "number", range: [20, 30], unit: "mL" },
          concentration1: { type: "number", range: [0.1, 0.2], unit: "M" },
          concentration2: { type: "number", range: [0.1, 0.2], unit: "M" },
          acid: { type: "string", options: ["HCl", "H2SO4", "HNO3"] },
          base: { type: "string", options: ["NaOH", "KOH"] }
        },
        difficultyRange: { min: 6.0, max: 8.0 },
        questionType: "calculation"
      },
      {
        subject: "Physics",
        topic: "Heat Conduction",
        template: "Find the thermal conductivity of a {material} rod of length {length} cm and diameter {diameter} mm at a temperature difference of {tempDiff}°C. Given the heat transfer rate is {heatRate} W.",
        variables: {
          material: { type: "string", options: ["copper", "aluminum", "steel"] },
          length: { type: "number", range: [15, 25], unit: "cm" },
          diameter: { type: "number", range: [5, 15], unit: "mm" },
          tempDiff: { type: "number", range: [20, 50], unit: "°C" },
          heatRate: { type: "number", range: [10, 30], unit: "W" }
        },
        difficultyRange: { min: 7.0, max: 9.0 },
        questionType: "calculation"
      }
    ];

    templates.forEach(template => {
      this.createQuestionTemplate(template);
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      ...userData,
      id: userData.id || randomUUID(),
      role: userData.role || "instructor",
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Student operations
  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async createStudent(studentData: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const student: Student = {
      ...studentData,
      id,
      email: studentData.email || null,
      createdAt: new Date(),
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: string, updates: Partial<InsertStudent>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;
    
    const updatedStudent = { ...student, ...updates };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  // Question template operations
  async getQuestionTemplates(): Promise<QuestionTemplate[]> {
    return Array.from(this.questionTemplates.values());
  }

  async getQuestionTemplate(id: string): Promise<QuestionTemplate | undefined> {
    return this.questionTemplates.get(id);
  }

  async createQuestionTemplate(templateData: InsertQuestionTemplate): Promise<QuestionTemplate> {
    const id = randomUUID();
    const template: QuestionTemplate = {
      ...templateData,
      id,
      createdAt: new Date(),
    };
    this.questionTemplates.set(id, template);
    return template;
  }

  // Question operations
  async getQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values());
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async createQuestion(questionData: InsertQuestion): Promise<Question> {
    const id = randomUUID();
    const question: Question = {
      ...questionData,
      id,
      templateId: questionData.templateId || null,
      createdAt: new Date(),
    };
    this.questions.set(id, question);
    return question;
  }

  async getQuestionsByBatch(batchId: string): Promise<Question[]> {
    // In a real implementation, this would filter by batchId
    return Array.from(this.questions.values());
  }

  // Assignment operations
  async getAssignments(): Promise<Assignment[]> {
    return Array.from(this.assignments.values());
  }

  async getAssignment(id: string): Promise<Assignment | undefined> {
    return this.assignments.get(id);
  }

  async createAssignment(assignmentData: InsertAssignment): Promise<Assignment> {
    const id = randomUUID();
    const assignment: Assignment = {
      ...assignmentData,
      id,
      status: assignmentData.status || "pending",
      assignedAt: new Date(),
      completedAt: assignmentData.completedAt || null,
      studentAnswer: assignmentData.studentAnswer || null,
      score: assignmentData.score || null,
    };
    this.assignments.set(id, assignment);
    return assignment;
  }

  async updateAssignment(id: string, updates: Partial<InsertAssignment>): Promise<Assignment | undefined> {
    const assignment = this.assignments.get(id);
    if (!assignment) return undefined;
    
    const updatedAssignment = { ...assignment, ...updates };
    this.assignments.set(id, updatedAssignment);
    return updatedAssignment;
  }

  async getAssignmentsByStudent(studentId: string): Promise<Assignment[]> {
    return Array.from(this.assignments.values()).filter(a => a.studentId === studentId);
  }

  // Activity log operations
  async createActivityLog(logData: InsertActivityLog): Promise<Activity> {
    const id = randomUUID();
    const log: Activity = {
      ...logData,
      id,
      metadata: logData.metadata || null,
      createdAt: new Date(),
    };
    this.activityLogs.push(log);
    return log;
  }

  async getActivityLogs(limit = 10): Promise<Activity[]> {
    return this.activityLogs
      .sort((a, b) => (b.createdAt ? b.createdAt.getTime() : 0) - (a.createdAt ? a.createdAt.getTime() : 0))
      .slice(0, limit);
  }

  // Question batch operations
  async createQuestionBatch(batchData: InsertQuestionBatch): Promise<QuestionBatch> {
    const id = randomUUID();
    const batch: QuestionBatch = {
      ...batchData,
      id,
      status: batchData.status || "generating",
      createdAt: new Date(),
      completedAt: null,
    };
    this.questionBatches.set(id, batch);
    return batch;
  }

  async updateQuestionBatch(id: string, updates: Partial<InsertQuestionBatch>): Promise<QuestionBatch | undefined> {
    const batch = this.questionBatches.get(id);
    if (!batch) return undefined;
    
    const updatedBatch = { ...batch, ...updates };
    this.questionBatches.set(id, updatedBatch);
    return updatedBatch;
  }

  async getQuestionBatch(id: string): Promise<QuestionBatch | undefined> {
    return this.questionBatches.get(id);
  }

  async getQuestionBatches(): Promise<QuestionBatch[]> {
    return Array.from(this.questionBatches.values());
  }

  // Analytics operations
  async getStats(): Promise<{
    totalQuestions: number;
    activeStudents: number;
    avgDifficulty: number;
    completedAssignments: number;
  }> {
    const questions = Array.from(this.questions.values());
    const students = Array.from(this.students.values());
    const assignments = Array.from(this.assignments.values());
    
    const completedAssignments = assignments.filter(a => a.status === "completed").length;
    const avgDifficulty = questions.length > 0 
      ? questions.reduce((sum, q) => sum + parseFloat(q.difficulty), 0) / questions.length 
      : 0;

    return {
      totalQuestions: questions.length,
      activeStudents: students.length,
      avgDifficulty: Math.round(avgDifficulty * 10) / 10,
      completedAssignments,
    };
  }
}

export const storage = new MemStorage();
