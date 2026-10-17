import { ShieldCheck } from 'lucide-react';
import { en } from '@/presentation/i18n/en';
import { ROLE_REGISTRY } from '@/domain/rules/permissions';
import type { Role } from '@/domain/entities';

export function RolesSection() {
  const roles = Object.keys(ROLE_REGISTRY) as Role[];

  return (
    <section className="mt-8 rounded-card border border-border bg-card p-6 shadow-card">
      <h2 className="text-lg font-semibold text-text">{en.accounts.rolesTitle}</h2>
      <p className="mt-1 text-sm text-text-muted">{en.accounts.rolesSubtitle}</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {roles.map((role) => {
          const definition = ROLE_REGISTRY[role];
          return (
            <div
              key={role}
              className="flex gap-4 rounded-panel border border-border bg-bg p-5"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-avatar bg-bg-2 text-primary">
                <ShieldCheck aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-text">{definition.label}</h3>
                <p className="mt-1 text-sm text-text-muted">{definition.description}</p>
                <p className="mt-2 text-2xs font-medium text-primary">
                  {en.accounts.permissionsCount(definition.permissions.length)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
