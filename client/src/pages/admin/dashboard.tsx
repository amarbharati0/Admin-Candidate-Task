import { useUsers } from "@/hooks/use-users";
import { useTasks } from "@/hooks/use-tasks";
import { useSubmissions } from "@/hooks/use-submissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckSquare, Clock, AlertCircle, MapPin } from "lucide-react";
import { ProfileManagement } from "@/components/profile-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAttendance } from "@/hooks/use-attendance";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { StatusBadge } from "@/components/status-badge";

export default function AdminDashboard() {
  const { data: users } = useUsers('candidate');
  const { data: tasks } = useTasks();
  const { data: submissions } = useSubmissions();
  const { data: attendance } = useAttendance();

  const totalCandidates = users?.length || 0;
  const activeTasks = tasks?.filter((t: any) => t.status === 'active').length || 0;
  const pendingReviews = submissions?.filter((s: any) => s.status === 'pending').length || 0;

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
      icon: CheckSquare,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Pending Reviews",
      value: pendingReviews,
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-display font-bold tracking-tight">Admin Overview</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Logs</TabsTrigger>
          <TabsTrigger value="profile">Admin Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="col-span-1 shadow-sm border-none">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingReviews > 0 ? (
                  <div className="space-y-4">
                    {submissions?.filter((s: any) => s.status === 'pending').slice(0, 5).map((sub: any) => (
                      <div key={sub.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                        <div>
                          <p className="font-medium text-sm">{sub.candidate?.fullName}</p>
                          <p className="text-xs text-muted-foreground">Submitted: {sub.task?.title}</p>
                        </div>
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No pending activities at the moment.</p>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-1 shadow-sm border-none">
              <CardHeader>
                <CardTitle>Recent Candidates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users?.slice(0, 5).map((candidate: any) => (
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
                  {!users?.length && (
                    <div className="text-center py-4 text-muted-foreground text-sm">No candidates yet</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Photo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance?.map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {users?.find((u: any) => u.id === record.userId)?.fullName || "Unknown"}
                      </TableCell>
                      <TableCell>{format(new Date(record.timestamp), "MMM d, h:mm a")}</TableCell>
                      <TableCell className="text-xs">
                        {record.latitude}, {record.longitude}
                      </TableCell>
                      <TableCell className="text-xs">{record.ipAddress}</TableCell>
                      <TableCell>
                        <a href={record.photoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">
                          View Photo
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!attendance || attendance.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No attendance records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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
