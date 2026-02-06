import { useState } from "react";
import { useRoute } from "wouter";
import { useTasks } from "@/hooks/use-tasks";
import { useCreateSubmission, useSubmissions } from "@/hooks/use-submissions";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar, Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/status-badge";

export default function TaskDetail() {
  const [, params] = useRoute("/candidate/tasks/:id");
  const taskId = parseInt(params?.id || "0");
  const { user } = useAuth();
  
  const { data: tasks } = useTasks();
  const task = tasks?.find((t: any) => t.id === taskId);
  
  const { data: submissions } = useSubmissions({ taskId, candidateId: user?.id });
  const submission = submissions?.[0]; // Assuming one submission per task for now

  const createSubmission = useCreateSubmission();
  const { toast } = useToast();

  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);

  if (!task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content && !file) {
      toast({
        title: "Validation Error",
        description: "Please provide text content or upload a file.",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("taskId", taskId.toString());
      if (content) formData.append("content", content);
      if (file) formData.append("file", file);

      await createSubmission.mutateAsync(formData);
      
      toast({
        title: "Submitted Successfully",
        description: "Your work has been submitted for review.",
      });
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">{task.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Due {format(new Date(task.deadline), "PPP p")}</span>
            </div>
          </div>
          {submission && <StatusBadge status={submission.status} />}
        </div>
        
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
          <p>{task.description}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Upload className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold">Your Submission</h2>
        </div>

        {submission ? (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-300">Submitted on {format(new Date(submission.submittedAt), "PPP p")}</p>
                {submission.score && <p className="text-sm mt-1">Score: {submission.score}/100</p>}
              </div>
            </div>

            <div className="space-y-4">
              {submission.content && (
                <div>
                  <Label>Text Content</Label>
                  <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                    {submission.content}
                  </div>
                </div>
              )}
              
              {submission.fileName && (
                <div>
                  <Label>Attached File</Label>
                  <div className="mt-2 flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">{submission.fileName}</span>
                  </div>
                </div>
              )}

              {submission.feedback && (
                <div className="mt-6">
                  <Label>Feedback</Label>
                  <div className="mt-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm italic text-gray-700 dark:text-gray-300">"{submission.feedback}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="content">Text Submission</Label>
              <Textarea
                id="content"
                placeholder="Type your answer or add comments here..."
                className="min-h-[150px] resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="h-px bg-border flex-1" />
              <span className="text-xs text-muted-foreground uppercase font-medium">OR / AND</span>
              <div className="h-px bg-border flex-1" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">Supported formats: PDF, DOCX, PNG, JPG (Max 5MB)</p>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={createSubmission.isPending} className="w-full sm:w-auto">
                {createSubmission.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Assignment
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
