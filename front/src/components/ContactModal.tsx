// src/components/ContactModal.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query'; // Import useMutation

interface Student {
  _id: string; // Changed from 'id' to '_id' to match the backend convention
  name: string;
  email: string;
  department: string;
}

interface ContactModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

// Function to send email via API
const sendEmail = async (studentId: string, emailData: { subject: string; body: string }) => {
  const res = await fetch(`http://localhost:3000/email/${studentId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(emailData),
  });

  if (res.status === 401) {
    // Handle unauthorized access, e.g., redirect to login
    toast({ title: 'Login Required', description: 'You need to log in to send emails.', className: 'bg-orange-100 text-orange-800 border-l-4 border-orange-500' });
    setTimeout(() => {
      window.location.href = '/Login';
    }, 2000);
    throw new Error('Login required');
  }

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to send email');
  }
  return res.json();
};

const ContactModal: React.FC<ContactModalProps> = ({ student, isOpen, onClose }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Initialize useMutation for sending email
  const emailMutation = useMutation({
    mutationFn: (data: { studentId: string; emailData: { subject: string; body: string } }) =>
      sendEmail(data.studentId, data.emailData),
    onSuccess: () => {
      toast({ title: 'Success', description: `Your message has been sent to ${student?.name}` });
      setSubject('');
      setMessage('');
      onClose();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to send email.' });
    },
  });

  // Clear fields when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSubject('');
      setMessage('');
    }
  }, [isOpen]);

  if (!student) return null;

  const handleSendMessage = () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both subject and message",
        variant: "destructive",
      });
      return;
    }

    // Call the mutation to send the email
    emailMutation.mutate({
      studentId: student._id, // Use _id as per backend
      emailData: { subject, body: message }, // 'body' as per your API
    });
  };

  const handleClose = () => {
    setSubject('');
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2 text-blue-600" />
            Contact {student.name}
          </DialogTitle>
          <DialogDescription>
            Send a message to {student.name} ({student.email})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={emailMutation.isPending} // Disable input while sending
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              disabled={emailMutation.isPending} // Disable textarea while sending
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={emailMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSendMessage}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={emailMutation.isPending} // Disable button while sending
          >
            <Send className="h-4 w-4 mr-2" />
            {emailMutation.isPending ? 'Sending...' : 'Send Message'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
;

export default ContactModal;