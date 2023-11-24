<template ref="templatevn_autocomplete">
  <v-autocomplete
    ref="vn_autocomplete"
    multiple
    outlined
    dense
    autocomplete="new"
    :clearable="clearable"
    :label="label"
    :items="items"
    :item-value="itemValue"
    :item-text="itemText"
    :disabled="disabled"
    v-model="models"
    @focus="focusInput($event)"
    @blur="blurInput($event)"
  >
    <template v-slot:selection="{ item, index }">
      <v-chip
        small
        v-if="styleList != undefined && styleList.maxIndex - 1 >= index"
      >
        <span>{{ item.description }}</span>
      </v-chip>
      <v-tooltip v-if="showTooltip(index)" bottom>
        <template v-slot:activator="{ on }">
          <span v-on="on" class="grey--text text-caption">
            (+{{ models.length - styleList.maxIndex }}
            others)
          </span>
        </template>
        <span v-html="getFilteredList" class="filteredDeptElips"></span>
      </v-tooltip>
    </template>
    <template v-slot:prepend-item v-if="items != undefined && items.length > 1">
      <div
        style="
          position: sticky;
          top: 0;
          width: 100%;
          background: white;

          z-index: 99999;
        "
      >
        <v-list-item
          style="min-height: unset !important; padding: 20px 16px"
          class="v-list-item--link"
          ripple
          @mousedown="toggleSelectAll($event)"
        >
          <v-list-item-action>
            <v-icon :color="selectAllStyle.color">
              {{ selectAllStyle.icon }}
            </v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
              {{ selectAllStyle.label }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
      </div>
    </template>
  </v-autocomplete>
</template>
<script lang="ts" setup>
import { computed, PropType, ref, useSlots } from "vue";

const defProps = defineProps({
  modelValue: Boolean,
  itemValue: {
    required: false,
    type: [String, Function],
  },
  itemText: String,
  label: String,
  clearable: {
    required: false,
    type: [String, Boolean],
  },
  items: Array as PropType<Array<any>>,
  disabled: {
    required: false,
    type: [String, Boolean],
  },
});
const models = ref<Array<any>>([]),
  styleList = ref({ maxIndex: 0, showOthers: true }),
  catchMaxIndex = ref(0),
  templatevn_autocomplete = ref<any>(),
  vn_autocomplete = ref<any>();


      const showTooltip=(index:any)=> {
      return (
        styleList != undefined &&
        ((index == styleList.value.maxIndex && styleList.value.maxIndex != 0) ||
          (models.value.length - 1 == index &&
            styleList.value.showOthers == true))
      );
    },

    toggleSelectAll=(e:any)=> {
      e.preventDefault();
      if (e.which == 1)
        if (defProps.items && defProps.items.length == models.value.length) models.value.splice(0);
        else
        models.value = [
            ...models.value,
            ...(defProps.items ? defProps.items :[])
              .map((b:any) =>{
                const ba = typeof defProps.itemValue =='function'? defProps.itemValue() :defProps.itemValue;

                return !models.value.includes(b[ba])
                  ? b[ba]
                  : false
                }
              )
              .filter(Boolean),
          ]

    },
    focusInput = (e:any)=> {
    //   if (models.value.length - 1 > catchMaxIndex.value)
    //     vn_autocomplete.$el.querySelector(
    //       ".v-select__selections"
    //     ).style.padding = "8px 0px";

      const maxIndex = styleList.value.maxIndex;
      styleList.value.maxIndex = models.value.length
      catchMaxIndex.value = maxIndex

      e.preventDefault();
    },
    blurInput(e) {
      this.$refs.vn_autocomplete.$el.querySelector(
        ".v-select__selections"
      ).style.padding = "";

      this.$set(this.styleList, "maxIndex", this.catchMaxIndex);
      e.preventDefault();
    },
    toggleDetails(callback) {
      const self = this,
        ref = this.$refs.vn_autocomplete;
      if (ref != undefined && this.items.length > 0) {
        const parent = ref.$el;
        this.$set(this.styleList, "showOthers", true);
        this.$set(this.styleList, "maxIndex", this.models.length);
        this.$nextTick(function () {
          const otherText = parent.querySelector(".grey--text.text-caption"),
            toolTip = parent.querySelector(".v-tooltip");
          let maxWidth = 0,
            maxIndex = 0;
          if (otherText != null) {
            toolTip.style.display = "unset";
            maxWidth =
              otherText.clientWidth == 0
                ? toolTip.clientWidth
                : otherText.clientWidth;
          }
          Array.from(parent.querySelectorAll(".v-chip")).every((e) => {
            maxWidth += e.clientWidth + 8;
            if (
              parent.querySelector(".v-select__selections").clientWidth <=
              maxWidth
            )
              return false;
            maxIndex += 1;
            return true;
          });
          self.$set(this.styleList, "showOthers", false);
          self.$set(this, "catchMaxIndex", maxIndex);
          // if (otherText != null) otherText.style.display = ''
          if (self.models.length - 1 > maxIndex)
            self.$refs.vn_autocomplete.$el.querySelector(
              ".v-select__selections"
            ).style.padding = "8px 0px";
          if (callback != undefined && typeof callback == "function")
            callback.call();
        });
      }
    },
// export default {
//   props: [
//     "item-value",
//     "item-text",
//     "label",
//     "clearable",
//     "items",
//     "disabled",
//     "value",
//   ],
//   data() {
//     return {
//       models: [],
//       styleList: { maxIndex: 0, showOthers: true },
//       catchMaxIndex: 0,
//     };
//   },
//   created() {
//     this.items = this.items == undefined ? [] : this.items;
//     this.itemValue = this.itemValue == undefined ? "value" : this.itemValue;
//     this.itemText = this.itemText == undefined ? "text" : this.itemText;
//     this.clearable = this.clearable == undefined ? false : this.clearable;
//     this.models = this.value == undefined ? [] : this.value;
//     // this.$nextTick(function () {
//     //   this.toggleDetails()
//     // })
//   },
//   methods: {
//     showTooltip(index) {
//       return (
//         this.styleList != undefined &&
//         ((index == this.styleList.maxIndex && this.styleList.maxIndex != 0) ||
//           (this.models.length - 1 == index &&
//             this.styleList.showOthers == true))
//       );
//     },

//     toggleSelectAll(e) {
//       e.preventDefault();
//       if (e.which == 1)
//         if (this.items.length == this.models.length) this.models.splice(0);
//         else
//           this.$set(this, "models", [
//             ...this.models,
//             ...this.items
//               .map((e) =>
//                 !this.models.includes(e[this.itemValue])
//                   ? e[this.itemValue]
//                   : false
//               )
//               .filter(Boolean),
//           ]);
//     },
//     focusInput(e) {
//       if (this.models.length - 1 > this.catchMaxIndex)
//         this.$refs.vn_autocomplete.$el.querySelector(
//           ".v-select__selections"
//         ).style.padding = "8px 0px";

//       const maxIndex = this.styleList.maxIndex;
//       this.$set(this.styleList, "maxIndex", this.models.length);
//       this.$set(this, "catchMaxIndex", maxIndex);
//       e.preventDefault();
//     },
//     blurInput(e) {
//       this.$refs.vn_autocomplete.$el.querySelector(
//         ".v-select__selections"
//       ).style.padding = "";

//       this.$set(this.styleList, "maxIndex", this.catchMaxIndex);
//       e.preventDefault();
//     },
//     toggleDetails(callback) {
//       const self = this,
//         ref = this.$refs.vn_autocomplete;
//       if (ref != undefined && this.items.length > 0) {
//         const parent = ref.$el;
//         this.$set(this.styleList, "showOthers", true);
//         this.$set(this.styleList, "maxIndex", this.models.length);
//         this.$nextTick(function () {
//           const otherText = parent.querySelector(".grey--text.text-caption"),
//             toolTip = parent.querySelector(".v-tooltip");
//           let maxWidth = 0,
//             maxIndex = 0;
//           if (otherText != null) {
//             toolTip.style.display = "unset";
//             maxWidth =
//               otherText.clientWidth == 0
//                 ? toolTip.clientWidth
//                 : otherText.clientWidth;
//           }
//           Array.from(parent.querySelectorAll(".v-chip")).every((e) => {
//             maxWidth += e.clientWidth + 8;
//             if (
//               parent.querySelector(".v-select__selections").clientWidth <=
//               maxWidth
//             )
//               return false;
//             maxIndex += 1;
//             return true;
//           });
//           self.$set(this.styleList, "showOthers", false);
//           self.$set(this, "catchMaxIndex", maxIndex);
//           // if (otherText != null) otherText.style.display = ''
//           if (self.models.length - 1 > maxIndex)
//             self.$refs.vn_autocomplete.$el.querySelector(
//               ".v-select__selections"
//             ).style.padding = "8px 0px";
//           if (callback != undefined && typeof callback == "function")
//             callback.call();
//         });
//       }
//     },
//   },
//   computed: {
//     selectAllStyle() {
//       if (this.items != undefined && this.items.length == this.models.length)
//         return {
//           icon: "mdi-checkbox-marked",
//           label: "Select None",
//           color: "primary",
//         };
//       return {
//         icon:
//           this.models.length == 0
//             ? "mdi-checkbox-blank-outline"
//             : "mdi-minus-box ",
//         label: "Select All",
//         color: "",
//       };
//     },
//     getFilteredList() {
//       return this.models
//         .slice(this.styleList.maxIndex)
//         .map(
//           (e) =>
//             this.items
//               .map((a) => (a[this.itemValue] == e ? a : false))
//               .filter(Boolean)[0]
//         )
//         .map((e) => e.description)
//         .join(", ");
//     },
//   },
//   watch: {
//     models() {
//       this.toggleDetails();

//       this.$emit("input", this.models);
//     },
//     items() {
//       const self = this;
//       this.toggleDetails(() => {
//         self.$set(self.styleList, "maxIndex", self.catchMaxIndex);
//       });
//     },
//   },
// };
</script>

<style scoped>
>>> .v-list {
  padding: 0 0 8px;
}
.filteredDeptElips {
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  display: -webkit-box;
  max-height: 85px;
  overflow: hidden;
}
</style>
