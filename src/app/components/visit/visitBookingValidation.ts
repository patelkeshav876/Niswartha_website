export type VisitBookingFormState = {
  name: string;
  email: string;
  phone: string;
  orgType: 'NGO' | 'College' | 'School' | 'Corporate' | 'Individual' | '';
  orgName: string;
  userLocation: string;
  visitorCount: number;
  visitorNames: string[];
  ageGroup: string;
  gender: string;
  durationMinutes: string;
  purpose: string;
  idNumber: string;
  idDocumentDataUrl: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  phoneOtpToken?: string;
  phoneOtpVerified?: boolean;
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateVisitBookingForm(
  f: VisitBookingFormState,
  opts: { selectedDateIso: string; selectedSlotId: string | null; todayIso: string },
): string | null {
  if (!opts.selectedDateIso) return 'Choose a visit date';
  if (opts.selectedDateIso < opts.todayIso) return 'Cannot book a past date';
  if (!opts.selectedSlotId) return 'Select a time slot';

  if (!f.name.trim()) return 'Name is required';
  if (!f.email.trim() || !emailRe.test(f.email.trim())) return 'Valid email is required';
  if (!f.phone.trim() || f.phone.replace(/\D/g, '').length < 10) return 'Valid 10-digit mobile number is required';

  if (!f.orgType) return 'Select organization type';
  if (f.orgType !== 'Individual' && !f.orgName.trim()) {
    return 'Organization name is required';
  }

  if (!f.userLocation.trim()) return 'Your city / location is required';

  const n = Math.max(1, f.visitorCount);
  if (n < 1) return 'Visitor count must be at least 1';
  if (!f.purpose) return 'Select visit purpose';

  if (f.visitorNames.length !== n) return 'Enter each visitor name';
  for (let i = 0; i < n; i++) {
    if (!f.visitorNames[i]?.trim()) return `Visitor ${i + 1} name is required`;
  }

  if (!f.emergencyContactName.trim()) return 'Emergency contact name is required';
  if (!f.emergencyContactPhone.trim()) return 'Emergency contact phone is required';

  return null;
}
