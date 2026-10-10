import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { LineItem, Quote, QuotePhoto } from '../types';
import { catalogTemplates } from '../data/initialData';
import { formatCurrency, generateQuoteRef } from '../utils/formatters';
import { AddPartidaModal } from '../components/AddPartidaModal';

export const NewQuoteScreen: React.FC = () => {
  const {
    quotes,
    createQuote,
    updateQuote,
    navigateToDetail,
    showToast,
    draftWorkingQuote,
  } = useApp();

  const isEditing = Boolean(draftWorkingQuote?.id);

  // Initial values populated from existing draft or defaults from mockup
  const [clientName, setClientName] = useState(draftWorkingQuote?.clientName ?? 'Marta Domínguez');
  const [clientPhone, setClientPhone] = useState(draftWorkingQuote?.clientPhone ?? '+34 612 345 678');
  const [clientEmail, setClientEmail] = useState(draftWorkingQuote?.clientEmail ?? 'marta.dominguez@ejemplo.com');
  const [validityDays, setValidityDays] = useState(draftWorkingQuote?.validityDays ?? 15);
  const [ivaRate, setIvaRate] = useState<number>(draftWorkingQuote?.ivaRate ?? 21);

  // Line items
  const [items, setItems] = useState<LineItem[]>(() => {
    if (draftWorkingQuote?.items && draftWorkingQuote.items.length > 0) {
      return draftWorkingQuote.items;
    }
    // Default from mockup
    return [
      {
        id: 'item-1',
        category: 'Partida 01 • Pintura Interior',
        title: 'Pintura plástica lisa paredes y techos dos manos',
        description: 'Superficie vertical y techos con pintura lavable mate',
        measurement: 180,
        unit: 'm²',
        unitPrice: 9.50,
        subtotal: 1710.00,
      },
      {
        id: 'item-2',
        category: 'Partida 02 • Preparación',
        title: 'Alisado de paredes y eliminación de gotelé fino',
        description: 'Pasta renovación con lijado aspirado profesional',
        measurement: 45,
        unit: 'm²',
        unitPrice: 14.00,
        subtotal: 630.00,
      },
      {
        id: 'item-3',
        category: 'Partida 03 • Medios Auxiliares',
        title: 'Protección y enmascarado de suelos, rodapiés y carpinterías',
        description: 'Encintado, papel hidrófugo y film plástico',
        measurement: 1,
        unit: 'ud',
        unitPrice: 180.00,
        subtotal: 180.00,
      },
    ];
  });

  // Photos
  const [photos, setPhotos] = useState<QuotePhoto[]>(() => {
    if (draftWorkingQuote?.photos && draftWorkingQuote.photos.length > 0) {
      return draftWorkingQuote.photos;
    }
    return [
      {
        id: 'photo-1',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNJ36DEb8XeW0FbSbdsFsM-ZJR45aCiPlhtmfcjuK_euLHGmldWYtDOJgf8FIEdB_VIdOoD7VrW4K6Cbubxm5xDF4Mx4lsIPmJw9Pfjyuibw2OZk-CGc2DL9wESvypCb3EOBceq-895b0Dyy1tRjY80AzIxE2Y7O9RDFrBhzjBBV6BH-idf7mRE91Vn1sPLefQRVzU2DgL0Vzc0ELoEz4fIyudBmOnfP5_loOQlcQ6zA9gPeZIBvyi',
        label: 'Pared salón',
      },
      {
        id: 'photo-2',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLAg2TG0yXGsdc-OMWDnhMfMwCkPWCc4olqX20u5tqJI5lZT2XCFtfKcDGJQj_TCJAsUifrLdUsnPxV1Gipb17oRQ7n1JCkpxxdnKyrRfVnH85uW5XzwmYDR_njPeTkB70_D54NY-DOfS0S273hlswYJs9gvZxuoSRJhSRumvhpUD39JLkInAXs8AwUi1qHllgxX2zR4IkTBPIaUyh0c23ubQeFXsssafL7aDQpuKtxDpNS-cpUkVx',
        label: 'Pasillo suelo',
      },
    ];
  });

  const [activeTemplateId, setActiveTemplateId] = useState<string>('tmpl-piso-80');
  const [editingItem, setEditingItem] = useState<LineItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Financial calculations
  const netSubtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.subtotal || item.measurement * item.unitPrice), 0);
  }, [items]);

  const ivaAmount = useMemo(() => {
    return Number((netSubtotal * (ivaRate / 100)).toFixed(2));
  }, [netSubtotal, ivaRate]);

  const grandTotal = useMemo(() => {
    return Number((netSubtotal + ivaAmount).toFixed(2));
  }, [netSubtotal, ivaAmount]);

  // Apply quick template
  const handleApplyTemplate = (tmplId: string) => {
    setActiveTemplateId(tmplId);
    const tmpl = catalogTemplates.find(t => t.id === tmplId);
    if (!tmpl) return;

    const newItems: LineItem[] = tmpl.items.map((it, idx) => ({
      ...it,
      id: `item-tmpl-${Date.now()}-${idx}`,
      subtotal: Number((it.measurement * it.unitPrice).toFixed(2)),
    }));

    setItems(newItems);
    showToast(`Plantilla "${tmpl.name}" aplicada`);
  };

  const handleBlankItem = () => {
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
    showToast('Partida eliminada');
  };

  const handleEditItem = (item: LineItem) => {
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  const handleSavePartida = (savedItem: LineItem) => {
    if (editingItem) {
      setItems(prev => prev.map(i => (i.id === savedItem.id ? savedItem : i)));
      showToast('Partida actualizada');
    } else {
      setItems(prev => [...prev, savedItem]);
      showToast('Partida añadida');
    }
  };

  const handleAddSamplePhoto = () => {
    const newPhoto: QuotePhoto = {
      id: `photo-${Date.now()}`,
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAs7cSdcJJxKQ0v35IKzENHYa-xZ6U3UYrVTsoQoZPrX005jETPCnFvqqZMgbeGgW9xdJe53XlbvKc4-VLSsXalpPiGQq47WiTMjuRAkjvyLVuP6V79OPT8LHpAOAoUIU1P9x-5z14Z9i4_P9BOpxyIRt2_RD0GHJGFw0G5XfHB6Lt3GIedilC01i-ECfwPXc-psiYz-Jg0AcGLgj_y8qquDiCbiBpnvRXxr7hHb6VTBPwMgoS07Haj',
      label: `Zona obra ${photos.length + 1}`,
    };
    setPhotos(prev => [...prev, newPhoto]);
    showToast('Foto de estado previo añadida');
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const saveQuoteData = (status: 'draft' | 'pending') => {
    const summary = items.length > 0 ? items.map(i => i.title).slice(0, 2).join(' · ') : 'Presupuesto de obras';
    const quotePayload: Partial<Quote> = {
      clientName: clientName.trim() || 'Cliente sin nombre',
      clientPhone: clientPhone.trim() || '+34 600 000 000',
      clientEmail: clientEmail.trim(),
      conceptSummary: summary,
      items,
      photos,
      ivaRate,
      validityDays,
      status,
      statusLabel: status === 'pending' ? 'Listo para enviar' : 'Borrador · Guardado local',
      statusType: status === 'pending' ? 'sent' : 'draft',
      ref: draftWorkingQuote?.ref || generateQuoteRef(quotes.length),
    };

    if (isEditing && draftWorkingQuote?.id) {
      updateQuote(draftWorkingQuote.id, quotePayload);
      return draftWorkingQuote.id;
    } else {
      const created = createQuote(quotePayload);
      return created.id;
    }
  };

  const handleSaveDraft = () => {
    saveQuoteData('draft');
    showToast('Borrador guardado localmente en el dispositivo');
  };

  const handlePreviewAndSend = () => {
    const id = saveQuoteData('pending');
    navigateToDetail(id);
  };

  const currentTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto pb-32">
      {/* Status pill / Autosave indicator */}
      <div className="px-4 pt-2 pb-1">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#e3f1e7] shadow-xs border border-[#ddece2]">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="material-symbols-outlined text-[#005232] text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <span className="font-label-sm text-[#005232] uppercase tracking-wider truncate font-bold">
              Borrador guardado automáticamente
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#005232] animate-pulse"></span>
            <span className="font-label-sm text-[#3f4942]">{currentTime}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-1">
        {/* Step 1: Customer Info Card */}
        <section className="rounded-xl bg-white p-4 shadow-sm flex flex-col gap-3 border border-[#e4e8e3]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1d6b47] text-white font-headline-sm text-sm">
                1
              </span>
              <h2 className="font-headline-sm text-[#121e18] uppercase tracking-tight">
                Datos del Cliente
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#e3f1e7] font-label-sm text-[#3f4942]">
              Contacto directo
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-[#121e18]" htmlFor="cliente-nombre">
                Nombre o Razón Social
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined text-[#6f7a72] absolute left-3 text-[20px] pointer-events-none">
                  person
                </span>
                <input
                  id="cliente-nombre"
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full h-12 pl-10 pr-3 rounded-lg bg-[#e9f7ed] font-body-md text-[#121e18] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#005232] border border-[#ddece2] transition-all"
                  placeholder="Ej: Marta Domínguez"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-[#121e18]" htmlFor="cliente-tel">
                  Teléfono (WhatsApp)
                </label>
                <span className="font-label-sm text-[#005232] font-bold">
                  Formato internacional automático
                </span>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined text-[#6f7a72] absolute left-3 text-[20px] pointer-events-none">
                  phone_iphone
                </span>
                <input
                  id="cliente-tel"
                  type="tel"
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  className="w-full h-12 pl-10 pr-3 rounded-lg bg-[#e9f7ed] font-body-md text-[#121e18] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#005232] border border-[#ddece2] transition-all"
                  placeholder="+34 612 345 678"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-[#121e18]" htmlFor="cliente-email">
                  Correo electrónico
                </label>
                <span className="font-label-sm text-[#3f4942]">Opcional</span>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined text-[#6f7a72] absolute left-3 text-[20px] pointer-events-none">
                  alternate_email
                </span>
                <input
                  id="cliente-email"
                  type="email"
                  value={clientEmail}
                  onChange={e => setClientEmail(e.target.value)}
                  className="w-full h-12 pl-10 pr-3 rounded-lg bg-[#e9f7ed] font-body-md text-[#121e18] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#005232] border border-[#ddece2] transition-all"
                  placeholder="marta.dominguez@ejemplo.com"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Step 2: Trade Template Quick Selector */}
        <section className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1d6b47] text-white font-headline-sm text-sm">
                2
              </span>
              <h2 className="font-headline-sm text-[#121e18] uppercase tracking-tight">
                Plantillas Rápidas de Trabajo
              </h2>
            </div>
            <span className="font-label-sm text-[#005232] font-semibold">
              1 clic aplica partidas
            </span>
          </div>

          {/* Quick horizontal chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
            <button
              onClick={() => handleApplyTemplate('tmpl-piso-80')}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 h-10 rounded-xl font-label-md active:scale-95 transition-transform ${
                activeTemplateId === 'tmpl-piso-80'
                  ? 'bg-[#005232] text-white shadow-sm font-semibold'
                  : 'bg-[#e3f1e7] text-[#121e18] hover:bg-[#ddece2]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">format_paint</span>
              <span>Pintar piso (80 m²)</span>
            </button>

            <button
              onClick={() => handleApplyTemplate('tmpl-fachada')}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 h-10 rounded-xl font-label-md active:scale-95 transition-transform ${
                activeTemplateId === 'tmpl-fachada'
                  ? 'bg-[#005232] text-white shadow-sm font-semibold'
                  : 'bg-[#e3f1e7] text-[#121e18] hover:bg-[#ddece2]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-[#6f7a72]">
                apartment
              </span>
              <span>Fachada exterior</span>
            </button>

            <button
              onClick={() => handleApplyTemplate('tmpl-local')}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 h-10 rounded-xl font-label-md active:scale-95 transition-transform ${
                activeTemplateId === 'tmpl-local'
                  ? 'bg-[#005232] text-white shadow-sm font-semibold'
                  : 'bg-[#e3f1e7] text-[#121e18] hover:bg-[#ddece2]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-[#6f7a72]">
                storefront
              </span>
              <span>Local comercial</span>
            </button>

            <button
              onClick={handleBlankItem}
              className="flex-shrink-0 flex items-center gap-1.5 px-3.5 h-10 rounded-xl bg-[#e3f1e7] text-[#121e18] font-label-md hover:bg-[#ddece2] active:scale-95 transition-transform"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-[#6f7a72]">
                note_add
              </span>
              <span>+ Partida en blanco</span>
            </button>
          </div>
        </section>

        {/* Step 3: Editable Line Items */}
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1d6b47] text-white font-headline-sm text-sm">
                3
              </span>
              <h2 className="font-headline-sm text-[#121e18] uppercase tracking-tight">
                Desglose de Partidas ({items.length})
              </h2>
            </div>
            <span className="font-label-sm text-[#3f4942]">Editable en sitio</span>
          </div>

          {items.map((item, index) => {
            const num = (index + 1).toString().padStart(2, '0');
            return (
              <article
                key={item.id}
                className="p-3.5 rounded-xl bg-white shadow-xs flex flex-col gap-2 border border-[#e4e8e3]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-[#005232] uppercase tracking-wider">
                      Partida {num} • {item.category.replace(/Partida \d+ • /, '')}
                    </span>
                    <h3 className="font-body-lg text-[#121e18] font-bold leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleEditItem(item)}
                      aria-label={`Editar partida ${num}`}
                      className="w-9 h-9 rounded-lg bg-[#e3f1e7] flex items-center justify-center text-[#121e18] hover:bg-[#ddece2] active:scale-90 transition-transform"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      aria-label={`Eliminar partida ${num}`}
                      className="w-9 h-9 rounded-lg bg-[#e3f1e7] flex items-center justify-center text-[#ba1a1a] hover:bg-[#ffdad6] active:scale-90 transition-transform"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-[#e9f7ed] items-center border border-[#ddece2]/60">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[#3f4942]">Medición</span>
                    <span className="font-currency-item text-[#121e18]">
                      {item.measurement}{' '}
                      <span className="font-body-sm text-[#3f4942] font-normal">
                        {item.unit}
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="font-label-sm text-[#3f4942]">Precio Unitario</span>
                    <span className="font-currency-item text-[#121e18]">
                      {formatCurrency(item.unitPrice)}
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="font-label-sm text-[#3f4942]">Subtotal</span>
                    <span className="font-headline-md text-[#005232]">
                      {formatCurrency(item.subtotal || item.measurement * item.unitPrice)}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}

          {/* Add line item action */}
          <button
            onClick={handleBlankItem}
            className="w-full h-12 rounded-xl bg-[#ddece2] text-[#005232] flex items-center justify-center gap-2 font-label-lg active:scale-[0.99] transition-transform shadow-xs font-semibold hover:bg-[#d8e6dc]"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Añadir partida manual o del catálogo</span>
          </button>
        </section>

        {/* Visual Documentation Section (Fotos de estado previo del inmueble) */}
        <section className="rounded-xl bg-white p-3.5 shadow-sm flex flex-col gap-2.5 border border-[#e4e8e3]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#005232] text-[20px]">
                photo_camera
              </span>
              <span className="font-label-md text-[#121e18] uppercase tracking-tight font-bold">
                Fotos de estado previo del inmueble
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-[#3f4942]">
                {photos.length} adjuntos
              </span>
              <button
                onClick={handleAddSamplePhoto}
                className="w-7 h-7 rounded-md bg-[#e3f1e7] text-[#005232] flex items-center justify-center hover:bg-[#ddece2]"
                title="Añadir foto de obra"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {photos.map(photo => (
              <div
                key={photo.id}
                className="relative rounded-lg overflow-hidden h-28 bg-[#e3f1e7] group border border-[#ddece2]"
              >
                <img
                  className="w-full h-full object-cover"
                  src={photo.url}
                  alt={photo.label}
                />
                <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-[#27332d]/80 text-[#e6f4ea] font-label-sm">
                  {photo.label}
                </span>
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-80 hover:opacity-100"
                  title="Eliminar foto"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Step 4: Financial Summary Card */}
        <section className="rounded-xl bg-white p-4 shadow-sm flex flex-col gap-3 border border-[#e4e8e3]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1d6b47] text-white font-headline-sm text-sm">
                4
              </span>
              <h2 className="font-headline-sm text-[#121e18] uppercase tracking-tight">
                Resumen Financiero
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#ffdf9d] text-[#5b4300] font-label-sm font-bold">
              Impuestos calculados
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between py-1">
              <span className="font-body-md text-[#3f4942]">Subtotal partidas netas</span>
              <span className="font-headline-sm text-[#121e18]">
                {formatCurrency(netSubtotal)}
              </span>
            </div>

            {/* IVA Selector Buttons */}
            <div className="flex flex-col gap-1.5 pt-1 pb-2">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-[#121e18]">Tipo de IVA aplicable</span>
                <span className="font-label-sm text-[#005232] font-semibold">
                  Base: {formatCurrency(netSubtotal)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setIvaRate(21)}
                  className={`h-11 rounded-lg font-label-md flex flex-col items-center justify-center leading-none transition-colors ${
                    ivaRate === 21
                      ? 'bg-[#005232] text-white shadow-sm'
                      : 'bg-[#e3f1e7] text-[#121e18] hover:bg-[#ddece2]'
                  }`}
                  type="button"
                >
                  <span className="font-headline-sm">21 %</span>
                  <span className="font-label-sm text-[10px] opacity-90">General</span>
                </button>

                <button
                  onClick={() => setIvaRate(10)}
                  className={`h-11 rounded-lg font-label-md flex flex-col items-center justify-center leading-none transition-colors ${
                    ivaRate === 10
                      ? 'bg-[#005232] text-white shadow-sm'
                      : 'bg-[#e3f1e7] text-[#121e18] hover:bg-[#ddece2]'
                  }`}
                  type="button"
                >
                  <span className="font-headline-sm">10 %</span>
                  <span className="font-label-sm text-[10px] opacity-90">Obras reforma</span>
                </button>

                <button
                  onClick={() => setIvaRate(0)}
                  className={`h-11 rounded-lg font-label-md flex flex-col items-center justify-center leading-none transition-colors ${
                    ivaRate === 0
                      ? 'bg-[#005232] text-white shadow-sm'
                      : 'bg-[#e3f1e7] text-[#121e18] hover:bg-[#ddece2]'
                  }`}
                  type="button"
                >
                  <span className="font-headline-sm">0 %</span>
                  <span className="font-label-sm text-[10px] opacity-90">Exento</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="font-body-md text-[#3f4942]">
                Cuota de IVA ({ivaRate} %)
              </span>
              <span className="font-headline-sm text-[#121e18]">
                {formatCurrency(ivaAmount)}
              </span>
            </div>

            {/* Grand Total highlight block */}
            <div className="mt-2 p-3.5 rounded-xl bg-[#e3f1e7] flex items-center justify-between shadow-inner border border-[#ddece2]">
              <div className="flex flex-col">
                <span className="font-label-sm text-[#005232] uppercase font-bold tracking-wider">
                  Total Presupuesto
                </span>
                <span className="font-body-sm text-[#3f4942]">IVA incluido</span>
              </div>
              <span className="font-currency-display text-[#005232] leading-none">
                {formatCurrency(grandTotal)}
              </span>
            </div>

            {/* Validity Selector */}
            <div className="flex items-center justify-between pt-2">
              <label
                className="font-label-md text-[#121e18] flex items-center gap-1.5"
                htmlFor="validez-select"
              >
                <span className="material-symbols-outlined text-[#6f7a72] text-[18px]">
                  event_available
                </span>
                <span>Validez de la oferta:</span>
              </label>
              <div className="relative">
                <select
                  id="validez-select"
                  value={validityDays}
                  onChange={e => setValidityDays(Number(e.target.value))}
                  className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-[#e9f7ed] font-label-md text-[#121e18] border border-[#ddece2] focus:outline-none focus:bg-white"
                >
                  <option value={15}>15 días naturales</option>
                  <option value={30}>30 días naturales</option>
                  <option value={60}>60 días naturales</option>
                </select>
                <span className="material-symbols-outlined text-[#6f7a72] absolute right-2 top-2 pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Persistent Bottom Action Sheet */}
      <aside className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-3 pt-2 bg-[#effdf3]/95 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.06)] border-t border-[#ddece2]">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button
            onClick={handleSaveDraft}
            className="w-12 h-[52px] rounded-xl bg-[#e3f1e7] text-[#121e18] flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform border border-[#ddece2]"
            title="Guardar borrador manual"
            type="button"
          >
            <span className="material-symbols-outlined text-[24px]">save</span>
          </button>
          <button
            onClick={handlePreviewAndSend}
            className="flex-1 h-[52px] rounded-xl bg-[#005232] text-white font-headline-md uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,82,50,0.3)] active:scale-[0.98] transition-transform cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">send</span>
            <span>Vista previa y enviar</span>
          </button>
        </div>
      </aside>

      {/* Add / Edit Partida Modal */}
      <AddPartidaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSavePartida}
        initialItem={editingItem}
      />
    </div>
  );
};
