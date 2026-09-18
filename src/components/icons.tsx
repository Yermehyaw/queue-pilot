import {
  Banknote, IdCard, LineChart, CreditCard, FileText, GraduationCap, Cross, FlaskConical,
  Landmark, Instagram, Facebook, Linkedin, Music2, Twitter, type LucideIcon,
} from 'lucide-react';
import type { SocialChannel } from '../types';

export function serviceIcon(name: string): LucideIcon {
  switch (name) {
    case 'banknote': return Banknote;
    case 'idcard': return IdCard;
    case 'chart': return LineChart;
    case 'card': return CreditCard;
    case 'file': return FileText;
    case 'grad': return GraduationCap;
    case 'cross': return Cross;
    case 'flask': return FlaskConical;
    default: return Landmark;
  }
}

export const CHANNEL_META: Record<SocialChannel, { label: string; color: string; bg: string; Icon: LucideIcon }> = {
  instagram: { label: 'Instagram', color: 'text-pink-600', bg: 'bg-pink-100', Icon: Instagram },
  x: { label: 'X', color: 'text-slate-900', bg: 'bg-slate-200', Icon: Twitter },
  facebook: { label: 'Facebook', color: 'text-blue-600', bg: 'bg-blue-100', Icon: Facebook },
  linkedin: { label: 'LinkedIn', color: 'text-sky-700', bg: 'bg-sky-100', Icon: Linkedin },
  tiktok: { label: 'TikTok', color: 'text-slate-900', bg: 'bg-slate-200', Icon: Music2 },
};
