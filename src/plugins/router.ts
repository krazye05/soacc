import { createRouter, createWebHistory } from "vue-router";
import { getAuth } from "@firebase/auth";
import { useGlobalStore } from "@/stores";

import firebaseHelpers from "@/plugins/firebaseHelpers";

const history = createWebHistory(import.meta.env.BASE_URL),
  router = createRouter({
    history,
    routes: [
      {
        path: "/",
        name: "login",
        component: () => import("@/views/login/login.vue"),
      },
      {
        path: "/dashboard",
        name: "dashboard",
        component: () => import("@/views/dashboard/dashboard.vue"),
      },
      {
        path: "/transactions/upload",
        name: "uploadStatement",
        component: () => import("@/views/transactions/uploadStatement.vue"),
      },
      {
        path: "/transactions/assign",
        name: "assignStatement",
        component: () => import("@/views/transactions/assignStatement.vue"),
      },
    ],
  });

router.beforeEach(async (to, from, next) => {
  const globalStore = useGlobalStore(),
    auth = getAuth();

  globalStore.overlay = true;

  if (!auth.currentUser && to.path != "/") {
    next({
      path: "/",
      query: {
        redirect: to.path,
      },
    }),
      (globalStore.initAPI = false);
  } else if (auth.currentUser && to.path == "/")
    next({
      path: "/dashboard",
    });
  else {
    if (auth.currentUser && !globalStore.initAPI) {
      await firebaseHelpers().initRealtimeDatabase.loadDatabase();
    }
    if (globalStore.initOverlay)
      setTimeout(() => {
        globalStore.onInitOverlay(false);
      });
    next();
  }
});
router.afterEach(() => {
  const globalStore = useGlobalStore();

  globalStore.overlay = false;
  setTimeout(() => {
    globalStore.reloadHasScroll();
  });
});
export default router;
