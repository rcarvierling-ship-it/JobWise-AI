import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, FileText, Send, Briefcase, Sparkles, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">JobWise AI</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/pricing">
              <Button variant="ghost">Pricing</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight">
          Get Your Dream Job with
          <span className="text-primary"> AI-Powered</span> Applications
        </h1>
        <p className="mb-8 max-w-2xl text-xl text-muted-foreground">
          Generate ATS-optimized resumes, personalized cover letters, and application answers in seconds.
          Land more interviews with JobWise AI.
        </p>
        <div className="flex gap-4">
          <Link href="/auth/signup">
            <Button size="lg">Start Free Trial</Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">
              View Pricing
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">
          Everything you need to land your next job
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <FileText className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>AI Résumé Builder</CardTitle>
              <CardDescription>
                Create ATS-optimized resumes in multiple styles with AI-powered suggestions
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Send className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Cover Letter Generator</CardTitle>
              <CardDescription>
                Personalized cover letters tailored to each job application
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Briefcase className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Job Tracker</CardTitle>
              <CardDescription>
                Organize your applications with a drag-and-drop Kanban board
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Zap className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Application Answers</CardTitle>
              <CardDescription>
                Generate STAR method responses for common interview questions
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Sparkles className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Auto-Apply Packs</CardTitle>
              <CardDescription>
                Generate complete application packages for multiple jobs at once
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CheckCircle2 className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>ATS Optimization</CardTitle>
              <CardDescription>
                Ensure your resume passes applicant tracking systems
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to get started?</h2>
          <p className="mb-8 text-muted-foreground">
            Join thousands of job seekers landing their dream roles with JobWise AI
          </p>
          <Link href="/auth/signup">
            <Button size="lg">Start Your 7-Day Free Trial</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 JobWise AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

