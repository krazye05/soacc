<style lang="scss">
@import "./assets/customstyles.scss";
</style>
<style lang="scss" scoped>
@import "./assets/app.scss";
</style>

<template>
  <v-app v-resize="onResize">
    <v-dialog
      class="alert-confirmation-dialog"
      persistent
      :model-value="alertDialog.status || confirmationDialog.status"
    >
      <v-alert
        v-if="alertDialog.status"
        border
        prominent
        :type="alertDialog.type"
        :title="alertDialog.title"
      >
        <v-btn
          v-if="!alertDialog.timer"
          size="small"
          position="fixed"
          style="z-index: 1; right: 16px; top: 19px; opacity: 80%"
          icon="mdi-close"
          variant="tonal"
          @click="closeAlertDialog()"
        ></v-btn>
        <div style="overflow-wrap: break-word" class="mt-6">
          {{ alertDialog.text }}
        </div>

        <div
          v-if="alertDialog.timer"
          class="mt-6"
          style="font-style: italic; font-size: 12px; float: right"
        >
          <span>{{ alertDialog.timer?.text + " " + defValueTime + " " }}</span>
          <span
            style="cursor: pointer; text-decoration: underline"
            @click="closeAlertDialog()"
          >
            Click Me
          </span>
        </div>
      </v-alert>
      <v-card v-if="confirmationDialog.status">
        <v-card-title class="text-h5">{{
          confirmationDialog.title
        }}</v-card-title>
        <v-card-text>{{ confirmationDialog.text }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="success"
            :loading="confirmationDialog.action.loading"
            @click="confirmationDialog.action.continue()"
          >
            Continue
          </v-btn>
          <v-btn
            color="error"
            :disabled="confirmationDialog.action.loading"
            @click="closeConfirmationDialog()"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-layout
      :style="
        initOverlay
          ? 'background: RGB(var(--v-theme-background)); opacity: 0;'
          : ''
      "
      :class="[
        {
          'layout-container': isLogin,
          'layout-collapsed': isLogin && !navigationDrawerTemporaryStatus,
          'layout-overlay-nav':
            isLogin && navigationDrawerTemporaryStatus
              ? false
              : navigationDrawerRailStatus,
          'window-scrolled': scrolled,
        },
      ]"
    >
      <v-navigation-drawer
        v-if="isLogin"
        style="position: fixed; min-width: 68px"
        :temporary="navigationDrawerTemporaryStatus"
        :rail="
          navigationDrawerTemporaryStatus ? false : navigationDrawerRailStatus
        "
        expand-on-hover
        v-model="navigationDrawerStatus"
        class="navigation-parent"
        @update:rail="navigationDrawerHoverStatus = $event"
      >
        <v-list-item nav class="py-3 pl-3">
          <template v-slot:title>
            <div class="text-h6">SOACC</div>
          </template>
          <template v-slot:prepend>
            <v-avatar rounded="0">
              <v-img
                src="https://cdn-icons-png.flaticon.com/512/2845/2845655.png"
              />
            </v-avatar>
          </template>
          <template v-slot:append>
            <v-btn
              variant="plain"
              :ripple="false"
              :icon="
                'mdi-' +
                (navigationDrawerTemporaryStatus
                  ? 'close'
                  : 'menu' + (navigationDrawerRailStatus ? '' : '-open'))
              "
              @click="
                navigationDrawerTemporaryStatus
                  ? (navigationDrawerStatus = !navigationDrawerStatus)
                  : (navigationDrawerRailStatus = !navigationDrawerRailStatus)
              "
            ></v-btn>
          </template>
        </v-list-item>
        <!-- @click="navigateLink(menuList.menuPath)" -->
        <v-list nav class="navigation-list" :opened="getOpened">
          <template v-for="menuList in menuLists">
            <v-list-item
              v-if="!menuList.menuLists"
              :prepend-icon="menuList.menuIcon"
              :title="menuList.menuName"
              :value="menuList.UID"
              :to="menuList.menuPath"
              :active="currentRoutePath === menuList.menuPath"
              :ripple="false"
              color="primary"
            >
            </v-list-item>
            <v-list-group v-else :value="menuList.UID">
              <template v-slot:activator="{ props }">
                <v-list-item
                  v-bind="props"
                  :prepend-icon="menuList.menuIcon"
                  :title="menuList.menuName"
                  :active="
                    menuList.menuLists
                      .map((a) => a.menuPath === currentRoutePath)
                      .includes(true)
                  "
                  color="grey-lighten-1"
                ></v-list-item>
              </template>
              <v-list-item
                v-for="menuList2 in menuList.menuLists"
                :prepend-icon="
                  ['', undefined].includes(menuList2.menuIcon)
                    ? 'mdi-circle-small'
                    : menuList2.menuIcon
                "
                :title="menuList2.menuName"
                :value="menuList2.UID"
                :to="menuList2.menuPath"
                :ripple="false"
                :active="currentRoutePath === menuList2.menuPath"
                color="primary"
              ></v-list-item>
            </v-list-group>
            <!-- @click="navigateLink(menuList2.menuPath)" -->
          </template>
        </v-list>
      </v-navigation-drawer>
      <div class="layout-content-wrapper" style="width: 100%">
        <!-- :style="isLogin && hasScroll ? 'padding-right: 17px' : ''" -->
        <v-overlay
          persistent
          contained
          v-model="overlay"
          style="z-index: 999"
        ></v-overlay>
        <v-app-bar v-if="isLogin">
          <template v-if="navigationDrawerTemporaryStatus" v-slot:prepend>
            <v-btn
              style="height: 38px; width: 38px"
              icon="mdi-menu-open"
              @click="navigationDrawerStatus = !navigationDrawerStatus"
            ></v-btn>
          </template>
          <!-- active="routePath === menuList.menuPath" -->
          <v-app-bar-title>{{
            currentRouteName?.toString().toUpperCase()
          }}</v-app-bar-title>

          <template v-slot:append>
            <v-menu transition="scale-transition">
              <template v-slot:activator="{ props }">
                <div class="v-avatar">
                  <v-icon
                    v-if="
                      !authrefs.userImage || authrefs.userImage.value === ''
                    "
                    style="cursor: pointer"
                    v-bind="props"
                    size="35"
                    >mdi-account</v-icon
                  >
                  <v-img
                    v-if="authrefs.userImage && authrefs.userImage.value !== ''"
                    style="cursor: pointer"
                    class=""
                    v-bind="props"
                    cover
                    :src="authrefs.userImage.value"
                  ></v-img>
                </div>
              </template>
              <v-card class="userOptions mx-auto" width="230" style="top: 14px">
                <v-list>
                  <v-list-item @click="signOut()">
                    <template v-slot:prepend>
                      <v-icon
                        class="userOptionsIcon"
                        icon="mdi-logout"
                      ></v-icon>
                    </template>
                    <v-list-item-title>Logout</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>
          </template>
        </v-app-bar>
        <v-main>
          <router-view></router-view>
        </v-main>
      </div>
    </v-layout>
  </v-app>
</template>

<script lang="ts" setup>
import { ThemeInstance, useTheme } from "vuetify";
import { computed, getCurrentInstance, ref, watch } from "vue";
import { getAuth, signOut as signOutFirebase } from "@firebase/auth";
import router from "./plugins/router";
import { useAuthStore, useGlobalStore, useMenuListStore } from "@/stores";
import { storeToRefs } from "pinia";
import { MenuList } from "./interfaces/stores.interface";
import { RouteLocationNormalized, useRoute } from "vue-router";

const navigationDrawerStatus = ref(true),
  navigationDrawerRailStatus = ref(false),
  navigationDrawerTemporaryStatus = ref(false),
  navigationDrawerHoverStatus = ref(),
  res = ref<any>(),
  scrolled = ref(false),
  defValueTime = ref(0);

const theme: ThemeInstance = useTheme(),
  route: RouteLocationNormalized = useRoute();

const authStore = useAuthStore(),
  globalStore = useGlobalStore(),
  menuListStore = useMenuListStore();

const authrefs = storeToRefs(authStore),
  { overlay, initOverlay, isLogin, isMobile, alertDialog, confirmationDialog } =
    storeToRefs(globalStore),
  { menuLists } = storeToRefs(menuListStore);

const currentRoutePath = computed(() => route.path),
  currentRouteName = computed(() => {
    const selectMenu = menuListStore.menuLists
      .map((e: MenuList) =>
        e.menuLists
          ? (e.menuLists.find(
              (a: MenuList) => a.menuPath === currentRoutePath.value
            ) as MenuList)
          : e.menuPath === currentRoutePath.value
          ? e
          : ({} as MenuList)
      )
      .filter(Boolean)
      .find((e: MenuList) => e.menuPath === currentRoutePath.value);
    return selectMenu?.headerName || selectMenu?.menuName || "";
  }),
  getOpened = computed(() => {
    if (
      (!navigationDrawerTemporaryStatus.value &&
        (!navigationDrawerRailStatus.value ||
          !navigationDrawerHoverStatus.value)) ||
      (navigationDrawerStatus.value && navigationDrawerTemporaryStatus.value)
    ) {
      const activeMenu = menuListStore.menuLists.find((e: MenuList) =>
        e.menuLists
          ? e.menuLists.find(
              (a: MenuList) => a.menuPath === currentRoutePath.value
            )
          : false
      );

      return activeMenu ? [activeMenu.UID] : [];
    }
    return [];
  });
const instance = getCurrentInstance();
toggleTheme(
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
);
function navigateLink(e: string) {
  router.push({ path: e });
}

window.addEventListener("scroll", onScroll);
onResize();
// watch(
//   [navigationDrawerStatus, navigationDrawerTemporaryStatus],
//   () =>
//     (document.documentElement.style.overflow =
//       navigationDrawerTemporaryStatus.value && navigationDrawerStatus.value
//         ? "hidden"
//         : "overlay"),
//   {
//     immediate: true, // run immediately
//     deep: true, // detects changes inside objects. not needed here, but maybe in other cases
//   }
// );
let alertIntervalDialog: any = 0;
watch(
  () => alertDialog.value.status,
  () => {
    if (alertDialog.value.status && alertDialog.value.timer.status) {
      defValueTime.value = alertDialog.value.timer.interval;
      alertIntervalDialog = setInterval(() => {
        defValueTime.value--;
        if (defValueTime.value === 0) {
          setTimeout(() => {
            if (
              alertDialog.value.timer.status &&
              alertDialog.value.timer.callBack
            )
              alertDialog.value.timer.callBack();
            clearInterval(alertIntervalDialog);
            alertDialog.value.status = false;
          }, 100);
        }
      }, 1000);
    }
  }
);
watch(
  () => confirmationDialog.value.status,
  () => {
    if (!confirmationDialog.value.status)
      confirmationDialog.value.action.loading = false;
  }
);

function closeConfirmationDialog() {
  confirmationDialog.value.status = false;
  if (confirmationDialog.value.action.cancel)
    confirmationDialog.value.action.cancel();
}
function closeAlertDialog() {
  alertDialog.value.status = false;
  clearInterval(alertIntervalDialog);
  if (alertDialog.value.timer.status && alertDialog.value.timer.callBack)
    alertDialog.value.timer.callBack();
}

function onScroll(e: any) {
  scrolled.value = e.target.documentElement.scrollTop > 0;
}

function onResize() {
  isMobileFN();
  navigationDrawerTemporaryStatus.value = window.innerWidth < 1280;
}

function signOut() {
  signOutFirebase(getAuth()).then(
    () => (router.push({ path: "/" }), useGlobalStore().onInitOverlay(true))
  );
}

function isMobileFN() {
  if (res.value) clearTimeout(res.value);

  res.value = setTimeout(function () {
    isMobile.value = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i,
    ].some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
    });
    globalStore.reloadHasScroll();
  }, 100);
}

function toggleTheme(isDark: Boolean) {
  theme.global.name.value = isDark ? "dark" : "light";
}
</script>
