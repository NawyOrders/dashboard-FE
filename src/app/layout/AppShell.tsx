import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/presentation/components/layout/Sidebar';
import { TopBar } from '@/presentation/components/layout/TopBar';

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar mobileOpen={drawerOpen} onClose={closeDrawer} />
      <div className="flex min-h-screen flex-col md:ps-[72px] xl:ps-sidebar">
        <TopBar onMenuClick={() => setDrawerOpen(true)} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
