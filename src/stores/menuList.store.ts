import { MenuList } from "@/interfaces/stores.interface";
import { defineStore } from "pinia";

export const useMenuListStore = defineStore({
  id: "menuList",
  state: (): { menuLists: Array<MenuList> } => ({ menuLists: [] }),
  actions: {
    init(menuList: Array<MenuList>) {
      this.menuLists = menuList;
    },
  },
});
