<style lang="scss">
@import "./uploadStatement.scss";
</style>
<style lang="scss" scoped>
.statementTable :deep(tr) td:last-child {
  text-align: right;
}
</style>
<template>
  <v-card class="mb-6">
    <v-card-text>
      <v-row class="mb-3">
        <v-col cols="12" sm="6">
          <v-autocomplete
            persistent-hint
            hint="* Required"
            color="primary"
            variant="outlined"
            density="compact"
            label="Bank"
            :items="bankDetails"
            item-title="bankName"
            item-value="UID"
            v-model="inputBank"
          ></v-autocomplete>
        </v-col>
        <v-col cols="12" sm="6">
          <monthYear
            label="Cutoff Date"
            :yearList="{ items: getYear() }"
            v-model="monthYearModel"
            action
            persistent-hint
            hint="* Required"
          />
        </v-col>
      </v-row>
      <div class="actionButton mb-2">
        <v-btn
          :disabled="
            [undefined, '', null].includes(monthYearModel.month) ||
            [undefined, '', null].includes(monthYearModel.year) ||
            [undefined, '', null].includes(inputBank) ||
            statementDataListsRetructured[0].header === '' ||
            statementDataListsRetructured[0].transactions.length === 0 ||
            statementDataListsRetructured
              .map(
                (e) =>
                  (e.header !== '' && e.transactions.length === 0) ||
                  (e.header === '' && e.transactions.length > 0)
              )
              .includes(true) ||
            notPDF ||
            pdfFileRequired
          "
          @click="confirmationDialog.status = true"
          block
          color="primary"
          >Save</v-btn
        >
      </div>
    </v-card-text>
  </v-card>
  <template
    v-if="
      ![undefined, '', null].includes(monthYearModel.month) &&
      ![undefined, '', null].includes(monthYearModel.year) &&
      ![undefined, '', null].includes(inputBank)
    "
  >
    <v-card class="mb-6">
      <v-card-text>
        <v-file-input
          :rules="[
            () => !notPDF || 'File is not PDF Format',
            () => !pdfFileRequired || 'Reference File Required',
          ]"
          prepend-icon=""
          variant="outlined"
          density="compact"
          accept="application/pdf"
          label="Reference File"
          class="uploadFile"
          v-model="pdfFile"
          persistent-hint
          hint="* Required"
          color="primary"
        >
          <template v-slot:append>
            <v-btn
              style="height: 100%"
              :disabled="pdfFile.length == 0"
              @click="dialog = pdfFile.length !== 0"
            >
              View File
            </v-btn>
          </template>
        </v-file-input>
      </v-card-text>
    </v-card>
    <v-card>
      <v-card-text>
        <v-row v-for="(item, index) in statementDataLists" class="mt-0 mb-0">
          <v-col cols="12" md="6">
            <v-text-field
              label="Header"
              variant="outlined"
              clearable
              clear-icon="mdi-close"
              density="compact"
              v-model="item.header"
              persistent-hint
              class="mb-3"
              hint="* Required"
              color="primary"
            >
            </v-text-field>
            <v-textarea
              color="primary"
              auto-grow
              variant="outlined"
              density="compact"
              label="Statement Details"
              v-model="item.statementDetails"
              persistent-hint
              hint="* Required"
            >
            </v-textarea>
          </v-col>
          <v-col
            cols="12"
            md="6"
            v-if="statementDataListsRetructured[index].transactions.length > 0"
          >
            <cDataTable
              class="statementTable"
              dense
              :headers="getColumnHeader"
              :items="statementDataListsRetructured[index].transactions"
              :rowsPerPageOption="{
                rowPageIndex: reduceTable(
                  statementDataListsRetructured[index].transactions.length
                ),
              }"
              generate-report
            />
            <div style="text-align: right">
              <span class="text-h7 font-weight-medium">Sub-Total:</span>
              <span
                class="font-weight-medium"
                style="color: #43a047 !important"
              >
                ₱{{
                  convertToMoney(
                    statementDataListsRetructured[index].transactions.reduce(
                      (acc: any, cur: any) => acc + cur.amount,
                      0
                    )
                  )
                }}
              </span>
            </div>
          </v-col>
        </v-row>
        <v-btn
          class="mt-6"
          block
          color="primary"
          :disabled="checkstatementDataListHasValue"
          prepend-icon="mdi-plus"
          @click="addMore()"
          >Add More</v-btn
        >
      </v-card-text>
    </v-card>
  </template>
  <v-dialog v-model="dialog" style="width: 100%">
    <v-card>
      <v-btn
        position="fixed"
        style="z-index: 1; right: 16px; top: 16px; opacity: 80%"
        icon="mdi-close"
        @click="dialog = false"
      />
      <vue-pdf-embed :source="pdfObject" />
    </v-card>
  </v-dialog>
</template>
<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { computedAsync } from "@vueuse/core";
// import VuePdfEmbed from "vue-pdf-embed";

import { usebankDetailsStore, useGlobalStore } from "@/stores";

import monthYear from "@/components/month-year.vue";
import cDataTable from "@/components/cDataTable/cDataTable.vue";

import firebaseHelpers from "@/plugins/firebaseHelpers";
import {
  Soacc,
  SoaccTransactions,
  SoaccAccountDetails,
} from "@/interfaces/stores.interface";

const bankDetailsStore = usebankDetailsStore(),
  globalStore = useGlobalStore();

const { bankDetails } = storeToRefs(bankDetailsStore),
  { alertDialog, confirmationDialog } = storeToRefs(globalStore);

const inputBank = ref(),
  dialog = ref(),
  pdfFile = ref<any>([]),
  monthYearModel = ref<any>({ year: null, month: null });

const statementDataLists = ref([{ header: "", statementDetails: "" }]);
const pdfObject = computed(() =>
    pdfFile.value == "" ? "" : URL.createObjectURL(pdfFile.value[0])
  ),
  statementDataListsRetructured = computed<SoaccAccountDetails[]>(() =>
    statementDataLists.value.map((statementDataList) => {
      const stDetails = statementDataList.statementDetails
        .replace(/\t/g, " ")
        .split(/\r?\n|\r|\n/g)
        .reduce((accum: Array<SoaccTransactions>, args) => {
          if (args === "") return accum;
          try {
            const [firstDate, secondDate, ...rest] = args.trim().split(" ");
            const description = rest.slice(0, -1).join(" "),
              value = rest[rest.length - 1];
            const num = value.slice(0, -1).replace(",", ""),
              lastChar = value.charAt(value.length - 1);
            const valueNumber = ["c", "-"].includes(
              lastChar.toLocaleLowerCase()
            )
              ? Number("-" + num)
              : Number(num + lastChar);

            const checkValue = isNaN(valueNumber);
            accum.push({
              firstDate,
              secondDate,
              description: description + (checkValue ? " " + value : ""),
              amount: checkValue ? 0 : valueNumber,
            });
            return accum;
          } catch (e) {
            return accum;
          }
        }, []);
      return {
        header: statementDataList.header,
        transactions: stDetails,
      };
    })
  ),
  checkstatementDataListHasValue = computed(() =>
    statementDataListsRetructured.value
      .map((e) => e.header === "" || e.transactions.length === 0)
      .includes(true)
  ),
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
  notPDF = computed(
    () =>
      pdfFile.value.length > 0 && pdfFile.value[0].type !== "application/pdf"
  ),
  pdfFileRequired = computed(() => pdfFile.value.length === 0),
  getBase64PdfFile = computedAsync(async () => {
    return await new Promise((resolve, reject) => {
      if (pdfFile.value.length === 0) resolve("");
      const reader = new FileReader();
      reader.readAsDataURL(pdfFile.value[0]);
      reader.onload = () => resolve(reader.result);
      // reader.onerror = (error) => reject(undefined);
    });
  });

function getYear() {
  const currentYear = new Date().getFullYear();
  const range = (start: number, stop: number, step: number) =>
    Array.from(
      {
        length: (stop - start) / step + 1,
      },
      (_: number, i: number) => start + i * step
    );

  return range(currentYear, currentYear - 10, -1);
}

function convertToMoney(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });
}

function resetData() {
  monthYearModel.value = { year: null, month: null };
  statementDataLists.value = [{ header: "", statementDetails: "" }];
  pdfFile.value = [];
  inputBank.value = null;
}

confirmationDialog.value.action.continue = () => {
  confirmationDialog.value.action.loading = true;
  firebaseHelpers()
    .crud.saveSoaccDetails({
      monthYear: monthYearModel.value,
      bankID: inputBank.value,
      referenceFile: String(getBase64PdfFile.value),
      accountDetails: statementDataListsRetructured.value,
    } as Soacc)
    .then((e) => {
      setTimeout(() => {
        alertDialog.value.status = true;
        alertDialog.value.type = "success";
        alertDialog.value.title = "Processed Successfuly";
        alertDialog.value.text = "Transaction has been processed successfully";

        alertDialog.value.timer.callBack = resetData;
      }, 100);
    })
    .catch((e) => {
      setTimeout(() => {
        alertDialog.value.status = true;
        alertDialog.value.type = "error";
        alertDialog.value.title = "Processed Failed";
        alertDialog.value.text = "Transaction processed failed";
      }, 100);
    })

    .finally(() => {
      confirmationDialog.value.status = false;
    });
};

function reduceTable(value: number) {
  const counts = [5, 10, 50, 100],
    goal = value / 2;

  const closest = counts.reduce((prev, curr) =>
    Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev
  );

  return counts.indexOf(closest);
}

function addMore() {
  statementDataLists.value.push({ header: "", statementDetails: "" });
}
</script>

<!-- <script lang="ts" src="./uploadStatement"></script> -->
