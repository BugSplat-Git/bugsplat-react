import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { init } from '@bugsplat/react';
import App from './App';
import pkg from '../package.json';

const database = import.meta.env.BUGSPLAT_DATABASE;

if (!database) {
  throw new Error('BUGSPLAT_DATABASE environment variable must be set');
}

init({
  database,
  application: pkg.name,
  version: pkg.version,
})((bugSplat) => {
  bugSplat.setDefaultAppKey('key!');
  bugSplat.setDefaultDescription('description!');
  bugSplat.setDefaultEmail('fred@bugsplat.com');

  window.addEventListener('unhandledrejection', (rejection) => {
    bugSplat.post(String(rejection.reason)).catch(console.error);
  });
});

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = createRoot(rootEl);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
