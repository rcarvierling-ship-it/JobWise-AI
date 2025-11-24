"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles, Loader2 } from "lucide-react";

export default function AutoApplyPage() {
  const { toast } = useToast();
  const [urls, setUrls] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleGenerate = async () => {
    const urlList = urls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urlList.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one job URL",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate/auto-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: urlList }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to generate application packs",
          variant: "destructive",
        });
      } else {
        setResults(data);
        toast({
          title: "Success",
          description: "Application packs generated successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Auto-Apply Pack Generator</h1>
          <p className="text-muted-foreground">
            Generate complete application packages for multiple jobs at once
          </p>
        </div>

        <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle>Job URLs</CardTitle>
            <CardDescription>
              Paste job URLs (one per line) from Indeed, LinkedIn, or other job boards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="urls">Job URLs (one per line)</Label>
              <Textarea
                id="urls"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                placeholder="https://www.linkedin.com/jobs/view/...&#10;https://www.indeed.com/viewjob?jk=...&#10;https://..."
                rows={10}
                disabled={isGenerating}
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !urls.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Application Packs
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {results && (
          <Card className="mt-8 max-w-4xl">
            <CardHeader>
              <CardTitle>Generated Application Packs</CardTitle>
              <CardDescription>
                Your application packs have been generated and saved
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(results.outputs || {}).map(([url, output]: [string, any]) => (
                  <Card key={url} className="p-4">
                    <h3 className="font-semibold mb-2">{output.jobTitle || url}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {output.company || "Company not found"}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Resume:</strong> Generated
                      </div>
                      <div>
                        <strong>Cover Letter:</strong> Generated
                      </div>
                      <div>
                        <strong>Answers:</strong> {output.answers?.length || 0} questions
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

