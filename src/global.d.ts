declare interface IHelpers {
  rebuildObject: (
    value:
      | Ref<{ [key: string]: any }[]>
      | { [key: string]: any }[]
      | { [key: string]: any }
  ) =>
    | Ref<{ [key: string]: any }[]>
    | { [key: string]: any }[]
    | { [key: string]: any };
  isNullOrUndefined: (value: string | null | undefined) => boolean;
}
