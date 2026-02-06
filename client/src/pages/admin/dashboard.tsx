import { useTasks } from "@/hooks/use-tasks";
import { useUsers } from "@/hooks/use-users";
import { useSubmissions } from "@/hooks/use-submissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Users, FileText, CheckCircle, Clock } from "lucide-react";

export default function AdminDashboard() {
  const { data: candidates } = useUsers("candidate");
  const { data: tasks } = useTasks();
  const { data: submissions } = useSubmissions();

  const activeTasks = tasks?.filter((t: any) => t.status === "active")?.length || 0;
  const pendingSubmissions = submissions?.filter((s: any) => s.status === "pending")?.length || 0;
  const totalCandidates = candidates?.length || 0;

  const stats = [
    {
      title: "Total Candidates",
      value: totalCandidates,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Active Tasks",
      value: activeTasks,
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Pending Reviews",
      value: pendingSubmissions,
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      title: "Total Submissions",
      value: submissions?.length || 0,
      icon: FileText,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-2">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="card-hover border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="col-span-1 shadow-sm border-none">
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submissions?.slice(0, 5).map((submission: any) => (
                <div key={submission.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{submission.task?.title}</p>
                    <p className="text-xs text-muted-foreground">by {submission.candidate?.fullName}</p>
                  </div>
                  <StatusBadge status={submission.status} />
                </div>
              ))}
              {!submissions?.length && (
                <div className="text-center py-4 text-muted-foreground text-sm">No submissions yet</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm border-none">
          <CardHeader>
            <CardTitle>Recent Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {candidates?.slice(0, 5).map((candidate: any) => (
                <div key={candidate.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {candidate.fullName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{candidate.fullName}</p>
                    <p className="text-xs text-muted-foreground">{candidate.candidateId}</p>
                  </div>
                </div>
              ))}
              {!candidates?.length && (
                <div className="text-center py-4 text-muted-foreground text-sm">No candidates yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
