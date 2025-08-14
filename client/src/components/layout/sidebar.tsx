import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  FlaskConical, 
  LayoutDashboard, 
  Wand2, 
  Users, 
  Database, 
  BarChart3, 
  Settings 
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Question Generator",
    href: "/question-generator",
    icon: Wand2,
  },
  {
    title: "Students",
    href: "/students",
    icon: Users,
  },
  {
    title: "Question Bank",
    href: "/question-bank",
    icon: Database,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-surface shadow-lg flex-shrink-0" data-testid="sidebar">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <FlaskConical className="text-white h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground" data-testid="text-app-title">
              Lab Question AI
            </h1>
            <p className="text-sm text-muted-foreground" data-testid="text-app-subtitle">
              Admin Dashboard
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="p-4" data-testid="nav-sidebar">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start space-x-3 h-11",
                      isActive 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    data-testid={`nav-link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
