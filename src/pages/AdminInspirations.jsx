import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Trash2 } from "lucide-react";

export default function AdminInspirations() {
  const queryClient = useQueryClient();

  const { data: inspirations = [] } = useQuery({
    queryKey: ["admin-inspirations"],
    queryFn: () => base44.entities.Inspiration.list("-created_date"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Inspiration.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-inspirations"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Inspiration.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-inspirations"] }),
  });

  const pending = inspirations.filter((i) => !i.is_approved);
  const approved = inspirations.filter((i) => i.is_approved);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">משפטי השראה</h1>
        <p className="text-gray-500">ניהול ואישור משפטי השראה מהמשתמשים</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">ממתינים לאישור ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">מאושרים ({approved.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {pending.length === 0 ? (
            <p className="text-gray-400 text-center py-8">אין משפטים ממתינים</p>
          ) : (
            pending.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border p-4">
                {item.image_url && (
                  <img src={item.image_url} alt="" className="w-full h-32 object-cover rounded-lg mb-3"/>
                )}
                <p className="text-lg italic mb-2">"{item.text}"</p>
                {item.author && <p className="text-sm text-gray-600 mb-2">- {item.author}</p>}
                <div className="flex gap-2 text-xs text-gray-500 mb-3">
                  <Badge variant="outline">{item.category}</Badge>
                  <span>נשלח על ידי: {item.submitted_by}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateMutation.mutate({ id: item.id, data: { is_approved: true } })}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check size={14} className="ml-1"/> אשר
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(item.id)}
                  >
                    <X size={14} className="ml-1"/> דחה
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-4">
          {approved.length === 0 ? (
            <p className="text-gray-400 text-center py-8">אין משפטים מאושרים</p>
          ) : (
            approved.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border p-4">
                {item.image_url && (
                  <img src={item.image_url} alt="" className="w-full h-32 object-cover rounded-lg mb-3"/>
                )}
                <p className="text-lg italic mb-2">"{item.text}"</p>
                {item.author && <p className="text-sm text-gray-600 mb-2">- {item.author}</p>}
                <div className="flex gap-2 text-xs text-gray-500 mb-3">
                  <Badge variant="outline">{item.category}</Badge>
                  <span>נשלח על ידי: {item.submitted_by}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateMutation.mutate({ id: item.id, data: { is_approved: false } })}
                  >
                    בטל אישור
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(item.id)}
                  >
                    <Trash2 size={14} className="ml-1"/> מחק
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}