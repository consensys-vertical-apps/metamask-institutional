import { IEthereumAccountCustodianDetails } from "../interfaces/IEthereumAccountCustodianDetails";
import { IEthereumAccount } from "../interfaces/IEthereumAccount";

export class AccountHierarchyNode {
  type: string;
  name?: string;
  id?: string;
  children: AccountHierarchyNode[];
  account?: IEthereumAccount<IEthereumAccountCustodianDetails>;
  parent: AccountHierarchyNode;

  constructor(
    type: string,
    id: string,
    name: string,
    parent: AccountHierarchyNode = null
  ) {
    this.type = type;
    this.name = name;
    this.id = id;
    this.parent = parent;
    this.children = [];
  }

  // Remove parents, so this is not a circular structure. Allow chaining
  serialize(): AccountHierarchyNode {
    this.removeParents();
    return this;
  }

  // Recursively traverse depth first removing parents
  removeParents(): void {
    this.parent = undefined;
    if (this.children.length) {
      this.children.forEach((child) => child.removeParents());
    }
  }

  // Recursively traverse tree depth first looking for an ID, and return that node
  findItemWithId(id: string): AccountHierarchyNode {
    if (this.id === id) {
      return this;
    } else {
      for (const child of this.children) {
        const found = child.findItemWithId(id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  // Recursively traverse depth first looking for ethereum accounts, and ultimately return an array of them
  getEthereumAccounts(
    stack: IEthereumAccount<IEthereumAccountCustodianDetails>[] = []
  ): IEthereumAccount<IEthereumAccountCustodianDetails>[] {
    if (this.account) {
      stack.push(this.account);
    }
    for (const child of this.children) {
      child.getEthereumAccounts(stack);
    }
    return stack;
  }
}

export const ROOT = "root";
export const ROOT_NAME = "Root account node";
export const ORGANIZATION = "organization";
export const WALLET = "wallet";
export const ETHEREUM_ACCOUNT = "ethereum-account";
