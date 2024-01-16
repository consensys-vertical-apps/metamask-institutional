interface IMmiActionsFactoryParameters {
  log: any;
  showLoadingIndication: (string) => { type: string; value: any };
  submitRequestToBackground: any;
  displayWarning: (string) => { type: string; value: any };
  hideLoadingIndication: () => { type: string };
  forceUpdateMetamaskState: () => Promise<any>;
  showModal: (any) => { type: string; value: any };
  callBackgroundMethod: any;
}

// TODO - Check if this is used
export function mmiActionsFactory({
  log,
  showLoadingIndication,
  submitRequestToBackground,
  displayWarning,
  hideLoadingIndication,
  forceUpdateMetamaskState,
  showModal,
  callBackgroundMethod,
}: IMmiActionsFactoryParameters): any {
  const createAsyncAction = (name, params, forceUpdateMetamaskState?, loadingText?) => {
    log.debug(`background.${name}`);
    return async dispatch => {
      if (loadingText) {
        dispatch(showLoadingIndication(loadingText));
      }
      let result;
      try {
        result = await submitRequestToBackground(name, [...params]);
      } catch (error) {
        log.error(error);
        dispatch(displayWarning(error.message));
        throw error;
      }

      if (loadingText) {
        dispatch(hideLoadingIndication());
      }
      if (forceUpdateMetamaskState) {
        await forceUpdateMetamaskState(dispatch);
      }
      return result;
    };
  };

  const createAction = (name, payload) => {
    return () => {
      callBackgroundMethod(name, [payload], err => {
        if (err) {
          throw new Error(err.message);
        }
      });
    };
  };

  return {
    connectCustodyAddresses: (custodianType, custodianName, newAccounts) =>
      createAsyncAction(
        "connectCustodyAddresses",
        [custodianType, custodianName, newAccounts],
        forceUpdateMetamaskState,
        "Looking for your custodian account...",
      ),
    getCustodianAccounts: (token, envName, custody, getNonImportedAccounts) =>
      createAsyncAction(
        "getCustodianAccounts",
        [token, envName, custody, getNonImportedAccounts],
        forceUpdateMetamaskState,
        "Getting custodian accounts...",
      ),
    getCustodianAccountsByAddress: (jwt, envName, address, custody) =>
      createAsyncAction(
        "getCustodianAccountsByAddress",
        [jwt, envName, address, custody],
        forceUpdateMetamaskState,
        "Getting custodian accounts...",
      ),
    getCustodianTransactionDeepLink: (address, txId) =>
      createAsyncAction("getCustodianTransactionDeepLink", [address, txId], forceUpdateMetamaskState),
    getCustodianConfirmDeepLink: txId =>
      createAsyncAction("getCustodianConfirmDeepLink", [txId], forceUpdateMetamaskState),
    getCustodianSignMessageDeepLink: (from, custodyTxId) =>
      createAsyncAction("getCustodianSignMessageDeepLink", [from, custodyTxId], forceUpdateMetamaskState),
    getCustodianToken: custody => createAsyncAction("getCustodianToken", [custody], forceUpdateMetamaskState),
    getCustodianJWTList: custody => createAsyncAction("getCustodianJWTList", [custody], forceUpdateMetamaskState),
    setWaitForConfirmDeepLinkDialog: waitForConfirmDeepLinkDialog =>
      createAction("setWaitForConfirmDeepLinkDialog", waitForConfirmDeepLinkDialog),
    removeAddTokenConnectRequest: ({ origin, envName, token }) =>
      createAction("removeAddTokenConnectRequest", { origin, envName, token }),
    setCustodianConnectRequest: ({ token, envName, custodianType }) =>
      createAsyncAction("setCustodianConnectRequest", [{ token, envName, custodianType }]),
    getCustodianConnectRequest: () => createAsyncAction("getCustodianConnectRequest", []),
    getMmiConfiguration: () => createAsyncAction("getMmiConfiguration", []),
    getAllCustodianAccountsWithToken: (custodyType, token) =>
      createAsyncAction("getAllCustodianAccountsWithToken", [custodyType, token]),
    setCustodianNewRefreshToken: (address, newAuthDetails) =>
      createAsyncAction("setCustodianNewRefreshToken", [address, newAuthDetails]),
    showCustodyConfirmLink: ({ link, address, closeNotification, custodyId }) => {
      return async dispatch => {
        dispatch(
          showModal({
            name: "CUSTODY_CONFIRM_LINK",
            link,
            address,
            closeNotification,
            custodyId,
          }),
        );
      };
    },
    showInteractiveReplacementTokenModal: () => {
      return async dispatch => {
        dispatch(
          showModal({
            name: "INTERACTIVE_REPLACEMENT_TOKEN_MODAL",
          }),
        );
      };
    },
  };
}
