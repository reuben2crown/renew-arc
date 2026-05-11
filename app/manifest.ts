import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RenewPilot - License Renewal Tracker',
    short_name: 'RenewPilot',
    description: 'Track your professional license renewals and CE hours',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    categories: ['productivity', 'utilities'],
    shortcuts: [
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'View your license status',
        url: '/dashboard',
        icons: [{ src: '/icons/dashboard-icon.png', sizes: '192x192' }],
      },
      {
        name: 'Upload CE',
        short_name: 'Upload CE',
        description: 'Upload CE certificate',
        url: '/ce-credits/upload',
        icons: [{ src: '/icons/upload-icon.png', sizes: '192x192' }],
      },
    ],
  };
}
