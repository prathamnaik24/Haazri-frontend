import React, { useState } from 'react';
import { card, cardTitle } from '../ui/styles.js';

const STATUS_COLOR = {
  present: { bg: '#1677B8', text: '#ffffff' },
  late:    { bg: '#f59e0b', text: '#ffffff' },
  leave:   { bg: '#517891', text: '#ffffff' },
  absent:  { bg: '#ef4444', text: '#ffffff' },
  weekend: { bg: 'transparent', text: '#d1d5db' },
  future:  { bg: 'transparent', text: '#9ca3af' },
  today:   { bg: '#172B3A', text: '#ffffff' },
};

const MOCK_STATUS_MAP = {
  1: 'present', 2: 'present', 3: 'present', 4: 'present',
  7: 'present', 8: 'late',    9: 'present', 10: 'leave',
  11: 'present', 14: 'present', 15: 'absent', 16: 'present',
  17: 'present', 18: 'present',
};

export default function AttendanceCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAY_LABELS = ['S','M','T','W','T','F','S'];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const getDayStatus = (day) => {
    const date = new Date(year, month, day);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) return 'weekend';
    if (isCurrentMonth && day === today) return 'today';
    if (isCurrentMonth && day > today) return 'future';
    return MOCK_STATUS_MAP[day] || 'present';
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const stats = [
    { label: 'Present', color: '#1677B8', count: Object.values(MOCK_STATUS_MAP).filter(s => s === 'present').length },
    { label: 'Late',    color: '#f59e0b', count: Object.values(MOCK_STATUS_MAP).filter(s => s === 'late').length },
    { label: 'Leave',   color: '#517891', count: Object.values(MOCK_STATUS_MAP).filter(s => s === 'leave').length },
    { label: 'Absent',  color: '#ef4444', count: Object.values(MOCK_STATUS_MAP).filter(s => s === 'absent').length },
  ];

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={cardTitle}>Attendance Calendar</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={prevMonth} style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>‹</button>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', minWidth: 110, textAlign: 'center' }}>
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>›</button>
        </div>
      </div>

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
        {DAY_LABELS.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', fontWeight: 600, padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px 0' }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const status = getDayStatus(day);
          const colors = STATUS_COLOR[status];
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3px 0' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: colors.bg,
                color: colors.text,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: status === 'future' || status === 'weekend' ? 400 : 600,
                cursor: status !== 'future' && status !== 'weekend' && day ? 'pointer' : 'default',
                border: isCurrentMonth && day === today ? '2px solid #172B3A' : 'none',
              }}>
                {day}
              </div>
            </div>
          );
        })}
      </div>

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
    </div>
  );
}
