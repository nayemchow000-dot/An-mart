import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Bot, Link as LinkIcon, Settings2, Play, Trash2, CheckCircle2, XCircle, AlertCircle, RefreshCw, Image as ImageIcon, Save, Edit3, X } from 'lucide-react';
import { useSmartImporterStore } from '../../store/useSmartImporterStore';
import { ImportItem } from '../../types/importer';
import toast from 'react-hot-toast';

export default function SmartImporter() {
  const { 
    items, 
    settings, 
    isImporting, 
    addUrls, 
    updateSettings, 
    startImport, 
    clearAll, 
    removeItems,
    updateItem,
    importSelectedToStore
  } = useSmartImporterStore();

  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'input' | 'settings' | 'preview'>('input');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<ImportItem | null>(null);

  const handleAddUrls = () => {
    const urls = urlInput.split(/[\n,]+/).map(u => u.trim()).filter(u => u.startsWith('http'));
    if (urls.length === 0) {
      toast.error('Please enter valid HTTP/HTTPS URLs');
      return;
    }
    addUrls(urls);
    setUrlInput('');
    setActiveTab('preview');
    toast.success(`${urls.length} URLs added to queue`);
  };

  const handleStartImport = () => {
    startImport();
    setActiveTab('preview');
  };

  const handleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(i => i.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleImportToDatabase = async () => {
    const readySelected = selectedIds.filter(id => items.find(i => i.id === id)?.status === 'ready');
    if (readySelected.length === 0) {
      toast.error('No ready products selected');
      return;
    }
    
    const loadingToast = toast.loading(`Saving ${readySelected.length} products to AN Mart...`);
    await importSelectedToStore(readySelected);
    toast.dismiss(loadingToast);
    toast.success('Selected products saved successfully!');
    setSelectedIds([]);
  };

  const stats = {
    total: items.length,
    waiting: items.filter(i => i.status === 'waiting').length,
    processing: items.filter(i => ['analyzing', 'extracting', 'processing', 'uploading_images'].includes(i.status)).length,
    ready: items.filter(i => i.status === 'ready').length,
    imported: items.filter(i => i.status === 'imported').length,
    failed: items.filter(i => i.status === 'failed' || i.status === 'duplicate').length,
  };

  return (
    <>
      <Helmet>
        <title>Smart Importer | AN Mart Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bot className="text-primary" size={28} />
              Smart Importer
            </h1>
            <p className="text-gray-500 mt-1">AI-assisted bulk product extraction and publishing</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleStartImport}
              disabled={isImporting || stats.waiting === 0}
              className="btn-primary flex items-center gap-2 px-6 disabled:opacity-50"
            >
              {isImporting ? (
                <><RefreshCw className="animate-spin" size={18} /> Processing...</>
              ) : (
                <><Play size={18} /> Start Extraction</>
              )}
            </button>
            {(stats.ready > 0) && (
               <button 
                onClick={handleImportToDatabase}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
              >
                <Save size={18} /> Publish to Store ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total URLs</div>
          </div>
          <div className="text-center border-l border-gray-100">
            <div className="text-2xl font-bold text-gray-500">{stats.waiting}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Waiting</div>
          </div>
          <div className="text-center border-l border-gray-100">
            <div className="text-2xl font-bold text-blue-500">{stats.processing}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Processing</div>
          </div>
          <div className="text-center border-l border-gray-100">
            <div className="text-2xl font-bold text-emerald-500">{stats.ready}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Ready</div>
          </div>
          <div className="text-center border-l border-gray-100">
            <div className="text-2xl font-bold text-purple-500">{stats.imported}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Imported</div>
          </div>
          <div className="text-center border-l border-gray-100">
            <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Failed</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button 
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'input' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('input')}
          >
            <LinkIcon size={16} /> Source URLs
          </button>
          <button 
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'preview' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('preview')}
          >
            <CheckCircle2 size={16} /> Queue & Preview
          </button>
          <button 
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings2 size={16} /> Rules & Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
          
          {/* INPUT TAB */}
          {activeTab === 'input' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Paste Product URLs</label>
                <p className="text-sm text-gray-500 mb-4">Paste the URLs of the products you want to import. Separate multiple URLs with commas or new lines.</p>
                <textarea 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full h-64 input-field font-mono text-sm"
                  placeholder="https://example.com/product-1&#10;https://example.com/product-2"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button className="btn-secondary" onClick={() => setUrlInput('')}>Clear</button>
                <button className="btn-primary" onClick={handleAddUrls}>Add to Queue</button>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Categorization */}
                <div className="space-y-4 bg-gray-50 p-5 rounded-lg border border-gray-100">
                  <h3 className="font-bold text-gray-900 border-b pb-2">Categorization</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fallback Category</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={settings.defaultCategory}
                      onChange={(e) => updateSettings({ defaultCategory: e.target.value })}
                      placeholder="e.g. Skincare"
                    />
                  </div>
                </div>

                {/* Pricing Rules */}
                <div className="space-y-4 bg-gray-50 p-5 rounded-lg border border-gray-100">
                  <h3 className="font-bold text-gray-900 border-b pb-2">Pricing Engine</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Modification Rule</label>
                    <select 
                      className="input-field mb-3"
                      value={settings.priceRuleType}
                      onChange={(e) => updateSettings({ priceRuleType: e.target.value as any })}
                    >
                      <option value="none">Use exact source price</option>
                      <option value="add_fixed">Add fixed markup amount (+৳)</option>
                      <option value="add_percent">Add percentage markup (+%)</option>
                    </select>
                    
                    {settings.priceRuleType !== 'none' && (
                      <input 
                        type="number" 
                        className="input-field"
                        value={settings.priceRuleValue}
                        onChange={(e) => updateSettings({ priceRuleValue: Number(e.target.value) })}
                        placeholder="Value"
                      />
                    )}
                  </div>
                </div>

                {/* Inventory & Status */}
                <div className="space-y-4 bg-gray-50 p-5 rounded-lg border border-gray-100">
                  <h3 className="font-bold text-gray-900 border-b pb-2">Inventory Defaults</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Stock Amount</label>
                    <input 
                      type="number" 
                      className="input-field mb-3"
                      value={settings.defaultStock}
                      onChange={(e) => updateSettings({ defaultStock: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Publish Status</label>
                    <select 
                      className="input-field"
                      value={settings.defaultStatus}
                      onChange={(e) => updateSettings({ defaultStatus: e.target.value as any })}
                    >
                      <option value="draft">Draft (Requires manual review)</option>
                      <option value="published">Published (Live instantly)</option>
                    </select>
                  </div>
                </div>

                {/* Delivery */}
                <div className="space-y-4 bg-gray-50 p-5 rounded-lg border border-gray-100">
                  <h3 className="font-bold text-gray-900 border-b pb-2">Delivery Defaults</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Charge (৳)</label>
                    <input 
                      type="number" 
                      className="input-field mb-3"
                      value={settings.deliveryCharge}
                      onChange={(e) => updateSettings({ deliveryCharge: Number(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="cod"
                      checked={settings.isCodAvailable}
                      onChange={(e) => updateSettings({ isCodAvailable: e.target.checked })}
                      className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300"
                    />
                    <label htmlFor="cod" className="text-sm font-medium text-gray-700">Enable Cash on Delivery</label>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* PREVIEW TAB */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              
              {items.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                    <Bot size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Queue is empty</h3>
                  <p className="text-gray-500 mt-2">Go to the Source URLs tab to add products.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.length === items.length && items.length > 0}
                        onChange={handleSelectAll}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <span>Select All ({selectedIds.length} selected)</span>
                    </div>
                    <button 
                      onClick={() => {
                        removeItems(selectedIds);
                        setSelectedIds([]);
                      }}
                      disabled={selectedIds.length === 0}
                      className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                    >
                      <Trash2 size={16} /> Remove Selected
                    </button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                          <th className="p-4 w-12"></th>
                          <th className="p-4">Product Info</th>
                          <th className="p-4">Price</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                              <input 
                                type="checkbox" 
                                checked={selectedIds.includes(item.id)}
                                onChange={() => handleToggleSelect(item.id)}
                                className="rounded text-primary focus:ring-primary"
                              />
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                  {item.importedImages?.[0] ? (
                                    <img src={item.importedImages[0]} alt="Thumbnail" className="w-full h-full object-cover" />
                                  ) : (
                                    <ImageIcon className="text-gray-400" size={20} />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-gray-900 truncate max-w-[200px] md:max-w-[400px]">
                                    {item.productData?.title || 'Pending Extraction'}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500 truncate max-w-[150px]">{item.sourceUrl}</span>
                                    {item.productData?.category && (
                                      <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                        {item.productData.category}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-medium text-gray-900">
                              {item.productData?.price ? `৳${item.productData.price}` : '-'}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                item.status === 'ready' ? 'bg-emerald-100 text-emerald-700' :
                                item.status === 'imported' ? 'bg-purple-100 text-purple-700' :
                                item.status === 'failed' || item.status === 'duplicate' ? 'bg-red-100 text-red-700' :
                                item.status === 'waiting' ? 'bg-gray-100 text-gray-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {item.status === 'failed' && <XCircle size={14} />}
                                {item.status === 'ready' && <CheckCircle2 size={14} />}
                                {item.status === 'imported' && <CheckCircle2 size={14} />}
                                {['analyzing', 'extracting', 'processing', 'uploading_images'].includes(item.status) && <RefreshCw size={14} className="animate-spin" />}
                                {item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                              {item.errorMessage && (
                                <div className="text-xs text-red-500 mt-1 flex items-start gap-1 max-w-[200px]">
                                  <AlertCircle size={12} className="shrink-0 mt-0.5" />
                                  <span className="truncate">{item.errorMessage}</span>
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {item.status === 'ready' && (
                                  <>
                                    <button
                                      onClick={() => importSelectedToStore([item.id])}
                                      className="text-emerald-600 hover:text-emerald-700 p-1"
                                      title="Publish"
                                    >
                                      <Save size={18} />
                                    </button>
                                    <button
                                      onClick={() => setEditingItem(item)}
                                      className="text-blue-500 hover:text-blue-700 p-1"
                                      title="Edit Details"
                                    >
                                      <Edit3 size={18} />
                                    </button>
                                  </>
                                )}
                                <button 
                                  onClick={() => removeItems([item.id])}
                                  className="text-gray-400 hover:text-red-500 p-1"
                                  title="Remove"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && editingItem.productData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Edit Extracted Data</h2>
              <button 
                onClick={() => setEditingItem(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title (English)</label>
                  <input 
                    type="text" 
                    className="input-field"
                    value={editingItem.productData.title || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, productData: { ...editingItem.productData, title: e.target.value }})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title (Bengali)</label>
                  <input 
                    type="text" 
                    className="input-field"
                    value={editingItem.productData.titleBn || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, productData: { ...editingItem.productData, titleBn: e.target.value }})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input 
                    type="number" 
                    className="input-field"
                    value={editingItem.productData.price || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, productData: { ...editingItem.productData, price: Number(e.target.value) }})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input 
                    type="number" 
                    className="input-field"
                    value={editingItem.productData.stock || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, productData: { ...editingItem.productData, stock: Number(e.target.value) }})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input 
                    type="text" 
                    className="input-field"
                    value={editingItem.productData.category || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, productData: { ...editingItem.productData, category: e.target.value }})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
                <textarea 
                  className="input-field h-32"
                  value={editingItem.productData.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, productData: { ...editingItem.productData, description: e.target.value }})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Bengali)</label>
                <textarea 
                  className="input-field h-32"
                  value={editingItem.productData.descriptionBn || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, productData: { ...editingItem.productData, descriptionBn: e.target.value }})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
                  <textarea 
                    className="input-field h-24"
                    value={editingItem.productData.benefits || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, productData: { ...editingItem.productData, benefits: e.target.value }})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">How to Use</label>
                  <textarea 
                    className="input-field h-24"
                    value={editingItem.productData.howToUse || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, productData: { ...editingItem.productData, howToUse: e.target.value }})}
                  />
                </div>
              </div>

            </div>
            
            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50">
              <button 
                className="btn-secondary"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  updateItem(editingItem.id, { productData: editingItem.productData });
                  setEditingItem(null);
                  toast.success('Product details updated');
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
