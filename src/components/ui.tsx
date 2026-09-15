import { ReactNode } from 'react';

export function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
      {message && <p className="mt-4 text-slate-400 text-sm">{message}</p>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl bg-gradient-dark border border-gold/10 overflow-hidden">
      <div className="skeleton h-48 w-full" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-5 w-2/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="flex gap-2 pt-2">
          <div className="skeleton h-9 w-24 rounded-lg" />
          <div className="skeleton h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: React.ElementType;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gold/60" />
      </div>
      <h3 className="text-gold font-semibold text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-md">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function SectionHeading({
  title,
  subtitle,
  centered = true,
}: {
  title: string;
  subtitle?: string;
  centered?: boolean;
}) {
  return (
    <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
      <div className={`flex items-center gap-4 ${centered ? 'justify-center' : ''}`}>
        <div className="h-px w-12 bg-gradient-gold" />
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient-gold tracking-tight">
          {title}
        </h2>
        <div className="h-px w-12 bg-gradient-gold" />
      </div>
      {subtitle && (
        <p className="mt-4 text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    accepted: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    declined: 'text-red-400 bg-red-500/10 border-red-500/30',
    completed: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    cancelled: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  };

  const label = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
        colors[status] || colors.cancelled
      }`}
    >
      {label}
    </span>
  );
}
