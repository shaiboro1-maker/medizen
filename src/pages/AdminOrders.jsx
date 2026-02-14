import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, Search, MessageSquare, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import moment from "moment";

export default function AdminOrders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notes, setNotes] = useState("");

  const { data: orders = [] } = useQuery({
    queryKey: ["allOrders"],
    queryFn: () => base44.entities.Order.list("-created_date", 500),
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
      alert("ההזמנה עודכנה בהצלחה");
    },
  });

  const filteredOrders = orders.filter(order => {
    const matchSearch = !searchQuery || 
      order.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.client_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some(item => item.product_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchSearch && matchStatus;
  });

  const totalRevenue = orders.filter(o => o.payment_status === "paid").reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const completedOrders = orders.filter(o => o.status === "completed").length;

  const handleAddNote = () => {
    if (!selectedOrder || !notes) return;
    const currentNotes = selectedOrder.internal_notes || "";
    const timestamp = moment().format('DD/MM/YYYY HH:mm');
    const newNote = `[${timestamp}] ${notes}`;
    const updatedNotes = currentNotes ? `${currentNotes}\n${newNote}` : newNote;
    
    updateOrderMutation.mutate({
      id: selectedOrder.id,
      data: { internal_notes: updatedNotes }
    });
    setNotes("");
  };

  return (
    <div className="p-6 md:p-8" style={{backgroundColor: '#F5F1E8'}}>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowRight size={20}/>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#7C9885]">ניהול הזמנות</h1>
          <p className="text-[#A8947D]">צפייה וניהול של כל ההזמנות</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
              <ShoppingBag className="text-purple-600" size={20}/>
            </div>
            <p className="text-2xl font-bold">{orders.length}</p>
            <p className="text-sm text-gray-500">סה"כ הזמנות</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
              <DollarSign className="text-green-600" size={20}/>
            </div>
            <p className="text-2xl font-bold">₪{totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-500">סה"כ הכנסות</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center mb-3">
              <TrendingUp className="text-yellow-600" size={20}/>
            </div>
            <p className="text-2xl font-bold">{pendingOrders}</p>
            <p className="text-sm text-gray-500">ממתינות</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
              <TrendingUp className="text-blue-600" size={20}/>
            </div>
            <p className="text-2xl font-bold">{completedOrders}</p>
            <p className="text-sm text-gray-500">הושלמו</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-[#E5DDD3] p-4 mb-6">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חפש לפי שם לקוח, מייל או פריט..."
              className="pr-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="סטטוס"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              <SelectItem value="pending">ממתין</SelectItem>
              <SelectItem value="processing">בטיפול</SelectItem>
              <SelectItem value="shipped">נשלח</SelectItem>
              <SelectItem value="completed">הושלם</SelectItem>
              <SelectItem value="cancelled">בוטל</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-[#E5DDD3] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F1E8]">
            <tr>
              <th className="text-right p-3 font-medium text-[#7C9885]">מספר הזמנה</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">לקוח</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">תאריך</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">פריטים</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">סכום</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">סטטוס</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">תשלום</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-[#A8947D]">
                  {searchQuery ? "לא נמצאו הזמנות" : "אין הזמנות"}
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id} className="border-t border-[#E5DDD3] hover:bg-gray-50">
                  <td className="p-3 font-medium">#{order.id?.slice(0, 8)}</td>
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{order.client_name}</p>
                      <p className="text-xs text-gray-500">{order.client_email}</p>
                    </div>
                  </td>
                  <td className="p-3">{moment(order.created_date).format('DD/MM/YYYY')}</td>
                  <td className="p-3">
                    <Badge variant="outline">{order.items?.length || 0} פריטים</Badge>
                  </td>
                  <td className="p-3 font-bold">₪{order.total?.toLocaleString()}</td>
                  <td className="p-3">
                    <Select 
                      value={order.status} 
                      onValueChange={(v) => updateOrderMutation.mutate({ id: order.id, data: { status: v } })}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <Badge className={
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {order.status === 'pending' && 'ממתין'}
                          {order.status === 'processing' && 'בטיפול'}
                          {order.status === 'shipped' && 'נשלח'}
                          {order.status === 'completed' && 'הושלם'}
                          {order.status === 'cancelled' && 'בוטל'}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">ממתין</SelectItem>
                        <SelectItem value="processing">בטיפול</SelectItem>
                        <SelectItem value="shipped">נשלח</SelectItem>
                        <SelectItem value="completed">הושלם</SelectItem>
                        <SelectItem value="cancelled">בוטל</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <Badge className={
                      order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                      'bg-amber-100 text-amber-800'
                    }>
                      {order.payment_status === 'paid' ? 'שולם' : 'ממתין'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <MessageSquare size={14}/>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>פרטי הזמנה #{selectedOrder?.id?.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>לקוח</Label>
                  <p className="font-medium">{selectedOrder.client_name}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.client_email}</p>
                </div>
                <div>
                  <Label>תאריך</Label>
                  <p className="font-medium">{moment(selectedOrder.created_date).format('DD/MM/YYYY HH:mm')}</p>
                </div>
              </div>

              <div>
                <Label>פריטים</Label>
                <div className="space-y-2 mt-2">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded-lg flex justify-between">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-500">כמות: {item.quantity}</p>
                      </div>
                      <p className="font-bold">₪{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex justify-between font-bold">
                  <span>סה"כ:</span>
                  <span>₪{selectedOrder.total}</span>
                </div>
              </div>

              <div>
                <Label>הערות פנימיות</Label>
                {selectedOrder.internal_notes && (
                  <div className="bg-amber-50 p-3 rounded-lg mt-2 mb-2 whitespace-pre-wrap text-sm">
                    {selectedOrder.internal_notes}
                  </div>
                )}
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="הוסף הערה פנימית..."
                  rows={3}
                  className="mt-2"
                />
                <Button onClick={handleAddNote} className="mt-2 w-full bg-[#B8A393] hover:bg-[#C5B5A4]">
                  <MessageSquare size={16} className="ml-2"/> הוסף הערה
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}