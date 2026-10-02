import { getSites } from './dataSource';

function reading(value: number, unit: string, digits = 1) {
  return `${value.toFixed(digits)}${unit ? ` ${unit}` : ''}`;
}

export async function getAnswer(question: string): Promise<string> {
  const sites = await getSites();
  const normalized = question.trim().toLowerCase();
  const sports = sites.find((site) => site.id === 'sports');
  const canteen = sites.find((site) => site.id === 'canteen');
  const admin = sites.find((site) => site.id === 'admin');
  const hostel = sites.find((site) => site.id === 'hostel');

  if (normalized.includes('unsafe') || normalized.includes('problem') || normalized.includes('risk')) {
    return sports
      ? `${sports.name} is unsafe right now. Turbidity is ${reading(sports.latest.turb, 'NTU')} and TDS is ${Math.round(sports.latest.tds)} ppm, both outside their safe ranges. Please use another drinking-water point until it is checked.`
      : 'No unsafe site is present in the latest readings.';
  }

  if (normalized.includes('canteen')) {
    return canteen
      ? `The Canteen Cooler is stable and safe. Its latest pH is ${canteen.latest.ph.toFixed(2)}, TDS is ${Math.round(canteen.latest.tds)} ppm, and turbidity is ${reading(canteen.latest.turb, 'NTU')}. The 24-hour trend shows only small normal variations.`
      : 'I could not find the Canteen Cooler in the current site list.';
  }

  if (normalized.includes('best') || normalized.includes('cleanest')) {
    return admin
      ? `${admin.name} currently has the strongest overall readings: pH ${admin.latest.ph.toFixed(2)}, TDS ${Math.round(admin.latest.tds)} ppm, and turbidity ${reading(admin.latest.turb, 'NTU')}. All five parameters are comfortably within range.`
      : 'The current data does not identify a best-performing site.';
  }

  if (normalized.includes('hostel') || normalized.includes('watch')) {
    return hostel
      ? `${hostel.name} is on watch. Its pH is ${hostel.latest.ph.toFixed(2)} and turbidity is ${reading(hostel.latest.turb, 'NTU')}, both moving toward their limits. It is not unsafe yet, but it should be monitored closely.`
      : 'No watch-level site is present in the latest readings.';
  }

  if (normalized.includes('safe') || normalized.includes('all site') || normalized.includes('summary')) {
    const safeNames = sites.filter((site) => site.status === 'safe').map((site) => site.name);
    return `${safeNames.join(' and ')} are safe. Hostel Wing A is on watch, while Sports Complex is unsafe. I can explain any site or parameter in more detail.`;
  }

  return 'I can compare campus sites, explain current pH, TDS, turbidity, dissolved oxygen, or temperature readings, and point out which locations need attention. Try asking for a site summary.';
}

/*
 * TODO: Replace only the body of getAnswer() with the approved LLM request.
 * Keep provider credentials in environment variables and never in this file.
 * The Assistant screen already depends only on getAnswer(question).
 */

