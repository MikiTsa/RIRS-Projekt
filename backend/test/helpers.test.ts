import { describe, expect, it } from "vitest";
import { Role } from "../generated/prisma/client.js";
import { durationLabel, initials, projectScope } from "../src/app.js";

describe("durationLabel", () => {
  it("brez minut vrne 0 min", () => {
    expect(durationLabel(null)).toBe("0 min");
    expect(durationLabel(0)).toBe("0 min");
  });

  it("minute oblikuje v ure in minute", () => {
    expect(durationLabel(45)).toBe("45 min");
    expect(durationLabel(120)).toBe("2 h");
    expect(durationLabel(90)).toBe("1 h 30 min");
  });
});

describe("initials", () => {
  it("vrne največ dve veliki začetnici", () => {
    expect(initials("Ana Novak")).toBe("AN");
    expect(initials("neža pirc kos")).toBe("NP");
  });
});

describe("projectScope", () => {
  it("vodja podjetja vidi vse projekte", () => {
    expect(projectScope({ id: 1, role: Role.COMPANY_MANAGER })).toEqual({});
  });

  it("zaposleni vidi le projekte, katerih član je", () => {
    expect(projectScope({ id: 3, role: Role.EMPLOYEE })).toEqual({ members: { some: { userId: 3 } } });
  });

  it("vodja projekta vidi projekte, ki jih vodi ali v katerih je član", () => {
    expect(projectScope({ id: 7, role: Role.PROJECT_MANAGER })).toEqual({
      OR: [{ managerId: 7 }, { members: { some: { userId: 7 } } }],
    });
  });
});
