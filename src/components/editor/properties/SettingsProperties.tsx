/**
 * Properties panel header component
 */
function PanelHeader({ title }: { title: string }) {
  return (
    <div className="border-b bg-stone-50 px-4 py-3">
      <h3 className="font-semibold text-stone-800">{title}</h3>
    </div>
  );
}

/**
 * Settings properties panel.
 * Placeholder for future canvas-specific settings.
 */
export function SettingsProperties() {
  return (
    <div className="flex h-full flex-col">
      <PanelHeader title="Settings" />

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        <p className="text-sm text-stone-500">
          Canvas settings are available in the Settings tool panel.
        </p>
      </div>
    </div>
  );
}
