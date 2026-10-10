import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = {
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  verifyOtp: vi.fn(),
  updateUser: vi.fn(),
};
const config = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth }),
}));
vi.mock("@/lib/supabase/config", () => ({
  getSupabaseConfig: () => config(),
}));

const {
  requestPasswordReset,
  signIn,
  signOut,
  updatePassword,
  verifyEmailToken,
} = await import("@/modules/auth/auth.service");

const credentials = { email: "user@example.test", password: "secret" };
const providerError = (status: number, code?: string) => ({
  error: { status, code, message: "provider detail that must not leak" },
});

beforeEach(() => {
  vi.resetAllMocks();
  config.mockReturnValue({
    url: "http://127.0.0.1:54321",
    publishableKey: "k",
  });
  auth.signOut.mockResolvedValue({ error: null });
});

describe("signIn", () => {
  it("succeeds when the provider accepts the credentials", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: null });

    expect(await signIn(credentials)).toEqual({ ok: true });
    expect(auth.signInWithPassword).toHaveBeenCalledWith(credentials);
  });

  it.each([
    ["wrong password or unknown email", 400, "invalid_credentials"],
    ["unconfirmed email", 400, "email_not_confirmed"],
    ["banned user", 400, "user_banned"],
    ["unknown 4xx", 422, undefined],
  ])("reports %s as invalid credentials", async (_label, status, code) => {
    auth.signInWithPassword.mockResolvedValue(providerError(status, code));

    expect(await signIn(credentials)).toEqual({
      ok: false,
      reason: "invalid_credentials",
    });
  });

  it("reports rate limiting", async () => {
    auth.signInWithPassword.mockResolvedValue(
      providerError(429, "over_request_rate_limit"),
    );

    expect(await signIn(credentials)).toEqual({
      ok: false,
      reason: "rate_limited",
    });
  });

  it.each([500, 503, undefined])(
    "reports status %s as unavailable",
    async (status) => {
      auth.signInWithPassword.mockResolvedValue({
        error: { status, message: "fetch failed" },
      });

      expect(await signIn(credentials)).toEqual({
        ok: false,
        reason: "unavailable",
      });
    },
  );

  it("does not call the provider when Supabase is not configured", async () => {
    config.mockReturnValue(null);

    expect(await signIn(credentials)).toEqual({
      ok: false,
      reason: "not_configured",
    });
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
  });
});

describe("requestPasswordReset", () => {
  it("answers the same for a known and an unknown address", async () => {
    auth.resetPasswordForEmail.mockResolvedValueOnce({ error: null });
    auth.resetPasswordForEmail.mockResolvedValueOnce(
      providerError(400, "user_not_found"),
    );

    expect(await requestPasswordReset("known@example.test")).toEqual({
      ok: true,
    });
    expect(await requestPasswordReset("unknown@example.test")).toEqual({
      ok: true,
    });
  });

  it("reports rate limiting and outages", async () => {
    auth.resetPasswordForEmail.mockResolvedValueOnce(
      providerError(429, "over_email_send_rate_limit"),
    );
    auth.resetPasswordForEmail.mockResolvedValueOnce(providerError(500));

    expect(await requestPasswordReset("a@example.test")).toEqual({
      ok: false,
      reason: "rate_limited",
    });
    expect(await requestPasswordReset("a@example.test")).toEqual({
      ok: false,
      reason: "unavailable",
    });
  });
});

describe("verifyEmailToken", () => {
  it("passes the token hash and type to the provider", async () => {
    auth.verifyOtp.mockResolvedValue({ error: null });

    expect(
      await verifyEmailToken({ tokenHash: "abc", type: "recovery" }),
    ).toEqual({ ok: true });
    expect(auth.verifyOtp).toHaveBeenCalledWith({
      type: "recovery",
      token_hash: "abc",
    });
  });

  it("fails for an expired or used token", async () => {
    auth.verifyOtp.mockResolvedValue(providerError(403, "otp_expired"));

    expect(
      (await verifyEmailToken({ tokenHash: "abc", type: "recovery" })).ok,
    ).toBe(false);
  });
});

describe("updatePassword", () => {
  it("ends the user's other sessions after a successful change", async () => {
    auth.updateUser.mockResolvedValue({ error: null });

    expect(await updatePassword("a-new-long-password")).toEqual({ ok: true });
    expect(auth.updateUser).toHaveBeenCalledWith({
      password: "a-new-long-password",
    });
    expect(auth.signOut).toHaveBeenCalledWith({ scope: "others" });
  });

  it.each([
    ["weak_password", "weak_password"],
    ["same_password", "same_password"],
    ["reauthentication_needed", "reauthentication_needed"],
    ["session_not_found", "reauthentication_needed"],
    ["something_else", "unavailable"],
  ])("maps %s to %s and keeps other sessions", async (code, reason) => {
    auth.updateUser.mockResolvedValue(providerError(422, code));

    expect(await updatePassword("a-new-long-password")).toEqual({
      ok: false,
      reason,
    });
    expect(auth.signOut).not.toHaveBeenCalled();
  });
});

describe("signOut", () => {
  it("ends only the current session", async () => {
    await signOut();

    expect(auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
});
