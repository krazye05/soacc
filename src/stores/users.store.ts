import { UserDetail } from "@/interfaces/stores.interface";
import { defineStore } from "pinia";

export const useUsersStore = defineStore({
  id: "users",
  state: (): { users: UserDetail[] } => ({
    users: [],
  }),
});
