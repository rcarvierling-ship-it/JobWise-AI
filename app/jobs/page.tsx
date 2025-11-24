"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import JobTracker from "@/components/jobs/job-tracker";
import AddJobDialog from "@/components/jobs/add-job-dialog";
import { Plus } from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs");
      const data = await response.json();
      if (data.success) {
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJobAdded = () => {
    fetchJobs();
  };

  const handleJobUpdated = () => {
    fetchJobs();
  };

  const handleJobDeleted = () => {
    fetchJobs();
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Job Tracker</h1>
            <p className="text-muted-foreground">Organize and track your job applications</p>
          </div>
          <AddJobDialog onJobAdded={handleJobAdded}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Job
            </Button>
          </AddJobDialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        ) : (
          <JobTracker
            jobs={jobs}
            onJobUpdated={handleJobUpdated}
            onJobDeleted={handleJobDeleted}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

