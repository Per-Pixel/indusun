// Mock data for statistics
export const mockStats = {
  views: { value: '721K', change: '+11.02%', positive: true },
  visits: { value: '367K', change: '-0.03%', positive: false },
  newUsers: { value: '1,156', change: '+15.03%', positive: true },
  activeUsers: { value: '239K', change: '+6.08%', positive: true }
};

// Mock data for traffic sources
export const mockTrafficSources = [
  { name: 'Google', value: 40 },
  { name: 'YouTube', value: 30 },
  { name: 'Instagram', value: 80 },
  { name: 'Pinterest', value: 25 },
  { name: 'Facebook', value: 35 },
  { name: 'Twitter', value: 20 },
  { name: 'Tumblr', value: 15 }
];

// Mock data for location
export const mockLocationData = [
  { country: 'United States', percentage: 38.6 },
  { country: 'Canada', percentage: 22.5 },
  { country: 'Mexico', percentage: 30.8 },
  { country: 'Other', percentage: 8.1 }
];

// Mock data for notifications
export const mockNotifications = [
  { id: 1, text: 'You fixed a bug.', time: 'Just now' },
  { id: 2, text: 'New user registered.', time: '30 minutes ago' },
  { id: 3, text: 'You fixed a bug.', time: '12 hours ago' },
  { id: 4, text: 'Andi Lane subscribed to you.', time: 'Today, 11:59 AM' }
];

// Mock data for activities
export const mockActivities = [
  { id: 1, text: 'Changed the style.', time: 'Just now', user: { name: 'Sophie', avatar: '/avatars/avatar1.png' } },
  { id: 2, text: 'Released a new version.', time: '37 minutes ago', user: { name: 'Thomas', avatar: '/avatars/avatar2.png' } },
  { id: 3, text: 'Submitted a bug.', time: '12 hours ago', user: { name: 'Chris', avatar: '/avatars/avatar3.png' } },
  { id: 4, text: 'Modified A data in Page X.', time: 'Today, 11:57 AM', user: { name: 'Maria', avatar: '/avatars/avatar4.png' } },
  { id: 5, text: 'Deleted a page in Project X.', time: 'Feb 2, 2024', user: { name: 'Alex', avatar: '/avatars/avatar5.png' } }
];

// Mock data for contacts
export const mockContacts = [
  { id: 1, name: 'Natali Craig', avatar: '/avatars/avatar6.png' },
  { id: 2, name: 'Drew Cono', avatar: '/avatars/avatar7.png' },
  { id: 3, name: 'Andi Lane', avatar: '/avatars/avatar8.png' },
  { id: 4, name: 'Koray Okumus', avatar: '/avatars/avatar9.png' },
  { id: 5, name: 'Kate Morrison', avatar: '/avatars/avatar10.png' },
  { id: 6, name: 'Melody Macy', avatar: '/avatars/avatar11.png' }
];

// Mock data for user chart
export const mockUserChartData = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  thisYear: [10000000, 15000000, 12000000, 18000000, 15000000, 20000000, 25000000],
  lastYear: [8000000, 10000000, 8000000, 12000000, 10000000, 15000000, 18000000],
  currentValue: 18355598
};

// Mock data for device traffic
export const mockDeviceTraffic = [
  { device: 'Linux', value: 15 },
  { device: 'Mac', value: 25 },
  { device: 'iOS', value: 20 },
  { device: 'Windows', value: 30 },
  { device: 'Android', value: 10 },
  { device: 'Other', value: 25 }
];

// Mock data for marketing
export const mockMarketingData = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  values: [20, 25, 20, 30, 20, 25, 20, 25, 20, 30, 20, 25]
};