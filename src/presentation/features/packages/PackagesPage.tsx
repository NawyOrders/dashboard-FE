import { Check, Minus } from 'lucide-react';
import { PageHeader } from '@/presentation/components/shared/PageHeader';
import { Card, CardHeader, CardBody } from '@/presentation/components/ui/Card';
import { en } from '@/presentation/i18n/en';
import { usePackages } from '@/presentation/hooks/queries';
import {
  PACKAGE_FEATURE_LABELS,
  PACKAGE_FEATURE_ORDER,
  PACKAGES,
} from '@/config/packages';
import { getReferencePrice } from '@/domain/rules/packages';
import { REFERENCE_PRICE_NOTE } from '@/config/policy';
import type { DurationMonths } from '@/domain/entities';

const DURATIONS: DurationMonths[] = [3, 6, 12];

function formatEgp(value: number): string {
  return new Intl.NumberFormat('en-EG', { maximumFractionDigits: 0 }).format(value);
}

export function PackagesPage() {
  const query = usePackages();
  const packages = query.data ?? [PACKAGES.start, PACKAGES.growth];

  return (
    <div>
      <PageHeader title={en.packages.title} subtitle={en.packages.subtitle} />

      <Card className="mb-6">
        <CardHeader>
          <div>
            <h2 className="text-lg font-semibold text-text">{en.packages.feature}</h2>
            <p className="text-2xs text-text-muted">{en.packages.growthOnlyNote}</p>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-2xs text-text-muted">
                  <th scope="col" className="px-4 py-3 text-start font-medium">{en.packages.feature}</th>
                  {packages.map((pkg) => (
                    <th key={pkg.code} scope="col" className="px-4 py-3 text-center font-medium">
                      {pkg.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PACKAGE_FEATURE_ORDER.map((feature) => (
                  <tr key={feature} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-text">{PACKAGE_FEATURE_LABELS[feature]}</td>
                    {packages.map((pkg) => {
                      const included = pkg.features.includes(feature);
                      return (
                        <td key={pkg.code} className="px-4 py-3 text-center">
                          {included ? (
                            <span className="inline-flex justify-center text-success-fg">
                              <Check aria-label={en.packages.included} className="size-4" />
                            </span>
                          ) : (
                            <span className="inline-flex justify-center text-text-muted">
                              <Minus aria-label={en.packages.notIncluded} className="size-4" />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex-col items-start gap-1">
          <h2 className="text-lg font-semibold text-text">{en.details.referencePrices}</h2>
          <p className="text-2xs text-text-muted">{REFERENCE_PRICE_NOTE}</p>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-2xs text-text-muted">
                  <th scope="col" className="px-4 py-3 text-start font-medium">{en.create.subscription.package}</th>
                  {DURATIONS.map((months) => (
                    <th key={months} scope="col" className="px-4 py-3 text-end font-medium">
                      {en.packages.priceFor(months)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.code} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-text">{pkg.name}</td>
                    {DURATIONS.map((months) => (
                      <td key={months} className="tabular px-4 py-3 text-end text-text">
                        {formatEgp(getReferencePrice(pkg.code, months))} EGP
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
