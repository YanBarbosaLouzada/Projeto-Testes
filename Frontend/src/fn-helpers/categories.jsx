import { FaThLarge, FaMale, FaFemale, FaBoxOpen } from "react-icons/fa";

export const CATEGORY_META = {
  masculino: { label: "Masculino", icon: <FaMale />, accent: "#3b82f6" },
  feminino: { label: "Feminino", icon: <FaFemale />, accent: "#ec4899" },
  outros: { label: "Outros", icon: <FaBoxOpen />, accent: "#14b8a6" },
};

export const CATEGORY_LIST = [
  { key: "todos", label: "Todos", icon: <FaThLarge />, accent: "var(--accent)" },
  { key: "masculino", ...CATEGORY_META.masculino },
  { key: "feminino", ...CATEGORY_META.feminino },
  { key: "outros", ...CATEGORY_META.outros },
];
