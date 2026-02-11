import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminContent() {
  const queryClient = useQueryClient();

  const { data: exercises = [] } = useQuery({
    queryKey: ["adminExercises"],
    queryFn: () => base44.entities.Exercise.list("-created_date"),
  });
  const { data: recipes = [] } = useQuery({
    queryKey: ["adminRecipes"],
    queryFn: () => base44.entities.Recipe.list("-created_date"),
  });

  const deleteExMutation = useMutation({
    mutationFn: (id) => base44.entities.Exercise.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminExercises"] }),
  });
  const deleteRecMutation = useMutation({
    mutationFn: (id) => base44.entities.Recipe.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminRecipes"] }),
  });

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-6">ניהול תוכן</h1>
      <Tabs defaultValue="exercises">
        <TabsList className="bg-gray-100 rounded-xl p-1 mb-6">
          <TabsTrigger value="exercises">תרגילים ({exercises.length})</TabsTrigger>
          <TabsTrigger value="recipes">מתכונים ({recipes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="exercises">
          <div className="space-y-3">
            {exercises.map(ex => (
              <div key={ex.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{ex.title}</h3>
                  <p className="text-sm text-gray-500">{ex.category} · {ex.therapist_name || "מערכת"}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteExMutation.mutate(ex.id)} className="text-red-500"><Trash2 size={16}/></Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recipes">
          <div className="space-y-3">
            {recipes.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{r.title}</h3>
                  <p className="text-sm text-gray-500">{r.category} · {r.therapist_name || "מערכת"}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteRecMutation.mutate(r.id)} className="text-red-500"><Trash2 size={16}/></Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}