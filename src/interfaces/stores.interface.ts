import { IHeader } from "@/components/cDataTable.interface";
import {
  AlertDialog,
  ConfirmationDialog,
} from "./vuetify.components.interface";

export interface AuthData {
  idToken: string;
  rememberMe: boolean;
  expiresIn: number;
  refreshToken?: string;
}

export interface UserDetail {
  UID?: string;
  firstName: string;
  lastName: string;
  isDark: boolean;
  status: boolean;
  userImage: string;
}

export interface GlobalStore {
  overlay: boolean;
  initOverlay: boolean;
  initAPI: boolean;
  isLogin: boolean;
  isMobile: boolean;
  hasScroll: boolean;
  alertDialog: AlertDialog;
  confirmationDialog: ConfirmationDialog;
}

export interface bankDetailsType {
  UID?: string;
  bankImage: string;
  bankName: string;
  columnHeaders: IHeader[];
}

export interface menuListInit {
  UID?: string;
  menuIcon: string;
  menuName: string;
  headerName?: string;
  menuPath: string;
  menuOrder: number;
}

export interface MenuList extends menuListInit {
  menuLists?: Array<MenuList>;
}

export interface SoaccAssigns {
  UID?: string;
  soaccUID?: string;
  soaccTransactionUID?: string;
  transactionUID: string;
  ignore?: boolean;
  assignUsers?: string[];
}

export interface SoaccTransactions {
  soaccUID?: string;
  soaccTransactionUID?: string;
  UID?: string;
  firstDate: string;
  secondDate: string;
  description: string;
  amount: string | number;
}

export interface SoaccAccountDetails {
  SoaccUID?: string;
  UID?: string;
  header: string;
  transactions: Array<SoaccTransactions>;
}

export interface SoaccAccountDetailsObject
  extends Omit<SoaccAccountDetails, "transactions"> {
  transactions: { [key: string]: SoaccTransactions };
}

export interface Soacc {
  UID?: string;
  monthYear: { month: string; year: string };
  bankID: string;
  referenceFile: string | undefined;
  accountDetails: Array<SoaccAccountDetails>;
}

export interface SoaccObject extends Omit<Soacc, "accountDetails"> {
  accountDetails: { [key: string]: SoaccAccountDetailsObject };
}
