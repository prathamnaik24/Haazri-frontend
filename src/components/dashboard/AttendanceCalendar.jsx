import React, { useState, useEffect, useRef } from 'react';
import { card, cardTitle } from '../ui/styles.js';
import api from '../../services/api.js';

const STATUS_COLOR = {
  present: { bg: '#1677B8', text: '#ffffff' },
  late:    { bg: '#f59e0b', text: '#ffffff' },
  leave:   { bg: '#517891', text: '#ffffff' },
  absent:  { bg: '#ef4444', text: '#ffffff' },
  weekend: { bg: 'transparent', text: '#9ca3af' },
  future:  { bg: 'transparent', text: '#cbd5e1' },
  today:   { bg: '#172B3A', text: '#ffffff' },
};

function formatTime(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '—';
  }
}

function formatMinutes(minutes) {
  if (!minutes || minutes <= 0) return '0h 0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export default function AttendanceCalendar({ title = "Attendance Calendar", noCard = false }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);

  const popoverRef = useRef(null);

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAY_LABELS = ['S','M','T','W','T','F','S'];

  // Fetch live attendance records and leaves
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const [attRes, leavesRes] = await Promise.all([
          api.get('/attendance/me?limit=100').catch(() => ({ data: { data: { history: [] } } })),
          api.get('/leaves/me').catch(() => ({ data: { data: { requests: [] } } })),
        ]);

        if (isMounted) {
          setAttendanceLogs(attRes.data?.data?.history || []);
          setLeaveRequests(leavesRes.data?.data?.requests || []);
        }
      } catch (err) {
        console.error('Failed to load calendar attendance data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Close popover on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setSelectedDayInfo(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  // Helper to format YYYY-MM-DD
  const getDateStr = (d) => {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  };

  // Find attendance record for a specific day
  const getRecordForDay = (d) => {
    const targetDateStr = getDateStr(d);
    return attendanceLogs.find(r => {
      const workDateStr = r.work_date ? new Date(r.work_date).toISOString().split('T')[0] : null;
      const checkInStr = r.check_in_time ? new Date(r.check_in_time).toISOString().split('T')[0] : null;
      return workDateStr === targetDateStr || checkInStr === targetDateStr;
    });
  };

  // Find approved leave for a specific day
  const getLeaveForDay = (d) => {
    const targetDateStr = getDateStr(d);
    return leaveRequests.find(l => {
      if (l.status && l.status.toLowerCase() !== 'approved') return false;
      const start = l.start_date ? new Date(l.start_date).toISOString().split('T')[0] : '';
      const end = l.end_date ? new Date(l.end_date).toISOString().split('T')[0] : '';
      return targetDateStr >= start && targetDateStr <= end;
    });
  };

  // Calculate day status
  const getDayStatus = (day) => {
    const date = new Date(year, month, day);
    const dow = date.getDay();
    const isWeekend = (dow === 0 || dow === 6);
    const isToday = isCurrentMonth && day === today;
    const isFuture = (year > now.getFullYear()) ||
                     (year === now.getFullYear() && month > now.getMonth()) ||
                     (isCurrentMonth && day > today);

    const attRecord = getRecordForDay(day);
    const leaveRecord = getLeaveForDay(day);

    if (attRecord) {
      if (attRecord.punctuality_status === 'LATE') return 'late';
      if (attRecord.status === 'ON_LEAVE' || attRecord.status === 'On Leave' || leaveRecord) return 'leave';
      if (attRecord.punctuality_status === 'ABSENT' || attRecord.status === 'Absent') return 'absent';
      return 'present';
    }

    if (leaveRecord) return 'leave';
    if (isToday) return 'today';
    if (isWeekend) return 'weekend';
    if (isFuture) return 'future';

    // Past weekday without check-in or leave
    return 'absent';
  };

  const handleDayClick = (day) => {
    if (!day) return;
    const status = getDayStatus(day);
    const dateStr = getDateStr(day);
    const attRecord = getRecordForDay(day);
    const leaveRecord = getLeaveForDay(day);
    const fullDate = new Date(year, month, day).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    setSelectedDayInfo({
      day,
      fullDate,
      dateStr,
      status,
      attRecord,
      leaveRecord,
    });
  };

  const prevMonth = () => {
    setSelectedDayInfo(null);
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    setSelectedDayInfo(null);
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Calculate live stats for the current month
  let presentCount = 0;
  let lateCount = 0;
  let leaveCount = 0;
  let absentCount = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const s = getDayStatus(d);
    if (s === 'present') presentCount++;
    else if (s === 'late') lateCount++;
    else if (s === 'leave') leaveCount++;
    else if (s === 'absent') absentCount++;
  }

  const stats = [
    { label: 'Present', color: '#1677B8', count: presentCount },
    { label: 'Late',    color: '#f59e0b', count: lateCount },
    { label: 'Leave',   color: '#517891', count: leaveCount },
    { label: 'Absent',  color: '#ef4444', count: absentCount },
  ];

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ ...(noCard ? {} : card), position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={cardTitle}>{title}</h2>
          {loading && <span style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic' }}>Syncing...</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={prevMonth}
            style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}
          >
            ‹
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', minWidth: 110, textAlign: 'center' }}>
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}
          >
            ›
          </button>
        </div>
      </div>

      {/* Monthly Summary Badges */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
        {stats.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 32, borderRadius: 4, background: s.color }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#172B3A' }}>{s.count}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Week Day Labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
        {DAY_LABELS.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', fontWeight: 600, padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Day Cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px 0' }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const status = getDayStatus(day);
          const colors = STATUS_COLOR[status];
          const isSelected = selectedDayInfo?.day === day;
          const isTodayCell = isCurrentMonth && day === today;

          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3px 0' }}>
              <button
                type="button"
                onClick={() => handleDayClick(day)}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: colors.bg,
                  color: colors.text,
                  border: isSelected
                    ? '2px solid #0284c7'
                    : isTodayCell
                    ? '2px solid #172B3A'
                    : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: status === 'future' || status === 'weekend' ? 400 : 600,
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: isSelected ? '0 0 0 3px rgba(2, 132, 199, 0.2)' : 'none',
                  transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                title={`Day ${day}: ${status.toUpperCase()}`}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>

      {/* Color Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 16, paddingTop: 14, borderTop: '1px solid #f3f4f6' }}>
        {[
          { label: 'Present', color: '#1677B8' },
          { label: 'Late',    color: '#f59e0b' },
          { label: 'Leave',   color: '#517891' },
          { label: 'Absent',  color: '#ef4444' },
          { label: 'Today',   color: '#172B3A' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
            <span style={{ fontSize: 11, color: '#6b7280' }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Interactive Day Details Popover */}
      {selectedDayInfo && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            top: 60,
            right: 20,
            width: 290,
            background: '#ffffff',
            borderRadius: 12,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E2E8F0',
            padding: '16px 18px',
            zIndex: 40,
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {/* Popover Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#172B3A' }}>
                {selectedDayInfo.fullDate}
              </div>
              <div style={{ display: 'inline-block', marginTop: 4 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: STATUS_COLOR[selectedDayInfo.status]?.bg || '#f3f4f6',
                    color: STATUS_COLOR[selectedDayInfo.status]?.text || '#172B3A',
                  }}
                >
                  {selectedDayInfo.status}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedDayInfo(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: 16,
                lineHeight: 1,
                padding: '2px 4px',
              }}
            >
              ✕
            </button>
          </div>

          {/* Popover Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
            {selectedDayInfo.attRecord ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Check-in:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>
                    {formatTime(selectedDayInfo.attRecord.check_in_time)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Check-out:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>
                    {selectedDayInfo.attRecord.check_out_time
                      ? formatTime(selectedDayInfo.attRecord.check_out_time)
                      : selectedDayInfo.status === 'today'
                      ? 'In Progress'
                      : '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Total Hours:</span>
                  <span style={{ fontWeight: 700, color: '#1677B8' }}>
                    {formatMinutes(selectedDayInfo.attRecord.working_minutes)}
                  </span>
                </div>
                {selectedDayInfo.attRecord.punctuality_status && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Punctuality:</span>
                    <span style={{ fontWeight: 600, color: selectedDayInfo.attRecord.punctuality_status === 'LATE' ? '#d97706' : '#15803d' }}>
                      {selectedDayInfo.attRecord.punctuality_status}
                      {selectedDayInfo.attRecord.late_by_minutes > 0 ? ` (${selectedDayInfo.attRecord.late_by_minutes}m)` : ''}
                    </span>
                  </div>
                )}
              </>
            ) : selectedDayInfo.leaveRecord ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Leave Type:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>
                    {selectedDayInfo.leaveRecord.leave_type_name || selectedDayInfo.leaveRecord.leave_type?.name || 'Leave'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Status:</span>
                  <span style={{ fontWeight: 600, color: '#15803d' }}>
                    {selectedDayInfo.leaveRecord.status || 'Approved'}
                  </span>
                </div>
                {selectedDayInfo.leaveRecord.reason && (
                  <div>
                    <span style={{ color: '#64748b', display: 'block', marginBottom: 2 }}>Reason:</span>
                    <span style={{ color: '#334155', fontStyle: 'italic' }}>
                      "{selectedDayInfo.leaveRecord.reason}"
                    </span>
                  </div>
                )}
              </>
            ) : selectedDayInfo.status === 'weekend' ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '6px 0' }}>
                Non-working weekend day
              </div>
            ) : selectedDayInfo.status === 'future' ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '6px 0' }}>
                Upcoming work day
              </div>
            ) : selectedDayInfo.status === 'today' ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '6px 0' }}>
                No check-in recorded yet for today
              </div>
            ) : (
              <div style={{ color: '#ef4444', textAlign: 'center', padding: '6px 0', fontWeight: 500 }}>
                Absent (No attendance record)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
