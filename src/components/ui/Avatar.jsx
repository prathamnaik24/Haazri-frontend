// Avatar with initials fallback
export function Avatar({ name = '', size = 36, bgColor = '#dbeafe' }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bgColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 600, color: '#374151', flexShrink: 0,
    }}>
      {initials || '?'}
    </div>
  )
}

// Color palette for avatars based on index
const avatarColors = ['#dbeafe', '#fce7f3', '#d1fae5', '#fef3c7', '#ede9fe', '#fef9c3', '#ffedd5']
export function avatarColor(index) {
  return avatarColors[index % avatarColors.length]
}
