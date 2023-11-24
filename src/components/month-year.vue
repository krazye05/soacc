<template>
  <v-menu
    v-model="openMenu"
    :persistent="action"
    @update:modelValue="initMenu()"
  >
    <template v-slot:activator="{ props }">
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
        v-bind="props"
        :persistentHint="persistentHint"
        :hint="hint"
      ></v-text-field>
    </template>
    <v-card style="width: 100%; overflow: hidden; top: 3px">
      <v-row no-gutters @click.stop.prevent>
        <v-col class="ma-3">
          <v-autocomplete
            color="primary"
            @click.stop.prevent
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
          ></v-autocomplete>
          <!-- :items="!yearMonth ? (defProps.monthProp ? defProps.monthProp.items : defProps.monthList) : (defProps.yearProp ? defProps.yearProp.items : defProps.yearList) " -->
          <!-- v-model="monthYearValue.month" -->
        </v-col>
        <v-col class="ma-3">
          <v-autocomplete
            color="primary"
            @click.stop.prevent
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
          ></v-autocomplete>
        </v-col>
      </v-row>
      <v-row no-gutters @click.stop.prevent v-if="action">
        <v-col>
          <v-btn
            block
            border="0"
            rounded="0"
            color="success"
            variant="outlined"
            :disabled="checkMonthYearValue || checkMonthYearValueDifference"
            @click="inputEmit(true)"
          >
            Ok
          </v-btn>
        </v-col>
        <v-col>
          <v-btn
            block
            border="0"
            rounded="0"
            color="error"
            variant="outlined"
            @click="inputEmit(false)"
          >
            Close
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-menu>
</template>
<script lang="ts" setup>
import { PropType, computed, ref, watch } from "vue";

interface monthYearList {
  items: Array<{ title: string; value: string } | any>;
  itemTitle?: string;
  itemValue?: string;
}

const defProps = defineProps({
  label: String,
  yearList: Object as PropType<monthYearList>,
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
  monthList: Object as PropType<monthYearList>,
  alternateDisabled: Boolean,
  modelValueAction: Object,
});

function useValue(
  yearMonth: boolean,
  prop1?: monthYearList,
  prop2?: monthYearList,
  key?: "itemTitle" | "itemValue"
) {
  const value = !yearMonth ? prop1 : prop2;
  return (key === "itemTitle" ? value?.itemTitle : value?.itemValue) || "";
}

const emit = defineEmits(["update:modelValue", "update:modelValueAction"]);
const openMenu = ref(),
  monthYearValue = ref({ month: null, year: null }),
  defmonthYearValue = ref({ month: null, year: null }),
  labelValue = computed(() => {
    if (!checkMonthYearValue.value) {
      if (!defProps.action) {
        return defProps.modelValue?.month + " " + defProps.modelValue?.year;
      } else if (openMenu.value) {
        if (
          ["", undefined, null].includes(defmonthYearValue.value.month) ||
          ["", undefined, null].includes(defmonthYearValue.value.year)
        ) {
          return " ";
        } else {
          return (
            defmonthYearValue.value.month + " " + defmonthYearValue.value.year
          );
        }
      } else {
        if (
          ["", undefined, null].includes(defProps.modelValue.month) ||
          ["", undefined, null].includes(defProps.modelValue.year)
        )
          return "";
        return defProps.modelValue.month + " " + defProps.modelValue.year;
      }
    } else {
      return openMenu.value ? " " : "";
    }
  }),
  checkMonthYearValueDifference = computed(
    () =>
      monthYearValue.value.month === defmonthYearValue.value.month &&
      monthYearValue.value.year === defmonthYearValue.value.year
  );

function inputEmit(_initChangeLabel?: Boolean) {
  if (defProps.action)
    emit(
      "update:modelValueAction",
      JSON.parse(JSON.stringify(monthYearValue.value))
    );
  if (!defProps.action || _initChangeLabel === true)
    emit("update:modelValue", JSON.parse(JSON.stringify(monthYearValue.value)));

  if (
    (!defProps.action && !checkMonthYearValue.value) ||
    _initChangeLabel !== undefined
  )
    openMenu.value = false;
  if (_initChangeLabel === false)
    setTimeout(() => {
      monthYearValue.value = JSON.parse(
        JSON.stringify(defmonthYearValue.value)
      );
    }, 50);
}

watch(
  () => [
    defProps.modelValue,
    defProps.modelValue.year,
    defProps.modelValue.month,
  ],
  () => {
    monthYearValue.value = JSON.parse(JSON.stringify(defProps.modelValue));
    if (defProps.action)
      emit(
        "update:modelValueAction",
        JSON.parse(JSON.stringify(monthYearValue.value))
      );
  }
);

const checkMonthYearValue = computed(
  () =>
    ["", undefined, null].includes(monthYearValue.value.month) ||
    ["", undefined, null].includes(monthYearValue.value.year)
);

function initMenu() {
  monthYearValue.value = JSON.parse(JSON.stringify(defProps.modelValue));
  if (defProps.action)
    defmonthYearValue.value = JSON.parse(JSON.stringify(defProps.modelValue));
}

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
