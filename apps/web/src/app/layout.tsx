import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DigiFlow',
  description: 'AI-Powered Document Approval Workflow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
