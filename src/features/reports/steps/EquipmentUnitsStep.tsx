import React from 'react';
import { Camera, PlusCircle, Trash2 } from 'lucide-react';

import type { CompanySettings, EquipmentAsset, Translations, UnitSystem } from '../../../types';

type Props = {
  t: Translations;
  unitSystem: UnitSystem;
  setUnitSystem: (u: UnitSystem) => void;

  templateId: string;
  setTemplateId: (id: string) => void;

  companySettings: CompanySettings;

  assets: EquipmentAsset[];
  setAssets: (assets: EquipmentAsset[]) => void;
};

export function EquipmentUnitsStep({
  t,
  unitSystem,
  setUnitSystem,
  templateId,
  setTemplateId,
  companySettings,
  assets,
  setAssets,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-surface/50 p-4 rounded-xl border border-border/50">
        <div>
          <label className="text-[10px] font-bold text-text-secondary uppercase">{t.unitSystem}</label>
          <div className="flex gap-2 mt-2">
            {['metric', 'imperial'].map((u) => (
              <button
                key={u}
                onClick={() => setUnitSystem(u as UnitSystem)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                  unitSystem === u
                    ? 'bg-primary text-white scale-105 shadow-md shadow-primary/20'
                    : 'bg-surface text-text-secondary border border-border'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-text-secondary uppercase">Template</label>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="block w-full mt-2 bg-surface border border-border rounded-lg px-3 py-1.5 text-[10px] font-bold outline-none focus:border-primary"
          >
            {companySettings.templates.map((tmp) => (
              <option key={tmp.id} value={tmp.id}>
                {tmp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{t.assets}</label>
          <button
            onClick={() =>
              setAssets([
                ...assets,
                { id: 'a' + Date.now(), name: '', model: '', sn: '', nominalVoltage: 460 },
              ])
            }
            className="text-primary p-1 hover:bg-primary/10 rounded-full transition-colors"
          >
            <PlusCircle size={20} />
          </button>
        </div>

        {assets.map((asset, idx) => (
          <div key={asset.id} className="p-4 bg-surface border border-border rounded-2xl space-y-4 relative group">
            <button
              onClick={() => setAssets(assets.filter((a) => a.id !== asset.id))}
              className="absolute top-4 right-4 text-text-secondary opacity-0 group-hover:opacity-100 hover:text-error transition-all"
            >
              <Trash2 size={16} />
            </button>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-text-secondary uppercase">Name</label>
                <input
                  value={asset.name}
                  onChange={(e) => {
                    const newAssets = [...assets];
                    newAssets[idx].name = e.target.value;
                    setAssets(newAssets);
                  }}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-xs text-text-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-text-secondary uppercase">Model</label>
                <input
                  value={asset.model}
                  onChange={(e) => {
                    const newAssets = [...assets];
                    newAssets[idx].model = e.target.value;
                    setAssets(newAssets);
                  }}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-xs text-text-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-text-secondary uppercase">S/N</label>
                <input
                  value={asset.sn}
                  onChange={(e) => {
                    const newAssets = [...assets];
                    newAssets[idx].sn = e.target.value;
                    setAssets(newAssets);
                  }}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-xs text-text-primary font-mono uppercase"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-text-secondary uppercase">Rated Voltage</label>
                <input
                  type="number"
                  value={asset.nominalVoltage}
                  onChange={(e) => {
                    const newAssets = [...assets];
                    newAssets[idx].nominalVoltage = Number(e.target.value);
                    setAssets(newAssets);
                  }}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-xs text-text-primary"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-4">
              <div className="flex-1 space-y-1">
                <label className="text-[9px] font-bold text-text-secondary uppercase">Documentation Photo</label>
                {asset.photo ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                    <img src={asset.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button
                      onClick={() => {
                        const newAssets = [...assets];
                        newAssets[idx].photo = undefined;
                        setAssets(newAssets);
                      }}
                      className="absolute top-1 right-1 bg-error p-1 rounded-md text-white shadow-lg"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const newAssets = [...assets];
                      newAssets[idx].photo = `https://picsum.photos/seed/${asset.id}${Date.now()}/800/600`;
                      setAssets(newAssets);
                    }}
                    className="w-full aspect-video border border-dashed border-border rounded-lg flex flex-col items-center justify-center text-[10px] text-text-secondary hover:text-primary transition-colors"
                  >
                    <Camera size={14} className="mb-1" />
                    UPLOAD
                  </button>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[9px] font-bold text-text-secondary uppercase">Unit Notes</label>
                <textarea
                  value={asset.comment || ''}
                  onChange={(e) => {
                    const newAssets = [...assets];
                    newAssets[idx].comment = e.target.value;
                    setAssets(newAssets);
                  }}
                  placeholder="Specific technical notes for this unit..."
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-[10px] h-full min-h-[60px] text-text-primary"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

