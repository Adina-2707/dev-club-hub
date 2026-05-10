import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { TimeSlotSelector } from './TimeSlotSelector';

interface ScheduleSlot {
  id: string;
  title?: string;
  startTime: string;
  endTime: string;
  mentorId: string;
}

interface MentorScheduleProps {
  mentorId: string;
  isMentor?: boolean;
}

export default function MentorSchedule({ mentorId, isMentor = false }: MentorScheduleProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [slotTitle, setSlotTitle] = useState('');

  const isOwnMentor = isMentor && user?.id === mentorId;

  const isOverlappingSlot = (start: Date, end: Date) =>
    slots.some((slot) => {
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);
      return start < slotEnd && end > slotStart;
    });

  // Fetch schedule slots
  useEffect(() => {
    fetchScheduleSlots();
  }, [mentorId]);

  const fetchScheduleSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get(`/mentor-schedule/${mentorId}`);
      setSlots(Array.isArray(response) ? response : response.data || []);
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!selectedDate || !startTime || !endTime) {
      setError(t('mentor.schedule.fillFields') || 'Please fill in all fields');
      return;
    }

    try {
      setError(null);
      const [startHour, startMin] = startTime.split(':');
      const [endHour, endMin] = endTime.split(':');

      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(parseInt(startHour), parseInt(startMin), 0, 0);

      const endDateTime = new Date(selectedDate);
      endDateTime.setHours(parseInt(endHour), parseInt(endMin), 0, 0);

      if (endDateTime <= startDateTime) {
        setError(t('mentor.schedule.invalidTime') || 'End time must be after start time');
        return;
      }

      if (isOverlappingSlot(startDateTime, endDateTime)) {
        setError(
          t('mentor.schedule.overlapError') || 'This slot overlaps with an existing slot'
        );
        return;
      }

      const response = await apiService.post('/mentor-schedule', {
        title: slotTitle || undefined,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });

      setSlots((prevSlots) =>
        [...prevSlots, response].sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
      );
      setIsDialogOpen(false);
      setSlotTitle('');
      setStartTime('09:00');
      setEndTime('10:00');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create schedule slot');
      console.error('Error creating slot:', err);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      setError(null);
      await apiService.delete(`/mentor-schedule/${slotId}`);
      setSlots(slots.filter(s => s.id !== slotId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete slot');
      console.error('Error deleting slot:', err);
    }
  };

  // Get slots for selected date
  const slotsForSelectedDate = selectedDate
    ? slots.filter(slot => {
        const slotDate = new Date(slot.startTime).toDateString();
        const selectedDateStr = selectedDate.toDateString();
        return slotDate === selectedDateStr;
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t('mentor.schedule.selectDate') || 'Select Date'}
          </h3>
          <Card className="p-4">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="flex justify-center"
            />
          </Card>

          {isOwnMentor && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="w-full"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('mentor.schedule.addSlot') || 'Add Time Slot'}
            </Button>
          )}
        </div>

        {/* Time Slots Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('mentor.schedule.availableSlots') || 'Available Time Slots'}
          </h3>

          {loading ? (
            <Card className="p-6 text-center text-muted-foreground">
              {t('common.loading') || 'Loading...'}
            </Card>
          ) : slotsForSelectedDate.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              {t('mentor.schedule.noSlots') || 'No available slots for this date'}
            </Card>
          ) : (
            <div className="space-y-3">
              {slotsForSelectedDate.map((slot) => {
                const startDateTime = new Date(slot.startTime);
                const endDateTime = new Date(slot.endTime);
                const startTimeStr = startDateTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                });
                const endTimeStr = endDateTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                });

                return (
                  <Card
                    key={slot.id}
                    className="p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {slot.title && (
                          <h4 className="font-medium text-sm mb-1">{slot.title}</h4>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {startTimeStr} - {endTimeStr}
                          </span>
                        </div>
                      </div>

                      {isOwnMentor && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="ml-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200 p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </Card>
      )}

      {/* Add Slot Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {t('mentor.schedule.addNewSlot') || 'Add New Consultation Slot'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold mb-2 block">
                {t('mentor.schedule.selectedDate') || 'Selected Date'}
              </Label>
              <div className="px-4 py-2 bg-muted rounded-md text-sm">
                {selectedDate?.toLocaleDateString()}
              </div>
            </div>

            <div>
              <Label htmlFor="slot-title" className="text-base font-semibold mb-2 block">
                {t('mentor.schedule.slotTitle') || 'Slot Title'}{' '}
                <span className="text-xs text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="slot-title"
                placeholder="e.g., Frontend Consultation, Code Review"
                value={slotTitle}
                onChange={(e) => setSlotTitle(e.target.value)}
                className="text-sm"
              />
            </div>

            <TimeSlotSelector
              startTime={startTime}
              endTime={endTime}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
            />

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setError(null);
                }}
                className="flex-1"
              >
                {t('common.cancel') || 'Cancel'}
              </Button>
              <Button onClick={handleAddSlot} className="flex-1">
                {t('mentor.schedule.create') || 'Create Slot'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
