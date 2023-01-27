import { toChecksumHexAddress } from "./utils";

describe("#toChecksumHexAddress", () => {
  it("should call toChecksumHexAddress with an address", async () => {
    const address = toChecksumHexAddress("0x5ab19e7091dd208f352f8e727b6dcc6f8abb6275");
    expect(address).toEqual("0x5Ab19e7091dD208F352F8E727B6DCC6F8aBB6275");
  });

  it("should call toChecksumHexAddress with an empty address and return an empty string", async () => {
    const address = toChecksumHexAddress("");
    expect(address).toEqual("");
  });
});
