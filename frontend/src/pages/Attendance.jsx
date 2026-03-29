import { useState, useEffect, useRef } from 'react';
import { LogIn, LogOut, Clock, CheckCircle, AlertCircle, MinusCircle, Calendar } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { attendanceService, profileService } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';

const todayStr = () => {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
};

const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--';

const fmtMins = (m) => {
  if (m == null) return '--';
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h}h ${min}m`;
};

const StatusBadge = ({ status }) => {
  const map = {
    present: { label: 'Present', cls: 'bg-green-100 text-green-700 border border-green-200', dot: 'bg-green-500', Icon: CheckCircle },
    'partially-present': { label: 'Partially Present', cls: 'bg-amber-100 text-amber-700 border border-amber-200', dot: 'bg-amber-500', Icon: MinusCircle },
    absent: { label: 'Absent', cls: 'bg-red-100 text-red-700 border border-red-200', dot: 'bg-red-500', Icon: AlertCircle },
    weekend: { label: 'Off Day', cls: 'bg-slate-100 text-slate-500 border border-slate-200', dot: 'bg-slate-300', Icon: Calendar },
  };
  const s = map[status] || map['absent'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

export default function Attendance() {
  const [status, setStatus] = useState('not-checked-in');
  const [todayRecord, setTodayRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [joiningDate, setJoiningDate] = useState(null);
  const [liveTime, setLiveTime] = useState(new Date());
  const [elapsed, setElapsed] = useState(null);
  const { addToast } = useToast();
  const timerRef = useRef(null);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Elapsed timer when checked in
  useEffect(() => {
    if (status === 'checked-in' && todayRecord?.checkIn) {
      timerRef.current = setInterval(() => {
        const diff = Date.now() - new Date(todayRecord.checkIn).getTime();
        const totalMins = Math.floor(diff / 60000);
        setElapsed(fmtMins(totalMins));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setElapsed(null);
    }
    return () => clearInterval(timerRef.current);
  }, [status, todayRecord?.checkIn]);

  useEffect(() => {
    const load = async () => {
      try {
        const [attendRes, profRes] = await Promise.all([
          attendanceService.getMyAttendance({ month: selectedMonth }),
          profileService.getProfile()
        ]);
        const records = attendRes.data.data || [];
        setHistory(records);
        setJoiningDate(profRes.data.data?.joiningDate);
        
        // Only set today's status if we are looking at the current month
        const today = todayStr();
        if (today.startsWith(selectedMonth)) {
          const todayRec = records.find((r) => r.date === today);
          if (todayRec) {
            setTodayRecord(todayRec);
            if (todayRec.checkOut) setStatus('checked-out');
            else if (todayRec.checkIn) setStatus('checked-in');
          } else {
            setTodayRecord(null);
            setStatus('not-checked-in');
          }
        }
      } catch { /* ignore */ }
      finally { setInitialLoading(false); }
    };
    load();
  }, [selectedMonth]);

  const handleCheckIn = async () => {
    setLoading('in');
    try {
      const res = await attendanceService.checkIn();
      const record = res.data.data;
      setTodayRecord(record);
      setStatus('checked-in');
      setHistory((v) => [record, ...v.filter((r) => r.date !== todayStr())]);
      addToast('Checked in successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-in failed.', 'error');
    } finally { setLoading(null); }
  };

  const handleCheckOut = async () => {
    setLoading('out');
    try {
      const res = await attendanceService.checkOut();
      const record = res.data.data;
      setTodayRecord(record);
      setStatus('checked-out');
      setHistory((v) => [record, ...v.filter((r) => r.date !== todayStr())]);
      addToast('Checked out successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-out failed.', 'error');
    } finally { setLoading(null); }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusConfig = {
    'not-checked-in': { label: 'Not Checked In', ring: 'ring-orange-200', bg: 'bg-orange-50', iconColor: 'text-orange-500', dot: 'bg-orange-400' },
    'checked-in':     { label: 'Currently Working', ring: 'ring-green-200', bg: 'bg-green-50', iconColor: 'text-green-600', dot: 'bg-green-500 animate-pulse' },
    'checked-out':    { label: 'Work Complete', ring: 'ring-slate-200', bg: 'bg-slate-50', iconColor: 'text-slate-500', dot: 'bg-slate-400' },
  };
  const cfg = statusConfig[status];

  // Logic to generate all calendar days for the selected month
  const mergedHistory = (() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const dates = [];
    
    // Filter based on joining date
    const today = todayStr();
    const currentMonthStr = today.slice(0, 7);
    
    // If selected month is in the future, show nothing
    if (selectedMonth > currentMonthStr) {
      return [];
    }

    const isCurrentMonth = today.startsWith(selectedMonth);
    const maxDay = isCurrentMonth ? parseInt(today.split('-')[2]) : daysInMonth;

    const jDate = joiningDate ? new Date(joiningDate).toISOString().slice(0, 10) : '0000-00-00';

    for (let i = 1; i <= maxDay; i++) {
      const dStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      if (dStr >= jDate) {
        dates.push(dStr);
      }
    }

    return dates.reverse().map(date => {
      const record = history.find(h => h.date === date);
      if (record) return { ...record, type: 'record' };
      
      const dayOfWeek = new Date(date).getDay();
      return { 
        date, 
        status: dayOfWeek === 0 ? 'weekend' : 'absent',
        type: 'placeholder'
      };
    });
  })();

  const stats = {
    present: history.filter(r => r.status === 'present').length,
    partial: history.filter(r => r.status === 'partially-present').length,
    absent: mergedHistory.filter(r => r.status === 'absent').length,
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-500 mt-1 text-sm">Mark your daily check-in and check-out</p>
      </div>

      {/* Today's attendance card */}
      <Card padding="lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 transition-all duration-500 ring-4 ${cfg.ring} ${cfg.bg}`}>
            <Clock size={40} className={cfg.iconColor} />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 tabular-nums tracking-tight">
            {liveTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </h2>
          <p className="text-gray-400 mt-1 text-sm">
            {liveTime.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className={`inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-100 shadow-sm`}>
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-center gap-1 mb-1">
              <LogIn size={13} className="text-green-500" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Check In</p>
            </div>
            <p className="text-sm font-bold text-gray-900">{fmtTime(todayRecord?.checkIn)}</p>
          </div>
          <div className="text-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock size={13} className="text-blue-500" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Hours</p>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {status === 'checked-in' ? (elapsed || '--') : fmtMins(todayRecord?.totalHours)}
            </p>
          </div>
          <div className="text-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-center gap-1 mb-1">
              <LogOut size={13} className="text-slate-400" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Check Out</p>
            </div>
            <p className="text-sm font-bold text-gray-900">{fmtTime(todayRecord?.checkOut)}</p>
          </div>
        </div>

        {/* Today status badge */}
        {todayRecord?.status && (
          <div className="flex justify-center mb-6">
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs text-gray-400">Today's Status</p>
              <StatusBadge status={todayRecord.status} />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <Button
              onClick={handleCheckIn}
              disabled={status !== 'not-checked-in' || new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000).getDay() === 0}
              loading={loading === 'in'}
              icon={LogIn}
              size="lg"
              className="flex-1"
            >
              {new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000).getDay() === 0 ? 'Disabled (Sunday)' : 'Check In'}
            </Button>
            <Button
              onClick={handleCheckOut}
              disabled={status !== 'checked-in'}
              loading={loading === 'out'}
              variant="secondary"
              icon={LogOut}
              size="lg"
              className="flex-1"
            >
              Check Out
            </Button>
          </div>
          
          {new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000).getDay() === 0 && status === 'not-checked-in' && (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 text-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
                <Calendar size={14} />
                Sunday Policy: Weekly Off Enabled
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Attendance logging is restricted on Sundays.</p>
            </div>
          )}
        </div>

        {/* Rules note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          ≥ 8 hours → <span className="text-green-600 font-semibold">Present</span> &nbsp;·&nbsp;
          &lt; 8 hours → <span className="text-amber-600 font-semibold">Partially Present</span> &nbsp;·&nbsp;
          No check-in → <span className="text-red-500 font-semibold">Absent</span>
        </p>
      </Card>

      {/* Monthly Summary Insights */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card padding="md" className="border-l-4 border-l-green-500 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Total Present</p>
                <p className="text-xl font-black text-gray-900 leading-none">{history.filter(r => r.status === 'present').length} Days</p>
              </div>
            </div>
          </Card>
          <Card padding="md" className="border-l-4 border-l-amber-500 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <MinusCircle size={20} className="text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Partially Present</p>
                <p className="text-xl font-black text-gray-900 leading-none">{history.filter(r => r.status === 'partially-present').length} Days</p>
              </div>
            </div>
          </Card>
          <Card padding="md" className="border-l-4 border-l-blue-600 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Clock size={20} className="text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Total Work Mins</p>
                <p className="text-xl font-black text-gray-900 leading-none">
                  {fmtMins(history.reduce((acc, r) => acc + (r.totalHours || 0), 0))}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* History Area */}
      {history.length >= 0 && (
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={18} className="text-blue-500" />
              Attendance Log
            </h3>
            
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:block">Filter Month:</p>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
              />
            </div>
          </div>
          <div className="space-y-3">
          <div className="space-y-6">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 items-center justify-center p-3 bg-gray-50/50 rounded-xl border border-gray-100/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-amber-500" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Partial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-red-400" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-slate-200" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Weekend</span>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-[10px] font-black text-gray-400 uppercase text-center mb-1">{d}</div>
              ))}
              {(() => {
                const [year, month] = selectedMonth.split('-').map(Number);
                const firstDay = new Date(year, month - 1, 1).getDay();
                const blanks = Array(firstDay).fill(null);
                const daysInMonth = new Date(year, month, 0).getDate();
                const days = [];
                for(let i=1; i<=daysInMonth; i++) {
                  const dStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                  days.push(dStr);
                }
                
                const statusColors = {
                  present: 'bg-green-500 shadow-sm shadow-green-500/20',
                  'partially-present': 'bg-amber-500 shadow-sm shadow-amber-500/20',
                  absent: 'bg-red-400 shadow-sm shadow-red-500/10',
                  weekend: 'bg-slate-200',
                };

                return [...blanks, ...days].map((day, idx) => {
                  if (!day) return <div key={`blank-${idx}`} className="aspect-square" />;
                  
                  const record = history.find(h => h.date === day);
                  const isToday = day === todayStr();
                  const isFuture = day > todayStr();
                  const dayOfWeek = new Date(day).getDay();
                  
                  let status = 'absent';
                  if (record) status = record.status;
                  else if (dayOfWeek === 0) status = 'weekend';
                  else if (isFuture) status = 'none';

                  if (status === 'none') return (
                    <div key={day} className="aspect-square rounded-md bg-gray-50 border border-gray-100/50" />
                  );

                  return (
                    <div 
                      key={day} 
                      title={`${day}: ${status}`}
                      className={`aspect-square rounded-md transition-all duration-300 relative group
                        ${statusColors[status] || 'bg-gray-100'} 
                        ${isToday ? 'ring-2 ring-blue-500 ring-offset-2 scale-105 z-10' : 'hover:scale-110 hover:z-10'}`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[8px] font-black text-white drop-shadow-sm">{new Date(day).getDate()}</span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="pt-4 border-t border-gray-50">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-1">Detailed Logs</h4>
              <div className="space-y-3">
                {mergedHistory.slice(0, 5).map((item) => (
                  <div key={item.date} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="text-sm font-bold text-gray-900">
                          {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', weekday: 'short' })}
                        </p>
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                  </div>
                ))}
                {mergedHistory.length > 5 && (
                  <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2">
                    Showing recent 5 logs • View grid above for full month
                  </p>
                )}
              </div>
            </div>
          </div>
          </div>
        </Card>
      )}
    </div>
  );
}
