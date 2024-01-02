<style lang="scss" scoped>
.monthYearContainer {
  width: 100%;
  overflow: hidden;
  top: 3px;
  :deep(.v-card__overlay) {
    opacity: 0;
  }
}
</style>
<template>
  <v-text-field
    :loading="defProps.loading"
    :disabled="defProps.disabled"
    :hide-details="hideDetails"
    v-model="labelValue"
    color="primary"
    readonly
    :label="label"
    variant="outlined"
    density="compact"
    @update:focused="openMenu = true"
    :persistentHint="persistentHint"
    :hint="hint"
    ref="vMenuTarget"
  />
  <v-menu
    v-model="openMenu"
    :persistent="action"
    :target="vMenuTarget"
    :close-on-content-click="false"
  >
    <v-card class="monthYearContainer">
      <v-row no-gutters>
        <v-col class="ma-3">
          <v-autocomplete
            color="primary"
            hide-details
            :label="!yearMonth ? 'Month' : 'Year'"
            variant="outlined"
            density="compact"
            :model-value="
              !yearMonth ? monthYearValue.month : monthYearValue.year
            "
            @update:modelValue="
              (monthYearValue[!yearMonth ? 'month' : 'year'] = $event),
                inputEmit()
            "
            :items="!yearMonth ? monthList?.items || months : yearList?.items"
            :item-title="useValue(!yearMonth, monthList, yearList, 'itemTitle')"
            :item-value="useValue(!yearMonth, monthList, yearList, 'itemValue')"
          />
        </v-col>
        <v-col class="ma-3">
          <v-autocomplete
            color="primary"
            hide-details
            :label="!yearMonth ? 'Year' : 'Month'"
            variant="outlined"
            :model-value="
              !yearMonth ? monthYearValue.year : monthYearValue.month
            "
            @update:modelValue="
              (monthYearValue[!yearMonth ? 'year' : 'month'] = $event),
                inputEmit()
            "
            density="compact"
            :items="!yearMonth ? yearList?.items : monthList?.items || months"
            :item-title="useValue(!yearMonth, yearList, monthList, 'itemTitle')"
            :item-value="useValue(!yearMonth, yearList, monthList, 'itemValue')"
            :disabled="
              alternateDisabled &&
              ([null, '', undefined].includes(
                monthYearValue[!yearMonth ? 'month' : 'year']
              ) ||
                (!yearMonth
                  ? yearList?.items || []
                  : monthList?.items || months
                ).length === 0)
            "
          />
        </v-col>
      </v-row>
      <v-row no-gutters v-if="action">
        <v-col>
          <v-btn
            block
            border="0"
            rounded="0"
            color="success"
            variant="outlined"
            :disabled="
              condMonthYearValue(monthYearValue) ||
              checkMonthYearValueDifference ||
              !checkListIfMonthYearHasValue
            "
            @click="inputEmit(true)"
            text="Ok"
          />
        </v-col>
        <v-col>
          <v-btn
            block
            border="0"
            rounded="0"
            color="error"
            variant="outlined"
            @click="inputEmit(false)"
            text="Close"
          />
        </v-col>
      </v-row>
    </v-card>
  </v-menu>
</template>
<script lang="ts" setup>
import { PropType, computed, inject, ref, watch } from "vue";

interface IMonthYearList {
  items: Array<{ title: string; value: string } | any>;
  itemTitle?: string;
  itemValue?: string;
}
interface IMonthYear {
  month: any;
  year: any;
}
const helpers = inject<IHelpers>("Helpers")!;

const defProps = defineProps({
  label: String,
  yearList: Object as PropType<IMonthYearList>,
  modelValue: {
    type: Object,
    default: () => ({ month: null, year: null }),
  },
  disabled: Boolean,
  loading: {
    type: [String, Boolean],
    default: false,
  },
  action: Boolean,
  hideDetails: Boolean,
  persistentHint: Boolean,
  hint: String,
  yearMonth: Boolean,
  monthList: Object as PropType<IMonthYearList>,
  alternateDisabled: Boolean,
});
defineOptions({
  inheritAttrs: false,
});
const emit = defineEmits([
  "update:modelValue",
  "openMenu",
  "closeMenu",
  "done",
]);
const openMenu = ref(),
  vMenuTarget = ref<Element>(),
  monthYearValue = ref<IMonthYear>({ month: null, year: null }),
  defmonthYearValue = ref<IMonthYear>({
    month: null,
    year: null,
  }),
  labelValue = computed(() => {
    const getFormattedDate = (value) =>
        condMonthYearValue(value) ? " " : `${value.month} ${value.year}`,
      shouldReturnDefault = () =>
        (!condMonthYearValue(monthYearValue.value) ||
          !condMonthYearValue(defmonthYearValue.value)) &&
        !defProps.action;

    if (shouldReturnDefault() || (defProps.action && openMenu.value)) {
      return getFormattedDate(
        openMenu.value ? defmonthYearValue.value : defProps.modelValue
      );
    } else if (!condMonthYearValue(defProps.modelValue as IMonthYear, "AND")) {
      return getFormattedDate(defProps.modelValue);
    }
    return openMenu.value ? " " : "";
  }),
  checkMonthYearValueDifference = computed(
    () =>
      monthYearValue.value.month === defmonthYearValue.value.month &&
      monthYearValue.value.year === defmonthYearValue.value.year
  ),
  checkListIfMonthYearHasValue = computed(
    () =>
      (defProps.monthList ? defProps.monthList.items.length : months.length) >
        0 && (defProps.yearList?.items.length || 0) > 0
  );

const inputEmit = (_initChangeLabel?: Boolean) => {
    
    emit("update:modelValue", helpers.rebuildObject(monthYearValue.value));
    if (
      (!defProps.action &&
        !condMonthYearValue(monthYearValue.value) &&
        !checkMonthYearValueDifference.value &&
        condMonthYearValue(defmonthYearValue.value)) ||
      (defProps.action && _initChangeLabel != undefined)
    ) {
      if (_initChangeLabel === false) {
        emit(
          "update:modelValue",
          helpers.rebuildObject(defmonthYearValue.value)
        );
        monthYearValue.value = helpers.rebuildObject(defmonthYearValue.value);
      }
      openMenu.value = false;
      emit("done", {
        old: helpers.rebuildObject(defmonthYearValue.value),
        new: helpers.rebuildObject(monthYearValue.value),
      });
    }
  },
  condMonthYearValue = (value: IMonthYear, cond?: "AND" | "OR") => {
    if (cond === "AND")
      return (
        helpers.isNullOrUndefined(value.month) &&
        helpers.isNullOrUndefined(value.year)
      );
    return (
      helpers.isNullOrUndefined(value.month) ||
      helpers.isNullOrUndefined(value.year)
    );
  },
  useValue = (
    yearMonth: boolean,
    prop1?: IMonthYearList,
    prop2?: IMonthYearList,
    key?: "itemTitle" | "itemValue"
  ) => {
    const value = !yearMonth ? prop1 : prop2;
    return (key === "itemTitle" ? value?.itemTitle : value?.itemValue) || "";
  };

watch(
  () => openMenu.value,
  () => {
    if (openMenu.value) {
      defmonthYearValue.value = helpers.rebuildObject(defProps.modelValue);
      monthYearValue.value = helpers.rebuildObject(defProps.modelValue);
    } else if (
      !defProps.action &&
      (checkListIfMonthYearHasValue.value
        ? condMonthYearValue(monthYearValue.value)
        : true)
    ) {
      emit("update:modelValue", helpers.rebuildObject(defmonthYearValue.value));

      setTimeout(() => {
        monthYearValue.value = helpers.rebuildObject(defmonthYearValue.value);
      }, 150);
    }
    emit(openMenu.value ? "openMenu" : "closeMenu");
  }
);

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
</script>
