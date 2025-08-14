import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2, UserPlus, BarChart3, ChevronRight } from "lucide-react";

export default function QuickActions() {
  const [, setLocation] = useLocation();

  const actions = [
    {
      title: "Generate New Questions",
      description: "Create unique questions for students",
      icon: Wand2,
      onClick: () => setLocation("/question-generator"),
      color: "primary",
      testId: "action-generate-questions"
    },
    {
      title: "Assign to Students",
      description: "Distribute questions to class",
      icon: UserPlus,
      onClick: () => setLocation("/students"),
      color: "accent",
      testId: "action-assign-students"
    },
    {
      title: "View Analytics", 
      description: "Track performance metrics",
      icon: BarChart3,
      onClick: () => setLocation("/analytics"),
      color: "warning",
      testId: "action-view-analytics"
    },
  ];

  return (
    <Card data-testid="quick-actions-card">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant="ghost"
                className="w-full flex items-center justify-between p-4 h-auto border border-border rounded-lg hover:bg-muted/50 transition-colors"
                onClick={action.onClick}
                data-testid={action.testId}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-${action.color}/10 rounded-lg flex items-center justify-center`}>
                    <Icon className={`text-${action.color} h-5 w-5`} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}