const version = 2;

export default {
  version,
  migrate(keyring) {
    const newKeyring = transformKeyring(keyring);

    newKeyring.meta = {
      version,
    };

    return newKeyring;
  },
};

function transformKeyring(keyring: any) {
  return {
    ...keyring,
    accountsDetails: keyring.accountsDetails
      .filter(account => !account.envName)
      .map(({ apiUrl, ...account }) => ({
        ...account,
        envName: keyring.custodians.find(c => c.apiUrl === apiUrl)?.envName,
      })),
    selectedAddresses: keyring.selectedAddresses
      .filter(account => !account.envName)
      .map(({ apiUrl, ...account }) => ({
        ...account,
        envName: keyring.custodians.find(c => c.apiUrl === apiUrl)?.envName,
      })),
  };
}
