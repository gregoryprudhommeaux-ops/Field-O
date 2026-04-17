import React from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Plus, Zap } from 'lucide-react';

import type { EquipmentAsset, MeasurementRow, UnitSystem } from '../../../types';

type Props = {
  assets: EquipmentAsset[];
  setAssets: Dispatch<SetStateAction<EquipmentAsset[]>>;
  unitSystem: UnitSystem;
  measurementsByAsset: Record<string, MeasurementRow[]>;
  setMeasurementsByAsset: (next: Record<string, MeasurementRow[]>) => void;
  validateVoltageTolerance: (nominalVoltage?: number | null, measuredVoltage?: number | null, tolerancePercent?: number) => {
    deviationPercent: number | null;
    status: 'ok' | 'warning' | 'out_of_range' | null;
  };
};

export function TechnicalReadingsStep({
  assets,
  setAssets,
  unitSystem,
  measurementsByAsset,
  setMeasurementsByAsset,
  validateVoltageTolerance,
}: Props) {
  return (
    <div className="space-y-8">
      {assets.map((asset) => (
        <div key={asset.id} className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-black text-primary uppercase tracking-widest">
            <Zap size={14} className="shrink-0" />
            <input
              value={asset.name}
              onChange={(e) => {
                const v = e.target.value;
                setAssets((prev) => prev.map((x) => (x.id === asset.id ? { ...x, name: v } : x)));
              }}
              placeholder="Unit name"
              className="min-w-[8rem] max-w-[14rem] bg-surface border border-border rounded px-2 py-1 text-[10px] font-bold text-text-primary placeholder:text-text-secondary/50 normal-case"
            />
            <span className="text-text-secondary font-bold">(</span>
            <input
              value={asset.sn}
              onChange={(e) => {
                const v = e.target.value;
                setAssets((prev) => prev.map((x) => (x.id === asset.id ? { ...x, sn: v } : x)));
              }}
              placeholder="Serial #"
              className="min-w-[6rem] max-w-[12rem] bg-surface border border-border rounded px-2 py-1 text-[10px] font-bold text-text-primary placeholder:text-text-secondary/50 normal-case"
            />
            <span className="text-text-secondary font-bold">)</span>
          </div>

          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 text-[9px] font-bold text-text-secondary text-left uppercase pr-4">Load (%)</th>
                  <th className="py-2 text-[9px] font-bold text-text-secondary text-left uppercase pr-4">Voltage (V)</th>
                  <th className="py-2 text-[9px] font-bold text-text-secondary text-left uppercase pr-4">Power (kW)</th>
                  <th className="py-2 text-[9px] font-bold text-text-secondary text-left uppercase">
                    Flow ({unitSystem === 'metric' ? 'm³/m' : 'SCFM'})
                  </th>
                </tr>
              </thead>
              <tbody>
                {(measurementsByAsset[asset.id] ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-[10px] text-text-secondary">
                      No reading points yet. Use “Add Reading Point”.
                    </td>
                  </tr>
                ) : null}
                {(measurementsByAsset[asset.id] ?? []).map((row, rIdx) => {
                  const measuredV = row.current.trim() === '' ? null : Number(row.current);
                  const validation = validateVoltageTolerance(
                    asset.nominalVoltage,
                    measuredV != null && Number.isFinite(measuredV) ? measuredV : null,
                    10
                  );
                  const isOut = validation.status === 'out_of_range';
                  const deviationPct = Math.round(Math.abs(validation.deviationPercent ?? 0));

                  const updateRow = (patch: Partial<MeasurementRow>) => {
                    const assetRows = [...(measurementsByAsset[asset.id] ?? [])];
                    assetRows[rIdx] = { ...assetRows[rIdx], ...patch };
                    setMeasurementsByAsset({ ...measurementsByAsset, [asset.id]: assetRows });
                  };

                  return (
                    <tr key={row.id} className="border-b border-border/30">
                      <td className="py-3 pr-4">
                        <input
                          value={row.label}
                          onChange={(e) => updateRow({ label: e.target.value })}
                          className="min-w-[7rem] bg-surface border border-border rounded px-1.5 py-1 text-[10px] text-text-primary"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <div className="relative">
                          <input
                            type="number"
                            value={row.current}
                            onChange={(e) => updateRow({ current: e.target.value })}
                            className={`w-20 bg-surface border rounded px-1.5 py-1 text-[10px] ${
                              isOut ? 'border-error text-error animate-pulse' : 'border-border text-text-primary'
                            }`}
                          />
                          {isOut && (
                            <span className="absolute -top-1.5 -right-1.5 bg-error text-white text-[7px] font-bold px-1 rounded-full">
                              {deviationPct}%!
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <input
                          type="number"
                          value={row.power ?? ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            updateRow({ power: v === '' ? null : Number(v) });
                          }}
                          className="w-20 bg-surface border border-border rounded px-1.5 py-1 text-[10px] text-text-primary"
                        />
                      </td>
                      <td className="py-3">
                        <input
                          type="number"
                          value={row.flow ?? ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            updateRow({ flow: v === '' ? null : Number(v) });
                          }}
                          className="w-20 bg-surface border border-border rounded px-1.5 py-1 text-[10px] text-text-primary"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => {
              const existing = measurementsByAsset[asset.id] ?? [];
              setMeasurementsByAsset({
                ...measurementsByAsset,
                [asset.id]: [
                  ...existing,
                  {
                    id: `${asset.id}-r-${Date.now()}`,
                    label: '',
                    current: '',
                    power: null,
                    flow: null,
                    pressure: null,
                    temp: null,
                  },
                ],
              });
            }}
            className="text-[9px] font-bold text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
          >
            <Plus size={12} /> Add Reading Point
          </button>
        </div>
      ))}
    </div>
  );
}

