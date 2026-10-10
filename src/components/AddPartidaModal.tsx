import React, { useState } from 'react';
import { LineItem, CatalogItem } from '../types';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';

interface AddPartidaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: LineItem) => void;
  initialItem?: LineItem | null;
}

export const AddPartidaModal: React.FC<AddPartidaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
}) => {
  const { catalog } = useApp();
  const [activeTab, setActiveTab] = useState<'catalog' | 'custom'>(initialItem ? 'custom' : 'catalog');

  const [category, setCategory] = useState(initialItem?.category || 'Pintura Interior');
  const [title, setTitle] = useState(initialItem?.title || '');
  const [description, setDescription] = useState(initialItem?.description || '');
  const [measurement, setMeasurement] = useState<number>(initialItem?.measurement || 50);
  const [unit, setUnit] = useState<LineItem['unit']>(initialItem?.unit || 'm²');
  const [unitPrice, setUnitPrice] = useState<number>(initialItem?.unitPrice || 9.5);

  if (!isOpen) return null;

  const handleSelectFromCatalog = (catItem: CatalogItem) => {
    setTitle(catItem.title);
    setCategory(catItem.category);
    setDescription(catItem.description || '');
    setUnit(catItem.unit);
    setUnitPrice(catItem.defaultPrice);
    setActiveTab('custom');
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const subtotal = Number((measurement * unitPrice).toFixed(2));
    const item: LineItem = {
      id: initialItem?.id || `item-${Date.now()}`,
      category: category.startsWith('Partida') ? category : `Partida • ${category}`,
      title: title.trim(),
      description: description.trim(),
      measurement: Number(measurement),
      unit,
      unitPrice: Number(unitPrice),
      subtotal,
    };

    onSave(item);
    onClose();
  };

  const subtotalCalculated = (measurement * unitPrice).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl max-h-[90vh] flex flex-col border border-[#ddece2]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ddece2]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#005232] text-[22px]">
              {initialItem ? 'edit_note' : 'add_circle'}
            </span>
            <h3 className="font-headline-sm uppercase text-[#121e18]">
              {initialItem ? 'Editar Partida' : 'Añadir Partida'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#ddece2] flex items-center justify-center text-[#3f4942] hover:text-[#121e18]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tab switcher */}
        {!initialItem && (
          <div className="flex p-1 bg-[#ddece2] rounded-xl gap-1 my-3">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex-1 py-1.5 rounded-lg font-label-md transition-all text-center ${
                activeTab === 'catalog'
                  ? 'bg-white text-[#005232] shadow-sm font-semibold'
                  : 'text-[#3f4942]'
              }`}
            >
              Desde Catálogo
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-1.5 rounded-lg font-label-md transition-all text-center ${
                activeTab === 'custom'
                  ? 'bg-white text-[#005232] shadow-sm font-semibold'
                  : 'text-[#3f4942]'
              }`}
            >
              Partida Manual
            </button>
          </div>
        )}

        <div className="overflow-y-auto space-y-4 py-2 pr-1 flex-1">
          {activeTab === 'catalog' && !initialItem ? (
            <div className="space-y-2">
              <span className="font-label-sm text-[#3f4942] uppercase tracking-wider block">
                Selecciona una plantilla o concepto estándar:
              </span>
              <div className="space-y-2">
                {catalog.map(catItem => (
                  <div
                    key={catItem.id}
                    onClick={() => handleSelectFromCatalog(catItem)}
                    className="p-3 rounded-xl bg-[#e9f7ed] hover:bg-[#ddece2] transition-colors cursor-pointer border border-[#ddece2] flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-label-sm text-[#005232] uppercase block">
                        {catItem.category}
                      </span>
                      <h4 className="font-body-md font-semibold text-[#121e18]">
                        {catItem.title}
                      </h4>
                      {catItem.description && (
                        <p className="font-body-sm text-[#3f4942] line-clamp-1">
                          {catItem.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-currency-item text-[#005232]">
                        {formatCurrency(catItem.defaultPrice)}
                      </span>
                      <span className="font-label-sm text-[#3f4942] block">
                        / {catItem.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="font-label-md text-[#121e18] block mb-1">
                  Categoría
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="Ej: Pintura Interior, Preparación, Fachadas"
                  className="w-full h-11 px-3 rounded-lg bg-[#e9f7ed] font-body-md text-[#121e18] border border-[#ddece2] focus:bg-white focus:outline-none focus:border-[#005232]"
                />
              </div>

              <div>
                <label className="font-label-md text-[#121e18] block mb-1">
                  Concepto / Título de la partida
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ej: Pintura plástica lisa paredes y techos"
                  className="w-full h-11 px-3 rounded-lg bg-[#e9f7ed] font-body-md text-[#121e18] border border-[#ddece2] focus:bg-white focus:outline-none focus:border-[#005232]"
                />
              </div>

              <div>
                <label className="font-label-md text-[#121e18] block mb-1">
                  Detalles o especificación técnica (opcional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ej: Dos manos cruzadas, lijado previo, pintura mate anti-moho"
                  className="w-full p-2.5 rounded-lg bg-[#e9f7ed] font-body-md text-[#121e18] border border-[#ddece2] focus:bg-white focus:outline-none focus:border-[#005232] resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-label-sm text-[#3f4942] block mb-1">
                    Medición
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={measurement}
                    onChange={e => setMeasurement(parseFloat(e.target.value) || 0)}
                    className="w-full h-11 px-2 text-center rounded-lg bg-[#e9f7ed] font-currency-item text-[#121e18] border border-[#ddece2] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-label-sm text-[#3f4942] block mb-1">
                    Unidad
                  </label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value as LineItem['unit'])}
                    className="w-full h-11 px-2 rounded-lg bg-[#e9f7ed] font-body-md text-[#121e18] border border-[#ddece2] focus:bg-white focus:outline-none"
                  >
                    <option value="m²">m²</option>
                    <option value="ud">ud</option>
                    <option value="ml">ml</option>
                    <option value="h">h</option>
                    <option value="días">días</option>
                  </select>
                </div>

                <div>
                  <label className="font-label-sm text-[#3f4942] block mb-1">
                    Precio Unitario (€)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={unitPrice}
                    onChange={e => setUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full h-11 px-2 text-center rounded-lg bg-[#e9f7ed] font-currency-item text-[#121e18] border border-[#ddece2] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Real-time Subtotal Preview */}
              <div className="p-3 rounded-xl bg-[#ddece2] flex items-center justify-between">
                <span className="font-label-sm uppercase text-[#3f4942] font-semibold">
                  Subtotal estimado:
                </span>
                <span className="font-headline-md text-[#005232]">
                  {formatCurrency(Number(subtotalCalculated))}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-[#ddece2] flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-xl bg-[#ddece2] text-[#3f4942] font-label-md"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 h-12 rounded-xl bg-[#005232] text-white font-label-md shadow-sm disabled:opacity-50 font-semibold"
          >
            Guardar Partida
          </button>
        </div>
      </div>
    </div>
  );
};
