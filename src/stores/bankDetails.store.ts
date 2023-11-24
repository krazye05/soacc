import { bankDetailsType } from "@/interfaces/stores.interface";
import { defineStore } from "pinia";

export const usebankDetailsStore = defineStore({
  id: "bankDetails",
  state: (): { bankDetails: Array<bankDetailsType> } => ({ bankDetails: [] }),
});
