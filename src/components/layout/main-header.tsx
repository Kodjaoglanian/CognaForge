import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
// LogIn icon removed as the button is removed

export function MainHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <a href="/" className="mr-6 flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="hidden font-bold sm:inline-block">
              {APP_NAME}
            </span>
          </a>
        </div>

        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Login button removed */}
        </div>
      </div>
    </header>
  );
}
