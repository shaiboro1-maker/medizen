import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const { data: products = [] } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: () => base44.entities.Product.list("-created_date"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminProducts"] }),
  });

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-6">ניהול מוצרים</h1>
      {products.length === 0 ? (
        <p className="text-center text-gray-400 py-12">אין מוצרים</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right p-3 font-medium text-gray-500">שם</th>
                <th className="text-right p-3 font-medium text-gray-500">קטגוריה</th>
                <th className="text-right p-3 font-medium text-gray-500">מחיר</th>
                <th className="text-right p-3 font-medium text-gray-500">מלאי</th>
                <th className="text-right p-3 font-medium text-gray-500">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3"><Badge variant="secondary">{p.category}</Badge></td>
                  <td className="p-3">₪{p.price}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)} className="text-red-500"><Trash2 size={14}/></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}