import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./plugins/router";

import firebaseConfig from "@/plugins/firebaseConfig";
import { initializeApp } from "firebase/app";
import { createPinia } from "pinia";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { useAuthStore, useGlobalStore } from "./stores";
import firebaseHelpers from "@/plugins/firebaseHelpers";
import { GlobalStore } from "@/interfaces/stores.interface";
import "typeface-inter/inter.css";
import "@/assets/init.scss";
initializeApp(firebaseConfig);
declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $checkAuth: boolean;
  }
}
let vueCreate: any, globalStore: GlobalStore, authStore: any;

onAuthStateChanged(getAuth(), async (e: any) => {
  if (!vueCreate) {
    vueCreate = createApp(App);
    vueCreate.use(createPinia()).use(router).use(vuetify).mount("#app");
    globalStore = useGlobalStore();
    authStore = useAuthStore();

  }
  if (globalStore.isLogin !== !!getAuth().currentUser)
    firebaseHelpers().initRealtimeDatabase.resetStores();

  globalStore.isLogin = !!getAuth().currentUser;

  authStore.UID = e ? e.uid : "";
});
