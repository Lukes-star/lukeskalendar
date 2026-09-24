import { Appointment } from '@/types/calendar';
import { STATUS_CONFIG } from '@/lib/calendar';

interface AppointmentPillProps {
  appointment: Appointment;
  onClick: (e: React.MouseEvent, appointment: Appointment) => void;
  compact?: boolean;
}

export function AppointmentPill({ appointment, onClick, compact = false }: AppointmentPillProps) {
  const config = STATUS_CONFIG[appointment.status];
  const plate = appointment.vehicle?.plate;

  return (
    <div
      onClick={(e) => onClick(e, appointment)}
      title={`${appointment.clientName || 'Termin'} - ${appointment.serviceName}${plate ? ` - ${plate}` : ''}`}
      aria-label={`${appointment.clientName || 'Termin'}, ${appointment.serviceName}`}
      className={`press flex items-start gap-1.5 rounded-lg px-1.5 cursor-pointer overflow-hidden transition-all hover:brightness-125 ${
        compact ? 'py-1 min-h-[25px]' : 'py-1.5 min-h-[34px] sm:min-h-[38px]'
      }`}
      style={{
        backgroundColor: config.bg,
        borderLeft: `3px solid ${config.dot}`,
      }}
    >
      <span
        className={`flex-shrink-0 rounded-md flex items-center justify-center font-extrabold ${compact ? 'w-4 h-4 text-[9px] mt-0' : 'w-5 h-5 text-[10px] mt-0.5'}`}
        style={{ color: '#ffffff', backgroundColor: `${config.dot}25`, boxShadow: `inset 0 0 0 1px ${config.dot}50` }}
      >
        {(appointment.clientName || 'T').charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <div className="flex items-baseline gap-1 min-w-0">
          {appointment.startTime && (
            <span className="text-[9px] sm:text-[10px] font-extrabold tabular-nums flex-shrink-0 text-white" style={{ color: '#ffffff' }}>
              {appointment.startTime}
            </span>
          )}
          <span className="text-[10px] sm:text-[11px] font-extrabold truncate max-[420px]:hidden text-white" style={{ color: '#ffffff' }}>
            {appointment.clientName || 'Termin'}
          </span>
          <span className="hidden max-[420px]:inline text-[10px] font-extrabold text-white" style={{ color: '#ffffff' }}>
            {(appointment.clientName || 'Termin').charAt(0).toUpperCase()}
          </span>
        </div>
        {!compact && (
          <p className="text-[9px] sm:text-[10px] font-semibold truncate mt-0.5 opacity-90 text-white" style={{ color: '#ffffff' }}>
            {appointment.serviceName || 'Bez usluge'}{plate ? ` · ${plate}` : ''}
          </p>
        )}
      </div>
    </div>
  );
}
