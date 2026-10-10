import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, getWhatsAppUrl } from '../utils/formatters';

export const QuoteDetailScreen: React.FC = () => {
  const {
    quotes,
    selectedQuoteId,
    businessProfile,
    setActiveTab,
    navigateToEdit,
    updateQuote,
    showToast,
  } = useApp();

  const currentQuote = useApp().quotes.find(q => q.id === selectedQuoteId) || quotes[0];

  const netSubtotal = useMemo(() => {
    return currentQuote.items.reduce(
      (sum, item) => sum + (item.subtotal || item.measurement * item.unitPrice),
      0
    );
  }, [currentQuote]);

  const ivaAmount = useMemo(() => {
    return Number((netSubtotal * ((currentQuote.ivaRate || 21) / 100)).toFixed(2));
  }, [netSubtotal, currentQuote.ivaRate]);

  const grandTotal = useMemo(() => {
    return Number((netSubtotal + ivaAmount).toFixed(2));
  }, [netSubtotal, ivaAmount]);

  const defaultShareUrl = `https://propuestasrapidas.es/p/${currentQuote.id.replace('quote-', '')}`;
  const defaultMessage = `Hola ${currentQuote.clientName}, te paso el presupuesto para los trabajos de ${currentQuote.conceptSummary || 'reformas'}: ${defaultShareUrl}. Cualquier duda me dices. ${businessProfile.name}`;

  const [messageText, setMessageText] = useState(
    currentQuote.customMessage || defaultMessage
  );
  const [copySuccess, setCopySuccess] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState(false);

  const resetDefaultMessage = () => {
    setMessageText(defaultMessage);
    showToast('Mensaje restablecido');
  };

  const markAsSent = () => {
    updateQuote(currentQuote.id, {
      status: 'pending',
      statusLabel: 'Enviado',
      statusType: 'sent',
    });
    setStatusFeedback(true);
    setTimeout(() => {
      setStatusFeedback(false);
    }, 4000);
  };

  const handleSendViaWhatsApp = () => {
    const waUrl = getWhatsAppUrl(currentQuote.clientPhone, messageText);
    markAsSent();
    window.open(waUrl, '_blank');
    showToast('Abriendo WhatsApp y presupuesto marcado como Enviado');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(defaultShareUrl);
      setCopySuccess(true);
      showToast('Enlace de presupuesto copiado al portapapeles');
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      showToast('Enlace copiado');
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Presupuesto ${currentQuote.ref} - ${businessProfile.name}`,
          text: messageText,
          url: defaultShareUrl,
        });
        markAsSent();
      } catch {
        // Share cancelled or dismissed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleAcceptProposal = () => {
    updateQuote(currentQuote.id, {
      status: 'accepted',
      statusLabel: 'Aceptado',
      statusType: 'accepted',
    });
    showToast('¡Presupuesto marcado como Aceptado! Listo para obra');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto pb-36">
      {/* Top Action & Status bar */}
      <div className="px-4 pt-3 flex items-center justify-between">
        <button
          onClick={() => navigateToEdit(currentQuote.id)}
          className="flex items-center gap-1.5 text-[#3f4942] hover:text-[#005232] transition-colors py-2 active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">edit_note</span>
          <span className="font-label-md">Volver a edición</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdf9d] text-[#5b4300] font-label-sm uppercase tracking-wider shadow-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#f9bd14] inline-block animate-pulse"></span>
          <span>
            {currentQuote.status === 'accepted' ? 'Aceptado para obra' : 'Listo para enviar'}
          </span>
        </div>
      </div>

      {/* Official Estimate Invoice Sheet */}
      <div className="px-4 mt-3">
        <div className="w-full bg-white rounded-xl shadow-md p-5 flex flex-col relative overflow-hidden border border-[#ddece2]">
          {/* Subtle top decoration watermark */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#ddece2]/50 to-transparent pointer-events-none rounded-bl-full"></div>

          {/* Trade Identity Header */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#ddece2]">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#005232] text-[24px]">
                  format_paint
                </span>
                <span className="font-headline-sm text-[#121e18] uppercase tracking-tight truncate font-bold">
                  {businessProfile.name}
                </span>
              </div>
              <span className="font-body-sm text-[#3f4942] mt-1">
                CIF: {businessProfile.cif}
              </span>
              <span className="font-body-sm text-[#3f4942]">
                Tel: {businessProfile.phone} • {businessProfile.city}, CP {businessProfile.postalCode}
              </span>
            </div>

            <div className="w-12 h-12 rounded-lg bg-[#e3f1e7] flex items-center justify-center shrink-0 text-[#005232]">
              <span
                className="material-symbols-outlined text-[28px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="rounded-lg bg-[#e9f7ed] p-3.5 my-3 grid grid-cols-2 gap-y-2 gap-x-4 border border-[#ddece2]">
            <div>
              <span className="font-label-sm text-[#3f4942] block uppercase">Nº Documento</span>
              <span className="font-label-lg text-[#121e18] font-bold">{currentQuote.ref}</span>
            </div>
            <div>
              <span className="font-label-sm text-[#3f4942] block uppercase">Fecha Emisión</span>
              <span className="font-body-md text-[#121e18]">{currentQuote.dateCreated}</span>
            </div>
            <div>
              <span className="font-label-sm text-[#3f4942] block uppercase">Destinatario</span>
              <span className="font-label-lg text-[#121e18] truncate block font-semibold">
                {currentQuote.clientName}
              </span>
            </div>
            <div>
              <span className="font-label-sm text-[#3f4942] block uppercase">Validez Oferta</span>
              <span className="font-body-md text-[#005232] font-bold">
                {currentQuote.validityDays} días naturales
              </span>
            </div>
          </div>

          {/* Line items table */}
          <div className="mt-2 flex flex-col">
            <div className="flex justify-between items-center py-2 px-1 border-b border-[#ddece2]">
              <span className="font-label-sm uppercase text-[#3f4942] font-bold">
                Concepto / Partida
              </span>
              <span className="font-label-sm uppercase text-[#3f4942] font-bold">
                Subtotal
              </span>
            </div>

            <div className="flex flex-col gap-1.5 pt-2">
              {currentQuote.items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white hover:bg-[#e9f7ed] transition-colors border border-transparent hover:border-[#ddece2]"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-body-lg text-[#121e18] leading-tight font-medium">
                      {item.title}
                    </span>
                    <span className="font-body-sm text-[#3f4942]">
                      {item.description || item.category} ({item.measurement} {item.unit})
                    </span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="font-currency-item text-[#121e18]">
                      {formatCurrency(item.subtotal || item.measurement * item.unitPrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="mt-4 pt-3 p-3.5 rounded-lg bg-[#e3f1e7] flex flex-col gap-1.5 border border-[#ddece2]">
              <div className="flex justify-between items-center text-[#3f4942]">
                <span className="font-body-sm">Base Imponible</span>
                <span className="font-currency-item text-[#3f4942]">
                  {formatCurrency(netSubtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#3f4942]">
                <span className="font-body-sm">IVA ({currentQuote.ivaRate || 21}%)</span>
                <span className="font-currency-item text-[#3f4942]">
                  {formatCurrency(ivaAmount)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-[#ddece2]">
                <div className="flex flex-col">
                  <span className="font-label-lg text-[#121e18] font-bold uppercase">
                    Total Presupuesto
                  </span>
                  <span className="font-label-sm text-[#3f4942]">Impuestos incluidos</span>
                </div>
                <span className="font-currency-display text-[#005232] font-bold">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Legal / Validity notice */}
            <div className="mt-4 p-3 rounded-lg bg-[#e9f7ed] border border-[#ddece2]">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#6f7a72] text-[18px] shrink-0 mt-0.5">
                  info
                </span>
                <p className="font-body-sm text-[#3f4942] leading-relaxed">
                  Presupuesto válido durante {currentQuote.validityDays} días naturales. Precios con IVA desglosado. Pago según condiciones acordadas antes del inicio de los trabajos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje al cliente Section */}
      <div className="px-4 mt-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-headline-sm text-[#121e18]">Mensaje al cliente</span>
          <span className="font-label-sm text-[#005232] flex items-center gap-1 font-bold">
            <span className="material-symbols-outlined text-[16px]">touch_app</span>
            Editable
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-xs p-3.5 flex flex-col gap-2 border border-[#e4e8e3]">
          <div className="flex items-center gap-2 pb-1 text-[#3f4942] border-b border-[#ddece2]">
            <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
            <span className="font-label-sm font-semibold">
              Texto preparado para WhatsApp / SMS
            </span>
          </div>

          <textarea
            id="proposalMessage"
            rows={4}
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            className="w-full bg-[#e9f7ed] rounded-lg p-3 text-[#121e18] font-body-md resize-none outline-none focus:bg-white focus:ring-1 focus:ring-[#005232] border border-[#ddece2] transition-all leading-normal"
          />

          <div className="flex justify-between items-center pt-1 text-[#3f4942]">
            <span className="font-label-sm">Destino: {currentQuote.clientPhone}</span>
            <button
              onClick={resetDefaultMessage}
              className="font-label-sm text-[#005232] hover:underline cursor-pointer font-bold"
            >
              Restablecer
            </button>
          </div>
        </div>

        {/* Quick sharing action row */}
        <div className="grid grid-cols-2 gap-2">
          <button
            id="copyBtn"
            onClick={handleCopyLink}
            className={`h-12 rounded-xl flex items-center justify-center gap-2 font-label-md active:scale-95 transition-all cursor-pointer border ${
              copySuccess
                ? 'bg-[#a6f3c5] text-[#002111] border-[#8bd6aa] font-semibold'
                : 'bg-[#e3f1e7] text-[#121e18] border-[#ddece2]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {copySuccess ? 'done' : 'link'}
            </span>
            <span>{copySuccess ? '¡Copiado!' : 'Copiar enlace'}</span>
          </button>

          <button
            onClick={handleShareNative}
            className="h-12 bg-[#e3f1e7] border border-[#ddece2] rounded-xl flex items-center justify-center gap-2 text-[#121e18] font-label-md active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">share</span>
            <span>Compartir...</span>
          </button>
        </div>

        <div className="flex flex-col gap-1 items-center pt-1">
          <a
            className="inline-flex items-center gap-1.5 text-[#3f4942] hover:text-[#005232] font-body-md transition-colors py-2 px-3 rounded-lg active:bg-[#e3f1e7]"
            href={`mailto:${currentQuote.clientEmail || ''}?subject=Presupuesto%20${businessProfile.name}%20${currentQuote.ref}&body=${encodeURIComponent(messageText)}`}
          >
            <span className="material-symbols-outlined text-[18px]">mail</span>
            <span>Enviar copia por correo electrónico</span>
          </a>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 text-[#3f4942] hover:text-[#005232] font-label-sm py-1 px-2.5 rounded-lg bg-[#e3f1e7] border border-[#ddece2]"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Imprimir / Guardar PDF</span>
            </button>

            {currentQuote.status !== 'accepted' && (
              <button
                onClick={handleAcceptProposal}
                className="inline-flex items-center gap-1 text-[#005232] font-label-sm py-1 px-2.5 rounded-lg bg-[#a6f3c5] font-semibold"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Marcar como Aceptado</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar for WhatsApp Conversion */}
      <aside aria-label="Enviar por WhatsApp" className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md shadow-xl flex flex-col gap-2 z-40 border-t border-[#ddece2]">
        <div className="max-w-lg mx-auto w-full flex flex-col gap-2">
          {statusFeedback && (
            <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-full bg-[#a6f3c5] text-[#002111] font-label-sm self-center animate-fade-in font-semibold">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Presupuesto marcado como Enviado</span>
            </div>
          )}

          <button
            onClick={handleSendViaWhatsApp}
            className="w-full h-[54px] bg-[#1d6b47] hover:bg-[#005232] text-white rounded-xl flex items-center justify-center gap-3 font-label-lg tracking-wide shadow-md active:scale-[0.985] transition-transform cursor-pointer font-bold"
          >
            <svg className="w-6 h-6 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.34C9.35 7.34 9.06 7.41 8.8 7.69C8.55 7.97 7.83 8.65 7.83 10.04C7.83 11.43 8.84 12.77 8.98 12.96C9.13 13.15 10.97 15.98 13.78 17.2C14.45 17.49 14.97 17.66 15.38 17.79C16.05 18.01 16.66 17.98 17.15 17.91C17.69 17.83 18.82 17.23 19.05 16.57C19.29 15.91 19.29 15.35 19.22 15.23C19.15 15.12 18.96 15.05 18.68 14.91C18.4 14.77 17.03 14.1 16.78 14.01C16.52 13.92 16.34 13.87 16.15 14.15C15.97 14.43 15.44 15.05 15.28 15.23C15.12 15.42 14.96 15.44 14.68 15.3C14.4 15.16 13.5 14.87 12.44 13.92C11.61 13.18 11.05 12.27 10.89 11.99C10.73 11.71 10.87 11.56 11.01 11.42C11.14 11.29 11.3 11.08 11.44 10.92C11.58 10.76 11.63 10.64 11.72 10.46C11.81 10.27 11.77 10.11 11.7 9.97C11.63 9.83 11.05 8.41 10.82 7.84C10.59 7.29 10.36 7.37 10.19 7.36C10.02 7.35 9.83 7.34 9.53 7.34Z" />
            </svg>
            <span>Enviar por WhatsApp</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
