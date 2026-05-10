import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

interface TimeSlotSelectorProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  interval?: number; // Minutes interval for time selection (default: 30)
}

// Generate time options
const generateTimeOptions = (interval: number = 30) => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      options.push(timeStr);
    }
  }
  return options;
};

export function TimeSlotSelector({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  interval = 30,
}: TimeSlotSelectorProps) {
  const { t } = useLanguage();
  const timeOptions = generateTimeOptions(interval);

  // Filter end time options to be after start time
  const startHour = parseInt(startTime.split(':')[0]);
  const startMin = parseInt(startTime.split(':')[1]);
  const startTotalMin = startHour * 60 + startMin;

  const validEndTimes = timeOptions.filter((time) => {
    const [hour, min] = time.split(':');
    const totalMin = parseInt(hour) * 60 + parseInt(min);
    return totalMin > startTotalMin;
  });

  useEffect(() => {
    if (!validEndTimes.includes(endTime) && validEndTimes.length > 0) {
      onEndTimeChange(validEndTimes[0]);
    }
  }, [endTime, validEndTimes, onEndTimeChange]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-time" className="text-sm font-semibold">
            {t('mentor.schedule.startTime') || 'Start Time'}
          </Label>
          <Select value={startTime} onValueChange={onStartTimeChange}>
            <SelectTrigger id="start-time" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-48">
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="end-time" className="text-sm font-semibold">
            {t('mentor.schedule.endTime') || 'End Time'}
          </Label>
          <Select value={endTime} onValueChange={onEndTimeChange}>
            <SelectTrigger id="end-time" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-48">
              {validEndTimes.length > 0 ? (
                validEndTimes.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  {t('mentor.schedule.noValidEndTime') || 'No valid end times'}
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Duration Display */}
      <div className="bg-muted rounded-lg p-3">
        <p className="text-xs text-muted-foreground mb-1">
          {t('mentor.schedule.duration') || 'Duration'}
        </p>
        <p className="font-semibold text-sm">
          {(() => {
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);
            
            const startTotalMin = startHour * 60 + startMin;
            const endTotalMin = endHour * 60 + endMin;
            const durationMin = endTotalMin - startTotalMin;
            
            const hours = Math.floor(durationMin / 60);
            const minutes = durationMin % 60;
            
            if (hours === 0) {
              return `${minutes} ${t('mentor.schedule.minutes') || 'minutes'}`;
            }
            if (minutes === 0) {
              return `${hours} ${hours === 1 ? (t('mentor.schedule.hour') || 'hour') : (t('mentor.schedule.hours') || 'hours')}`;
            }
            return `${hours} ${hours === 1 ? (t('mentor.schedule.hour') || 'hour') : (t('mentor.schedule.hours') || 'hours')} ${minutes} ${t('mentor.schedule.minutes') || 'minutes'}`;
          })()}
        </p>
      </div>
    </div>
  );
}
