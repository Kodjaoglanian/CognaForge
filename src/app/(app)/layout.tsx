import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { MainHeader } from '@/components/layout/main-header';
import { APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react'; // For a potential settings button

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
               {/* Example settings button, can be adapted */}
               <Button variant="ghost" className="w-full justify-start gap-2">
                <Settings className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">Settings</span>
               </Button>
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
