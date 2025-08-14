import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateQuestionFromTemplate, generateMultipleQuestions, evaluateQuestionDifficulty } from "./openai";
import { 
  questionGeneratorRequestSchema,
  insertStudentSchema,
  insertAssignmentSchema,
  type QuestionGeneratorRequest,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get('/api/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Activity logs
  app.get('/api/activity', isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const logs = await storage.getActivityLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  app.get('/api/activities/recent', isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const logs = await storage.getActivityLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      res.status(500).json({ message: "Failed to fetch recent activities" });
    }
  });

  // Students management
  app.get('/api/students', isAuthenticated, async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post('/api/students', isAuthenticated, async (req: any, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(studentData);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user.claims.sub,
        action: "create_student",
        description: `Added student: ${student.name}`,
        metadata: { studentId: student.id },
      });
      
      res.json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid student data", errors: error.errors });
      } else {
        console.error("Error creating student:", error);
        res.status(500).json({ message: "Failed to create student" });
      }
    }
  });

  // Question templates
  app.get('/api/question-templates', isAuthenticated, async (req, res) => {
    try {
      const templates = await storage.getQuestionTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching question templates:", error);
      res.status(500).json({ message: "Failed to fetch question templates" });
    }
  });

  // Questions
  app.get('/api/questions', isAuthenticated, async (req, res) => {
    try {
      const questions = await storage.getQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Generate questions
  app.post('/api/questions/generate', isAuthenticated, async (req: any, res) => {
    try {
      const requestData: QuestionGeneratorRequest = questionGeneratorRequestSchema.parse(req.body);
      const userId = req.user.claims.sub;
      
      // Create a batch record
      const batch = await storage.createQuestionBatch({
        userId,
        subject: requestData.subject,
        topic: requestData.topic,
        difficultyLevel: requestData.difficultyLevel,
        questionCount: requestData.questionCount,
        status: "generating",
      });

      // Parse variable ranges if provided
      let variableRanges = {};
      if (requestData.variableRanges) {
        try {
          // Parse ranges like "resistance: 100-500, voltage: 5-12"
          const ranges = requestData.variableRanges.split(',').map(r => r.trim());
          for (const range of ranges) {
            const [name, values] = range.split(':').map(s => s.trim());
            const [min, max] = values.split('-').map(v => parseFloat(v.trim()));
            variableRanges[name] = { min, max };
          }
        } catch (e) {
          // If parsing fails, use empty ranges
          variableRanges = {};
        }
      }

      // Create a template from the user input
      const template = {
        id: "user-template",
        subject: requestData.subject,
        topic: requestData.topic,
        template: requestData.templateText,
        variables: variableRanges,
        difficultyRange: { min: 6.0, max: 8.0 }, // Default difficulty range
        questionType: requestData.questionType,
        createdAt: new Date(),
      };

      // Use AI to generate multiple unique questions
      const generatedQuestions = await generateMultipleQuestions(
        [template],
        requestData.questionCount
      );

      // Save questions to storage
      const savedQuestions = [];
      for (const genQ of generatedQuestions) {
        const question = await storage.createQuestion({
          templateId: null, // No template ID for user-generated questions
          questionText: genQ.questionText,
          expectedAnswer: genQ.expectedAnswer,
          difficulty: genQ.difficulty.toString(),
          subject: requestData.subject,
          topic: requestData.topic,
          questionType: requestData.questionType,
          variables: genQ.variables,
        });
        savedQuestions.push(question);
      }

      // Assign to selected students if any
      if (requestData.selectedStudents && requestData.selectedStudents.length > 0) {
        for (let i = 0; i < requestData.selectedStudents.length && i < savedQuestions.length; i++) {
          const studentId = requestData.selectedStudents[i];
          const question = savedQuestions[i];
          await storage.createAssignment({
            studentId,
            questionId: question.id,
            status: "pending",
          });
        }
      }

      // Update batch status
      await storage.updateQuestionBatch(batch.id, {
        status: "completed",
      });

      // Log activity
      await storage.createActivityLog({
        userId,
        action: "generate_questions",
        description: `Generated ${savedQuestions.length} questions for ${requestData.subject} - ${requestData.topic}`,
        metadata: { 
          batchId: batch.id,
          questionCount: savedQuestions.length,
          subject: requestData.subject,
          topic: requestData.topic,
        },
      });

      res.json({
        batch,
        questions: savedQuestions,
        message: `Successfully generated ${savedQuestions.length} questions`,
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error generating questions:", error);
        res.status(500).json({ message: "Failed to generate questions", error: error.message });
      }
    }
  });

  // Assignments
  app.get('/api/assignments', isAuthenticated, async (req, res) => {
    try {
      const assignments = await storage.getAssignments();
      
      // Enrich with student and question data
      const enrichedAssignments = await Promise.all(
        assignments.map(async (assignment) => {
          const student = await storage.getStudent(assignment.studentId);
          const question = await storage.getQuestion(assignment.questionId);
          return {
            ...assignment,
            student,
            question,
          };
        })
      );
      
      res.json(enrichedAssignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.post('/api/assignments', isAuthenticated, async (req: any, res) => {
    try {
      const assignmentData = insertAssignmentSchema.parse(req.body);
      const assignment = await storage.createAssignment(assignmentData);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user.claims.sub,
        action: "create_assignment",
        description: `Assigned question to student`,
        metadata: { 
          assignmentId: assignment.id,
          studentId: assignment.studentId,
          questionId: assignment.questionId,
        },
      });
      
      res.json(assignment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid assignment data", errors: error.errors });
      } else {
        console.error("Error creating assignment:", error);
        res.status(500).json({ message: "Failed to create assignment" });
      }
    }
  });

  app.get('/api/assignments/recent', isAuthenticated, async (req, res) => {
    try {
      const assignments = await storage.getAssignments();
      
      // Get recent assignments (last 10)
      const recentAssignments = assignments
        .sort((a, b) => (b.assignedAt ? b.assignedAt.getTime() : 0) - (a.assignedAt ? a.assignedAt.getTime() : 0))
        .slice(0, 10);
      
      // Enrich with student data
      const enrichedAssignments = await Promise.all(
        recentAssignments.map(async (assignment) => {
          const student = await storage.getStudent(assignment.studentId);
          return {
            ...assignment,
            student,
          };
        })
      );
      
      res.json(enrichedAssignments);
    } catch (error) {
      console.error("Error fetching recent assignments:", error);
      res.status(500).json({ message: "Failed to fetch recent assignments" });
    }
  });

  // Bulk assign questions to students
  app.post('/api/assignments/bulk', isAuthenticated, async (req: any, res) => {
    try {
      const { studentIds, questionIds } = req.body;
      
      if (!Array.isArray(studentIds) || !Array.isArray(questionIds)) {
        res.status(400).json({ message: "studentIds and questionIds must be arrays" });
        return;
      }

      const assignments = [];
      for (let i = 0; i < studentIds.length; i++) {
        const studentId = studentIds[i];
        const questionId = questionIds[i % questionIds.length]; // Cycle through questions
        
        const assignment = await storage.createAssignment({
          studentId,
          questionId,
          status: "pending",
        });
        assignments.push(assignment);
      }

      // Log activity
      await storage.createActivityLog({
        userId: req.user.claims.sub,
        action: "bulk_assign",
        description: `Assigned questions to ${studentIds.length} students`,
        metadata: { 
          studentCount: studentIds.length,
          questionCount: questionIds.length,
        },
      });

      res.json({
        assignments,
        message: `Successfully assigned questions to ${studentIds.length} students`,
      });

    } catch (error) {
      console.error("Error creating bulk assignments:", error);
      res.status(500).json({ message: "Failed to create bulk assignments" });
    }
  });

  // Question batches
  app.get('/api/question-batches', isAuthenticated, async (req, res) => {
    try {
      const batches = await storage.getQuestionBatches();
      res.json(batches);
    } catch (error) {
      console.error("Error fetching question batches:", error);
      res.status(500).json({ message: "Failed to fetch question batches" });
    }
  });

  // Evaluate question difficulty
  app.post('/api/questions/evaluate-difficulty', isAuthenticated, async (req, res) => {
    try {
      const { questionTexts } = req.body;
      
      if (!Array.isArray(questionTexts)) {
        res.status(400).json({ message: "questionTexts must be an array" });
        return;
      }

      const evaluation = await evaluateQuestionDifficulty(questionTexts);
      res.json(evaluation);

    } catch (error) {
      console.error("Error evaluating question difficulty:", error);
      res.status(500).json({ message: "Failed to evaluate question difficulty" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
