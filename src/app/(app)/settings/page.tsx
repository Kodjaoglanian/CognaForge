'use client';

import { PageTitle } from '@/components/shared/page-title';
import { AppSettings } from '@/components/settings/AppSettings';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Configurações"
        description="Gerencie suas preferências e configurações do aplicativo."
      />

      {/* AppSettings component with comprehensive adjustment tools */}
      <AppSettings />
    </div>
  );
}
