import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "react-hot-toast";

export default function FAQManager({ therapistId }) {
  const [newFAQ, setNewFAQ] = useState({ question: "", answer: "" });
  const queryClient = useQueryClient();

  const { data: faqs = [] } = useQuery({
    queryKey: ["faqs", therapistId],
    queryFn: () => base44.entities.FAQ.filter({ therapist_id: therapistId }, "order"),
    enabled: !!therapistId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FAQ.create({
      ...data,
      therapist_id: therapistId,
      order: faqs.length
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["faqs"]);
      setNewFAQ({ question: "", answer: "" });
      toast.success("השאלה נוספה!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FAQ.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["faqs"]);
      toast.success("השאלה נמחקה!");
    },
  });

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div key={faq.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start gap-3">
            <GripVertical size={16} className="text-gray-400 mt-1 cursor-move"/>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
              <p className="text-sm text-gray-600">{faq.answer}</p>
            </div>
            <button
              onClick={() => deleteMutation.mutate(faq.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={16}/>
            </button>
          </div>
        </div>
      ))}

      <div className="border-t pt-4 space-y-3">
        <Label>הוסף שאלה חדשה</Label>
        <Input
          value={newFAQ.question}
          onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
          placeholder="השאלה..."
        />
        <Textarea
          value={newFAQ.answer}
          onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
          placeholder="התשובה..."
          rows={3}
        />
        <Button
          onClick={() => createMutation.mutate(newFAQ)}
          disabled={!newFAQ.question || !newFAQ.answer || createMutation.isPending}
          className="w-full bg-[#7C9885] hover:bg-[#9CB4A4] rounded-full"
        >
          <Plus size={18} className="ml-2"/>
          הוסף שאלה
        </Button>
      </div>
    </div>
  );
}