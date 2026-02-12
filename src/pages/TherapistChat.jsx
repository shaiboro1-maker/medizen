import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Paperclip, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import moment from "moment";

export default function TherapistChat() {
  const [therapist, setTherapist] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: appointments = [] } = useQuery({
    queryKey: ["chatAppointments", therapist?.id],
    queryFn: () => base44.entities.Appointment.filter({ therapist_id: therapist.id, status: "confirmed" }, "-date"),
    enabled: !!therapist,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["chatMessages", selectedChat?.id],
    queryFn: () => base44.entities.ChatMessage.filter({ appointment_id: selectedChat.id }, "-created_date"),
    enabled: !!selectedChat,
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: async (data) => {
      let fileUrl = "";
      if (uploadFile) {
        const result = await base44.integrations.Core.UploadFile({ file: uploadFile });
        fileUrl = result.file_url;
      }
      return base44.entities.ChatMessage.create({ ...data, file_url: fileUrl });
    },
    onMutate: async (newMessage) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["chatMessages", selectedChat?.id] });
      
      // Snapshot previous value
      const previousMessages = queryClient.getQueryData(["chatMessages", selectedChat?.id]);
      
      // Optimistically update
      queryClient.setQueryData(["chatMessages", selectedChat?.id], (old = []) => [
        ...old,
        {
          id: `temp-${Date.now()}`,
          ...newMessage,
          created_date: new Date().toISOString(),
          is_read: false
        }
      ]);
      
      return { previousMessages };
    },
    onError: (err, newMessage, context) => {
      // Rollback on error
      queryClient.setQueryData(["chatMessages", selectedChat?.id], context.previousMessages);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatMessages"] });
      setMessage("");
      setUploadFile(null);
    },
  });

  const handleSend = () => {
    if (!message.trim() && !uploadFile) return;
    sendMutation.mutate({
      appointment_id: selectedChat.id,
      therapist_id: therapist.id,
      client_email: selectedChat.client_email,
      sender_type: "therapist",
      message: message.trim(),
    });
  };

  return (
    <div className="p-6 md:p-8 h-screen flex gap-4">
      <div className="w-80 bg-white rounded-2xl border border-gray-100 p-4 overflow-y-auto">
        <h2 className="font-bold mb-4">צ'אטים</h2>
        <div className="space-y-2">
          {appointments.map(apt => (
            <button
              key={apt.id}
              onClick={() => setSelectedChat(apt)}
              className={`w-full text-right p-3 rounded-xl hover:bg-gray-50 transition-colors ${selectedChat?.id === apt.id ? "bg-teal-50 border border-teal-200" : "border border-gray-100"}`}
            >
              <p className="font-medium text-sm">{apt.client_name}</p>
              <p className="text-xs text-gray-500">{apt.service_name}</p>
              <p className="text-xs text-gray-400">{moment(apt.date).format("DD/MM/YYYY")}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col">
        {!selectedChat ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle size={64} className="text-gray-200 mx-auto mb-4"/>
              <p className="text-gray-400">בחר צ'אט להתחלת שיחה</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b">
              <p className="font-bold">{selectedChat.client_name}</p>
              <p className="text-sm text-gray-500">{selectedChat.service_name}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_type === "therapist" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs p-3 rounded-2xl ${msg.sender_type === "therapist" ? "bg-teal-600 text-white" : "bg-gray-100"}`}>
                    <p className="text-sm">{msg.message}</p>
                    {msg.file_url && (
                      <a href={msg.file_url} target="_blank" rel="noreferrer" className="text-xs underline block mt-2">קובץ מצורף</a>
                    )}
                    <p className="text-xs opacity-70 mt-1">{moment(msg.created_date).format("HH:mm")}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input type="file" onChange={(e) => setUploadFile(e.target.files[0])} className="hidden" id="file-upload"/>
                <label htmlFor="file-upload">
                  <Button variant="outline" size="icon" className="cursor-pointer" type="button">
                    <Paperclip size={16}/>
                  </Button>
                </label>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="כתוב הודעה..."
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={sendMutation.isPending} className="bg-teal-600 hover:bg-teal-700">
                  <Send size={16}/>
                </Button>
              </div>
              {uploadFile && <p className="text-xs text-gray-500 mt-2">קובץ: {uploadFile.name}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}