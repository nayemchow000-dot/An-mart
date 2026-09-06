import { useDBErrorStore } from '../../store/useDBErrorStore';
import { AlertTriangle, Copy, Check, Terminal } from 'lucide-react';
import { useState } from 'react';

export default function DatabaseSetupAlert() {
  const { hasError, errorCode, sqlRequired, clearError } = useDBErrorStore();
  const [copied, setCopied] = useState(false);

  if (!hasError || !sqlRequired) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlRequired);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-red-50 p-6 border-b border-red-100 flex gap-4 items-start">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-800">Database Setup Required</h2>
            <p className="text-red-700 mt-1">
              Your Supabase database is blocking requests (Error: {errorCode}). To fix this, you need to run the following SQL script in your Supabase Dashboard to grant permissions and setup RLS policies.
            </p>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <Terminal size={18} /> SQL Query to Run
            </h3>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm font-medium"
            >
              {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy SQL</>}
            </button>
          </div>
          <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">
            {sqlRequired}
          </pre>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-white flex justify-end">
          <button 
            onClick={clearError}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            I have run the SQL script
          </button>
        </div>
      </div>
    </div>
  );
}
