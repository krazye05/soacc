<style lang="scss"></style>
<template>
  <v-dialog persistent v-model="dialogModel" width="50%">
    <v-card>
      <v-card-title class="text-h5"> Assign Statement </v-card-title>
      <v-card-text>
        <multipleAutocomplete
          label="Users"
          :items="users"
          :item-title="(e:any) => e.firstName + ' ' + e.lastName"
          v-model="usersModel"
          persistent-hint
          hint="* Required"
          color="primary"
          chips
          closable-chips
          fit-items
          select-all
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="success"> Agree </v-btn>
        <v-btn color="error" @click="dialogModel = false"> Close </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-card class="mb-6">
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6">
          <v-autocomplete
            persistent-hint
            hint="* Required"
            color="primary"
            variant="outlined"
            density="compact"
            label="Bank"
            :items="banks"
            item-title="bankName"
            item-value="UID"
            v-model="inputBank"
            @update:modelValue="
              (monthYearModel.year = null), (monthYearModel.month = null)
            "
          />
        </v-col>
        <v-col cols="12" sm="6">
          <monthYear
            :disabled="!inputBank"
            label="Cutoff Date"
            v-model="monthYearModel"
            action
            persistent-hint
            hint="* Required"
            year-month
            :yearList="{ items: getYear }"
            :month-list="{ items: getMonth }"
            alternate-disabled
            @update:model-value-action="monthYearAction = $event"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <v-card class="mb-6 pa-3" v-for="getTableItem in getTableItems">
    <cDataTable
      :title="getTableItem.header"
      class="statementTable"
      dense
      :headers="getColumnHeader"
      :items="getTableItem.transactions"
      :rowsPerPageOption="{
        rowPageIndex: reduceTable(getTableItems.length),
      }"
      v-model="getTableItem.modelSelect"
      :rows-options="{ color: tableOptionRowColor }"
      hover
      :action-button="actionButton(getTableItem.modelSelect)"
      show-select
      generate-report
    >
      <template v-slot:optionRow="value" :title="'asd'">
        <v-menu>
          <template v-slot:activator="{ isActive, props }">
            <v-btn density="comfortable" color="secondary" v-bind="props">
              Select Options
              <template v-slot:append>
                <v-icon
                  :style="[
                    'transition: .2s cubic-bezier(.4,0,.2,1)',
                    { transform: isActive ? 'rotate(180deg)' : '' },
                  ]"
                >
                  mdi-menu-down
                </v-icon>
              </template>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              @click="optionRow('ASSIGN', value.value as SoaccTransactions)"
            >
              <v-list-item-title style="text-align: center"
                >Assign</v-list-item-title
              >
            </v-list-item>
            <v-list-item
              @click="optionRow('IGNORE', value.value as SoaccTransactions)"
            >
              <v-list-item-title style="text-align: center"
                >Ignore</v-list-item-title
              >
            </v-list-item>
            <v-list-item
              @click="optionRow('REMOVE', value.value as SoaccTransactions)"
            >
              <v-list-item-title style="text-align: center"
                >Remove</v-list-item-title
              >
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </cDataTable>
  </v-card>
</template>
<script lang="ts" setup>
import { computed, ref } from "vue";
import cDataTable from "@/components/cDataTable/cDataTable.vue";

import { storeToRefs } from "pinia";
import monthYear from "@/components/month-year.vue";

import { usebankDetailsStore, useSoaccDetailsStore } from "@/stores";
import {
  Soacc,
  SoaccAccountDetails,
  SoaccTransactions,
} from "@/interfaces/stores.interface";
import { useUsersStore } from "@/stores/users.store";
import multipleAutocomplete from "@/components/multipleAutocomplete.vue";
const bankDetailsStore = usebankDetailsStore(),
  soaccDetailsStore = useSoaccDetailsStore(),
  usersStore = useUsersStore();

const { bankDetails } = storeToRefs(bankDetailsStore),
  { soaccList, soaccAssigns } = storeToRefs(soaccDetailsStore),
  { users } = storeToRefs(usersStore);
//
const inputBank = ref(),
  monthYearModel = ref<any>({ year: null, month: null }),
  monthYearAction = ref<any>({ year: null, month: null }),
  dialogModel = ref<boolean>(),
  usersModel = ref([]);

const banks = computed(() =>
    bankDetails.value
      .map(
        (e) => soaccList.value.map((e: any) => e.bankID).includes(e.UID) && e
      )
      .filter(Boolean)
  ),
  getYear = computed(() => {
    const value = soaccList.value
      .map((e: any) => e.bankID === inputBank.value && e.monthYear.year)
      .filter(Boolean);
    if (value.length === 0) return [];
    return [...new Set(value)];
  }),
  getMonth = computed(() => {
    const value = soaccList.value
      .map(
        (e: any) =>
          e.bankID === inputBank.value &&
          e.monthYear.year === monthYearAction.value.year &&
          e.monthYear.month.trim()
      )
      .filter(Boolean);
    if (value.length === 0) return [];
    return [...new Set(value)];
  }),
  getColumnHeader = computed(() => {
    if ([null, "", undefined].includes(inputBank.value)) return [];

    return bankDetails.value
      .find((e) => e.UID === inputBank.value)!
      .columnHeaders.map((e: any) => {
        if (e.value === "amount")
          e.render = (value: any, header: any) => {
            return convertToMoney(Number(value.amount.toFixed(2)));
          };

        return e;
      });
  }),
  getTableItems = computed(() => {
    return (
      soaccList.value.map(
        (e: Soacc) =>
          (e.bankID === inputBank.value &&
            e.monthYear.year === monthYearModel.value.year &&
            e.monthYear.month === monthYearModel.value.month &&
            e.accountDetails) ||
          []
      )[0] as (SoaccAccountDetails & { modelSelect: Array<any> })[]
    ).map((e) => {
      e.modelSelect = [];
      return e;
    });
  });

const convertToMoney = (value: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    });
  },
  reduceTable = (value: number) => {
    const counts = [5, 10, 50, 100],
      goal = value / 2;

    const closest = counts.reduce((prev, curr) =>
      Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev
    );

    return counts.indexOf(closest);
  },
  optionRow = (
    type: "ASSIGN" | "REMOVE" | "IGNORE" | "MODIFY",
    data: SoaccTransactions
  ) => {
    dialogModel.value = true;
  },
  tableOptionRowColor = (data: SoaccTransactions) => {
    const soaccAssign = soaccAssigns.value.find(
      (TsoaccAssign) =>
        TsoaccAssign.soaccUID === data.soaccUID &&
        TsoaccAssign.soaccTransactionUID === data.soaccTransactionUID &&
        TsoaccAssign.UID === data.UID
    );
    if (soaccAssign)
      return soaccAssign.ignore && soaccAssign.ignore
        ? "error"
        : soaccAssign.assignUsers && soaccAssign.assignUsers.length > 0
        ? "success"
        : "warning";
    return "warning";
    // let test: any = false;
    // if (data.UID === "-NTr29E0MlIdAWzRJkme") test = "success";
    // if (data.UID === "-NTr29E0MlIdAWzRJkmf") test = "info";
    // if (data.UID === "-NTr29E0MlIdAWzRJkmg") test = "error";
    // if (data.UID === "-NTr29E0MlIdAWzRJkmh") test = "warning";
    // return test;
  },
  actionButton = (data: any[]) => {
    return {
      title: data.length > 0 ? "Options" : "Add",
      action:
        data.length > 0
          ? [
              {
                title: "Add",
                action: () => {
                  console.log(data);
                },
              },
              {
                title: "Assign",
                action: () => {
                  console.log(data);
                },
              },
              {
                title: "Edit",
                action: () => {
                  console.log(data);
                },
              },
              {
                title: "Ignore",
                action: () => {
                  console.log(data);
                },
              },
              {
                title: "Remove",
                action: () => {
                  console.log(data);
                },
              },
            ]
          : () => {
              console.log(data);
            },
    };
  };
</script>
