import { useState, useEffect, useRef } from 'react';
import { LogIn, LogOut, Clock, CheckCircle, AlertCircle, MinusCircle, Calendar } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { attendanceService } from '../services/api';
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
  const [loading, setLoading] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
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
        const res = await attendanceService.getMyAttendance();
        const records = res.data.data || [];
        setHistory(records);
        const today = records.find((r) => r.date === todayStr());
        if (today) {
          setTodayRecord(today);
          if (today.checkOut) setStatus('checked-out');
          else if (today.checkIn) setStatus('checked-in');
        }
      } catch { /* ignore */ }
      finally { setInitialLoading(false); }
    };
    load();
  }, []);

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
        <div className="flex gap-3">
          <Button
            onClick={handleCheckIn}
            disabled={status !== 'not-checked-in'}
            loading={loading === 'in'}
            icon={LogIn}
            size="lg"
            className="flex-1"
          >
            Check In
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

        {/* Rules note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          ≥ 8 hours → <span className="text-green-600 font-semibold">Present</span> &nbsp;·&nbsp;
          &lt; 8 hours → <span className="text-amber-600 font-semibold">Partially Present</span> &nbsp;·&nbsp;
          No check-in → <span className="text-red-500 font-semibold">Absent</span>
        </p>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            Attendance History <span className="text-gray-400 font-normal text-sm">(Last 30 days)</span>
          </h3>
          <div className="space-y-2">
            {history.map((item) => (
              <div key={item._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-sm font-medium text-gray-900">{item.date}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    In: {fmtTime(item.checkIn)} &nbsp;→&nbsp; Out: {fmtTime(item.checkOut)}
                    {item.totalHours != null && <span className="ml-2 font-medium text-gray-600">({fmtMins(item.totalHours)})</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
