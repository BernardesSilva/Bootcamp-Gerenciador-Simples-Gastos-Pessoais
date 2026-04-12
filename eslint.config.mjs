import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                Chart: "readonly" // Isso resolve o erro 'Chart is not defined'
            }
        },
        rules: {
            "no-unused-vars": "off", // Isso resolve o erro de funções 'never used'
            "no-undef": "off"
        }
    }
];