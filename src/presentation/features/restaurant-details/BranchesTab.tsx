import { Card, CardBody, CardHeader } from '@/presentation/components/ui/Card';
import { StatusPill } from '@/presentation/components/ui/StatusPill';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { branchStatusMeta } from '@/presentation/lib/status';
import { INCLUDED_BRANCHES } from '@/config/policy';
import { en } from '@/presentation/i18n/en';
import type { Tenant } from '@/domain/entities';

// OPEN: endpoint missing in swagger. The tenant endpoints do not return branches, so this
// tab is read-only until the backend exposes them.
export function BranchesTab({ tenant }: { tenant: Tenant }) {
  const overIncluded = tenant.branches.length > INCLUDED_BRANCHES;

  return (
    <Card>
      <CardHeader>
        <div>
          <h3 className="text-xl font-semibold">{en.create.branches.title}</h3>
          <p className="mt-1 text-2xs text-text-muted">
            {en.create.branches.included(tenant.branches.length, INCLUDED_BRANCHES)}
          </p>
        </div>
      </CardHeader>

      <CardBody className="pt-0">
        {overIncluded && (
          <p className="mb-4 rounded-panel bg-warning-bg px-4 py-3 text-2xs text-warning-fg">
            {en.create.branches.limitNote(INCLUDED_BRANCHES)}
          </p>
        )}

        {tenant.branches.length === 0 ? (
          <EmptyState title={en.details.noBranches} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <caption className="sr-only">{en.create.branches.title}</caption>
              <thead>
                <tr className="border-y border-border text-2xs font-medium text-text-muted">
                  <th scope="col" className="px-4 py-3 text-start">{en.create.branches.name}</th>
                  <th scope="col" className="px-4 py-3 text-start">{en.create.branches.address}</th>
                  <th scope="col" className="px-4 py-3 text-start">{en.create.branches.phone}</th>
                  <th scope="col" className="px-4 py-3 text-start">{en.create.branches.hours}</th>
                  <th scope="col" className="px-4 py-3 text-start">{en.create.branches.status}</th>
                </tr>
              </thead>
              <tbody>
                {tenant.branches.map((branch) => (
                  <tr key={branch.id} className="border-b border-border last:border-0">
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex flex-col">
                        <span dir="ltr" className="font-medium text-text">{branch.name}</span>
                        {branch.nameAr ? (
                          <span dir="rtl" className="text-2xs text-text-muted">{branch.nameAr}</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-text-muted">
                      <div className="flex flex-col">
                        <span>{branch.address}</span>
                        {branch.city ? (
                          <span className="text-2xs">{branch.city}</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="tabular whitespace-nowrap px-4 py-4 text-text-muted">{branch.phone}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-text-muted">
                      {branch.openTime && branch.closeTime
                        ? `${branch.workingDay ? `${branch.workingDay} ` : ''}${branch.openTime}–${branch.closeTime}`
                        : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <StatusPill meta={branchStatusMeta(branch.status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
