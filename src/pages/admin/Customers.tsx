import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Mail, Phone, MapPin, Loader2, Calendar } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../config/supabase';
import toast from 'react-hot-toast';

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setCustomers(data || []);
    } catch (error) {
      console.warn('Error fetching customers:', error);
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => 
    (customer.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone || '').includes(searchTerm)
  );

  return (
    <>
      <Helmet>
        <title>Manage Customers | Admin</title>
      </Helmet>

      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name, email or phone..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-white"
              />
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Note: For security reasons, user passwords are encrypted by the database and cannot be viewed by administrators.
            </p>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchTerm ? 'No customers found matching your search.' : 'No customers registered yet.'}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">Customer Details</th>
                    <th className="p-4 font-medium">Contact Info</th>
                    <th className="p-4 font-medium">Location</th>
                    <th className="p-4 font-medium">Joined Date</th>
                    <th className="p-4 font-medium">Role</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold uppercase shrink-0">
                            {(customer.full_name || customer.email || 'U').charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{customer.full_name || 'No Name Provided'}</div>
                            <div className="text-xs text-gray-500 font-mono mt-0.5">{customer.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail size={14} className="text-gray-400" /> 
                            <a href={`mailto:${customer.email}`} className="hover:text-primary transition-colors">{customer.email}</a>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone size={14} className="text-gray-400" /> 
                              <a href={`tel:${customer.phone}`} className="hover:text-primary transition-colors">{customer.phone}</a>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {customer.address ? (
                          <div className="flex items-start gap-2 text-gray-600">
                            <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" /> 
                            <span className="text-xs line-clamp-2 max-w-[200px]">{customer.address}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Not provided</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          {customer.created_at ? new Date(customer.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          }) : 'Unknown'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                          customer.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {customer.role || 'Customer'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
