import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createEmailAccess } from "./emailAccess";

const both = "astonhotelsinternational.com,archipelagohotels.com";

describe("createEmailAccess", () => {
  it("allows Workspace accounts on any listed domain", () => {
    const { isEmailAllowed } = createEmailAccess(both, "");
    assert.equal(isEmailAllowed("Abrin.T@archipelagohotels.com", "archipelagohotels.com"), true);
    assert.equal(isEmailAllowed("x@astonhotelsinternational.com", "astonhotelsinternational.com"), true);
  });

  it("requires Google's hosted-domain claim to match the email domain", () => {
    const { isEmailAllowed } = createEmailAccess(both, "");
    assert.equal(isEmailAllowed("x@archipelagohotels.com", undefined), false);
    assert.equal(isEmailAllowed("x@archipelagohotels.com", "astonhotelsinternational.com"), false);
    assert.equal(isEmailAllowed("x@archipelagohotels.com", "ArchipelagoHotels.com"), true);
  });

  it("rejects look-alike, sub- and suffix domains", () => {
    const { isEmailAllowed } = createEmailAccess(both, "");
    for (const email of [
      "x@evilarchipelagohotels.com",
      "x@archipelagohotels.com.evil.io",
      "x@sub.archipelagohotels.com",
      "x@archipelagohotels.com@evil.io",
      "no-at-sign",
    ]) {
      assert.equal(isEmailAllowed(email, email.split("@").pop()), false, email);
    }
  });

  it("rejects non-ASCII addresses", () => {
    const { isEmailAllowed } = createEmailAccess("kok.com", "");
    assert.equal(isEmailAllowed("x@Kok.com", "kok.com"), false);
  });

  it("tolerates spaces, a leading @, quotes and a trailing dot in the setting", () => {
    const { isEmailAllowed, domains } = createEmailAccess(` "@Aston.com." , 'b.com' `, "");
    assert.deepEqual(domains, ["aston.com", "b.com"]);
    assert.equal(isEmailAllowed("x@aston.com", "aston.com"), true);
  });

  it("denies everyone when the domain setting is set but has no usable domain", () => {
    for (const setting of [",", " , ", '""']) {
      const { isEmailAllowed } = createEmailAccess(setting, "");
      assert.equal(isEmailAllowed("anyone@gmail.com", null), false, JSON.stringify(setting));
    }
  });

  it("allows everyone when no domain is configured (local development)", () => {
    for (const setting of [undefined, "", "   "]) {
      assert.equal(createEmailAccess(setting, "").isEmailAllowed("anyone@gmail.com", null), true);
    }
  });

  it("always allows ALLOWED_EMAILS exceptions, without a hosted domain", () => {
    const { isEmailAllowed } = createEmailAccess(both, " Someone@Gmail.com ,");
    assert.equal(isEmailAllowed("someone@gmail.com", null), true);
    assert.equal(isEmailAllowed("other@gmail.com", null), false);
  });
});
