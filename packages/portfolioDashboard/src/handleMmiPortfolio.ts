import { setDashboardCookie } from "./utils";

export async function handleMmiPortfolio({
  keyringAccounts,
  identities,
  metaMetricsId,
  networks,
  cookieSetUrls,
  getAccountDetails,
  extensionId,
}) {
  networks.forEach(item => parseInt(item.chainId, 16));
  const accounts = keyringAccounts.map(address => {
    const accountDetails = getAccountDetails(address);

    if (accountDetails) {
      // This is a custodial account
      return {
        address,
        name: accountDetails.name,
        custodyType: accountDetails.custodyType,
      };
    }

    const name = identities[address]?.name || null;

    // This is an HD or hardware account. We should be able to get the name from the preferences controller store, but I have no idea how (@shane-t)
    return { address, name, custodyType: null };
  });

  const mmiDashboardData = {
    accounts,
    networks,
    metrics: {
      metaMetricsId,
      extensionId,
    },
  };

  await setDashboardCookie(mmiDashboardData, cookieSetUrls);
}
