// Migrations must start at version 1 or later.
// They are objects with a `version` number
// and a `migrate` function.
import m001 from "./001";
import m002 from "./002";

export const migrations = [m001, m002];
