import { useState } from "react";
import { useUpdateSubmission } from "@/hooks/use-submissions";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { FileText, Download, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface SubmissionReviewModalProps {
  submission: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubmissionReviewModal({ submission, open, onOpenChange }: SubmissionReviewModalProps) {
  const { toast } = useToast();
  const updateSubmission = useUpdateSubmission();
  const [feedback, setFeedback] = useState(submission?.feedback || "");
  const [score, setScore] = useState(submission?.score || "");

  if (!submission) return null;

  const handleReview = async (status: "approved" | "rejected") => {
    try {
      await updateSubmission.mutateAsync({
        id: submission.id,
        data: {
          status,
          feedback,
          score: score ? parseInt(score) : undefined,
        },
      });
      
      toast({
        title: `Submission ${status}`,
        description: "The candidate has been notified.",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${submission.candidate?.fullName}&background=random`} />
              <AvatarFallback>{submission.candidate?.fullName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl">{submission.task?.title}</DialogTitle>
              <DialogDescription className="mt-1">
                Submitted by <span className="font-semibold text-foreground">{submission.candidate?.fullName}</span> on {format(new Date(submission.submittedAt), "PPP p")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-border">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Submission Content</h4>
            {submission.content && (
              <div className="prose dark:prose-invert max-w-none text-sm bg-white dark:bg-slate-950 p-4 rounded-lg border border-border mb-4">
                {submission.content}
              </div>
            )}
            
            {submission.fileUrl && (
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-950 border border-border rounded-lg group hover:border-primary/50 transition-colors">
                <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{submission.fileName || "Attached File"}</p>
                  <p className="text-xs text-muted-foreground">{submission.fileType || "Document"}</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href={submission.fileUrl} target="_blank" rel="noreferrer" className="gap-2">
                    <Download className="h-4 w-4" /> Download
                  </a>
                </Button>
              </div>
            )}

            {!submission.content && !submission.fileUrl && (
              <div className="text-center py-8 text-muted-foreground italic">
                No content provided
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="score">Score (0-100)</Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="100"
                placeholder="Enter score..."
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Write feedback for the candidate..."
                className="min-h-[100px]"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => handleReview("rejected")}
            disabled={updateSubmission.isPending}
            className="gap-2"
          >
            <XCircle className="h-4 w-4" /> Reject
          </Button>
          <Button 
            onClick={() => handleReview("approved")}
            disabled={updateSubmission.isPending}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-4 w-4" /> Approve
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
