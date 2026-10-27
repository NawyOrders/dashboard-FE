import { AlertTriangle } from 'lucide-react';
import { en } from '@/presentation/i18n/en';

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
            <h1 className="text-lg font-semibold text-text">{en.system.schemaInvalidTitle}</h1>
            <p className="mt-1 text-sm text-text-muted">
              {en.system.schemaInvalidBodyPrefix}{' '}
              <code className="font-mono text-xs" dir="ltr">
                src/config/restaurant-registration-fields.json
              </code>{' '}
              {en.system.schemaInvalidBodySuffix}
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

        <p className="mt-4 text-2xs text-text-muted">{en.system.schemaFix}</p>
      </div>
    </div>
  );
}
