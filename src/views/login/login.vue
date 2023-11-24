<style lang="scss">
@import "./login.scss";
</style>
<template>
  <div class="login-container" v-if="!isLogin">
    <div class="login-wrapper">
      <v-progress-linear
        absolute
        :active="loading"
        :indeterminate="loading"
        color="primary"
      ></v-progress-linear>
      <v-overlay persistent contained v-model="loading"></v-overlay>
      <!-- <form v-on:keyup.enter="process" class="login-content"> -->
      <div class="login-content">
        <div class="login-header mb-16">
          <div class="d-flex align-center justify-center">
            <div class="me-3">
              <v-avatar rounded="0">
                <v-img
                  src="https://cdn-icons-png.flaticon.com/512/2845/2845655.png"
                />
              </v-avatar>
            </div>
            <div>
              <div class="text-h5 font-weight-medium">SOACC</div>
            </div>
          </div>
        </div>
        <!-- v-on:keyup.enter="signIn" -->
        <div class="login-body">
          <v-scroll-x-transition mode="out-in">
            <div v-if="!errorOthers.status">
              <div class="mb-3">
                <v-text-field
                  color="primary"
                  label="Username"
                  variant="outlined"
                  clearable
                  clear-icon="mdi-close"
                  v-model.trim="email.value"
                  :error="!!email.error?.status"
                  hide-details
                />

                <div class="error-message">
                  <div v-if="email.error?.status && email.error?.message != ''">
                    <span>
                      <v-icon icon="mdi-alert-circle"></v-icon>
                    </span>
                    {{ email.error?.message }}
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <v-text-field
                  color="primary"
                  :type="show ? 'text' : 'password'"
                  label="Password"
                  variant="outlined"
                  clearable
                  :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="show = !show"
                  clear-icon="mdi-close"
                  v-model.trim="password.value"
                  :error="!!password.error?.status"
                  hide-details
                />
                <div class="error-message">
                  <div
                    v-if="
                      password.error?.status && password.error?.message != ''
                    "
                  >
                    <span>
                      <v-icon icon="mdi-alert-circle"></v-icon>
                    </span>
                    {{ password.error?.message }}
                  </div>
                </div>
              </div>

              <cCheckBox
                v-model="rememberMe"
                label="Remember Me"
                color="primary"
              />
            </div>
            <div v-if="errorOthers.status">
              <v-alert type="error">
                {{ errorOthers.message }}
              </v-alert>
            </div>
          </v-scroll-x-transition>
          <div class="mt-3" style="position: fixed; right: 0px; top: 220px">
            <v-btn color="primary" @click="process()" style="width: 97.16px">{{
              errorOthers.status ? "return" : "Sign In"
            }}</v-btn>
          </div>
        </div>
      </div>
      <!-- </form> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import cCheckBox from "@/components/cCheckBox.vue";
import { TextField } from "@/interfaces/vuetify.components.interface";
import { useGlobalStore } from "@/stores";
import {
  AuthErrorCodes,
  getAuth,
  signInWithEmailAndPassword,
  browserLocalPersistence,
  browserSessionPersistence,
} from "@firebase/auth";
import { FirebaseError } from "@firebase/util";
import router from "@/plugins/router";
import { storeToRefs } from "pinia";

const globalStore = useGlobalStore();
const { isLogin } = storeToRefs(globalStore);
const email = ref<TextField>({
    value: "",
    error: { status: false, message: "" },
  }),
  password = ref<TextField>({
    value: "",
    error: { status: false, message: "" },
  }),
  rememberMe = ref(false),
  show = ref(false),
  loading = ref(false),
  errorOthers = ref({
    status: false,
    message: "",
  });

const keypressEnterProcess = (e: KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      email.value.value !== "" &&
      password.value.value !== ""
    )
      process();
  },
  process = () => {
    if (errorOthers.value.status) {
      errorOthers.value = {
        status: false,
        message: "",
      };
      return false;
    }
    loading.value = true;
    [email.value.error, password.value.error].forEach(
      (e?: { status: Boolean; message: String }) =>
        e !== undefined ? ((e.status = false), (e.message = "")) : false
    );
    const auth = getAuth();

    auth.setPersistence(
      rememberMe.value ? browserLocalPersistence : browserSessionPersistence
    );

    signInWithEmailAndPassword(auth, email.value.value, password.value.value)
      .then(() => {
        useGlobalStore().onInitOverlay(true);
        router.push({ path: "/dashboard" });
        window.removeEventListener("keypress", keypressEnterProcess);
      })
      .catch(handleError)
      .finally(() => {
        loading.value = false;
      });
  },
  handleError = (errorRes: FirebaseError) => {
    switch (errorRes.code) {
      case AuthErrorCodes.USER_DELETED:
        email.value.error = {
          status: true,
          message: "Couldn't found your Account",
        };
        break;
      case AuthErrorCodes.INVALID_EMAIL:
        email.value.error = {
          status: true,
          message: "Your Account Email is Invalid ",
        };
        break;
      case AuthErrorCodes.INVALID_PASSWORD:
        password.value.error = {
          status: true,
          message: "Wrong password. Try again",
        };
        break;
      case AuthErrorCodes.USER_DISABLED:
        errorOthers.value = {
          status: true,
          message:
            "This email does not exists or disabled. Contact the administrator for more information.",
        };
        break;
      default:
        errorOthers.value = {
          status: true,
          message:
            "Something went wrong. Please try again or Contact the administrator for more information.",
        };
    }
  };

onMounted(() => {
  window.addEventListener("keypress", keypressEnterProcess);
});
</script>
