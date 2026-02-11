import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { User, Calendar, Heart, ShoppingBag, LogOut, ChevronLeft } from "lucide-react";

export default function MyAccount() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  if (!user) return null;

  const menuItems = [
    { icon: <Calendar size={20}/>, label: "התורים שלי", to: "MyAppointments" },
    { icon: <Heart size={20}/>, label: "מועדפים", to: "MyFavorites" },
    { icon: <ShoppingBag size={20}/>, label: "הזמנות", to: "MyOrders" },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
          <User size={32} className="text-teal-700"/>
        </div>
        <h1 className="text-2xl font-bold">{user.full_name}</h1>
        <p className="text-gray-500">{user.email}</p>
      </div>

      <div className="space-y-3">
        {menuItems.map(item => (
          <Link
            key={item.to}
            to={createPageUrl(item.to)}
            className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="text-gray-500">{item.icon}</div>
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronLeft size={18} className="text-gray-400"/>
          </Link>
        ))}

        <button
          onClick={() => base44.auth.logout()}
          className="w-full flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-5 hover:bg-red-50 transition-all text-red-600"
        >
          <LogOut size={20}/>
          <span className="font-medium">התנתקות</span>
        </button>
      </div>
    </div>
  );
}