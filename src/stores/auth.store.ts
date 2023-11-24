import { UserDetail } from "@/interfaces/stores.interface";
import { defineStore } from "pinia";

export const useAuthStore = defineStore({
  id: "auth",
  state: (): UserDetail => ({
    UID: "",
    firstName: "",
    lastName: "",
    isDark: true,
    status: false,
    userImage: "",
  }),
  actions: {
    init(user: UserDetail) {
      this.firstName = user.firstName;
      this.lastName = user.lastName;
      this.isDark = user.isDark;
      this.status = user.status;
      this.userImage = user.userImage;
    },
  },
});
