import React from 'react';
import ReactDOM from 'react-dom/client';
import { initializeApi } from '@/app/composition';
import { AppRoot } from '@/app/AppRoot';
import { applyTheme } from '@/presentation/theme/apply-theme';
import { SchemaErrorScreen } from '@/presentation/components/shared/SchemaErrorScreen';
import { StartupErrorScreen } from '@/presentation/components/shared/StartupErrorScreen';
import { REGISTRATION_SCHEMA, REGISTRATION_SCHEMA_ISSUES } from '@/config/registration-schema';
import { initializeLocale, en } from '@/i18n';
import './index.css';

applyTheme();
initializeLocale();

const root = ReactDOM.createRoot(document.getElementById('root')!);

async function bootstrap() {
  // Startup gate (NW-246): the registration form is generated from the JSON schema, so an
  // invalid file must stop the app instead of rendering an incomplete form.
  if (!REGISTRATION_SCHEMA) {
    if (import.meta.env.DEV) {
      console.error(
        'Invalid restaurant registration schema:',
        REGISTRATION_SCHEMA_ISSUES.join('; '),
      );
    }
    root.render(
      <React.StrictMode>
        <SchemaErrorScreen issues={REGISTRATION_SCHEMA_ISSUES} />
      </React.StrictMode>,
    );
    return;
  }

  try {
    await initializeApi();
  } catch (error) {
    const message = error instanceof Error ? error.message : en.system.dataSourceFailed;
    if (import.meta.env.DEV) console.error('Data source startup failed:', error);
    root.render(
      <React.StrictMode>
        <StartupErrorScreen message={message} />
      </React.StrictMode>,
    );
    return;
  }

  root.render(
    <React.StrictMode>
      <AppRoot />
    </React.StrictMode>,
  );
}

void bootstrap();
