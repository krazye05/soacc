// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Vuetify
import { createVuetify } from "vuetify";
import * as labs from "vuetify/labs/components";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

const light = {
    dark: false,
    colors: {
      primary: "#1976d2",
      secondary: "#424242",
      accent: "#82B1FF",
      error: "#FF5252",
      info: "#2196F3",
      success: "#4CAF50",
      warning: "#fb8c00",
    },
  },
  dark = {
    dark: true,
    colors: {
      primary: "#1976D2",
      secondary: "#424242",
      accent: "#82B1FF",
      error: "#FF5252",
      info: "#2196F3",
      success: "#4CAF50",
      warning: "#fb8c00",
    },
  };

export default createVuetify({
  ssr: true,
  components: {
    ...components,
    ...labs,
  },
  directives,
  theme: {
    themes: {
      light,
      dark,
    },
  },
});
