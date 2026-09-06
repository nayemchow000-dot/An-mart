import { Helmet } from 'react-helmet-async';
import { FileText, Save } from 'lucide-react';

export default function LegalPages() {
  return (
    <>
      <Helmet>
        <title>Legal Pages | Admin | AN Mart</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-serif font-bold text-gray-900">Legal Pages</h1>
          <button className="btn-primary flex items-center gap-2">
            <Save size={18} />
            Save Content
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card-premium p-4 space-y-2">
            <button className="w-full text-left px-4 py-3 bg-primary-50 text-primary font-medium rounded-lg">
              Terms & Conditions
            </button>
            <button className="w-full text-left px-4 py-3 text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors">
              Privacy Policy
            </button>
            <button className="w-full text-left px-4 py-3 text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors">
              Refund Policy
            </button>
            <button className="w-full text-left px-4 py-3 text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors">
              Shipping Policy
            </button>
          </div>
          
          <div className="md:col-span-3 card-premium p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                <FileText size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Terms & Conditions</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                <input 
                  type="text" 
                  defaultValue="Terms & Conditions"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Content</label>
                <textarea 
                  rows={15}
                  defaultValue="Welcome to AN Mart. By using our website, you agree to these terms..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary resize-none font-mono text-sm"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
