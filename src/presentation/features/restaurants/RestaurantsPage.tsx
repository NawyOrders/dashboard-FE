import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/presentation/components/shared/PageHeader';
import { en } from '@/presentation/i18n/en';
import { RestaurantsTable } from './RestaurantsTable';

export function RestaurantsPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('q') ?? '';

  return (
    <div>
      <PageHeader title={en.restaurants.title} subtitle={en.restaurants.subtitle} />
      <RestaurantsTable key={initialSearch} initialSearch={initialSearch} />
    </div>
  );
}