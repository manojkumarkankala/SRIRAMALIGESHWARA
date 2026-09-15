import type { ContactSettings } from '@/types';

export function getWhatsAppUrl(phone: string | null | undefined, message: string): string {
  const cleanPhone = (phone || '').replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppMaterialMessage(
  contact: ContactSettings | null,
  materialName: string,
  quantity?: string,
  unit?: string,
  name?: string,
  location?: string
): string {
  const businessName = contact?.business_name || 'Sri Ramligeshwara Building Materials';
  let msg = `Hello ${businessName},\n\nI am interested in:\nMaterial: ${materialName}`;
  if (quantity && unit) msg += `\nQuantity: ${quantity} ${unit}`;
  if (name) msg += `\nName: ${name}`;
  if (location) msg += `\nLocation: ${location}`;
  msg += `\n\nPlease contact me.`;
  return msg;
}

export function getWhatsAppGenericMessage(contact: ContactSettings | null): string {
  const businessName = contact?.business_name || 'Sri Ramligeshwara Building Materials';
  return `Hello ${businessName},\nI would like to enquire about building materials.`;
}

export function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Not specified';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function validateMobile(mobile: string): boolean {
  const cleaned = mobile.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

export function getAvailabilityLabel(availability: string): string {
  switch (availability) {
    case 'available': return 'Available';
    case 'out_of_stock': return 'Out of Stock';
    case 'limited_stock': return 'Limited Stock';
    default: return availability;
  }
}

export function getAvailabilityColor(availability: string): string {
  switch (availability) {
    case 'available': return 'text-emerald-400';
    case 'out_of_stock': return 'text-red-400';
    case 'limited_stock': return 'text-amber-400';
    default: return 'text-slate-400';
  }
}

export function getAvailabilityDot(availability: string): string {
  switch (availability) {
    case 'available': return 'bg-emerald-500';
    case 'out_of_stock': return 'bg-red-500';
    case 'limited_stock': return 'bg-amber-500';
    default: return 'bg-slate-500';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    case 'accepted': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    case 'declined': return 'text-red-400 bg-red-500/10 border-red-500/30';
    case 'completed': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    case 'cancelled': return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
  }
}

export function parseFeatures(features: string | null): string[] {
  if (!features) return [];
  return features.split('|').map((f) => f.trim()).filter(Boolean);
}

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function getYouTubeThumb(url: string): string {
  const id = extractYouTubeId(url);
  if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  return '';
}

export function getYouTubeEmbedUrl(url: string): string {
  const id = extractYouTubeId(url);
  if (id) return `https://www.youtube.com/embed/${id}`;
  return url;
}
