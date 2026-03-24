import { useState } from 'react';
import { FileText, CheckCircle, ChevronDown, Plus } from 'lucide-react';
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
  const [submitted, setSubmitted] = useState([]);
  const { addToast } = useToast();

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
      setSubmitted(v => [{ ...form, time: new Date() }, ...v]);
      addToast('Work update submitted!', 'success');
      setForm({ title: '', description: '', status: 'in-progress' });
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (val) => statusOptions.find(s => s.value === val) || statusOptions[0];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Work Updates</h1>
        <p className="text-gray-500 mt-1 text-sm">Log your daily tasks, progress, and blockers</p>
      </div>

      {/* Form */}
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Plus size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Add Work Update</h3>
            <p className="text-xs text-gray-400">What did you work on today?</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Task Title <span className="text-red-500">*</span></label>
            <input
              value={form.title}
              onChange={e => { setForm(v => ({ ...v, title: e.target.value })); setErrors(v => ({ ...v, title: '' })); }}
              placeholder="e.g., Fixed login page bug"
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500
                ${errors.title ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'}`}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
            <textarea
              value={form.description}
              onChange={e => { setForm(v => ({ ...v, description: e.target.value })); setErrors(v => ({ ...v, description: '' })); }}
              placeholder="Describe the work you did, any challenges faced, or next steps..."
              rows={4}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                ${errors.description ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'}`}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <div className="relative">
              <select
                value={form.status}
                onChange={e => setForm(v => ({ ...v, status: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 hover:border-gray-300 px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
              >
                {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <Button onClick={handleSubmit} loading={loading} size="lg" className="w-full" icon={FileText}>
            Submit Work Update
          </Button>
        </div>
      </Card>

      {/* Submitted updates */}
      {submitted.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Submitted Today</h3>
          <div className="space-y-3">
            {submitted.map((item, i) => {
              const sc = getStatusConfig(item.status);
              return (
                <Card key={i} hover>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle size={16} className="text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                        <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">{item.description}</p>
                        <p className="text-xs text-gray-400 mt-2">{item.time.toLocaleTimeString('en-IN')}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${sc.color}`}>
                      {sc.label}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {submitted.length === 0 && (
        <Card className="text-center py-12">
          <FileText size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No updates yet today</p>
          <p className="text-gray-400 text-sm mt-1">Submit your first work update above</p>
        </Card>
      )}
    </div>
  );
}
