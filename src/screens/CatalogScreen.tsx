import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { CatalogItem } from '../types';

export const CatalogScreen: React.FC = () => {
  const { catalog, addCatalogItem, showToast, setActiveTab, setDraftWorkingQuote } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New item form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Pintura Interior');
  const [newDescription, setNewDescription] = useState('');
  const [newUnit, setNewUnit] = useState<CatalogItem['unit']>('m²');
  const [newPrice, setNewPrice] = useState(12.50);

  const categories = useMemo(() => {
    const set = new Set<string>();
    catalog.forEach(item => set.add(item.category));
    return ['all', ...Array.from(set)];
  }, [catalog]);

  const filteredItems = useMemo(() => {
    return catalog.filter(item => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase())) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [catalog, selectedCategory, search]);

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addCatalogItem({
      title: newTitle.trim(),
      category: newCategory.trim(),
      description: newDescription.trim(),
      unit: newUnit,
      defaultPrice: Number(newPrice),
    });

    setNewTitle('');
    setNewDescription('');
    setIsAddOpen(false);
  };

  const handleStartQuoteWithItem = (item: CatalogItem) => {
    setDraftWorkingQuote({
      items: [
        {
          id: `item-${Date.now()}`,
          category: `Partida 01 • ${item.category}`,
          title: item.title,
          description: item.description,
          measurement: item.unit === 'm²' ? 80 : 1,
          unit: item.unit,
          unitPrice: item.defaultPrice,
          subtotal: item.unit === 'm²' ? item.defaultPrice * 80 : item.defaultPrice,
        },
      ],
      conceptSummary: item.title,
    });
    setActiveTab('nuevo');
    showToast(`Presupuesto iniciado con "${item.title}"`);
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-4 pb-28 gap-4">
      {/* Banner */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="font-headline-md text-[#121e18] uppercase tracking-tight leading-snug">
            Catálogo de Precios y Partidas
          </h2>
          <p className="font-body-sm text-[#3f4942]">
            Tarifas base recomendadas para presupuestar al instante en obra.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="h-10 px-3 rounded-xl bg-[#005232] text-white font-label-sm flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Nueva</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative flex items-center">
        <span className="material-symbols-outlined text-[#6f7a72] absolute left-3 text-[20px] pointer-events-none">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por trabajo, material o m²..."
          className="w-full h-11 pl-10 pr-3 rounded-xl bg-white font-body-md text-[#121e18] border border-[#ddece2] shadow-xs focus:outline-none focus:border-[#005232]"
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full font-label-sm uppercase transition-all ${
              selectedCategory === cat
                ? 'bg-[#005232] text-white font-bold shadow-xs'
                : 'bg-white text-[#3f4942] border border-[#ddece2] hover:bg-[#e9f7ed]'
            }`}
          >
            {cat === 'all' ? 'Todas' : cat}
          </button>
        ))}
      </div>

      {/* Items list */}
      <div className="space-y-2.5">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl bg-white shadow-xs border border-[#e4e8e3] flex flex-col gap-2 hover:border-[#005232]/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="font-label-sm text-[#005232] uppercase tracking-wider block">
                  {item.category}
                </span>
                <h3 className="font-body-lg font-bold text-[#121e18] leading-snug">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="font-body-sm text-[#3f4942] mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="text-right flex-shrink-0 pl-2">
                <span className="font-currency-display text-[#005232] block leading-none">
                  {formatCurrency(item.defaultPrice)}
                </span>
                <span className="font-label-sm text-[#3f4942] uppercase font-semibold">
                  por {item.unit}
                </span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-end">
              <button
                onClick={() => handleStartQuoteWithItem(item)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#e3f1e7] text-[#005232] font-label-sm font-semibold hover:bg-[#ddece2] active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Usar en nuevo presupuesto</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNewItem}
            className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl flex flex-col gap-3 border border-[#ddece2]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#ddece2]">
              <h3 className="font-headline-sm uppercase text-[#121e18]">
                Añadir al Catálogo
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="w-8 h-8 rounded-full bg-[#ddece2] flex items-center justify-center text-[#3f4942]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div>
              <label className="font-label-sm text-[#3f4942] uppercase block mb-1">
                Categoría
              </label>
              <input
                type="text"
                required
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                placeholder="Pintura, Preparación, Fachadas, etc."
                className="w-full h-11 px-3 rounded-lg bg-[#e9f7ed] font-body-md text-[#121e18] border border-[#ddece2] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="font-label-sm text-[#3f4942] uppercase block mb-1">
                Nombre de la partida
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Ej: Pintura plástica satinada lavable"
                className="w-full h-11 px-3 rounded-lg bg-[#e9f7ed] font-body-md text-[#121e18] border border-[#ddece2] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="font-label-sm text-[#3f4942] uppercase block mb-1">
                Descripción
              </label>
              <textarea
                rows={2}
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                placeholder="Detalle de materiales o método de aplicación"
                className="w-full p-2.5 rounded-lg bg-[#e9f7ed] font-body-md text-[#121e18] border border-[#ddece2] focus:bg-white focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-label-sm text-[#3f4942] uppercase block mb-1">
                  Unidad
                </label>
                <select
                  value={newUnit}
                  onChange={e => setNewUnit(e.target.value as CatalogItem['unit'])}
                  className="w-full h-11 px-2 rounded-lg bg-[#e9f7ed] font-body-md text-[#121e18] border border-[#ddece2]"
                >
                  <option value="m²">m²</option>
                  <option value="ud">ud</option>
                  <option value="ml">ml</option>
                  <option value="h">h</option>
                </select>
              </div>

              <div>
                <label className="font-label-sm text-[#3f4942] uppercase block mb-1">
                  Precio Base (€)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newPrice}
                  onChange={e => setNewPrice(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 px-2 text-center rounded-lg bg-[#e9f7ed] font-currency-item text-[#121e18] border border-[#ddece2]"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="flex-1 h-11 rounded-xl bg-[#ddece2] text-[#3f4942] font-label-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 h-11 rounded-xl bg-[#005232] text-white font-label-md font-semibold shadow-sm"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
