import {
  MenuList,
  Soacc,
  SoaccTransactions,
  SoaccAccountDetails,
  SoaccAccountDetailsObject,
  SoaccObject,
  UserDetail,
} from "@/interfaces/stores.interface";
import {
  useAuthStore,
  useGlobalStore,
  useMenuListStore,
  useSoaccDetailsStore,
  useUsersStore,
  usebankDetailsStore,
} from "@/stores";
import {
  child,
  getDatabase,
  onValue,
  push,
  ref,
  update,
} from "firebase/database";

export default () => {
  const db = getDatabase(),
    refUserDB = ref(db, "users/" + useAuthStore().UID),
    refMenuListDB = ref(db, "menuLists/"),
    refBankDetailsDB = ref(db, "bankDetails/"),
    refSoaccDB = ref(db, "soacc/"),
    refUsersDB = ref(db, "users/");

  const stores = {
    authStore: useAuthStore(),
    bankDetailsStore: usebankDetailsStore(),
    globalStore: useGlobalStore(),
    soaccDetails: useSoaccDetailsStore(),
    usersStore: useUsersStore(),
  };

  function reMapData(
    data: Array<any>,
    ...options: Array<{ [key: string]: string } | { [key: string]: string }[]>
  ) {
    return data.map(([key, value]) => {
      const returnValue: any = {
        ...{ UID: key },
        ...(value as any),
      };
      options.forEach((option) => {
        if (Array.isArray(option))
          option.forEach((e) => {
            returnValue[e.key] = e.value;
          });
        else {
          const [key, value] = Object.entries(option)[0];
          returnValue[key] = value;
        }
        // returnValue[e.key] = e.value;
      });

      return returnValue;
    });
  }
  return {
    initRealtimeDatabase: {
      loadDatabase: async () => {
        stores.globalStore.initAPI = true;
        await new Promise((resolve) => {
          onValue(refMenuListDB, (snapshot) => {
            resolve(
              useMenuListStore().init(
                reMapData(
                  Object.entries(snapshot.val() as MenuList).sort(
                    ([, a], [, b]) => +a.menuOrder - +b.menuOrder
                  )
                )
              )
            );
          });
        });

        await new Promise((resolve) => {
          onValue(refUsersDB, (snapshot) => {
            snapshot.val()
              ? resolve(
                  (stores.usersStore.users = reMapData(
                    Object.entries(snapshot.val())
                  ) as UserDetail[])
                )
              : false;
          });
        });

        await new Promise((resolve) => {
          onValue(refUserDB, (snapshot) => {
            resolve(stores.authStore.init(snapshot.val()));
          });
        });

        await new Promise((resolve) => {
          onValue(refBankDetailsDB, (snapshot) =>
            resolve(
              (stores.bankDetailsStore.bankDetails = reMapData(
                Object.entries(snapshot.val() as MenuList)
              ))
            )
          );
        });

        await new Promise((resolve) => {
          onValue(refSoaccDB, (snapshot) => {
            resolve(
              snapshot.val()
                ? (stores.soaccDetails.soaccList = reMapData(
                    Object.entries(snapshot.val() as SoaccObject)
                  ).map(
                    ({ accountDetails: TaccountDetails, ...TSoacc }: Soacc) => {
                      const SoaccUID = { soaccUID: TSoacc.UID as string };
                      const accountDetails: SoaccAccountDetails[] = reMapData(
                        Object.entries(TaccountDetails),
                        SoaccUID
                      ).map(
                        ({
                          transactions: Ttransactions,
                          ...TstatementDetails
                        }: SoaccAccountDetails) => {
                          return {
                            ...{
                              transactions: reMapData(
                                Object.entries(Ttransactions),
                                SoaccUID,
                                {
                                  soaccTransactionUID:
                                    TstatementDetails.UID as string,
                                }
                              ) as SoaccTransactions[],
                            },
                            ...TstatementDetails,
                          };
                        }
                      );
                      return { ...{ accountDetails }, ...TSoacc };
                    }
                  ) as Soacc[])
                : false
            );
          });
        });
      },
      resetStores: () => {
        stores.globalStore.initAPI = false;
        stores.authStore.init({
          firstName: "",
          lastName: "",
          isDark: true,
          status: false,
          userImage: "",
        });
      },
    },
    crud: {
      saveSoaccDetails: (TSoaccDetailsType: Soacc) => {
        return new Promise((resolve) => {
          const soacc = child(refSoaccDB, push(refSoaccDB).key || ""),
            { accountDetails: TaccountDetails, ...TSoacc } = TSoaccDetailsType;

          const accountDetails: {
            [key: string]: SoaccAccountDetailsObject;
          } = {};

          TaccountDetails.forEach((accountDetail) => {
            if (accountDetail.transactions.length > 0) {
              const statementsRef = push(child(soacc, "accountDetails"));
              const statementsRefKey: string = statementsRef.key || "";

              accountDetails[statementsRefKey] = {
                header: accountDetail.header,
                transactions: {},
              };

              accountDetail.transactions.forEach((e) => {
                const statementRef = push(child(statementsRef, "transactions"));

                accountDetails[statementsRefKey].transactions[
                  statementRef.key || ""
                ] = e;
              });
            }
          });

          resolve(update(soacc, { ...{ accountDetails }, ...TSoacc }));
        });
        // return new Promise((resolve) => {
        //   try {
        //     const keySoacc = push(child(refSoaccDB, "posts")).key,
        //       { statements, ...TSoacc } = TSoaccDetailsType;
        //       push(child(refSoaccDB, "posts"))
        //     const updates: any = {};
        //     updates[`/${refSoaccDB.key}/${keySoacc}`] = TSoacc;

        //     statements.forEach((statement) => {
        //       if (statement.statementDetails.length > 0) {
        //         const keyStatements = push(
        //           child(refSoaccStatementsDB, "posts")
        //         ).key;
        //         updates[
        //           `/${refSoaccStatementsDB.key}/${keySoacc}/${keyStatements}`
        //         ] = statement.header.value;
        //         statement.statementDetails.forEach((e) => {
        //           const keyStatementDetails = push(
        //             child(refSoaccStatementDetailsDB, "posts")
        //           ).key;
        //           updates[
        //             `/${refSoaccStatementDetailsDB.key}/${keySoacc}/${keyStatements}/${keyStatementDetails}`
        //           ] = e;
        //         });
        //       }
        //     });
        //     // refSoaccDetailsDB.child()
        //     resolve(update(ref(db), updates));
        //   } catch (e: any) {
        //     throw new Error(e);
        //   }
        // });
      },
    },
  };
};
