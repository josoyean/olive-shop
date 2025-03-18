import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store, persistor } from "./redex/store.ts";
import { ThemeProvider } from "styled-components";
import { theme } from "../public/assets/styles/theme.ts";
import { PersistGate } from "redux-persist/es/integration/react";
createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={theme}>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </ThemeProvider>
);
