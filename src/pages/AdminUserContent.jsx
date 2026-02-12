import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Eye } from "lucide-react";

export default function AdminUserContent() {
  const queryClient = useQueryClient();

  const { data: content = [] } = useQuery({
    queryKey: ["userContent"],
    queryFn: () => base44.entities.UserContent?.list() || []
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, admin_notes }) => 
      base44.entities.UserContent.update(id, { status, admin_notes }),
    onSuccess: () => queryClient.invalidateQueries(["userContent"])
  });

  const pending = content.filter(c => c.status === "pending");
  const approved = content.filter(c => c.status === "approved");
  const rejected = content.filter(c => c.status === "rejected");

  const ContentItem = ({ item }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg">{item.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
            <p className="text-sm text-gray-600 mt-2">{item.content}</p>
          </div>
          <Badge>{item.content_type}</Badge>
        </div>

        {item.image_url && (
          <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover rounded mb-3"/>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">נשלח על ידי: {item.user_email}</span>
          {item.status === "pending" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => updateStatusMutation.mutate({ id: item.id, status: "approved" })}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check size={16} className="ml-1"/> אשר
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => updateStatusMutation.mutate({ id: item.id, status: "rejected" })}
              >
                <X size={16} className="ml-1"/> דחה
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">ניהול תוכן משתמשים</h1>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">ממתין לאישור ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">מאושר ({approved.length})</TabsTrigger>
          <TabsTrigger value="rejected">נדחה ({rejected.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pending.length === 0 ? (
            <p className="text-center text-gray-400 py-12">אין תוכן ממתין לאישור</p>
          ) : (
            pending.map(item => <ContentItem key={item.id} item={item}/>)
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {approved.map(item => <ContentItem key={item.id} item={item}/>)}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {rejected.map(item => <ContentItem key={item.id} item={item}/>)}
        </TabsContent>
      </Tabs>
    </div>
  );
}