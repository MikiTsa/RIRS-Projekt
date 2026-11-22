import { afterEach, describe, expect, it, vi } from "vitest";
import { apiRequest, getToken, setToken } from "../src/services/api";

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({ ok: status < 400, json: async () => body });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("api", () => {
  it("shrani in odstrani prijavni žeton", () => {
    setToken("abc");
    expect(getToken()).toBe("abc");
    setToken(null);
    expect(getToken()).toBeNull();
  });

  it("prijavljenemu uporabniku pošlje žeton v glavi Authorization", async () => {
    setToken("abc");
    const fetchMock = mockFetch(200, { status: "ok" });
    await expect(apiRequest("/auth/me")).resolves.toEqual({ status: "ok" });
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/me", expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer abc" }) }));
  });

  it("brez žetona ne pošlje glave Authorization", async () => {
    const fetchMock = mockFetch(200, {});
    await apiRequest("/health");
    expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty("Authorization");
  });

  it("ob napaki vrže sporočilo strežnika", async () => {
    mockFetch(401, { message: "Prijava je potekla. Prijavite se znova." });
    await expect(apiRequest("/bootstrap")).rejects.toThrow("Prijava je potekla. Prijavite se znova.");
  });
});
