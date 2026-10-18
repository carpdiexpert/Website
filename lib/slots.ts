export const BOOKING_SLOTS = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00"] as const;
export const SLOT_LABELS: Record<(typeof BOOKING_SLOTS)[number], string> = {
  "09:00": "9:00 AM", "10:30": "10:30 AM", "12:00": "12:00 PM", "13:30": "1:30 PM", "15:00": "3:00 PM", "16:30": "4:30 PM", "18:00": "6:00 PM",
};
