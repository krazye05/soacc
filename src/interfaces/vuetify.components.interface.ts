export interface TextField {
  value: string;
  error?: { status: Boolean; message: String };
}

export interface AlertDialog {
  status: boolean;
  type: "success" | "info" | "warning" | "error";
  title: string;
  text: string;
  timer: {
    status?: boolean;
    text: string;
    interval: number;
    callBack?: Function | undefined;
  };
}

export interface ConfirmationDialog {
  status: boolean;
  title?: string;
  text?: string;
  action: {
    loading?: boolean;
    continue: Function;
    cancel?: Function | undefined;
  };
}
