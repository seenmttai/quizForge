import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Activity } from "lucide-react";
import type { Activity as ActivityType } from "@shared/schema";

export default function RecentActivity() {
  const { data: activities = [], isLoading } = useQuery<ActivityType[]>({
    queryKey: ["/api/activities/recent"],
  });

  if (isLoading) {
    return (
      <Card data-testid="recent-activity-loading">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activity</span>
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

  return (
    <Card data-testid="recent-activity-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" data-testid="activity-list">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="no-activity">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Activity will appear here as you use the system</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-start space-x-3 pb-4 border-b border-border last:border-0 last:pb-0"
                data-testid={`activity-${activity.id}`}
              >
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium">
                    {activity.action}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.createdAt && formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}