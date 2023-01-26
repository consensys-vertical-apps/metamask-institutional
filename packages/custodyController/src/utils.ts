import { isHexString, addHexPrefix, toChecksumAddress } from "ethereumjs-util";

export function toChecksumHexAddress(address: string): string {
  if (!address) {
    // our internal checksumAddress function that this method replaces would
    // return an empty string for nullish input. If any direct usages of
    // ethereumjs-util.toChecksumAddress were called with nullish input it
    // would have resulted in an error on version 5.1.
    return "";
  }
  const hexPrefixed = addHexPrefix(address);
  if (!isHexString(hexPrefixed)) {
    // Version 5.1 of ethereumjs-utils would have returned '0xY' for input 'y'
    // but we shouldn't waste effort trying to change case on a clearly invalid
    // string. Instead just return the hex prefixed original string which most
    // closely mimics the original behavior.
    return hexPrefixed;
  }
  return toChecksumAddress(addHexPrefix(address));
}
