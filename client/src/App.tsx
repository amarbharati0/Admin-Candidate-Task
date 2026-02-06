import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Login from "@/pages/login";
import Register from "@/pages/register";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminTasks from "@/pages/admin/tasks";
import AdminSubmissions from "@/pages/admin/submissions";
import CandidateDashboard from "@/pages/candidate/dashboard";
import TaskDetail from "@/pages/candidate/task-detail";
import Layout from "@/components/layout";
import NotFound from "@/pages/not-found";

function PrivateRoute({ component: Component, role }: { component: any; role?: "admin" | "candidate" }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Redirect to="/login" />;
  if (role && user.role !== role) {
    return <Redirect to={user.role === "admin" ? "/admin" : "/candidate"} />;
  }

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Admin Routes */}
      <Route path="/admin">
        <PrivateRoute component={AdminDashboard} role="admin" />
      </Route>
      <Route path="/admin/tasks">
        <PrivateRoute component={AdminTasks} role="admin" />
      </Route>
      <Route path="/admin/submissions">
        <PrivateRoute component={AdminSubmissions} role="admin" />
      </Route>
      {/* Placeholder for candidates list if needed separately */}
      <Route path="/admin/candidates">
        <PrivateRoute component={AdminDashboard} role="admin" /> 
      </Route>

      {/* Candidate Routes */}
      <Route path="/candidate">
        <PrivateRoute component={CandidateDashboard} role="candidate" />
      </Route>
      <Route path="/candidate/tasks">
        {/* We can reuse dashboard or make a dedicated list page. Reusing dashboard for now or redirecting */}
        <PrivateRoute component={CandidateDashboard} role="candidate" />
      </Route>
      <Route path="/candidate/tasks/:id">
        <PrivateRoute component={TaskDetail} role="candidate" />
      </Route>
      <Route path="/candidate/submissions">
        <PrivateRoute component={CandidateDashboard} role="candidate" />
      </Route>

      <Route path="/">
        <Redirect to="/login" />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
