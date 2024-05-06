import { handleMmiPortfolio } from "./handleMmiPortfolio";

export interface Identity {
  address: string;
  name: string;
}

export interface Network {
  chainId: string;
}

const mockGetAccountDetails = jest.fn();

describe('handleMmiPortfolio', () => {
  beforeEach(() => {
    mockGetAccountDetails.mockClear();
    jest.clearAllMocks();
  });

  it('should return empty accounts and networks when inputs are empty', async () => {
    const result = await handleMmiPortfolio({
      keyringAccounts: [],
      identities: [],
      metaMetricsId: 'test-id',
      networks: [],
      getAccountDetails: mockGetAccountDetails,
      extensionId: 'ext-id',
    });

    expect(result).toEqual({
      accounts: [],
      networks: [],
      metrics: {
        metaMetricsId: 'test-id',
        extensionId: 'ext-id',
      },
    });
  });

  it('should process identities correctly', async () => {
    const result = await handleMmiPortfolio({
      keyringAccounts: ['0x123'],
      identities: [{ address: '0x123', name: 'Account 1' }],
      metaMetricsId: 'test-id',
      networks: ['0x1'],
      getAccountDetails: mockGetAccountDetails,
      extensionId: 'ext-id',
    });

    expect(result.accounts).toHaveLength(1);
    expect(result.accounts[0].name).toBe('Account 1');
  });

  it('should handle custodial accounts correctly', async () => {
    mockGetAccountDetails.mockImplementation(address => ({
      name: 'Custodial Account',
      custodyType: 'Custodial',
      address
    }));

    const result = await handleMmiPortfolio({
      keyringAccounts: ['0x123'],
      identities: [{ address: '0x123', name: 'Account 1' }],
      metaMetricsId: 'test-id',
      networks: ['0x1'],
      getAccountDetails: mockGetAccountDetails,
      extensionId: 'ext-id',
    });

    expect(result.accounts[0].custodyType).toBe('Custodial');
    expect(mockGetAccountDetails).toHaveBeenCalledWith('0x123');
  });

  it('should avoid adding duplicate accounts', async () => {
    const result = await handleMmiPortfolio({
      keyringAccounts: ['0x123', '0x123'],
      identities: [{ address: '0x123', name: 'Account 1' }, { address: '0x123', name: 'Account 1 Duplicate' }],
      metaMetricsId: 'test-id',
      networks: ['0x1'],
      getAccountDetails: mockGetAccountDetails,
      extensionId: 'ext-id',
    });

    expect(result.accounts).toHaveLength(1);
  });

  it('should handle both custodial and non-custodial accounts correctly', async () => {
    mockGetAccountDetails.mockImplementation((address: string) => {
      if (address === '0xCustodial') {
        return { name: 'Custodial Account', custodyType: 'Custodial' };
      }
      return null;
    });

    const keyringAccounts = ['0xCustodial', '0xNonCustodial'];
    const identities: Identity[] = [
      { address: '0xCustodial', name: 'Custodial Account 1' },
      { address: '0xNonCustodial', name: 'Account 2' },
    ];
    const networks: Network[] = [{ chainId: '0x1' }];
    const metaMetricsId = 'test-id';
    const extensionId = 'ext-id';

    const result = await handleMmiPortfolio({
      keyringAccounts,
      identities,
      metaMetricsId,
      networks,
      getAccountDetails: mockGetAccountDetails,
      extensionId,
    });

    // both accounts are included
    expect(result.accounts).toHaveLength(2);

    // custodial account
    expect(result.accounts).toEqual(expect.arrayContaining([
      expect.objectContaining({
        address: '0xCustodial',
        name: 'Custodial Account',
        custodyType: 'Custodial',
      }),
    ]));

    // non-custodial account
    expect(result.accounts).toEqual(expect.arrayContaining([
      expect.objectContaining({
        address: '0xNonCustodial',
        name: 'Account 2',
        custodyType: null,
      }),
    ]));

    expect(mockGetAccountDetails).toHaveBeenCalledWith('0xCustodial');
  });
});