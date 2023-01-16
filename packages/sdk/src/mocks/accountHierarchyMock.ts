import { AccountHierarchyNode } from "../classes/AccountHierarchyNode";

export const getMockAccountHierarchy = (): AccountHierarchyNode => {
  const rootNode = new AccountHierarchyNode("root", "0", "root-name", null);
  rootNode.children = (() => {
    return [
      (() => {
        const achn1 = new AccountHierarchyNode(
          "first",
          "1",
          "first-name-1",
          rootNode
        );
        achn1.children = (() => {
          return [
            (() => {
              const achn11 = new AccountHierarchyNode(
                "second",
                "11",
                "second-name-1-1",
                achn1
              );
              achn11.account = {
                address: "0x11",
                name: "second-name-1-1-account",
                custodianDetails: {},
                labels: [],
                balance: "0",
              };
              return achn11;
            })(),
            (() => {
              const achn12 = new AccountHierarchyNode(
                "second",
                "12",
                "second-name-1-2",
                achn1
              );
              achn12.account = {
                address: "0x12",
                name: "second-name-1-2-account",
                custodianDetails: {},
                labels: [],
                balance: "1",
              };
              return achn12;
            })(),
          ];
        })();
        return achn1;
      })(),
      (() => {
        const achn2 = new AccountHierarchyNode(
          "first",
          "2",
          "first-name-2",
          rootNode
        );
        achn2.children = (() => {
          return [
            (() => {
              const achn21 = new AccountHierarchyNode(
                "second",
                "21",
                "second-name-2-1",
                achn2
              );
              achn21.children = (() => {
                return [
                  (() => {
                    const achn211 = new AccountHierarchyNode(
                      "third",
                      "211",
                      "second-name-2-1-1",
                      achn21
                    );
                    achn211.account = {
                      address: "0x211",
                      name: "third-name-2-1-1-account",
                      custodianDetails: {},
                      labels: [],
                      balance: "2",
                    };
                    return achn211;
                  })(),
                ];
              })();
              return achn21;
            })(),
          ];
        })();
        return achn2;
      })(),
    ];
  })();
  return rootNode;
};

export const getAccountHierarchySerializedMock = {
  type: "root",
  name: "Root account node",
  id: null,
  children: [
    {
      type: "organization",
      name: "Trial-Metamask",
      id: "1a1ab272-928e-4479-b9b0-d7e9df724868",
      children: [
        {
          type: "wallet",
          name: "My wallet 2",
          id: "35e08c2d-4d42-487c-a18f-2dd1b898ab50",
          children: [
            {
              type: "ethereum-account",
              name: "Default wallet address",
              id: "701211a7-2dc2-4945-82a8-000372e1956e",
              children: [],
              account: {
                address: "0x5a2498A4c7893A50b56B07c87f1F6Ab64f578F23",
                name: "Default wallet address",
                custodianDetails: {
                  wallet_address_id: "701211a7-2dc2-4945-82a8-000372e1956e",
                  wallet_id: "35e08c2d-4d42-487c-a18f-2dd1b898ab50",
                  organization_id: "1a1ab272-928e-4479-b9b0-d7e9df724868",
                },
                balance: "5479685000000000000",
                labels: [
                  {
                    key: "organization_name",
                    value: "Trial-Metamask",
                  },
                  {
                    key: "wallet_name",
                    value: "My wallet 2",
                  },
                  {
                    key: "network_name",
                    value: "Ropsten",
                  },
                ],
                chainId: 3,
              },
            },
            {
              type: "ethereum-account",
              name: "Wallet address 2",
              id: "91804480-f3b4-4bf3-a890-743d0ae06879",
              children: [],
              account: {
                address: "0xADBe722a8f96feB2C4CC180c283A0e5988200387",
                name: "Wallet address 2",
                custodianDetails: {
                  wallet_address_id: "91804480-f3b4-4bf3-a890-743d0ae06879",
                  wallet_id: "35e08c2d-4d42-487c-a18f-2dd1b898ab50",
                  organization_id: "1a1ab272-928e-4479-b9b0-d7e9df724868",
                },
                balance: "0",
                labels: [
                  {
                    key: "organization_name",
                    value: "Trial-Metamask",
                  },
                  {
                    key: "wallet_name",
                    value: "My wallet 2",
                  },
                  {
                    key: "network_name",
                    value: "Ropsten",
                  },
                ],
                chainId: 3,
              },
            },
          ],
        },
        {
          type: "wallet",
          name: "My wallet",
          id: "4369c149-3f63-44f5-8905-9b58c54bb9cd",
          children: [
            {
              type: "ethereum-account",
              name: "Default wallet address",
              id: "701211a7-2dc2-4945-82a8-000372e1956e",
              children: [],
              account: {
                address: "0x5a2498A4c7893A50b56B07c87f1F6Ab64f578F23",
                name: "Default wallet address",
                custodianDetails: {
                  wallet_address_id: "701211a7-2dc2-4945-82a8-000372e1956e",
                  wallet_id: "4369c149-3f63-44f5-8905-9b58c54bb9cd",
                  organization_id: "1a1ab272-928e-4479-b9b0-d7e9df724868",
                },
                balance: "5479685000000000000",
                labels: [
                  {
                    key: "organization_name",
                    value: "Trial-Metamask",
                  },
                  {
                    key: "wallet_name",
                    value: "My wallet",
                  },
                  {
                    key: "network_name",
                    value: "Ropsten",
                  },
                ],
                chainId: 3,
              },
            },
            {
              type: "ethereum-account",
              name: "Wallet address 2",
              id: "91804480-f3b4-4bf3-a890-743d0ae06879",
              children: [],
              account: {
                address: "0xADBe722a8f96feB2C4CC180c283A0e5988200387",
                name: "Wallet address 2",
                custodianDetails: {
                  wallet_address_id: "91804480-f3b4-4bf3-a890-743d0ae06879",
                  wallet_id: "4369c149-3f63-44f5-8905-9b58c54bb9cd",
                  organization_id: "1a1ab272-928e-4479-b9b0-d7e9df724868",
                },
                balance: "0",
                labels: [
                  {
                    key: "organization_name",
                    value: "Trial-Metamask",
                  },
                  {
                    key: "wallet_name",
                    value: "My wallet",
                  },
                  {
                    key: "network_name",
                    value: "Ropsten",
                  },
                ],
                chainId: 3,
              },
            },
          ],
        },
      ],
    },
  ],
};
