import { useTasks, useDeleteTask } from "@/hooks/use-tasks";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import { Trash2, Calendar, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminTasks() {
  const { data: tasks, isLoading } = useTasks();
  const deleteTask = useDeleteTask();

  if (isLoading) {
    return <div className="h-96 w-full animate-shimmer rounded-xl" />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground mt-2">Manage and assign tasks to candidates.</p>
        </div>
        <CreateTaskDialog />
      </div>

      <div className="grid gap-6">
        {tasks?.map((task: any) => (
          <Card key={task.id} className="card-hover group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{task.title}</CardTitle>
                  <CardDescription className="line-clamp-2 max-w-2xl">
                    {task.description}
                  </CardDescription>
                </div>
                <StatusBadge status={task.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Due {format(new Date(task.deadline), "PPP")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {task.assignedTo 
                        ? `Assigned to ${task.assignedTo.fullName}` 
                        : "Assigned to All Candidates"}
                    </span>
                  </div>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the task and all associated submissions.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteTask.mutate(task.id)} className="bg-destructive hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
        {!tasks?.length && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">No tasks created yet. Create your first task above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
