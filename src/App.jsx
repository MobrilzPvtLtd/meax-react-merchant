import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import AppRoutes from './routes/AppRoutes';
import { HeaderProvider } from './context/HeaderContext';
import ErrorBoundary from './components/common/ErrorBoundary';

/**
 * Root Application Component for Merchant Portal
 * Structured with Global Redux Store, Top-Level Error Boundary,
 * Routing Context, and Dynamic Header State.
 */
function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <HeaderProvider>
            <AppRoutes />
          </HeaderProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
