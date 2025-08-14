import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FlaskConical, BookOpen, Beaker, Calculator } from "lucide-react";
import { type Question } from "@shared/schema";

export default function QuestionBank() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: questions, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ["/api/questions"],
    enabled: isAuthenticated,
  });

  const { data: templates, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["/api/question-templates"],
    enabled: isAuthenticated,
  });

  const getSubjectIcon = (subject: string) => {
    switch (subject.toLowerCase()) {
      case "chemistry":
        return <FlaskConical className="h-4 w-4" />;
      case "physics":
        return <Beaker className="h-4 w-4" />;
      case "biology":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Calculator className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return "bg-green-100 text-green-800 border-green-200";
    if (difficulty <= 6) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (difficulty <= 8) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-question-bank">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading question bank...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background-alt" data-testid="question-bank-container">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <Header 
          title="Question Bank"
          description="Manage your question templates and generated questions"
        />
        
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card data-testid="card-total-questions">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Questions</p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      {questions?.length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="text-primary h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-templates">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Templates</p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      {templates?.length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <FlaskConical className="text-accent h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-subjects">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Subjects</p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      {templates ? [...new Set(templates.map((t: any) => t.subject))].length : 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Beaker className="text-warning h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-avg-difficulty">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg. Difficulty</p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      {questions && questions.length > 0 
                        ? (questions.reduce((sum: number, q: Question) => sum + parseFloat(q.difficulty), 0) / questions.length).toFixed(1)
                        : "0.0"
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center">
                    <Calculator className="text-error h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Templates */}
          <Card data-testid="card-question-templates">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Question Templates</CardTitle>
                  <p className="text-muted-foreground mt-1">Base templates used for question generation</p>
                </div>
                <Button variant="outline" data-testid="button-add-template">
                  Add Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingTemplates ? (
                <div className="flex items-center justify-center py-8" data-testid="loading-templates">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {templates && templates.length > 0 ? (
                    templates.map((template: any) => (
                      <div 
                        key={template.id} 
                        className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                        data-testid={`template-${template.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="secondary" className="flex items-center space-x-1">
                                {getSubjectIcon(template.subject)}
                                <span>{template.subject}</span>
                              </Badge>
                              <Badge variant="outline">{template.topic}</Badge>
                              <Badge variant="outline">{template.questionType}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {truncateText(template.template, 150)}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                              <span>Difficulty: {template.difficultyRange.min} - {template.difficultyRange.max}</span>
                              <span>Variables: {Object.keys(template.variables).length}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" data-testid={`button-edit-template-${template.id}`}>
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground" data-testid="no-templates-message">
                      No templates found. Templates are automatically created when you generate questions.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated Questions */}
          <Card data-testid="card-generated-questions">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Questions</CardTitle>
                  <p className="text-muted-foreground mt-1">All AI-generated questions</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" data-testid="button-export-questions">
                    Export
                  </Button>
                  <Button variant="outline" data-testid="button-filter-questions">
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingQuestions ? (
                <div className="flex items-center justify-center py-8" data-testid="loading-questions">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table data-testid="table-questions">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions && questions.length > 0 ? (
                      questions.map((question: Question) => (
                        <TableRow key={question.id} data-testid={`row-question-${question.id}`}>
                          <TableCell className="max-w-md">
                            <p className="font-medium">{truncateText(question.questionText, 80)}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="flex items-center space-x-1 w-fit">
                              {getSubjectIcon(question.subject)}
                              <span>{question.subject}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{question.topic}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={getDifficultyColor(parseFloat(question.difficulty))}
                            >
                              {question.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{question.questionType}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(question.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              data-testid={`button-view-question-${question.id}`}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground" data-testid="no-questions-message">
                          No questions generated yet. Use the question generator to create your first questions.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
