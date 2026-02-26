import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { format } from 'date-fns';

export default function ConversationView({ conversation, userId, userName }) {
  const queryClient = useQueryClient();
  const [reply, setReply] = useState('');

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['conversation-messages', conversation?.id],
    queryFn: async () => {
      // In a real system, you'd have a separate messages thread table
      // For now, we'll use the existing Message entity structure
      const results = await base44.entities.Message.filter({
        school_id: conversation.school_id,
        id: conversation.id
      });
      return results;
    },
    enabled: !!conversation,
  });

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-messages'] });
      queryClient.invalidateQueries({ queryKey: ['user-conversations'] });
      setReply('');
    },
  });

  const handleSend = () => {
    if (!reply.trim() || !conversation) return;

    sendMutation.mutate({
      school_id: conversation.school_id,
      sender_id: userId,
      sender_name: userName,
      recipient_ids: conversation.recipient_ids,
      subject: `Re: ${conversation.subject}`,
      body: reply,
      is_announcement: false,
    });
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <p className="text-slate-400">Select a conversation to view messages</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="font-semibold text-slate-900">{conversation.subject}</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          with {conversation.participant_name} ({conversation.participant_role})
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(msg => {
          const isSender = msg.sender_id === userId;
          return (
            <div key={msg.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-lg ${isSender ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900'} rounded-2xl px-4 py-3`}>
                {!isSender && (
                  <p className="text-xs font-semibold mb-1 opacity-70">{msg.sender_name}</p>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                <p className={`text-xs mt-2 ${isSender ? 'text-indigo-200' : 'text-slate-500'}`}>
                  {msg.created_date ? format(new Date(msg.created_date), 'MMM d, h:mm a') : ''}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="flex gap-3">
          <Textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder="Type your message..."
            rows={2}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!reply.trim() || sendMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 self-end"
          >
            {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}