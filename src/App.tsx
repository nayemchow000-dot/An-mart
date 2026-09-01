/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </HelmetProvider>
  );
}
