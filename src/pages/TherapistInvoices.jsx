import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, FileText, Download, Send, Eye, Edit, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TherapistInvoices() {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: therapist } = useQuery({
    queryKey: ["current-therapist"],
    queryFn: async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      return therapists[0];
    },
  });

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices", therapist?.id],
    queryFn: () => base44.entities.Invoice.filter({ therapist_id: therapist.id }, "-created_date"),
    enabled: !!therapist,
  });

  const filtered = invoices.filter(i => statusFilter === "all" || i.status === statusFilter);

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    sent: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800"
  };

  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((sum, i) => sum + i.total, 0);
  const pendingRevenue = invoices.filter(i => i.status === "sent").reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">חשבוניות</h1>
          <p className="text-gray-500">נהל וצור חשבוניות ללקוחות</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Plus size={16} className="ml-2"/> חשבונית חדשה
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500 mb-1">סה"כ חשבוניות</p>
          <p className="text-2xl font-bold">{invoices.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500 mb-1">חשבוניות ששולמו</p>
          <p className="text-2xl font-bold text-green-600">{invoices.filter(i => i.status === "paid").length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500 mb-1">סה"כ הכנסות</p>
          <p className="text-2xl font-bold">₪{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500 mb-1">ממתין לתשלום</p>
          <p className="text-2xl font-bold text-amber-600">₪{pendingRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="סטטוס"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              <SelectItem value="draft">טיוטה</SelectItem>
              <SelectItem value="sent">נשלח</SelectItem>
              <SelectItem value="paid">שולם</SelectItem>
              <SelectItem value="cancelled">בוטל</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download size={16} className="ml-2"/> ייצא
          </Button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border">
        <table className="w-full text-right">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold">מספר חשבונית</th>
              <th className="px-4 py-3 text-sm font-semibold">לקוח</th>
              <th className="px-4 py-3 text-sm font-semibold">תאריך</th>
              <th className="px-4 py-3 text-sm font-semibold">סכום</th>
              <th className="px-4 py-3 text-sm font-semibold">סטטוס</th>
              <th className="px-4 py-3 text-sm font-semibold">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">טוען...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">אין חשבוניות</td></tr>
            ) : (
              filtered.map((invoice) => (
                <tr key={invoice.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{invoice.invoice_number}</td>
                  <td className="px-4 py-3">{invoice.client_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(invoice.created_date).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-4 py-3 font-bold">₪{invoice.total.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge className={statusColors[invoice.status]}>
                      {invoice.status === "draft" && "טיוטה"}
                      {invoice.status === "sent" && "נשלח"}
                      {invoice.status === "paid" && "שולם"}
                      {invoice.status === "cancelled" && "בוטל"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye size={14}/>
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download size={14}/>
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Send size={14}/>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}