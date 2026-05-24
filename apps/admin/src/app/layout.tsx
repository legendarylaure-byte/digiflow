import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DigiFlow Admin',
  description: 'DigiFlow Admin Panel - VyomAi Cloud Pvt. Ltd.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
