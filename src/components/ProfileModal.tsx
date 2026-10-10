import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const ProfileModal: React.FC = () => {
  const {
    businessProfile,
    updateBusinessProfile,
    isProfileModalOpen,
    setIsProfileModalOpen,
  } = useApp();

  const [name, setName] = useState(businessProfile.name);
  const [tradeType, setTradeType] = useState(businessProfile.tradeType);
  const [cif, setCif] = useState(businessProfile.cif);
  const [phone, setPhone] = useState(businessProfile.phone);
  const [email, setEmail] = useState(businessProfile.email);
  const [city, setCity] = useState(businessProfile.city);
  const [postalCode, setPostalCode] = useState(businessProfile.postalCode);
  const [monthlyGoal, setMonthlyGoal] = useState(businessProfile.monthlyGoal);
  const [closingRate, setClosingRate] = useState(businessProfile.closingRate);

  if (!isProfileModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile({
      name: name.trim(),
      tradeType: tradeType.trim(),
      cif: cif.trim(),
      phone: phone.trim(),
      email: email.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      monthlyGoal: Number(monthlyGoal),
      closingRate: Number(closingRate),
    });
    setIsProfileModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-lg rounded-2xl p-5 shadow-2xl flex flex-col gap-4 border border-[#ddece2] max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#ddece2]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#005232] text-[24px]">
              storefront
            </span>
            <h3 className="font-headline-sm uppercase text-[#121e18]">
              Datos del Autónomo / Empresa
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(false)}
            className="w-8 h-8 rounded-full bg-[#ddece2] flex items-center justify-center text-[#3f4942]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="font-label-sm text-[#3f4942] uppercase block mb-1">
              Nombre Comercial / Marca
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-[#e9f7ed] font-body-md text-[#121e18] border border-[#ddece2] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-label-sm text-[#3f4942] uppercase block mb-1">
                Estado Fiscal
              </label>
              <input
                type="text"
                value={tradeType}
                onChange={e => setTradeType(e.target.value)}
                placeholder="Autónomo activo"
                className="w-full h-11 px-3 rounded-lg bg-[#e9f7ed] font-body-md text-[#121e18] border border-[#ddece2] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="font-label-sm text-[#3f4942] uppercase block mb-1">
                CIF / NIF
              </label>
              <input
                type="text"
                required
                value={cif}
                onChange={e => setCif(e.target.value)}
                placeholder="B-19842103"
                className="w-full h-11 px-3 rounded-lg bg-[#e9f7ed] font-body-md text-[#121e18] border border-[#ddece2] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-label-sm text-[#3f4942] uppercase block mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-[#e9f7ed] font-body-md text-[#121e18] border border-[#ddece2] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="font-label-sm text-[#3f4942] uppercase block mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-[#e9f7ed] font-body-md text-[#121e18] border border-[#ddece2] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-label-sm text-[#3f4942] uppercase block mb-1">
                Población / Ciudad
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-[#e9f7ed] font-body-md text-[#121e18] border border-[#ddece2] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="font-label-sm text-[#3f4942] uppercase block mb-1">
                Código Postal
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={e => setPostalCode(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-[#e9f7ed] font-body-md text-[#121e18] border border-[#ddece2] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-label-sm text-[#3f4942] uppercase block mb-1">
                Objetivo del Mes (€)
              </label>
              <input
                type="number"
                value={monthlyGoal}
                onChange={e => setMonthlyGoal(Number(e.target.value) || 0)}
                className="w-full h-11 px-3 rounded-lg bg-[#e9f7ed] font-body-md text-[#121e18] border border-[#ddece2] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="font-label-sm text-[#3f4942] uppercase block mb-1">
                Tasa Cierre Objetivo (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={closingRate}
                onChange={e => setClosingRate(Number(e.target.value) || 0)}
                className="w-full h-11 px-3 rounded-lg bg-[#e9f7ed] font-body-md text-[#121e18] border border-[#ddece2] focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(false)}
            className="flex-1 h-12 rounded-xl bg-[#ddece2] text-[#3f4942] font-label-md"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 h-12 rounded-xl bg-[#005232] text-white font-label-md font-semibold shadow-sm"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};
