import { createRoot } from "react-dom/client";
import "@/styles/globals.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store, persistor } from "./redux/store.ts";
import { PersistGate } from "redux-persist/es/integration/react";
import { CookiesProvider } from "react-cookie";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <CookiesProvider>
        <App />
      </CookiesProvider>
    </PersistGate>
  </Provider>
);
