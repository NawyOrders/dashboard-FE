import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import { Providers } from '@/app/providers';
import { applyTheme } from '@/presentation/theme/apply-theme';
import { SchemaErrorScreen } from '@/presentation/components/shared/SchemaErrorScreen';
import { REGISTRATION_SCHEMA, REGISTRATION_SCHEMA_ISSUES } from '@/config/registration-schema';
import './index.css';

applyTheme();

const root = ReactDOM.createRoot(document.getElementById('root')!);

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
} else {
  root.render(
    <React.StrictMode>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </React.StrictMode>,
  );
}
