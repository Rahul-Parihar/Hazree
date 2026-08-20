import { Company } from '../types';

/**
 * Parses a company's shift configuration and returns an array of selectable shift labels.
 * If company has 1 shift: Returns Shift 1 (Day Shift).
 * If company has 2 shifts: Returns Shift 1 (Day Shift), Shift 2 (Night Shift) with timings.
 * If company has 3 shifts: Returns Shift 1 (Morning), Shift 2 (Evening), Shift 3 (Night).
 * If company has custom pipe-separated shiftTimings: Splits and returns those exact shifts.
 */
export function getCompanyShiftOptions(company?: Company | null): string[] {
  if (!company) {
    return ['Shift 1: 09:00 AM - 06:00 PM (9h)'];
  }

  // If company has pipe-separated shiftTimings, use them
  if (company.shiftTimings && company.shiftTimings.includes('|')) {
    const parsed = company.shiftTimings
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parsed.length > 0) {
      return parsed;
    }
  }

  const shiftCount = company.shiftCount || 1;

  if (shiftCount === 1) {
    const raw = company.shiftTimings || company.shiftType || '';
    if (raw && !raw.toLowerCase().includes('general')) {
      return [raw];
    }
    return ['Shift 1 (Day Shift): 09:00 AM - 06:00 PM (9h)'];
  }

  if (shiftCount === 2) {
    return [
      'Shift 1 (Day Shift): 08:00 AM - 08:00 PM (12h)',
      'Shift 2 (Night Shift): 08:00 PM - 08:00 AM (12h)',
    ];
  }

  if (shiftCount === 3) {
    return [
      'Shift 1 (Morning): 06:00 AM - 02:00 PM (8h)',
      'Shift 2 (Evening): 02:00 PM - 10:00 PM (8h)',
      'Shift 3 (Night): 10:00 PM - 06:00 AM (8h)',
    ];
  }

  return ['Shift 1: 09:00 AM - 06:00 PM (9h)'];
}

/**
 * Formats a raw shift string into a clean, concise badge text.
 */
export function formatShiftBadge(shift?: string): { label: string; icon: string; color: string } {
  if (!shift) {
    return { label: 'Shift 1', icon: '🌅', color: 'bg-amber-50 text-amber-800 border-amber-200' };
  }

  const lower = shift.toLowerCase();

  if (lower.includes('shift 2') && (lower.includes('night') || lower.includes('24h') || lower.includes('12h'))) {
    return {
      label: shift.includes(':') ? shift.split(':')[0] : 'Shift 2 (Night)',
      icon: '🌙',
      color: 'bg-purple-50 text-purple-800 border-purple-200',
    };
  }

  if (lower.includes('shift 2') || lower.includes('evening') || lower.includes('afternoon')) {
    return {
      label: shift.includes(':') ? shift.split(':')[0] : 'Shift 2 (Evening)',
      icon: '🌆',
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    };
  }

  if (lower.includes('shift 3') || lower.includes('night')) {
    return {
      label: shift.includes(':') ? shift.split(':')[0] : 'Shift 3 (Night)',
      icon: '🌙',
      color: 'bg-purple-50 text-purple-800 border-purple-200',
    };
  }

  if (lower.includes('shift 1') || lower.includes('morning') || lower.includes('day') || lower.includes('general')) {
    return {
      label: shift.includes(':') ? shift.split(':')[0].replace(/General Shift/i, 'Shift 1') : 'Shift 1',
      icon: '🌅',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  }

  return {
    label: shift.length > 25 ? shift.substring(0, 22) + '...' : shift,
    icon: '🕒',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  };
}

/**
 * Converts a 12-hour or 24-hour time string into total minutes from midnight.
 */
export function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr || timeStr === '--') return null;
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return null;

  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3] ? match[3].toUpperCase() : null;

  if (ampm === 'PM' && h !== 12) {
    h += 12;
  } else if (ampm === 'AM' && h === 12) {
    h = 0;
  }

  return h * 60 + m;
}

/**
 * Resolves precise shift timings (start/end minutes, start/end string) for an employee.
 */
export function resolveShiftTiming(
  assignedShift?: string,
  company?: Company | null
): {
  shiftName: string;
  shiftStart: string;
  shiftEnd: string;
  sMins: number;
  eMins: number;
} {
  const raw = (assignedShift || '').trim();
  const shiftName = raw.includes(':') ? raw.split(':')[0].trim() : (raw || 'Shift 1');

  // 1. If assignedShift has time format (e.g. "08:00 PM - 08:00 AM")
  const match = raw.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*(?:-|to)\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
  if (match) {
    const sStr = match[1].trim();
    const eStr = match[2].trim();
    const s = parseTimeToMinutes(sStr) ?? 9 * 60;
    const e = parseTimeToMinutes(eStr) ?? 18 * 60;
    return { shiftName, shiftStart: sStr, shiftEnd: eStr, sMins: s, eMins: e };
  }

  // 2. Check company shiftTimings configuration
  if (company?.shiftTimings) {
    const segments = company.shiftTimings.split('|').map((s) => s.trim()).filter(Boolean);
    const lowerRaw = raw.toLowerCase();

    for (const seg of segments) {
      const segLower = seg.toLowerCase();
      if (
        lowerRaw &&
        (segLower.includes(lowerRaw) ||
          (lowerRaw.includes('shift 2') && segLower.includes('shift 2')) ||
          (lowerRaw.includes('shift 3') && segLower.includes('shift 3')) ||
          (lowerRaw.includes('shift 1') && segLower.includes('shift 1')) ||
          (lowerRaw.includes('night') && segLower.includes('night')) ||
          (lowerRaw.includes('evening') && segLower.includes('evening')))
      ) {
        const segMatch = seg.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*(?:-|to)\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
        if (segMatch) {
          const sStr = segMatch[1].trim();
          const eStr = segMatch[2].trim();
          const s = parseTimeToMinutes(sStr) ?? 9 * 60;
          const e = parseTimeToMinutes(eStr) ?? 18 * 60;
          const name = seg.split(':')[0].trim();
          return { shiftName: name, shiftStart: sStr, shiftEnd: eStr, sMins: s, eMins: e };
        }
      }
    }
  }

  // 3. Fallbacks by standard keyword naming
  const lower = raw.toLowerCase();
  if (lower.includes('shift 2') || lower.includes('night') || lower.includes('evening')) {
    if (lower.includes('evening') || lower.includes('afternoon')) {
      return { shiftName: 'Shift 2 (Evening)', shiftStart: '02:00 PM', shiftEnd: '10:00 PM', sMins: 14 * 60, eMins: 22 * 60 };
    }
    return { shiftName: 'Shift 2 (Night)', shiftStart: '08:00 PM', shiftEnd: '08:00 AM', sMins: 20 * 60, eMins: 8 * 60 };
  }
  if (lower.includes('shift 3')) {
    return { shiftName: 'Shift 3 (Night)', shiftStart: '10:00 PM', shiftEnd: '06:00 AM', sMins: 22 * 60, eMins: 6 * 60 };
  }
  if (lower.includes('day') || lower.includes('morning')) {
    return { shiftName: 'Shift 1 (Day)', shiftStart: '08:00 AM', shiftEnd: '08:00 PM', sMins: 8 * 60, eMins: 20 * 60 };
  }

  return { shiftName: 'Shift 1 (Day Shift)', shiftStart: '09:00 AM', shiftEnd: '06:00 PM', sMins: 9 * 60, eMins: 18 * 60 };
}

/**
 * Validates whether a clock-in punch time falls within the employee's assigned shift window.
 */
export function validatePunchShiftWindow(
  punchTimeStr: string,
  assignedShift?: string,
  company?: Company | null
): {
  isValid: boolean;
  reason: string;
  status: 'Present' | 'Late';
  shiftName: string;
  shiftStart: string;
  shiftEnd: string;
} {
  const { shiftName, shiftStart, shiftEnd, sMins, eMins } = resolveShiftTiming(assignedShift, company);
  const pMins = parseTimeToMinutes(punchTimeStr);

  if (pMins === null) {
    return { isValid: true, reason: '', status: 'Present', shiftName, shiftStart, shiftEnd };
  }

  // Format 45-min early opening time
  const earliestAllowed = (sMins - 45 + 1440) % 1440;
  const eh = Math.floor(earliestAllowed / 60) % 24;
  const em = earliestAllowed % 60;
  const eampm = eh >= 12 ? 'PM' : 'AM';
  const eh12 = eh % 12 || 12;
  const earliestFmt = `${eh12 < 10 ? '0' : ''}${eh12}:${em < 10 ? '0' : ''}${em} ${eampm}`;

  if (sMins < eMins) {
    // Day Shift (e.g. 08:00 AM - 08:00 PM)
    const earlyLimit = sMins - 45;
    const lateLimit = eMins;

    if (pMins < earlyLimit) {
      return {
        isValid: false,
        reason: `Early Clock-in Rejected: Assigned shift '${shiftName}' (${shiftStart} - ${shiftEnd}) starts at ${shiftStart}. Clock-in opens at ${earliestFmt}.`,
        status: 'Present',
        shiftName,
        shiftStart,
        shiftEnd,
      };
    }

    if (pMins > lateLimit) {
      return {
        isValid: false,
        reason: `Shift Closed: Assigned shift '${shiftName}' (${shiftStart} - ${shiftEnd}) ended at ${shiftEnd}. Clock-in is closed for your shift hours.`,
        status: 'Late',
        shiftName,
        shiftStart,
        shiftEnd,
      };
    }

    const isLate = pMins > sMins + 15;
    return {
      isValid: true,
      reason: '',
      status: isLate ? 'Late' : 'Present',
      shiftName,
      shiftStart,
      shiftEnd,
    };
  } else {
    // Overnight Shift (e.g. 08:00 PM - 08:00 AM)
    const earlyLimit = (sMins - 45 + 1440) % 1440; // 1155 (07:15 PM)
    const lateLimit = eMins;                      // 480 (08:00 AM)

    const isInsideWindow = pMins >= earlyLimit || pMins <= lateLimit;

    if (!isInsideWindow) {
      return {
        isValid: false,
        reason: `Outside Shift Window: Assigned shift '${shiftName}' is active from ${shiftStart} to ${shiftEnd}. Early clock-in opens at ${earliestFmt}.`,
        status: 'Late',
        shiftName,
        shiftStart,
        shiftEnd,
      };
    }

    const onTimeCutoff = (sMins + 15) % 1440;
    const isOnTime =
      (pMins >= earlyLimit && (pMins <= onTimeCutoff || onTimeCutoff < earlyLimit)) ||
      (onTimeCutoff < earlyLimit && pMins <= onTimeCutoff);

    return {
      isValid: true,
      reason: '',
      status: isOnTime ? 'Present' : 'Late',
      shiftName,
      shiftStart,
      shiftEnd,
    };
  }
}
