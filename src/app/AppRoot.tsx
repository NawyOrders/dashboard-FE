import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import { Providers } from '@/app/providers';
import { useLocale } from '@/i18n';

export function AppRoot() {
  const locale = useLocale();
  return (
    <Providers>
      <RouterProvider key={locale} router={router} />
    </Providers>
  );
}
