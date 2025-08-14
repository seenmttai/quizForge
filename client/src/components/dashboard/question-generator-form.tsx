import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Wand2, LoaderCircle } from "lucide-react";
import type { Student } from "@shared/schema";

const questionFormSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  difficultyLevel: z.string().min(1, "Difficulty level is required"),
  questionCount: z.coerce.number().min(1, "Must generate at least 1 question").max(50, "Cannot generate more than 50 questions"),
  questionType: z.string().min(1, "Question type is required"),
  templateText: z.string().min(10, "Template must be at least 10 characters"),
  variableRanges: z.string().optional(),
  selectedStudents: z.array(z.string()).optional(),
});

type QuestionFormData = z.infer<typeof questionFormSchema>;

export default function QuestionGeneratorForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      subject: "",
      topic: "",
      difficultyLevel: "medium",
      questionCount: 1,
      questionType: "calculation", 
      templateText: "",
      variableRanges: "",
      selectedStudents: [],
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: QuestionFormData) => {
      setIsGenerating(true);
      const response = await apiRequest("/api/questions/generate", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data) => {
      setIsGenerating(false);
      toast({
        title: "Questions Generated",
        description: `Successfully generated ${data.questions?.length || form.getValues("questionCount")} unique questions.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      form.reset();
    },
    onError: (error: Error) => {
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuestionFormData) => {
    generateMutation.mutate(data);
  };

  return (
    <Card data-testid="question-generator-form">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wand2 className="h-5 w-5" />
          <span>Generate Questions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Physics, Chemistry" {...field} data-testid="input-subject" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Electrical Conduction" {...field} data-testid="input-topic" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="difficultyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-difficulty">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="questionCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Count</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="50" 
                        placeholder="5" 
                        {...field} 
                        data-testid="input-question-count" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="questionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-question-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="calculation">Calculation</SelectItem>
                        <SelectItem value="conceptual">Conceptual</SelectItem>
                        <SelectItem value="experimental">Experimental</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="templateText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Template</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter your question template with variables like {resistance}, {voltage}..."
                      className="h-24"
                      {...field}
                      data-testid="textarea-template"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="variableRanges"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Ranges (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., resistance: 100-500, voltage: 5-12"
                      {...field}
                      data-testid="input-variable-ranges"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {students && students.length > 0 && (
              <FormField
                control={form.control}
                name="selectedStudents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Students (Optional)</FormLabel>
                    <FormControl>
                      <Select onValueChange={(value) => field.onChange([...field.value || [], value])}>
                        <SelectTrigger data-testid="select-students">
                          <SelectValue placeholder="Select students to assign questions" />
                        </SelectTrigger>
                        <SelectContent>
                          {(students || []).map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name} ({student.studentId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button 
              type="submit" 
              disabled={isGenerating || generateMutation.isPending}
              className="w-full"
              data-testid="button-generate"
            >
              {isGenerating || generateMutation.isPending ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Questions
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}