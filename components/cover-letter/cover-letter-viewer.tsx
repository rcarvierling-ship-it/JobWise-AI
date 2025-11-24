"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Save, Copy } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CoverLetterViewer({ coverLetter }: { coverLetter: any }) {
  const { toast } = useToast();
  const router = useRouter();
  const [outputText, setOutputText] = useState(coverLetter.outputText || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/cover-letters/${coverLetter.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outputText }),
      });

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to save cover letter",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Cover letter saved!",
        });
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(outputText);
    toast({
      title: "Copied",
      description: "Cover letter copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cover Letter</h1>
          <p className="text-muted-foreground">
            {coverLetter.jobTitle} at {coverLetter.company}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cover Letter Content</CardTitle>
          <CardDescription>Edit your cover letter below</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={outputText}
            onChange={(e) => setOutputText(e.target.value)}
            className="min-h-[500px] font-mono text-sm"
          />
        </CardContent>
      </Card>
    </div>
  );
}

