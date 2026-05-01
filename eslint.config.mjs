import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Отключаем слишком строгое экспериментальное правило React 19.
      // Оно запрещает setState в useEffect, что ломает валидные паттерны
      // загрузки данных и синхронизации derived state.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
