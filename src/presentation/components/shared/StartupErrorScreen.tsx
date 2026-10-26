import { AlertTriangle } from 'lucide-react';

/** Shown before rendering when the selected data source cannot be started. */
export function StartupErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <div className="w-full max-w-2xl rounded-card border border-danger bg-card p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-panel bg-danger-bg text-danger-fg">
            <AlertTriangle aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-text">Cannot start the dashboard</h1>
            <p className="mt-1 text-sm text-text-muted">{message}</p>
          </div>
        </div>
        <p className="mt-4 text-2xs text-text-muted">
          Check the data-source configuration and reload the page.
        </p>
      </div>
    </div>
  );
}
