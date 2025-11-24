"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles, Download, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";

const styles = [
  { value: "ats-optimized", label: "ATS-Optimized" },
  { value: "modern", label: "Modern" },
  { value: "traditional", label: "Traditional" },
  { value: "minimal", label: "Minimal" },
  { value: "creative", label: "Creative" },
];

export default function ResumeBuilder({ resume }: { resume: any }) {
  const { toast } = useToast();
  const router = useRouter();
  const [style, setStyle] = useState(resume.style || "ats-optimized");
  const [finalText, setFinalText] = useState(resume.finalText || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume.id, style }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to generate resume",
          variant: "destructive",
        });
      } else {
        setFinalText(data.resume.finalText);
        toast({
          title: "Success",
          description: "Resume generated successfully!",
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
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/resumes/${resume.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalText }),
      });

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to save resume",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Resume saved!",
        });
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

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const text = finalText || resume.rawText || "";
    const splitText = doc.splitTextToSize(text, 180);
    doc.text(splitText, 10, 10);
    doc.save(`resume-${resume.id}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resume Builder</h1>
          <p className="text-muted-foreground">Generate and edit your AI-powered resume</p>
        </div>
        <div className="flex gap-2">
          {finalText && (
            <>
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resume Style</CardTitle>
          <CardDescription>Choose a style for your AI-generated resume</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="style">Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger id="style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {styles.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            <Sparkles className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Resume"}
          </Button>
        </CardContent>
      </Card>

      {(finalText || resume.rawText) && (
        <Card>
          <CardHeader>
            <CardTitle>Resume Content</CardTitle>
            <CardDescription>Edit your resume content below</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={finalText || resume.rawText || ""}
              onChange={(e) => setFinalText(e.target.value)}
              className="min-h-[600px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}

      {!finalText && !resume.rawText && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Select a style and generate your resume to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

