import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Users, Brain, BarChart3, Shield, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background-alt">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <FlaskConical className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Lab Question AI</h1>
                <p className="text-sm text-muted-foreground">Admin Dashboard</p>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-login"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4" data-testid="badge-ai-powered">
            <Brain className="h-4 w-4 mr-2" />
            AI-Powered Question Generation
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6" data-testid="text-hero-title">
            Unique Lab Questions for Every Student
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-hero-description">
            Eliminate copying and ensure fair evaluation with our AI-powered system that generates 
            unique but equivalent lab questions for each student.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-get-started"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Get Started
            </Button>
            <Button variant="outline" size="lg" data-testid="button-learn-more">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-features-title">
              Powerful Features for Modern Education
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto" data-testid="text-features-description">
              Our platform combines artificial intelligence with educational expertise to create 
              the perfect solution for lab question generation and management.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card data-testid="card-feature-ai-generation">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI Question Generation</CardTitle>
                <CardDescription>
                  Advanced AI creates unique questions while maintaining equivalent difficulty levels
                </CardDescription>
              </CardHeader>
            </Card>

            <Card data-testid="card-feature-student-management">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Student Management</CardTitle>
                <CardDescription>
                  Track assignments, monitor progress, and ensure no two students get identical questions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card data-testid="card-feature-analytics">
              <CardHeader>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-warning" />
                </div>
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Comprehensive analytics to track performance and maintain question quality
                </CardDescription>
              </CardHeader>
            </Card>

            <Card data-testid="card-feature-fair-evaluation">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Fair Evaluation</CardTitle>
                <CardDescription>
                  Unbiased grading system ensures equal assessment opportunities for all students
                </CardDescription>
              </CardHeader>
            </Card>

            <Card data-testid="card-feature-instant-generation">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Instant Generation</CardTitle>
                <CardDescription>
                  Generate hundreds of unique questions in seconds with our optimized AI engine
                </CardDescription>
              </CardHeader>
            </Card>

            <Card data-testid="card-feature-lab-experiments">
              <CardHeader>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                  <FlaskConical className="h-6 w-6 text-warning" />
                </div>
                <CardTitle>Lab Experiments</CardTitle>
                <CardDescription>
                  Specialized for lab environments with support for multiple subjects and experiment types
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-cta-title">
            Ready to Transform Your Lab Teaching?
          </h2>
          <p className="text-muted-foreground mb-8" data-testid="text-cta-description">
            Join educators who are already using AI to create better, fairer assessments.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-start-now"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Start Now - It's Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FlaskConical className="text-white h-5 w-5" />
            </div>
            <span className="text-lg font-semibold text-foreground">Lab Question AI</span>
          </div>
          <p className="text-muted-foreground" data-testid="text-footer-copyright">
            © 2024 Lab Question AI. Transforming education through artificial intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
}
