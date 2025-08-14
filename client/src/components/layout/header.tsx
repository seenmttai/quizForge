import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, LogOut } from "lucide-react";

interface HeaderProps {
  title: string;
  description: string;
}

export default function Header({ title, description }: HeaderProps) {
  const { user } = useAuth();

  const getUserInitials = () => {
    if (!user) return "U";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "U";
  };

  const getUserName = () => {
    if (!user) return "User";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "User";
  };

  return (
    <header className="bg-surface shadow-sm border-b border-border p-6" data-testid="header">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground" data-testid="text-header-title">
            {title}
          </h2>
          <p className="text-muted-foreground mt-1" data-testid="text-header-description">
            {description}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full" data-testid="notification-indicator"></span>
          </Button>

          {/* AI Status */}
          <Badge 
            variant="secondary" 
            className="bg-accent/10 text-accent border-accent/20"
            data-testid="badge-ai-status"
          >
            <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
            AI Model Active
          </Badge>

          {/* User Profile */}
          <div className="flex items-center space-x-3" data-testid="user-profile">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white text-sm">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground" data-testid="text-user-name">
              {getUserName()}
            </span>
          </div>

          {/* Logout */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.location.href = "/api/logout"}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
