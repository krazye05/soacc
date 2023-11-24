<style lang="scss" scoped>
.ccheckbox-container {
  display: -webkit-inline-box;
  display: inline-flex;
  width: 100%;
  padding: 0 8px;
  .ccheckbox-wrapper {
    align-items: center;
    display: flex;
    flex: none;
    height: 24px;
    justify-content: center;
    width: 24px;
    justify-content: flex-start;
    .ccheckbox-input-wrapper {
      border-color: #5f6368;
      will-change: unset;
      z-index: 0;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      padding: calc((40px - 18px) / 2);
      margin: calc((48px - 40px) / 2);
      margin-left: -8px;
      display: inline-block;
      position: relative;
      flex: 0 0 18px;
      box-sizing: content-box;
      width: 18px;
      height: 18px;
      line-height: 0;
      white-space: nowrap;
      cursor: pointer;
      vertical-align: bottom;
      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 100%;
        background-color: currentColor;
        opacity: 0;
        pointer-events: none;
        color: inherit;
      }
      &:hover::before {
        opacity: calc(
          var(--v-hover-opacity) * var(--v-theme-overlay-multiplier)
        );
      }
      input[type="checkbox"] {
        position: absolute;
        margin: 0;
        padding: 0;
        opacity: 0;
        cursor: inherit;
        &:checked ~ .ccheckbox-icon {
          opacity: 1;
          border: unset !important;
          background-color: #e3e3e3;
          path {
            stroke-dashoffset: 0;
          }
        }
        + .ccheckbox-icon {
          display: -webkit-inline-box;
          display: inline-flex;
          position: absolute;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          width: 18px;
          height: 18px;
          border: 2px solid currentColor;
          border-radius: 2px;
          background-color: transparent;
          pointer-events: none;
          will-change: background-color, border-color;
          transition: background-color 90ms 0ms cubic-bezier(0.4, 0, 0.6, 1),
            border-color 90ms 0ms cubic-bezier(0.4, 0, 0.6, 1),
            opacity 90ms 0ms cubic-bezier(0.4, 0, 0.6, 1);
          opacity: var(--v-medium-emphasis-opacity);
          path {
            transition: stroke-dashoffset 180ms 0ms cubic-bezier(0.4, 0, 0.6, 1);
            stroke: currentColor;
            stroke-width: 3.12px;
            stroke-dasharray: 29.7833385;

            stroke-dashoffset: 29.7833385;
          }
        }
      }
    }
  }
  label {
    align-items: flex-start;
    display: flex;
    flex: 0 1 auto;
    flex-direction: column;
    justify-content: center;
    margin-left: 8px;
    min-width: 0;
    width: 100%;
    opacity: var(--v-medium-emphasis-opacity);
    user-select: none;
    cursor: pointer;
  }
}
</style>

<template>
  <div class="ccheckbox-container">
    <div class="ccheckbox-wrapper">
      <div
        class="ccheckbox-input-wrapper"
        :class="modelValue && color ? `text-${color}` : ''"
        v-ripple.circle.center
        @click="eventClick()"
      >
        <input type="checkbox" v-model="defProps.modelValue" />

        <div
          class="ccheckbox-icon"
          :class="modelValue && color ? `bg-${color}` : ''"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path
              :style="{
                color: color ? 'white' : 'RGB(var(--v-theme-surface))',
              }"
              fill="none"
              d="M1.73,12.91 8.1,19.28 22.79,4.59"
            ></path>
          </svg>
        </div>
      </div>
    </div>
    <label @click="eventClick()" v-if="label != ''" style="">{{ label }}</label>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const defProps = defineProps({
  modelValue: Boolean,
  color: String,
  label: String,
});
const checkStatus = ref();

const emit = defineEmits(["update:modelValue"]);
function eventClick() {
  emit("update:modelValue", !defProps.modelValue);
}
</script>
