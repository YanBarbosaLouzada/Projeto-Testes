import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "./pages/Layout/Layout";
import { AuthPage, ChatPage, HomePage, ProductPage } from "./lazyRoutes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "products",
        element: <Suspense fallback={<p role="status">Carregando página...</p>}><ProductPage /></Suspense>,
      },
      {
        path: "ex",
        element: <p>Exemplo </p>,
      },
      {
        path: "/",
        element: <Suspense fallback={<p role="status">Carregando página...</p>}><HomePage /></Suspense>,
      },
      {
        path: "/auth",
        element: <Suspense fallback={<p role="status">Carregando página...</p>}><AuthPage /></Suspense>,
      },
      {
        path: "/chatpage",
        element: <Suspense fallback={<p role="status">Carregando página...</p>}><ChatPage /></Suspense>,
      },
    ],
  },
]);