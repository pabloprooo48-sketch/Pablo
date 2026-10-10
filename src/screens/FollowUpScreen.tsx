import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getWhatsAppUrl, formatCurrency } from '../utils/formatters';

export const FollowUpScreen: React.FC = () => {
  const { followUps, snoozeFollowUp, showToast, businessProfile } = useApp();

  // Local message state for immediate inline editing
  const [messages, setMessages] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    followUps.forEach(fu => {
      map[fu.id] = fu.suggestedMessage;
    });
    return map;
  });

  const handleMessageChange = (id: string, text: string) => {
    setMessages(prev => ({ ...prev, [id]: text }));
  };

  const handleSendWhatsApp = (item: typeof followUps[0]) => {
    const text = messages[item.id] || item.suggestedMessage;
    const url = getWhatsAppUrl(item.clientPhone, text);
    window.open(url, '_blank');
    showToast(`Abriendo WhatsApp para ${item.clientName}...`);
  };

  const handleSnooze = (item: typeof followUps[0], days: number) => {
    snoozeFollowUp(item.id, days);
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-4 pb-12 gap-4">
      {/* Status & Context Banner */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#ddece2] text-[#121e18] shadow-xs border border-[#d8e6dc]">
        <div className="w-9 h-9 rounded-lg bg-[#d8e6dc] flex items-center justify-center flex-shrink-0 text-[#005232]">
          <span className="material-symbols-outlined text-[22px]">notification_important</span>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-headline-sm text-[#121e18] uppercase tracking-tight">
            Seguimiento de Respuestas
          </span>
          <p className="font-body-sm text-[#3f4942] leading-snug">
            Alertas automáticas de clientes que vieron el presupuesto y no han respondido tras 2 o más días.
          </p>
        </div>
      </div>

      {/* Priority Follow-Up Card: Juan García Ramos */}
      {followUps.map(fu => {
        const isPriority = fu.type === 'priority_viewed';
        const isSnoozed = Boolean(fu.snoozedUntil);

        return (
          <article
            key={fu.id}
            className={`flex flex-col rounded-xl bg-white shadow-sm overflow-hidden border border-[#e4e8e3] transition-all ${
              isSnoozed ? 'opacity-60' : ''
            }`}
          >
            {/* Visual Alert Strip */}
            <div
              className={`px-4 py-2.5 flex items-center justify-between ${
                isPriority
                  ? 'bg-[#ffdf9d] text-[#251a00]'
                  : 'bg-[#ddece2] text-[#3f4942]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="material-symbols-outlined text-[20px] flex-shrink-0"
                  style={{ fontVariationSettings: isPriority ? "'FILL' 1" : undefined }}
                >
                  {isPriority ? 'visibility' : 'mark_email_unread'}
                </span>
                <span className="font-label-md truncate font-semibold">
                  {fu.snoozedUntil ? `Pospuesto: ${fu.snoozedUntil}` : fu.statusBadge}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full font-label-sm uppercase tracking-wide flex-shrink-0 ${
                  isPriority
                    ? 'bg-[#fcc019] text-[#6c5000] font-bold'
                    : 'bg-[#d8e6dc] text-[#121e18]'
                }`}
              >
                {isPriority ? 'Prioritario' : 'Pendiente'}
              </span>
            </div>

            {/* Client Header & Quote Metadata */}
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-headline-md text-[#121e18] tracking-tight truncate">
                      {fu.clientName}
                    </span>
                    {isPriority && (
                      <span
                        className="material-symbols-outlined text-[#005232] text-[18px]"
                        title="Cliente habitual verificado"
                      >
                        verified
                      </span>
                    )}
                  </div>
                  <a
                    className="font-body-sm text-[#3f4942] flex items-center gap-1 hover:text-[#005232] transition-colors"
                    href={`tel:${fu.clientPhone}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">call</span>
                    {fu.clientPhone}
                  </a>
                </div>

                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="font-label-sm text-[#3f4942] uppercase">
                    Presupuesto
                  </span>
                  <span className="font-label-md text-[#005232] font-semibold">
                    {fu.quoteRef}
                  </span>
                  <span className="font-currency-display text-[#121e18] mt-0.5 leading-none">
                    {formatCurrency(fu.amount)}
                  </span>
                </div>
              </div>

              {/* Quick Context Box */}
              <div className="p-2.5 rounded-lg bg-[#e3f1e7] flex items-center justify-between text-[#3f4942] border border-[#ddece2]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#785900]">
                    {isPriority ? 'timer' : 'schedule_send'}
                  </span>
                  <span className="font-body-sm">{fu.lastActivity}</span>
                </div>
                {isPriority ? (
                  <span className="font-label-sm text-[#005232] flex items-center gap-0.5 font-bold">
                    <span className="material-symbols-outlined text-[14px]">done_all</span> Leído
                  </span>
                ) : (
                  <span className="font-label-sm text-[#6c5000] bg-[#ddece2] px-2 py-0.5 rounded-full flex items-center gap-0.5 font-semibold">
                    <span className="material-symbols-outlined text-[14px]">visibility_off</span> Sin clics
                  </span>
                )}
              </div>

              {/* Ready-to-send Message Area */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className="font-label-sm text-[#3f4942] uppercase tracking-wider font-semibold"
                    htmlFor={`msg-${fu.id}`}
                  >
                    {isPriority ? 'Mensaje sugerido (editable)' : 'Mensaje de cortesía (editable)'}
                  </label>
                  <span className="font-label-sm text-[#005232] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">edit_note</span> Toca para editar
                  </span>
                </div>
                <div className="relative rounded-xl bg-[#e9f7ed] p-3 shadow-inner border border-[#ddece2]">
                  <textarea
                    id={`msg-${fu.id}`}
                    rows={3}
                    value={messages[fu.id] ?? fu.suggestedMessage}
                    onChange={e => handleMessageChange(fu.id, e.target.value)}
                    className="w-full bg-transparent font-body-md text-[#121e18] focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Tactile Action Group */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => handleSendWhatsApp(fu)}
                  className="w-full h-[52px] rounded-xl bg-[#005232] hover:bg-[#1d6b47] active:scale-[0.985] text-white font-label-lg flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  type="button"
                >
                  {isPriority ? (
                    <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.32C9.37 7.32 9.11 7.38 8.88 7.63C8.65 7.88 8.02 8.47 8.02 9.68C8.02 10.89 8.9 12.06 9.02 12.22C9.14 12.38 10.76 14.88 13.23 15.95C13.82 16.2 14.28 16.36 14.64 16.47C15.23 16.66 15.77 16.63 16.2 16.57C16.67 16.5 17.65 15.98 17.85 15.41C18.06 14.85 18.06 14.37 18 14.27C17.94 14.17 17.78 14.11 17.54 13.99C17.3 13.87 16.12 13.29 15.9 13.21C15.68 13.13 15.52 13.09 15.36 13.33C15.2 13.57 14.74 14.11 14.6 14.27C14.46 14.43 14.32 14.45 14.08 14.33C13.84 14.21 13.07 13.96 12.16 13.15C11.45 12.52 10.97 11.74 10.83 11.5C10.69 11.26 10.82 11.13 10.94 11.01C11.05 10.9 11.19 10.72 11.31 10.58C11.43 10.44 11.47 10.34 11.55 10.18C11.63 11.02 11.59 9.88 11.53 9.76C11.47 9.64 11.01 8.52 10.82 8.06C10.63 7.61 10.44 7.67 10.3 7.67C10.16 7.67 10 7.66 9.84 7.66C9.68 7.66 9.53 7.32 9.53 7.32Z" />
                    </svg>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  )}
                  <span>
                    {isPriority ? 'Enviar por WhatsApp' : 'Reenviar recordatorio WhatsApp'}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSnooze(fu, isPriority ? 2 : 1)}
                    className="h-12 rounded-xl bg-[#e3f1e7] hover:bg-[#ddece2] active:scale-[0.985] text-[#121e18] font-label-md flex items-center justify-center gap-1.5 transition-all border border-[#ddece2]"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#3f4942]">
                      {isPriority ? 'snooze' : 'schedule'}
                    </span>
                    <span>{isPriority ? 'Posponer 2 días' : 'Avisar mañana'}</span>
                  </button>

                  <a
                    className="h-12 rounded-xl bg-[#e3f1e7] hover:bg-[#ddece2] active:scale-[0.985] text-[#121e18] font-label-md flex items-center justify-center gap-1.5 transition-all border border-[#ddece2]"
                    href={`tel:${fu.clientPhone}`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#005232]">
                      {isPriority ? 'phone_in_talk' : 'phone'}
                    </span>
                    <span>{isPriority ? 'Llamar' : 'Llamar al cliente'}</span>
                  </a>
                </div>
              </div>
            </div>
          </article>
        );
      })}

      {/* Metrics / Health Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-white shadow-sm flex flex-col justify-between border border-[#e4e8e3]">
          <div className="flex items-center justify-between text-[#3f4942]">
            <span className="font-label-sm uppercase font-semibold">Tasa de Cierre</span>
            <span className="material-symbols-outlined text-[#005232] text-[20px]">
              trending_up
            </span>
          </div>
          <div className="mt-2">
            <span className="font-currency-display text-[#005232]">
              {businessProfile.closingRate}%
            </span>
            <p className="font-body-sm text-[#3f4942] mt-0.5 leading-tight">
              Con seguimiento en &lt; 48h
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white shadow-sm flex flex-col justify-between border border-[#e4e8e3]">
          <div className="flex items-center justify-between text-[#3f4942]">
            <span className="font-label-sm uppercase font-semibold">En espera</span>
            <span className="material-symbols-outlined text-[#785900] text-[20px]">
              pending_actions
            </span>
          </div>
          <div className="mt-2">
            <span className="font-currency-display text-[#121e18]">
              {formatCurrency(2540)}
            </span>
            <p className="font-body-sm text-[#3f4942] mt-0.5 leading-tight">
              {followUps.length} propuestas activas
            </p>
          </div>
        </div>
      </div>

      {/* Technical Note & Automation Footer */}
      <div className="p-4 rounded-xl bg-[#e3f1e7] flex items-start gap-3 border border-[#ddece2]">
        <span className="material-symbols-outlined text-[#005232] text-[22px] flex-shrink-0 mt-0.5">
          terminal
        </span>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-label-md text-[#121e18]">
            Sincronización de eventos de apertura
          </span>
          <p className="font-body-sm text-[#3f4942] leading-relaxed">
            Preparado para automatización de avisos por correo electrónico con webhook / cron de Supabase o PWA local.
          </p>
        </div>
      </div>
    </div>
  );
};
