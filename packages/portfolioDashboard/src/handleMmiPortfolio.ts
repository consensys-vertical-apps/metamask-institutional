export async function handleMmiPortfolio({
  keyringAccounts,
  identities,
  metaMetricsId,
  networks,
  getAccountDetails,
  extensionId,
}) {
  const parsedNetworks = networks.map(item => parseInt(item.chainId, 16));

  const parsedAccounts = [];

  identities.forEach(identity => {
    const isInKeyring = keyringAccounts.includes(identity.address);
    const accountDetails = isInKeyring ? getAccountDetails(identity.address) : null;

    // Check if the identity address is already in parsedAccounts to avoid duplicates
    const isAlreadyAdded = parsedAccounts.some(account => account.address === identity.address);

    if (!isAlreadyAdded) {
      if (isInKeyring && accountDetails) {
        // This is a custodial account
        parsedAccounts.push({
          address: identity.address,
          name: accountDetails.name,
          custodyType: accountDetails.custodyType,
        });
      } else {
        // For all identities, if not custodial or not in keyringAccounts
        parsedAccounts.push({
          address: identity.address,
          name: identity.name,
          custodyType: null,
        });
      }
    }
  });

  return {
    accounts: parsedAccounts,
    networks: parsedNetworks,
    metrics: {
      metaMetricsId,
      extensionId,
    },
  };
}
