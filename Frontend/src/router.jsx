import {createBrowserRouter} from "react-router-dom";
import Layout from "./pages/Layout/Layout";
import ProductPage from "./pages/ProductPage/ProductPage";
import HomePage from "./pages/HomePage/HomePage";
import AuthPage from "./pages/AuthPage/AuthPage";
import ChatPage from "./pages/ChatPage/ChatPage";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "products",
        element: <ProductPage />,
      },
      {
        path: "ex",
        element: <p>Exemplo </p>,
      },
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/auth",
        element: <AuthPage />,
      },
      {
        path: "/chatpage",
        element: <ChatPage />,
      },
    ],
  },
]);