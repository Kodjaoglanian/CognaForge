import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { MainHeader } from '@/components/layout/main-header';
// Removed Settings button import as it's now in Nav

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen flex-col">
        <MainHeader />
        <div className="flex flex-1">
          <Sidebar collapsible="icon" variant="sidebar" side="left">
            <SidebarHeader className="p-2 justify-between hidden md:flex">
               {/* Collapsed view might not show title here or needs different handling */}
            </SidebarHeader>
            <SidebarContent>
              <SidebarNav />
            </SidebarContent>
            <SidebarFooter className="p-2 hidden md:flex">
               {/* Footer can be used for other things, or removed if not needed */}
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="flex-1 overflow-y-auto">
            <main className="container mx-auto p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
