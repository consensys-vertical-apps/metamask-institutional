import { mapTransactionStatus } from "./map-status";

describe("mapTransactionStatus", () => {
  it("should map created", () => {
    const result = mapTransactionStatus("created");
    expect(result).toEqual({
      finished: false,
      submitted: false,
      signed: false,
      success: false,
      displayText: "Created",
    });
  });

  it("should map signed", () => {
    const result = mapTransactionStatus("signed");
    expect(result).toEqual({
      finished: false,
      submitted: false,
      signed: true,
      success: false,
      displayText: "Signed",
    });
  });

  it("should map submitted", () => {
    const result = mapTransactionStatus("submitted");
    expect(result).toEqual({
      finished: false,
      submitted: true,
      signed: true,
      success: false,
      displayText: "Submitted",
    });
  });

  it("should map completed", () => {
    const result = mapTransactionStatus("completed");
    expect(result).toEqual({
      finished: true,
      submitted: true,
      signed: true,
      success: true,
      displayText: "Completed",
    });
  });

  it("should map mined", () => {
    const result = mapTransactionStatus("mined");
    expect(result).toEqual({
      finished: true,
      submitted: true,
      signed: true,
      success: true,
      displayText: "Mined",
    });
  });

  it("should map failed", () => {
    const result = mapTransactionStatus("failed");
    expect(result).toEqual({
      finished: true,
      submitted: true,
      signed: true,
      success: false,
      displayText: "Failed",
    });
  });

  it("should map aborted", () => {
    const result = mapTransactionStatus("aborted");
    expect(result).toEqual({
      finished: true,
      submitted: false,
      signed: false,
      success: false,
      displayText: "Aborted",
    });
  });

  it("should map rejected", () => {
    const result = mapTransactionStatus("rejected");
    expect(result).toEqual({
      finished: true,
      submitted: false,
      signed: false,
      success: false,
      displayText: "Rejected",
      reason: undefined,
    });
  });

  it("should map unknown", () => {
    const result = mapTransactionStatus("unknown");
    expect(result).toEqual({
      finished: false,
      submitted: false,
      signed: false,
      success: false,
      displayText: "Unknown",
      reason: undefined,
    });
  });
});
