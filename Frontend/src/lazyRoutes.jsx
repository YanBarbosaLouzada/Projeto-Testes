import { lazy } from "react";

export const ProductPage = lazy(() => import("./pages/ProductPage/ProductPage"));
export const HomePage = lazy(() => import("./pages/HomePage/HomePage"));
export const AuthPage = lazy(() => import("./pages/AuthPage/AuthPage"));
export const ChatPage = lazy(() => import("./pages/ChatPage/ChatPage"));
