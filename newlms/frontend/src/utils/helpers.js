// Helper to parse YouTube video IDs
export const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Helper to get YouTube thumbnail
export const getYouTubeThumbnail = (url) => {
  const videoId = getYouTubeId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
};

// Generate high quality modern gradient placeholders based on course title
export const getCourseGradient = (title = '') => {
  const colors = [
    'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', // Indigo/Purple
    'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', // Blue
    'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', // Pink/Rose
    'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald/Teal
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Amber
  ];
  let sum = 0;
  for (let i = 0; i < title.length; i++) {
    sum += title.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

// Format Date string
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Generate UUID/Unique ID
export const generateId = (prefix = 'id') => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

// Format duration
export const formatDuration = (val) => {
  if (!val) return '';
  if (typeof val === 'number') {
    return `${val} Hours`;
  }
  if (!val.toLowerCase().includes('hour') && !val.toLowerCase().includes('min')) {
    return `${val} Hours`;
  }
  return val;
};
