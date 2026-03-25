import { useState, useEffect } from 'react';
import { FileText, CheckCircle, ChevronDown, Plus, Search, Filter, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { workService } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';

const statusOptions = [
  { value: 'in-progress', label: '🔄 In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'completed', label: '✅ Completed', color: 'bg-green-100 text-green-700' },
  { value: 'blocked', label: '🚫 Blocked', color: 'bg-red-100 text-red-700' },
  { value: 'review', label: '👀 In Review', color: 'bg-yellow-100 text-yellow-700' },
];

export default function WorkUpdates() {
  const [form, setForm] = useState({ title: '', description: '', status: 'in-progress' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [updates, setUpdates] = useState([]);
  const [filter, setFilter] = useState('all');
  const { addToast } = useToast();

  const fetchUpdates = async () => {
    setFetching(true);
    try {
      const res = await workService.getMyWorkUpdates();
      setUpdates(res.data.data || []);
    } catch (err) {
      addToast('Failed to load work updates', 'error');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Task title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await workService.addWork(form);
      addToast('Work update submitted!', 'success');
      setForm({ title: '', description: '', status: 'in-progress' });
      fetchUpdates();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (val) => statusOptions.find(s => s.value === val) || statusOptions[0];

  const filteredUpdates = filter === 'all' 
    ? updates 
    : updates.filter(u => u.status === filter);

  if (fetching) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-green-500" size={30} /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Updates</h1>
          <p className="text-gray-500 mt-1 text-sm">Log and manage your tasks, progress, and blockers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-5 h-fit lg:sticky lg:top-6">
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Plus size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Add Work Update</h3>
                <p className="text-xs text-gray-400">Record what you're working on</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Task Title <span className="text-red-500">*</span></label>
                <input
                  value={form.title}
                  onChange={e => { setForm(v => ({ ...v, title: e.target.value })); setErrors(v => ({ ...v, title: '' })); }}
                  placeholder="e.g., Fixed login page bug"
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500
                    ${errors.title ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'}`}
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
                <textarea
                  value={form.description}
                  onChange={e => { setForm(v => ({ ...v, description: e.target.value })); setErrors(v => ({ ...v, description: '' })); }}
                  placeholder="Describe your progress..."
                  rows={4}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                    ${errors.description ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'}`}
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(v => ({ ...v, status: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 hover:border-gray-300 px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                >
                  {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <Button onClick={handleSubmit} loading={loading} className="w-full" icon={FileText}>
                Submit Update
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: History & Filters */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                ${filter === 'all' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-300'}`}
            >
              All
            </button>
            {statusOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap
                  ${filter === opt.value ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-300'}`}
              >
                {opt.label.split(' ')[1] || opt.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredUpdates.length > 0 ? (
              filteredUpdates.map((item, i) => {
                const sc = getStatusConfig(item.status);
                return (
                  <Card key={item._id} hover className="border-l-4 border-l-transparent hover:border-l-green-500 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-gray-200">•</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {new Date(item.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-base">{item.taskTitle}</h4>
                        <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{item.description}</p>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shrink-0 shadow-sm ${sc.color}`}>
                        {sc.label.split(' ')[1] || sc.label}
                      </span>
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="text-center py-16">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <Filter size={24} className="text-gray-200" />
                </div>
                <p className="text-gray-500 font-bold">No updates found</p>
                <p className="text-gray-400 text-sm mt-1">Try changing the filter or log a new update</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
