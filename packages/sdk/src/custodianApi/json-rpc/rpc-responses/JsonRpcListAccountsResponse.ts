interface AccountWithMetadata {
  address: string;
  name: string;
  tags: [{ name: string; value: string }];
}

export type JsonRpcListAccountsResponse = AccountWithMetadata[];
