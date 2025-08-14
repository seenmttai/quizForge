import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, CheckCircle, XCircle } from "lucide-react";
import type { Assignment, Student } from "@shared/schema";

interface AssignmentWithStudent extends Assignment {
  student: Student;
}

export default function StudentAssignments() {
  const { data: assignments = [], isLoading } = useQuery<AssignmentWithStudent[]>({
    queryKey: ["/api/assignments/recent"],
  });

  if (isLoading) {
    return (
      <Card data-testid="student-assignments-loading">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Recent Assignments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <Card data-testid="student-assignments-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Recent Assignments</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" data-testid="assignments-list">
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="no-assignments">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No assignments yet</p>
              <p className="text-sm">Assignments will appear here when you distribute questions to students</p>
            </div>
          ) : (
            assignments.map((assignment) => (
              <div 
                key={assignment.id} 
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                data-testid={`assignment-${assignment.id}`}
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(assignment.status)}
                  <div>
                    <p className="font-medium text-foreground">
                      {assignment.student?.name || "Unknown Student"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Student ID: {assignment.student?.studentId || "N/A"}
                    </p>
                    {assignment.score && (
                      <p className="text-sm text-muted-foreground">
                        Score: {assignment.score}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge 
                    className={getStatusColor(assignment.status)}
                    data-testid={`status-${assignment.id}`}
                  >
                    {assignment.status?.replace("_", " ") || "pending"}
                  </Badge>
                  {assignment.assignedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                    </p>
                  )}
                  {assignment.completedAt && (
                    <p className="text-xs text-muted-foreground">
                      Completed: {new Date(assignment.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}