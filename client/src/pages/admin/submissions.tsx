import { useState } from "react";
import { useSubmissions } from "@/hooks/use-submissions";
import { SubmissionReviewModal } from "@/components/submission-review-modal";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminSubmissions() {
  const { data: submissions, isLoading } = useSubmissions();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [search, setSearch] = useState("");

  const filteredSubmissions = submissions?.filter((sub: any) => 
    sub.candidate?.fullName.toLowerCase().includes(search.toLowerCase()) ||
    sub.task?.title.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="h-96 w-full animate-shimmer rounded-xl" />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold tracking-tight">Submissions</h2>
        <p className="text-muted-foreground mt-2">Review and grade candidate submissions.</p>
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by candidate or task..." 
            className="pl-9 border-none bg-transparent shadow-none focus-visible:ring-0" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubmissions?.map((submission: any) => (
              <TableRow key={submission.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${submission.candidate?.fullName}&background=random`} />
                      <AvatarFallback>{submission.candidate?.fullName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{submission.candidate?.fullName}</p>
                      <p className="text-xs text-muted-foreground">{submission.candidate?.candidateId}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{submission.task?.title}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(submission.submittedAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <StatusBadge status={submission.status} />
                </TableCell>
                <TableCell>
                  {submission.score !== null ? (
                    <span className={`font-mono font-medium ${
                      submission.score >= 70 ? "text-green-600" : "text-orange-600"
                    }`}>
                      {submission.score}/100
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <Eye className="h-4 w-4 mr-2" /> Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!filteredSubmissions?.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No submissions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <SubmissionReviewModal 
        submission={selectedSubmission} 
        open={!!selectedSubmission} 
        onOpenChange={(open) => !open && setSelectedSubmission(null)} 
      />
    </div>
  );
}
