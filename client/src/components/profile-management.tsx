import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateUser } from "@/hooks/use-users";
import { UserCircle } from "lucide-react";

export function ProfileManagement() {
  const { user } = useAuth();
  const updateUser = useUpdateUser();

  const form = useForm({
    resolver: zodResolver(insertUserSchema.partial()),
    defaultValues: {
      fullName: user?.fullName || "",
      mobileNumber: user?.mobileNumber || "",
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
      profilePhoto: user?.profilePhoto || "",
    },
  });

  const onSubmit = (data: any) => {
    if (user) {
      updateUser.mutate({ 
        id: user.id, 
        data: {
          ...data,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null
        } 
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="h-5 w-5" />
          Profile Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Email (Non-editable)</FormLabel>
                <Input value={user?.username} disabled className="bg-muted" />
              </FormItem>
              <FormItem>
                <FormLabel>Candidate ID</FormLabel>
                <Input value={user?.candidateId || "N/A"} disabled className="bg-muted" />
              </FormItem>
              
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter mobile number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value as string} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profilePhoto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Photo URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter photo URL" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
