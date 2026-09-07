import { Helmet } from 'react-helmet-async';
import { Save, Loader2, RotateCcw } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { useSiteConfigStore } from '../../store/useSiteConfigStore';
import { useState, useEffect } from 'react';

export default function AdminSettings() {
  const { 
    draftConfig, 
    updateBranding, 
    publishChanges, 
    hasUnsavedChanges, 
    initializeStore, 
    isLoading,
    discardChanges
  } = useSiteConfigStore();
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  const handleSave = async () => {
    setIsSaving(true);
    await publishChanges();
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Store Settings | Admin</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Store Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">General Information</h2>
                {hasUnsavedChanges && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">Unsaved Changes</span>
                )}
              </div>
              
              <Input 
                label="Store Name" 
                value={draftConfig.branding.storeName || ''}
                onChange={(e) => updateBranding({ storeName: e.target.value })}
              />
              <Input 
                label="Support Email" 
                value={draftConfig.branding.contactEmail || ''}
                onChange={(e) => updateBranding({ contactEmail: e.target.value })}
              />
              <Input 
                label="Contact Phone" 
                value={draftConfig.branding.contactPhone || ''}
                onChange={(e) => updateBranding({ contactPhone: e.target.value })}
              />
              
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Store Address</label>
                <textarea 
                  rows={3}
                  value={(draftConfig.branding as any).address || ''}
                  onChange={(e) => updateBranding({ address: e.target.value } as any)}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
                <button 
                  onClick={handleSave}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="btn-primary py-3 px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                  Save Changes
                </button>

                {hasUnsavedChanges && (
                  <button 
                    onClick={discardChanges}
                    disabled={isSaving}
                    className="py-3 px-4 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <RotateCcw size={18} /> Discard
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
