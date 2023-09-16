import './index.css';
import App from './App';
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppContextProvider from "./View/hooks/context";

const container = document.getElementById("root");
const root = createRoot(container!);

const router = createBrowserRouter([
  {
    path: "*",
    element: <App />,
  },
]);
root.render(
  <AppContextProvider>
    <RouterProvider router={router} />
  </AppContextProvider>
);