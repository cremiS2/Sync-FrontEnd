export function generateAvatar(name: string, size: number = 80): string {
  if (!name) name = 'User';
  
  const initials = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
  
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const bgColor = colors[colorIndex];
  
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><rect width='${size}' height='${size}' fill='${bgColor}'/><text x='50%' y='50%' text-anchor='middle' dy='.3em' fill='white' font-size='${size * 0.4}' font-family='Arial'>${initials}</text></svg>`;
  
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const SAMPLE_AVATARS = [
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%234ECDC4'/%3E%3C/svg%3E",
  
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%2345B7D1'/%3E%3C/svg%3E",
  
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23FF6B6B'/%3E%3C/svg%3E",
  
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%2396CEB4'/%3E%3C/svg%3E"
];

export function getRandomAvatar(): string {
  return SAMPLE_AVATARS[Math.floor(Math.random() * SAMPLE_AVATARS.length)];
}
