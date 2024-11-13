export interface IHeader {
  text: string;
  value: string;
  sort?: boolean | string;
  sortIndex?: number;
  columnNumber?: number | null;
  sticky?: boolean | string;
  chip?: boolean | string;
  render?: (value?: any, header?: any) => any;
}

export interface IRowsPerPageOption {
  all?: boolean;
  rowPages?: Array<number>;
  rowPageIndex?: number;
}

export interface IRowsOptions {
  color?: (data?: any) => false | string;
}

export interface ISort {
  value: string;
  type: "ASC" | "DESC" | null;
}

export interface dataTable {
  title: string;
  serverSide: boolean | string;
  search: boolean | string;
  headers: IHeader[];
  items: any[];
  dense: boolean | string;
  sort: boolean | string;
  multiSort: boolean | string;
  showFirstLastButtons: boolean | string;
  rowsPerPageOption: IRowsPerPageOption | Array<number>;
  loading: boolean | string;
}
