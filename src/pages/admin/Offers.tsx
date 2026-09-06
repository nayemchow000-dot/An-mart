import { Helmet } from 'react-helmet-async';
import { Plus, Tag, Search } from 'lucide-react';

export default function Offers() {
  return (
    <>
      <Helmet>
        <title>Offers & Promotions | Admin | AN Mart</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-serif font-bold text-gray-900">Offers & Promotions</h1>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Create Offer
          </button>
        </div>
        
        <div className="card-premium p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Search offers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Tag size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No active offers</h3>
            <p className="text-gray-500">Create special offers, flash sales, and combo deals to boost sales.</p>
          </div>
        </div>
      </div>
    </>
  );
}
