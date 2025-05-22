import type { ReactNode } from 'react';

interface PageTitleProps {
  title: string;
  description?: string | ReactNode;
  children?: ReactNode; // For actions like buttons on the right
}

export function PageTitle({ title, description, children }: PageTitleProps) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-border pb-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-lg text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}
