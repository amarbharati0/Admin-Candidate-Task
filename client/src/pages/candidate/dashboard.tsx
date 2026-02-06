import { useTasks } from "@/hooks/use-tasks";
import { useSubmissions } from "@/hooks/use-submissions";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckSquare, Clock, Trophy, MapPin } from "lucide-react";
import { AttendanceCapture } from "@/components/attendance-capture";
import { ProfileManagement } from "@/components/profile-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const { data: tasks } = useTasks();
  const { data: submissions } = useSubmissions({ candidateId: user?.id });

  const activeTasks = tasks?.length || 0;
  const completedTasks = submissions?.length || 0;
  
  // Calculate average score safely
  const gradedSubmissions = submissions?.filter((s: any) => s.score !== null) || [];
  const averageScore = gradedSubmissions.length > 0
    ? Math.round(gradedSubmissions.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0) / gradedSubmissions.length)
    : 0;

  return (
    <div className="space-y-8">
      <div className="bg-primary rounded-3xl p-8 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Trophy className="h-64 w-64" />
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-display font-bold">Hello, {user?.fullName}!</h2>
          <p className="text-primary-foreground/80 max-w-xl">
            Welcome to your dashboard. Your unique User ID is <span className="font-mono font-bold">{user?.candidateId}</span>. 
            You have {activeTasks} tasks assigned.
          </p>
          <div className="flex gap-4">
            <Link href="/candidate/tasks">
              <Button variant="secondary" className="gap-2">
                View Tasks <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="card-hover border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assigned Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTasks}</div>
          </CardContent>
        </Card>
        <Card className="card-hover border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Submissions</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
          </CardContent>
        </Card>
        <Card className="card-hover border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Score</CardTitle>
            <Trophy className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Daily Attendance</TabsTrigger>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 mt-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Upcoming Deadlines</h3>
              {tasks?.slice(0, 3).map((task: any) => (
                <Link key={task.id} href={`/candidate/tasks/${task.id}`}>
                  <div className="group bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium group-hover:text-primary transition-colors">{task.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
                      </div>
                      <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-400">
                        {format(new Date(task.deadline), "MMM d")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Feedback</h3>
              {submissions?.slice(0, 3).map((sub: any) => (
                <div key={sub.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm">{sub.task?.title}</h4>
                    <StatusBadge status={sub.status} />
                  </div>
                  {sub.feedback ? (
                    <p className="text-sm text-muted-foreground italic">"{sub.feedback}"</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No feedback yet</p>
                  )}
                </div>
              ))}
              {!submissions?.length && (
                <p className="text-muted-foreground text-sm">No submissions yet.</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <div className="max-w-xl">
            <p className="text-muted-foreground mb-6">
              Mark your daily attendance by capturing a live photo. Your location, device details, and IP address will be recorded for authenticity.
            </p>
            <AttendanceCapture />
          </div>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <div className="max-w-3xl">
            <ProfileManagement />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
