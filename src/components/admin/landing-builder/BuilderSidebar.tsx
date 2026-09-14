import React from 'react';
import { LandingPageConfig, LandingPageSection } from './types';
import { Settings, Layout, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (t: string) => void;
  config: LandingPageConfig;
  setConfig: (c: LandingPageConfig) => void;
}

export default function BuilderSidebar({ activeTab, setActiveTab, config, setConfig }: Props) {
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...config.sections];
    if (direction === 'up' && index > 0) {
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    } else if (direction === 'down' && index < newSections.length - 1) {
      [newSections[index + 1], newSections[index]] = [newSections[index], newSections[index + 1]];
    }
    // Update order values
    newSections.forEach((s, i) => s.order = i);
    setConfig({ ...config, sections: newSections });
  };

  const toggleVisibility = (id: string) => {
    setConfig({
      ...config,
      sections: config.sections.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s)
    });
  };

  const getIcon = (type: string) => <Layout size={16} />;
  const getLabel = (type: string) => type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 overflow-y-auto">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Global Settings</h2>
        <button 
          onClick={() => setActiveTab('global')}
          className={`w-full flex items-center gap-2 p-3 text-sm rounded-lg transition-colors ${activeTab === 'global' ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Settings size={18} /> Global Config
        </button>
      </div>

      <div className="p-4 flex-1">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Sections</h2>
        <div className="space-y-1">
          {config.sections.sort((a, b) => a.order - b.order).map((section, index) => (
            <div 
              key={section.id} 
              className={`flex items-center gap-2 p-2 rounded-lg border ${activeTab === section.type ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-gray-50'}`}
            >
              <button 
                className="flex-1 flex items-center gap-2 text-sm text-left truncate"
                onClick={() => setActiveTab(section.type)}
              >
                {getIcon(section.type)}
                <span className={section.isVisible ? 'text-gray-900' : 'text-gray-400 line-through'}>
                  {getLabel(section.type)}
                </span>
              </button>
              
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleVisibility(section.id)} className="p-1 text-gray-400 hover:text-gray-700">
                  {section.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <div className="flex flex-col border-l border-gray-200 pl-1 ml-1">
                  <button disabled={index === 0} onClick={() => moveSection(index, 'up')} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">
                    <ArrowUp size={12} />
                  </button>
                  <button disabled={index === config.sections.length - 1} onClick={() => moveSection(index, 'down')} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">
                    <ArrowDown size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
