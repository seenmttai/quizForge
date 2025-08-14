import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, Users, TrendingUp, Server } from "lucide-react";

interface StatsData {
  totalQuestions: number;
  activeStudents: number;
  avgDifficulty: number;
  completedAssignments: number;
}

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} data-testid={`skeleton-stat-card-${i}`}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded mb-4"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Questions Generated",
      value: stats?.totalQuestions || 0,
      icon: HelpCircle,
      change: "+12%",
      changeText: "from last week",
      color: "primary",
      testId: "stat-total-questions"
    },
    {
      title: "Active Students", 
      value: stats?.activeStudents || 0,
      icon: Users,
      change: "+3",
      changeText: "new this week",
      color: "accent",
      testId: "stat-active-students"
    },
    {
      title: "Avg. Difficulty Score",
      value: stats?.avgDifficulty || 0,
      icon: TrendingUp,
      change: "Target: 7.0-7.5",
      changeText: "",
      color: "warning",
      testId: "stat-avg-difficulty"
    },
    {
      title: "API Usage",
      value: "78%",
      icon: Server,
      change: "of monthly limit",
      changeText: "",
      color: "error",
      testId: "stat-api-usage"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="stats-cards">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} data-testid={stat.testId}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-2" data-testid={`${stat.testId}-value`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}/10 rounded-lg flex items-center justify-center`}>
                  <Icon className={`text-${stat.color} h-6 w-6`} />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-accent" data-testid={`${stat.testId}-change`}>
                  {stat.change}
                </span>
                {stat.changeText && (
                  <span className="text-muted-foreground ml-2">
                    {stat.changeText}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}