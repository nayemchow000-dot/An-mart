import React from 'react';
import { LandingPageConfig } from './types';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  activeTab: string;
  config: LandingPageConfig;
  setConfig: (c: LandingPageConfig) => void;
  product: any;
}

export default function BuilderEditor({ activeTab, config, setConfig, product }: Props) {
  const update = (key: keyof LandingPageConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  const renderGlobal = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Global Settings</h2>
      
      <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-4">
        <h3 className="font-semibold text-gray-800">Announcement Bar</h3>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.announcementEnabled} onChange={(e) => update('announcementEnabled', e.target.checked)} className="rounded text-primary" />
          <span>Enable Announcement Bar</span>
        </label>
        {config.announcementEnabled && (
          <input type="text" value={config.announcementText} onChange={e => update('announcementText', e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="Announcement text..." />
        )}
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-4">
        <h3 className="font-semibold text-gray-800">Countdown Timer</h3>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.countdownEnabled} onChange={(e) => update('countdownEnabled', e.target.checked)} className="rounded text-primary" />
          <span>Enable Offer Countdown</span>
        </label>
        {config.countdownEnabled && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Countdown Text</label>
              <input type="text" value={config.countdownText} onChange={e => update('countdownText', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm mb-1">End Time</label>
              <input type="datetime-local" value={config.countdownEndTime.slice(0, 16)} onChange={e => update('countdownEndTime', new Date(e.target.value).toISOString())} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-4">
        <h3 className="font-semibold text-gray-800">Trust Badges</h3>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.trustBadgesEnabled} onChange={(e) => update('trustBadgesEnabled', e.target.checked)} className="rounded text-primary" />
          <span>Enable Trust Badges</span>
        </label>
        {config.trustBadgesEnabled && (
          <div className="space-y-2">
            {config.trustBadges.map((badge, idx) => (
              <div key={badge.id} className="flex gap-2">
                <input type="text" value={badge.text} onChange={e => {
                  const newBadges = [...config.trustBadges];
                  newBadges[idx].text = e.target.value;
                  update('trustBadges', newBadges);
                }} className="flex-1 px-4 py-2 border rounded-lg" />
                <button onClick={() => update('trustBadges', config.trustBadges.filter(b => b.id !== badge.id))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
              </div>
            ))}
            <button onClick={() => update('trustBadges', [...config.trustBadges, { id: uuidv4(), text: 'New Badge' }])} className="text-primary text-sm font-medium flex items-center gap-1 mt-2">
              <Plus size={16}/> Add Badge
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderHero = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Hero Section</h2>
      <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-4">
        <p className="text-sm text-gray-500 mb-4">The main product image, regular price, and discount price are automatically pulled from the product data.</p>
        <div>
          <label className="block text-sm font-medium mb-1">Hero Title (Overrides default product title)</label>
          <input type="text" value={config.heroTitle} onChange={e => update('heroTitle', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Short Subtitle / Description</label>
          <textarea rows={3} value={config.heroSubtitle} onChange={e => update('heroSubtitle', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Primary CTA Button</label>
            <input type="text" value={config.heroCTA} onChange={e => update('heroCTA', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Secondary CTA Button</label>
            <input type="text" value={config.heroSecondaryCTA} onChange={e => update('heroSecondaryCTA', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderArraySection = (
    title: string, 
    key: keyof LandingPageConfig, 
    items: any[], 
    fields: {key: string, label: string, type?: 'text'|'textarea'|'number'}[],
    defaultItem: any
  ) => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">{title} Section</h2>
      <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-4">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Section Title</label>
          <input type="text" value={(config as any)[`${String(key)}Title`] || ''} onChange={e => update(`${String(key)}Title` as keyof LandingPageConfig, e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
        </div>
        
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={item.id} className="p-4 border border-gray-200 rounded-lg relative">
              <button onClick={() => {
                const newItems = [...items];
                newItems.splice(idx, 1);
                update(key, newItems);
              }} className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button>
              
              <div className="space-y-3 mt-2">
                {fields.map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
                    {f.type === 'textarea' ? (
                      <textarea value={item[f.key]} onChange={e => {
                        const newItems = [...items];
                        newItems[idx][f.key] = e.target.value;
                        update(key, newItems);
                      }} className="w-full px-3 py-1.5 border rounded-lg text-sm" rows={2}/>
                    ) : (
                      <input type={f.type || 'text'} value={item[f.key]} onChange={e => {
                        const newItems = [...items];
                        newItems[idx][f.key] = f.type === 'number' ? Number(e.target.value) : e.target.value;
                        update(key, newItems);
                      }} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => update(key, [...items, { id: uuidv4(), ...defaultItem }])} className="btn-outline w-full py-2 flex items-center justify-center gap-2">
          <Plus size={16}/> Add Item
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'global': return renderGlobal();
      case 'hero': return renderHero();
      case 'problem': 
        return renderArraySection('Problem', 'problems', config.problems, [
          { key: 'title', label: 'Problem Title' },
          { key: 'description', label: 'Short Description', type: 'textarea' },
          { key: 'icon', label: 'Icon / Image URL' }
        ], { title: 'New Problem', description: '', icon: '' });
      case 'benefits': 
        return renderArraySection('Solution & Benefits', 'solutions', config.solutions, [
          { key: 'title', label: 'Benefit Title' },
          { key: 'description', label: 'Short Description', type: 'textarea' },
          { key: 'icon', label: 'Icon / Image URL' }
        ], { title: 'New Benefit', description: '', icon: '' });
      case 'ingredients': 
        return renderArraySection('Ingredients', 'ingredients', config.ingredients, [
          { key: 'name', label: 'Ingredient Name' },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'value', label: 'Value/Percentage (Optional)' }
        ], { name: 'New Ingredient', description: '', value: '' });
      case 'packages': 
        return renderArraySection('Packages / Combos', 'packages', config.packages, [
          { key: 'name', label: 'Package Name (e.g., 2 Bottle Combo)' },
          { key: 'quantity', label: 'Quantity', type: 'number' },
          { key: 'regularPrice', label: 'Regular Price', type: 'number' },
          { key: 'salePrice', label: 'Sale Price', type: 'number' },
          { key: 'badge', label: 'Badge (e.g., Best Value)' },
          { key: 'description', label: 'Short Description' }
        ], { name: 'New Package', quantity: 1, regularPrice: product?.price || 0, salePrice: product?.discountPrice || product?.price || 0, badge: '', description: '' });
      case 'faq':
        return renderArraySection('FAQs', 'faqs', config.faqs, [
          { key: 'question', label: 'Question' },
          { key: 'answer', label: 'Answer', type: 'textarea' }
        ], { question: '', answer: '' });
      case 'video':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Video Section</h2>
            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <label className="block text-sm font-medium mb-1">YouTube / Vimeo URL</label>
              <input type="text" value={config.videoUrl} onChange={e => update('videoUrl', e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="https://youtube.com/watch?v=..." />
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Contact Section</h2>
            <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-4">
              <label className="flex items-center gap-2 mb-4">
                <input type="checkbox" checked={config.contactEnabled} onChange={(e) => update('contactEnabled', e.target.checked)} className="rounded text-primary" />
                <span>Enable Contact Section</span>
              </label>
              <div>
                <label className="block text-sm mb-1">Title</label>
                <input type="text" value={config.contactTitle} onChange={e => update('contactTitle', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Phone Number</label>
                  <input type="text" value={config.contactPhone} onChange={e => update('contactPhone', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm mb-1">WhatsApp Number</label>
                  <input type="text" value={config.contactWhatsApp} onChange={e => update('contactWhatsApp', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        );
      default: return <div className="p-8 text-center text-gray-500">Select a section to edit</div>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
}
