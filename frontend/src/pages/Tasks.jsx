import { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle, AlertCircle, Trash2, User, Calendar, Filter, Loader2, X, ChevronRight, LayoutList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { taskService, adminService } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';

const priorityConfig = {
  low: { label: 'Low', color: 'bg-emerald-50 text-emerald-600', icon: Clock },
  medium: { label: 'Medium', color: 'bg-blue-50 text-blue-600', icon: Clock },
  high: { label: 'High', color: 'bg-orange-50 text-orange-600', icon: AlertCircle },
  urgent: { label: 'Urgent', color: 'bg-red-50 text-red-600', icon: AlertCircle },
};

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-slate-100 text-slate-600' },
  'in-progress': { label: 'In Progress', color: 'bg-brand-50 text-brand-600' },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
  blocked: { label: 'Blocked', color: 'bg-red-100 text-red-700' },
};

function TaskForm({ onUpdate, employees }) {
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    assignedTo: '', 
    priority: 'medium', 
    dueDate: '' 
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.assignedTo) {
      return addToast('Please fill all required fields.', 'error');
    }
    
    setLoading(true);
    try {
      await taskService.createTask(form);
      addToast('Task assigned successfully!', 'success');
      setForm({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });
      if (onUpdate) onUpdate();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to assign task.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Task Title *</label>
        <input
          value={form.title}
          onChange={e => setForm(v => ({ ...v, title: e.target.value }))}
          placeholder="e.g., Update system documentation"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Assign To *</label>
        <select
          value={form.assignedTo}
          onChange={e => setForm(v => ({ ...v, assignedTo: e.target.value }))}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          required
        >
          <option value="">Select an employee</option>
          {employees.map(emp => (
            <option key={emp._id} value={emp._id}>{emp.email} ({emp.role})</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Priority</label>
          <select
            value={form.priority}
            onChange={e => setForm(v => ({ ...v, priority: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={e => setForm(v => ({ ...v, dueDate: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={form.description}
          onChange={e => setForm(v => ({ ...v, description: e.target.value }))}
          placeholder="Details of the task..."
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
      </div>

      <Button type="submit" loading={loading} className="w-full">Assign Task</Button>
    </form>
  );
}

function TaskCard({ task, onStatusUpdate, onDelete, isAdmin, delay }) {
  const p = priorityConfig[task.priority];
  const s = statusConfig[task.status];
  const PriorityIcon = p.icon;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${delay}ms` }}>
      <Card hover padding="lg" className="h-full border-none shadow-premium relative group overflow-hidden">
        {/* Status indicator bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${s.color.split(' ')[0].replace('bg-', 'bg-')}`}></div>
        
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-wrap gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${p.color} flex items-center gap-1.5`}>
                <PriorityIcon size={12} />
                {p.label}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${s.color}`}>
                {s.label}
              </span>
            </div>
            {isAdmin && (
              <button 
                onClick={() => onDelete(task._id)} 
                className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all duration-300 transform hover:scale-110"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <h4 className="font-bold text-slate-900 text-xl mb-2 tracking-tight line-clamp-2 group-hover:text-brand-600 transition-colors">{task.title}</h4>
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-1 font-medium">{task.description}</p>

          <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
            <div className="flex items-center gap-3">
              {isAdmin ? (
                 <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border border-white shadow-sm">
                      <User size={14} className="text-slate-600" />
                   </div>
                   <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Assigned To</p>
                      <p className="text-xs font-bold text-slate-700 truncate">{task.assignedTo?.email?.split('@')[0]}</p>
                   </div>
                 </div>
              ) : (
                 <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
                      <Calendar size={14} className="text-emerald-600" />
                   </div>
                   <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Due Date</p>
                      <p className="text-xs font-bold text-slate-700">{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Flexible'}</p>
                   </div>
                 </div>
              )}
            </div>

            {!isAdmin && task.status !== 'completed' && (
              <div className="relative group/select">
                <select
                  value={task.status}
                  onChange={(e) => onStatusUpdate(task._id, e.target.value)}
                  className="appearance-none text-[10px] font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-4 py-2 rounded-xl outline-none cursor-pointer border border-brand-100 hover:bg-brand-100 transition-all shadow-sm pr-8"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
                <ChevronRight size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-500 pointer-events-none group-hover/select:translate-x-0.5 transition-transform rotate-90" />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const { addToast } = useToast();

  const isAdmin = user?.role === 'admin';

  const loadData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [taskRes, empRes] = await Promise.all([
          taskService.getAdminTasks(),
          adminService.getEmployees()
        ]);
        setTasks(taskRes.data.data || []);
        setEmployees(empRes.data.data || []);
      } else {
        const res = await taskService.getMyTasks();
        setTasks(res.data.data || []);
      }
    } catch (err) {
      addToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await taskService.updateTaskStatus(id, status);
      addToast('Status updated', 'success');
      loadData();
    } catch {
      addToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(id);
      addToast('Task deleted', 'success');
      loadData();
    } catch {
      addToast('Failed to delete task', 'error');
    }
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-green-500" size={30} /></div>;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutList className="text-green-500" />
            Task Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin ? 'Assign and monitor work across the team' : 'Manage your assigned work and updates'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowAddModal(true)} icon={Plus}>Assign New Task</Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-none">
        <button
          onClick={() => setFilter('all')}
          className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all duration-300
            ${filter === 'all' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105' : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-300 shadow-sm hover:bg-slate-50'}`}
        >
          All Tasks ({tasks.length})
        </button>
        {Object.entries(statusConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 flex items-center gap-2 whitespace-nowrap
              ${filter === key ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105' : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-300 shadow-sm hover:bg-slate-50'}`}
          >
            {config.label} ({tasks.filter(t => t.status === key).length})
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <Card glass className="text-center py-24 flex flex-col items-center border-dashed border-2 border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 text-slate-200 shadow-inner">
            <LayoutList size={40} />
          </div>
          <h3 className="font-black text-slate-900 text-xl tracking-tight">No Workspace Tasks</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto font-medium leading-relaxed">
            {isAdmin ? "The queue is clear. No assignments found for this category." : "You're all caught up! No tasks assigned here."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTasks.map((task, idx) => (
            <TaskCard
              key={task._id}
              task={task}
              isAdmin={isAdmin}
              delay={idx * 100}
              onStatusUpdate={handleStatusUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold text-gray-900">New Task Assignment</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <TaskForm employees={employees} onUpdate={() => { setShowAddModal(false); loadData(); }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
