import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Video, Phone, MessageSquare, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const meetingTypes = [
  { id: "discovery", name: "Discovery Call", duration: "30 min", icon: Phone, description: "Discuss your project requirements" },
  { id: "consultation", name: "Consultation", duration: "45 min", icon: Video, description: "Detailed project planning session" },
  { id: "demo", name: "Portfolio Demo", duration: "20 min", icon: MessageSquare, description: "See examples of my work" },
];

const timeSlots = [
  "10:00 AM", "11:00 AM", "12:00 PM", 
  "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

const getNextDays = () => {
  const days = [];
  const today = new Date();
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (date.getDay() !== 0) { // Skip Sundays
      days.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
      });
    }
  }
  return days.slice(0, 6);
};

const MeetingScheduler = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  
  const days = getNextDays();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("meeting_bookings")
        .insert({
          name: formData.name,
          email: formData.email,
          meeting_type: selectedType!,
          date: selectedDate!,
          time: selectedTime!,
        });

      if (error) throw error;

      // Send email notification (fire and forget)
      supabase.functions.invoke("send-notification", {
        body: { 
          type: "meeting", 
          data: {
            name: formData.name,
            email: formData.email,
            meeting_type: meetingTypes.find(t => t.id === selectedType)?.name,
            date: selectedDate,
            time: selectedTime,
          }
        },
      }).catch(console.error);

      toast({
        title: "Meeting Scheduled!",
        description: `Your ${meetingTypes.find(t => t.id === selectedType)?.name} has been booked for ${selectedDate} at ${selectedTime}.`,
      });
      // Reset form
      setStep(1);
      setSelectedType(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error booking meeting:", error);
      toast({
        title: "Error",
        description: "Failed to book meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="schedule" className="section-padding">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium mb-4 block">Schedule a Meeting</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Let's <span className="gradient-text">Talk About Your Project</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Book a free consultation to discuss your project requirements
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto glass-card p-6 md:p-8"
        >
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Meeting Type */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-center">Select Meeting Type</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {meetingTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id);
                      setStep(2);
                    }}
                    className={`p-6 rounded-xl border-2 transition-all text-left hover:border-primary ${
                      selectedType === type.id ? "border-primary bg-primary/10" : "border-border"
                    }`}
                  >
                    <type.icon className="w-8 h-8 text-primary mb-3" />
                    <div className="font-semibold mb-1">{type.name}</div>
                    <div className="text-sm text-muted-foreground mb-2">{type.description}</div>
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Clock className="w-3 h-3" />
                      {type.duration}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-center">Select Date & Time</h3>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Select Date
                </h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {days.map((day) => (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDate(day.date)}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        selectedDate === day.date
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-xs text-muted-foreground">{day.day}</div>
                      <div className="text-lg font-bold">{day.dayNum}</div>
                      <div className="text-xs text-muted-foreground">{day.month}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Select Time (IST)
                </h4>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 px-3 rounded-lg border-2 transition-all text-sm ${
                        selectedTime === time
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep(3)}
                >
                  Continue
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Contact Details */}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <h3 className="text-lg font-semibold mb-4 text-center">Enter Your Details</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Brief description of your project (optional)"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <h4 className="font-medium mb-2">Meeting Summary</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>📅 {meetingTypes.find(t => t.id === selectedType)?.name}</p>
                  <p>🗓️ {new Date(selectedDate!).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  <p>⏰ {selectedTime} IST</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isSubmitting ? "Booking..." : "Confirm Booking"}
                  {!isSubmitting && <Check className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default MeetingScheduler;
