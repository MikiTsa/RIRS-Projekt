import bcrypt from "bcrypt";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), create: vi.fn() },
  dailyTodo: { findFirst: vi.fn(), update: vi.fn() },
}));
vi.mock("../src/db.js", () => ({ prisma }));

const { app } = await import("../src/app.js");
const { createToken } = await import("../src/auth.js");

const luka = {
  id: 7,
  name: "Luka Kovač",
  email: "luka.kovac@workit.si",
  role: "PROJECT_MANAGER",
  passwordHash: bcrypt.hashSync("geslo123", 4),
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("GET /api/health", () => {
  it("vrne status ok", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

describe("POST /api/auth/register", () => {
  it("zavrne registracijo brez imena", async () => {
    const response = await request(app).post("/api/auth/register").send({ email: "ana@workit.si", password: "geslo1234" });
    expect(response.status).toBe(400);
  });

  it("zavrne geslo, krajše od 8 znakov", async () => {
    const response = await request(app).post("/api/auth/register").send({ name: "Ana", email: "ana@workit.si", password: "kratko" });
    expect(response.status).toBe(400);
  });

  it("zavrne že uporabljen e-naslov", async () => {
    prisma.user.findUnique.mockResolvedValue(luka);
    const response = await request(app).post("/api/auth/register").send({ name: "Luka", email: "luka.kovac@workit.si", password: "geslo1234" });
    expect(response.status).toBe(409);
  });

  it("ustvari zaposlenega z normaliziranim e-naslovom", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(async ({ data }) => ({ id: 9, ...data }));
    const response = await request(app).post("/api/auth/register").send({ name: " Nova Oseba ", email: " NOVA@WorkIT.si ", password: "geslo1234", role: "ADMIN" });
    expect(response.status).toBe(201);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({ email: "nova@workit.si", roleId: "employee" });
    expect(prisma.user.create.mock.calls[0][0].data).toMatchObject({ name: "Nova Oseba", email: "nova@workit.si", role: "EMPLOYEE" });
  });
});

describe("POST /api/auth/login", () => {
  it("zavrne napačno geslo", async () => {
    prisma.user.findUnique.mockResolvedValue(luka);
    const response = await request(app).post("/api/auth/login").send({ email: "luka.kovac@workit.si", password: "napacno" });
    expect(response.status).toBe(401);
    expect(response.body.token).toBeUndefined();
  });

  it("zavrne neznan e-naslov", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const response = await request(app).post("/api/auth/login").send({ email: "nihce@workit.si", password: "geslo123" });
    expect(response.status).toBe(401);
  });

  it("ob pravilnih podatkih vrne žeton in uporabnika", async () => {
    prisma.user.findUnique.mockResolvedValue(luka);
    const response = await request(app).post("/api/auth/login").send({ email: "LUKA.KOVAC@workit.si", password: "geslo123" });
    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({ name: "Luka Kovač", roleId: "project-manager" });
  });
});

describe("zaščitene končne točke", () => {
  it("/api/auth/me brez žetona vrne 401", async () => {
    const response = await request(app).get("/api/auth/me");
    expect(response.status).toBe(401);
  });

  it("/api/auth/me z neveljavnim žetonom vrne 401", async () => {
    const response = await request(app).get("/api/auth/me").set("Authorization", "Bearer neveljaven");
    expect(response.status).toBe(401);
  });

  it("/api/auth/me z veljavnim žetonom vrne uporabnika", async () => {
    prisma.user.findUnique.mockResolvedValue(luka);
    const token = createToken({ id: 7, role: "PROJECT_MANAGER" });
    const response = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe("luka.kovac@workit.si");
  });

  it("/api/bootstrap brez žetona vrne 401", async () => {
    const response = await request(app).get("/api/bootstrap");
    expect(response.status).toBe(401);
  });

  it("tuje dnevne obveznosti ni mogoče spremeniti", async () => {
    prisma.dailyTodo.findFirst.mockResolvedValue(null);
    const token = createToken({ id: 3, role: "EMPLOYEE" });
    const response = await request(app).patch("/api/daily-todos/5").set("Authorization", `Bearer ${token}`).send({ completed: true });
    expect(response.status).toBe(404);
    expect(prisma.dailyTodo.findFirst).toHaveBeenCalledWith({ where: { id: 5, userId: 3 } });
    expect(prisma.dailyTodo.update).not.toHaveBeenCalled();
  });
});
