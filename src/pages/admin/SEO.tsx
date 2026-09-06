import { Helmet } from 'react-helmet-async';
import { Globe, Save } from 'lucide-react';

export default function SEO() {
  return (
    <>
      <Helmet>
        <title>SEO Management | Admin | AN Mart</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-serif font-bold text-gray-900">SEO Management</h1>
          <button className="btn-primary flex items-center gap-2">
            <Save size={18} />
            Save Changes
          </button>
        </div>
        
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-primary-50 text-primary rounded-lg">
              <Globe size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Global SEO Settings</h2>
              <p className="text-sm text-gray-500">Configure default meta tags for your store</p>
            </div>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Global Meta Title</label>
              <input 
                type="text" 
                defaultValue="AN Mart | Premium E-commerce"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
              />
              <p className="mt-1 text-xs text-gray-500">This title will be used if a specific page doesn't have one.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Global Meta Description</label>
              <textarea 
                rows={3}
                defaultValue="Discover premium products at AN Mart. Shop the latest trends with fast shipping and secure payments."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary resize-none"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Social Sharing Image (OG Image)</label>
              <div className="flex items-center gap-4 mt-2">
                <div className="w-32 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-400">Preview</span>
                </div>
                <button className="btn-outline text-sm">Upload Image</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
