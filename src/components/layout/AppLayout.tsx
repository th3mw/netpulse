import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div
      className="flex w-screen h-screen overflow-hidden font-sans transition-colors duration-300 select-none"
      style={{
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-main)',
      }}
    >
      {/* Background ambient lighting orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl transition-all duration-700 ease-out"
          style={{ backgroundColor: 'var(--orb-1)' }}
        />
        <div
          className="absolute top-1/3 -right-40 w-96 h-96 rounded-full blur-3xl transition-all duration-700 ease-out"
          style={{ backgroundColor: 'var(--orb-2)' }}
        />
        <div
          className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full blur-3xl transition-all duration-700 ease-out"
          style={{ backgroundColor: 'var(--orb-3)' }}
        />
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">{children}</main>
      </div>
    </div>
  );
};
