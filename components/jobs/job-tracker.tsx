"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

const statuses = ["saved", "applied", "interview", "offer", "rejected"];
const statusLabels: Record<string, string> = {
  saved: "Saved",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

const statusColors: Record<string, string> = {
  saved: "bg-gray-500",
  applied: "bg-blue-500",
  interview: "bg-purple-500",
  offer: "bg-green-500",
  rejected: "bg-red-500",
};

export default function JobTracker({
  jobs,
  onJobUpdated,
  onJobDeleted,
}: {
  jobs: any[];
  onJobUpdated: () => void;
  onJobDeleted: () => void;
}) {
  const { toast } = useToast();

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to update job status",
          variant: "destructive",
        });
      } else {
        onJobUpdated();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to delete job",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Job deleted successfully",
        });
        onJobDeleted();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const jobsByStatus = statuses.map((status) => ({
    status,
    jobs: jobs.filter((job) => job.status === status),
  }));

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {jobsByStatus.map(({ status, jobs: statusJobs }) => (
        <div key={status} className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{statusLabels[status]}</h3>
            <Badge className={statusColors[status]}>{statusJobs.length}</Badge>
          </div>
          <div className="space-y-2">
            {statusJobs.map((job) => (
              <Card key={job.id} className="p-3">
                <CardContent className="p-0">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{job.jobTitle}</h4>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {statuses.map((s) => (
                            <DropdownMenuItem
                              key={s}
                              onClick={() => handleStatusChange(job.id, s)}
                              className={job.status === s ? "bg-accent" : ""}
                            >
                              {statusLabels[s]}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem
                            onClick={() => handleDelete(job.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {job.jobUrl && (
                      <Link
                        href={job.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Job
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

