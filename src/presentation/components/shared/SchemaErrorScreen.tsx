import { AlertTriangle } from 'lucide-react';

/**
 * Shown at startup when `src/config/restaurant-registration-fields.json` fails
 * validation (NW-246). The app stops rendering instead of showing a form that
 * silently lost fields.
 */
export function SchemaErrorScreen({ issues }: { issues: string[] }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <div className="w-full max-w-2xl rounded-card border border-danger bg-card p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-panel bg-danger-bg text-danger-fg">
            <AlertTriangle aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-text">
              Restaurant registration schema is invalid
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              <code className="font-mono text-xs">src/config/restaurant-registration-fields.json</code>{' '}
              does not match the expected structure, so the registration form cannot be rendered.
            </p>
          </div>
        </div>

        <ul className="mt-4 flex flex-col gap-1 rounded-panel bg-neutral-bg p-3 text-xs text-text">
          {issues.map((issue) => (
            <li key={issue} className="font-mono">
              {issue}
            </li>
          ))}
        </ul>

        <p className="mt-4 text-2xs text-text-muted">
          Fix the JSON file and reload the page.
        </p>
      </div>
    </div>
  );
}
