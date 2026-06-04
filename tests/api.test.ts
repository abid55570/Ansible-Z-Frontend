import { afterEach, describe, expect, it, vi } from "vitest";
import { api, ApiError } from "@/lib/api";

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("api client", () => {
  it("templates() returns the parsed list", async () => {
    global.fetch = mockFetch(200, [{ slug: "web-3tier" }]) as never;
    const result = await api.templates();
    expect(result[0].slug).toBe("web-3tier");
  });

  it("template(slug) fetches the detail", async () => {
    global.fetch = mockFetch(200, { slug: "web-3tier", variables: {} }) as never;
    const detail = await api.template("web-3tier");
    expect(detail.slug).toBe("web-3tier");
  });

  it("throws ApiError on a non-2xx response", async () => {
    global.fetch = mockFetch(401, { detail: "nope" }) as never;
    await expect(api.me()).rejects.toBeInstanceOf(ApiError);
    await expect(api.me()).rejects.toMatchObject({ status: 401 });
  });

  it("createProject POSTs with credentials and a JSON body", async () => {
    const fetchMock = mockFetch(201, { id: 1 });
    global.fetch = fetchMock as never;
    await api.createProject({ name: "p", template_slug: "web-3tier", config: {} });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/projects"),
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
  });

  it("generate() posts the env", async () => {
    const fetchMock = mockFetch(200, { id: 2, lint_status: "passed" });
    global.fetch = fetchMock as never;
    const generation = await api.generate(7, "uat");
    expect(generation.lint_status).toBe("passed");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/projects/7/generate"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("downloadUrl builds the right URL", () => {
    expect(api.downloadUrl(5, "uat")).toContain("/projects/5/download?env=uat");
  });

  it("projects() lists the user's projects", async () => {
    global.fetch = mockFetch(200, [{ id: 1, name: "p" }]) as never;
    const result = await api.projects();
    expect(result[0].id).toBe(1);
  });

  it("logout() POSTs to /auth/logout", async () => {
    const fetchMock = mockFetch(200, { status: "logged_out" });
    global.fetch = fetchMock as never;
    await api.logout();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/auth/logout"),
      expect.objectContaining({ method: "POST" }),
    );
  });
});
