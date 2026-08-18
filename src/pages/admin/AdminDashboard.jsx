import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import AppShell from '../../components/layout/AppShell.jsx'
import { Avatar, avatarColor } from '../../components/ui/Avatar.jsx'
import { card, cardTitle, dateBadge } from '../../components/ui/styles.js'
import { CalendarIcon } from '../../components/ui/Icons.jsx'
import AttendanceCalendar from '../../components/dashboard/AttendanceCalendar.jsx'

const attendanceData = [
  { day: 'Mon', present: 38, absent: 4 },
  { day: 'Tue', present: 40, absent: 2 },
  { day: 'Wed', present: 36, absent: 5 },
  { day: 'Thu', present: 39, absent: 3 },
  { day: 'Fri', present: 35, absent: 6 },
  { day: 'Sat', present: 20, absent: 2 },
  { day: 'Sun', present: 5,  absent: 0 },
]

const staffData = [
  { name: 'Managers',  value: 8,  color: '#517891' },
  { name: 'Employees', value: 35, color: '#1677B8' },
  { name: 'HR',        value: 4,  color: '#57B9FF' },
]

const recentActivity = [
  { name: 'Aisha Khan',   action: 'Checked In',    time: '5 min ago' },
  { name: 'Rohan Mehta',  action: 'Checked In',    time: '12 min ago' },
  { name: 'Sara Ahmed',   action: 'Leave Approved', time: '18 min ago' },
  { name: 'James Wilson', action: 'Checked Out',   time: '1 hr ago' },
  { name: 'Priya Singh',  action: 'Checked In',    time: '2 hr ago' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 13 }}>
        <div style={{ fontWeight: 600, color: '#172B3A', marginBottom: 6 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334E5C' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.fill, display: 'inline-block' }} />
            <span style={{ color: '#526B7A' }}>{p.name === 'present' ? 'Present' : 'Absent'}</span>
            <span style={{ fontWeight: 600, marginLeft: 4 }}>{p.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function AdminDashboard() {
  const [attendanceTab, setAttendanceTab] = useState('Weekly')
  const total = staffData.reduce((s, d) => s + d.value, 0)

  return (
    <AppShell>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Summary stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'Total Employees', value: '47',  delta: '+2 this month', color: '#1677B8', bg: '#EAF6FF', deltaColor: '#166534' },
            { label: 'Present Today',   value: '39',  delta: '83% attendance', color: '#1677B8', bg: '#EAF6FF', deltaColor: '#166534' },
            { label: 'On Leave',        value: '5',   delta: '3 approved today', color: '#1677B8', bg: '#EAF6FF', deltaColor: '#075985' },
            { label: 'Pending Actions', value: '3',   delta: 'Leave requests', color: '#1677B8', bg: '#EAF6FF', deltaColor: '#92400E' },
          ].map(s => (
            <div key={s.label} style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: s.color }}>✦</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#526B7A' }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 30, fontWeight: 700, color: '#172B3A', letterSpacing: '-0.03em', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: s.deltaColor, fontWeight: 500 }}>{s.delta}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Staff Overview Donut */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h2 style={cardTitle}>Staff Overview</h2>
              <span style={dateBadge}><CalendarIcon />Last 7 days</span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 4 }}>
              {staffData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#172B3A' }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                  <span style={{ color: '#526B7A' }}>{d.name}</span>
                  <span style={{ fontWeight: 600 }}>{d.value}</span>
                </div>
              ))}
            </div>
            <div style={{ position: 'relative', height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={staffData} cx="50%" cy="80%" startAngle={180} endAngle={0}
                    innerRadius={90} outerRadius={135} paddingAngle={3} dataKey="value" labelLine={false}>
                    {staffData.map((entry, index) => <Cell key={index} fill={entry.color} strokeWidth={0} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#172B3A', letterSpacing: '-0.03em' }}>{total}</div>
                <div style={{ fontSize: 12, color: '#526B7A', marginTop: 2 }}>Total Staff</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={cardTitle}>Recent Activity</h2>
              <button style={{ fontSize: 13, color: '#1677B8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>View more</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {recentActivity.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={a.name} size={36} bgColor={avatarColor(i)} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#172B3A', lineHeight: 1.3 }}>{a.name}</div>
                    <div style={{ fontSize: 12, color: '#526B7A', lineHeight: 1.3 }}>{a.action}</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#8AA0AD', whiteSpace: 'nowrap' }}>{a.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance Overview Chart */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h2 style={cardTitle}>Attendance Overview</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#526B7A' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#57B9FF', display: 'inline-block' }} />Absent
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#526B7A' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1677B8', display: 'inline-block' }} />Present
                </span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['Weekly', 'Monthly']).map(t => (
                  <button key={t} onClick={() => setAttendanceTab(t)} style={{
                    padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12,
                    background: attendanceTab === t ? '#1677B8' : '#EDF3F6',
                    color: attendanceTab === t ? '#FFFFFF' : '#526B7A',
                    fontWeight: attendanceTab === t ? 600 : 400,
                  }}>{t}</button>
                ))}
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attendanceData} barCategoryGap="30%" barGap={2}>
              <CartesianGrid vertical={false} stroke="#D7E6EF" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#526B7A' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#526B7A' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(81,120,145,0.05)' }} />
              <Bar dataKey="present" fill="#1677B8" radius={[6, 6, 6, 6]} name="present" />
              <Bar dataKey="absent" fill="#57B9FF" radius={[6, 6, 6, 6]} name="absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Calendar Widget */}
        <div style={card}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={cardTitle}>Organization Calendar</h2>
            <p style={{ fontSize: 13, color: '#526B7A', margin: 0 }}>View global attendance and holidays</p>
          </div>
          <AttendanceCalendar />
        </div>

      </div>
    </AppShell>
  )
}
