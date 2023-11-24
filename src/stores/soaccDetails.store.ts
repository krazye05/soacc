import { Soacc, SoaccAssigns } from "@/interfaces/stores.interface";
import { defineStore } from "pinia";

export const useSoaccDetailsStore = defineStore({
  id: "soaccDetails",
  state: (): { soaccList: Soacc[]; soaccAssigns: SoaccAssigns[] } => ({
    soaccList: [],
    soaccAssigns: [],
  }),
});
