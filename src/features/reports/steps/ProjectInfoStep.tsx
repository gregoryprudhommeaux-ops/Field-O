import React from 'react';
import { Briefcase, Plus } from 'lucide-react';

import type { ClientProfile, CompanySettings, Language, Translations } from '../../../types';
import { ClientSelector } from '../../clients/components/ClientSelector'
import { t as shellT } from '../../../lib/i18n/translations'

type Props = {
  lang: Language;
  setLang: (next: Language) => void;
  embedded?: boolean;
  /** Shell UI language: labels for the report-language row follow the site language, not the report language. */
  shellUiLang: Language;
  t: Translations;

  companySettings: CompanySettings;
  setCompanySettings: React.Dispatch<React.SetStateAction<CompanySettings>>;

  clientId: string;
  setClientId: (id: string) => void;

  isAddingClient: boolean;
  setIsAddingClient: (v: boolean) => void;
  newClientName: string;
  setNewClientName: (v: string) => void;

  projectName: string;
  setProjectName: (v: string) => void;
  operator: string;
  setOperator: (v: string) => void;
  date: string;

  customFieldValues: Record<string, string>;
  setCustomFieldValues: (v: Record<string, string>) => void;
};

export function ProjectInfoStep({
  lang,
  setLang,
  embedded = false,
  shellUiLang,
  t,
  companySettings,
  setCompanySettings,
  clientId,
  setClientId,
  isAddingClient,
  setIsAddingClient,
  newClientName,
  setNewClientName,
  projectName,
  setProjectName,
  operator,
  setOperator,
  date,
  customFieldValues,
  setCustomFieldValues,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-3 p-4 bg-surface/40 border border-dashed border-border rounded-2xl relative overflow-hidden">
        <div className="flex justify-between items-center mb-1">
          <label className="text-[10px] font-bold text-text-secondary uppercase flex items-center gap-1.5">
            <Briefcase size={12} className="text-primary" />
            {t.client}
          </label>
          <button onClick={() => setIsAddingClient(!isAddingClient)} className="text-[9px] font-black text-primary uppercase">
            {isAddingClient ? 'Back' : '+ New Client'}
          </button>
        </div>

        {isAddingClient ? (
          <div className="flex gap-2">
            <input
              placeholder="Client Name (e.g. INVENT)"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-xs focus:border-primary outline-none"
            />
            <button
              onClick={() => {
                if (!newClientName) return;
                const newClient: ClientProfile = {
                  id: Date.now().toString(),
                  name: newClientName,
                  logoUrl: `https://picsum.photos/seed/${newClientName}/100/100`,
                };
                setCompanySettings({ ...companySettings, clients: [...(companySettings.clients || []), newClient] });
                setClientId(newClient.id);
                setIsAddingClient(false);
                setNewClientName('');
              }}
              className="bg-primary text-white p-2 rounded-lg"
            >
              <Plus size={16} />
            </button>
          </div>
        ) : (
          <ClientSelector
            clients={(companySettings.clients || []).map((c) => ({ id: c.id, name: c.name }))}
            selectedClientId={clientId}
            onSelect={(nextClientId) => setClientId(nextClientId)}
            onCreateNew={() => setIsAddingClient(true)}
          />
        )}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{t.projectName}</label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors text-text-primary"
        />
        {embedded && (
          <div className="space-y-2 pt-1">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              {shellT(shellUiLang, 'shellWizardReportLanguageLabel')}
            </p>
            <p className="text-[11px] leading-snug text-text-secondary">{shellT(shellUiLang, 'shellWizardReportLanguageHint')}</p>
            <div className="inline-flex overflow-hidden rounded-xl border border-border bg-surface">
              <button
                type="button"
                aria-pressed={lang === 'es'}
                onClick={() => setLang('es')}
                className={`px-3 py-2 text-xs font-semibold tracking-wide ${
                  lang === 'es' ? 'bg-bg/70 text-text-primary' : 'text-text-secondary hover:bg-bg/40 hover:text-text-primary'
                }`}
              >
                🇲🇽 ES
              </button>
              <button
                type="button"
                aria-pressed={lang === 'en'}
                onClick={() => setLang('en')}
                className={`px-3 py-2 text-xs font-semibold tracking-wide ${
                  lang === 'en' ? 'bg-bg/70 text-text-primary' : 'text-text-secondary hover:bg-bg/40 hover:text-text-primary'
                }`}
              >
                🇺🇸 EN
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{t.operator}</label>
        <input
          type="text"
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors text-text-primary"
        />
      </div>

      {/* Custom Admin Fields Rendering */}
      {companySettings.customFields?.map((field) => (
        <div key={field} className="space-y-2">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{field}</label>
          <input
            type="text"
            value={customFieldValues[field] || ''}
            onChange={(e) => setCustomFieldValues({ ...customFieldValues, [field]: e.target.value })}
            className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors text-text-primary"
          />
        </div>
      ))}

      <div className="space-y-2 opacity-60">
        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{t.date}</label>
        <div className="bg-surface border border-border rounded-lg px-4 py-2.5 text-xs font-mono">{date}</div>
      </div>
    </div>
  );
}

