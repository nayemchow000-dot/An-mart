import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Save, Phone, Mail, MessageCircle, MapPin, CheckCircle, Clock } from 'lucide-react';
import { useSupportStore } from '../../store/useSupportStore';
import toast from 'react-hot-toast';

export default function AdminSupport() {
  const { settings, messages, updateSettings, updateMessageStatus, deleteMessage, initializeStore } = useSupportStore();
  const [activeTab, setActiveTab] = useState<'settings' | 'messages'>('settings');
  
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    whatsapp: '',
    messenger: '',
    address: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = initializeStore();
    return () => unsubscribe();
  }, [initializeStore]);

  useEffect(() => {
    if (settings) {
      setFormData({
        phone: settings.phone || '',
        email: settings.email || '',
        whatsapp: settings.whatsapp || '',
        messenger: settings.messenger || '',
        address: settings.address || ''
      });
    }
  }, [settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(formData);
      toast.success('Support settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'unread' | 'read' | 'replied') => {
    try {
      await updateMessageStatus(id, status);
      toast.success('Message status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(id);
        toast.success('Message deleted');
      } catch (error) {
        toast.error('Failed to delete message');
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Support & Contact | Admin</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-serif font-bold text-gray-900">Support Management</h1>
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'settings' ? 'bg-white shadow-sm text-primary' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Contact Settings
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'messages' ? 'bg-white shadow-sm text-primary' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Customer Messages
              {messages.filter(m => m.status === 'unread').length > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {messages.filter(m => m.status === 'unread').length}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === 'settings' && (
          <div className="card-premium p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Contact Information</h2>
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="+880 1XXXXXXXXX"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="support@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number (with country code)</label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="8801XXXXXXXXX"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Messenger Username/Page ID</label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      value={formData.messenger}
                      onChange={(e) => setFormData({...formData, messenger: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="yourpageusername"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Office Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                  <textarea 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={3}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary resize-none"
                    placeholder="Enter full office address"
                  ></textarea>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isSaving}
                className="btn-primary flex items-center gap-2"
              >
                <Save size={18} />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="card-premium overflow-hidden">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
                <p className="text-gray-500">When customers contact you, their messages will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {messages.map((msg) => (
                  <div key={msg.id} className={`p-6 transition-colors ${msg.status === 'unread' ? 'bg-[#FAFAFA]' : 'bg-white'}`}>
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                          {msg.name}
                          {msg.status === 'unread' && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                        </h4>
                        <p className="text-sm text-gray-500">{msg.phone}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                        
                        <select 
                          value={msg.status}
                          onChange={(e) => handleStatusChange(msg.id, e.target.value as 'unread' | 'read' | 'replied')}
                          className={`text-xs font-medium rounded-full px-3 py-1 border outline-none ${
                            msg.status === 'unread' ? 'bg-red-50 text-red-700 border-red-200' :
                            msg.status === 'replied' ? 'bg-green-50 text-green-700 border-green-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          <option value="unread">Unread</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                        </select>
                        <button onClick={() => handleDeleteMessage(msg.id)} className="text-red-500 text-sm hover:underline">Delete</button>
                      </div>
                    </div>
                    
                    <div className="bg-white border rounded-lg p-4 text-gray-700 whitespace-pre-wrap text-sm">
                      {msg.message}
                    </div>
                    
                    <div className="mt-4 flex gap-3">
                      <a 
                        href={`tel:${msg.phone}`} 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 transition-colors"
                      >
                        <Phone size={14} /> Call
                      </a>
                      <a 
                        href={`https://wa.me/88${msg.phone.replace(/[^0-9]/g, '')}?text=Hello ${msg.name}, regarding your message to AN Mart: `}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 rounded text-sm transition-colors font-medium"
                      >
                        <MessageCircle size={14} /> WhatsApp Reply
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
