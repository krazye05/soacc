import { GlobalStore } from "@/interfaces/stores.interface";
import { defineStore } from "pinia";
export const useGlobalStore = defineStore({
  id: "global",
  state: (): GlobalStore => ({
    overlay: false,
    initOverlay: false,
    initAPI: false,
    isLogin: false,
    isMobile: false,
    hasScroll: false,
    alertDialog: {
      status: false,
      title: "",
      text: "",
      type: "info",
      timer: {
        status: true,
        text: "This Dialog Will Closed in",
        interval: 5,
      },
    },
    confirmationDialog: {
      status: false,
      title: "Process Transaction",
      text: "Do you want to proceed this transaction?",
      action: {
        continue: () => {},
      },
    },
  }),
  actions: {
    onInitOverlay(status: boolean) {
      this.initOverlay = status;
    },
    reloadHasScroll() {
      this.hasScroll = document.body.offsetHeight > window.innerHeight;
    },
    resetAlertDialog() {
      this.alertDialog = {
        status: false,
        title: "",
        text: "",
        type: "info",
        timer: {
          status: true,
          text: "This Dialog Will Closed in",
          interval: 5,
        },
      };
    },
    resetConfirmationDialog() {
      this.confirmationDialog = {
        status: false,
        title: "Process Transaction",
        text: "Do you want to proceed this transaction?",
        action: {
          continue: () => {},
        },
      };
    },
  },
});
