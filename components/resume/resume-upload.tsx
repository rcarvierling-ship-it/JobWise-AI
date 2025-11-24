"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ResumeUpload() {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      if (text) {
        formData.append("text", text);
      }

      const response = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to upload resume",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Resume uploaded successfully!",
        });
        setOpen(false);
        setFile(null);
        setText("");
        router.push(`/resume/${data.resume.id}`);
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Upload Resume
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Resume</DialogTitle>
          <DialogDescription>
            Upload a PDF, DOCX, or paste your resume text
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="file" className="mb-2 block text-sm font-medium">
              Upload File (PDF, DOCX, TXT)
            </label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </div>
          <div className="text-center text-sm text-muted-foreground">OR</div>
          <div>
            <label htmlFor="text" className="mb-2 block text-sm font-medium">
              Paste Resume Text
            </label>
            <Textarea
              id="text"
              placeholder="Paste your resume content here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
              rows={10}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || (!file && !text)}>
              {isLoading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

