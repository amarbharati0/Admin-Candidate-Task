import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!user) return null;

  const isAdmin = user.role === "admin";

  const adminNav = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Tasks", href: "/admin/tasks", icon: CheckSquare },
    { name: "Submissions", href: "/admin/submissions", icon: FileText },
    { name: "Candidates", href: "/admin/candidates", icon: Users },
  ];

  const candidateNav = [
    { name: "Dashboard", href: "/candidate", icon: LayoutDashboard },
    { name: "My Tasks", href: "/candidate/tasks", icon: CheckSquare },
    { name: "My Submissions", href: "/candidate/submissions", icon: FileText },
  ];

  const navItems = isAdmin ? adminNav : candidateNav;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b p-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="font-display font-bold text-xl text-primary">TaskMaster</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(!isMobileOpen)}>
          {isMobileOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar Navigation */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-border
          transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col
        `}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <CheckSquare className="text-white h-5 w-5" />
            </div>
            <h1 className="font-display font-bold text-xl tracking-tight">TaskMaster</h1>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div 
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
                      ${isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                      }
                    `}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                    {item.name}
                    {isActive && <ChevronRight className="ml-auto h-3 w-3 opacity-50" />}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-border bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${user.fullName}&background=random`} />
              <AvatarFallback><UserIcon className="h-4 w-4" /></AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.fullName}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{user.role}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20"
            onClick={() => logout.mutate()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto h-[calc(100vh-65px)] md:h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
}
