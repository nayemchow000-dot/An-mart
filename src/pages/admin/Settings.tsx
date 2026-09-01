import { Helmet } from 'react-helmet-async';
import { Save } from 'lucide-react';
import { Input } from '../../components/ui/Input';

export default function AdminSettings() {
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
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">General Information</h2>
              
              <Input 
                label="Store Name" 
                defaultValue="AN Mart"
              />
              <Input 
                label="Support Email" 
                defaultValue="support@anmart.com.bd"
              />
              <Input 
                label="Contact Phone" 
                defaultValue="+880 1234 567890"
              />
              
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Store Address</label>
                <textarea 
                  rows={3}
                  defaultValue="Dhaka, Bangladesh"
                  className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              <button className="btn-primary py-3 px-6 mt-4 flex items-center gap-2">
                <Save size={18} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
