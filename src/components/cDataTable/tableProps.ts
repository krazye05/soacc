import { ComponentPropsOptions, PropType, Ref } from "vue";
import { IHeader, IRowsPerPageOption } from "../cDataTable.interface";

export const headerTableProps = {
  title: {
    type: String,
    default: "",
  },
  actionButton: Object as PropType<{
    title: string;
    action:
      | Function
      | {
          title: string;
          action: Function;
          loading?: boolean | Ref;
          disabled?: boolean | Ref;
        }[];
    loading?: boolean | Ref;
    disabled?: boolean | Ref;
  }>,
  generateReport: Boolean,
} satisfies ComponentPropsOptions;

export const footerTableProps = {
  showFirstLastButtons: {
    type: Boolean,
    default: true,
  },
  rowsPerPageOption: {
    type: Object as PropType<IRowsPerPageOption>,
    default: {
      all: true,
      rowPages: [5, 10, 25, 50, 100],
      rowPageIndex: -1,
    },
  },
} satisfies ComponentPropsOptions;

export const dataTableProps = {
  headers: {
    required: true,
    type: Array as PropType<IHeader[]>,
  },
  items: {
    required: true,
    type: Array as PropType<Array<any>>,
    default: [],
  },
} satisfies ComponentPropsOptions;
export const reportProps = {
  simpleReport: Boolean,
  workSheetName: String,
} satisfies ComponentPropsOptions;
export const styleProps = {
  dense: {
    required: false,
    type: Boolean,
    default: false,
  },
  hover: {
    required: false,
    type: [Boolean, String],
    default: false,
  },
} satisfies ComponentPropsOptions;
// export const cDataTableProps =
