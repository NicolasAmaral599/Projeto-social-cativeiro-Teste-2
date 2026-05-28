import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function AppLayout({ children, onLogout }: { children: ReactNode, onLogout: () => void }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Sidebar onLogout={onLogout} className="fixed left-0 top-0 z-40 hidden md:flex" />
      
      <div className="md:pl-64 flex flex-col min-h-screen">
        <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 border-r bg-[#0f172a] border-white/10 text-white">
          <Sidebar onLogout={onLogout} className="w-full h-full border-none" onItemClick={() => setIsMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
