import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { AuthContext } from "../src/context/AuthContext";
import { ProtectedRoute } from "../src/routes/RouteGuards";
import type { AuthUser } from "../src/types/auth";

const ana: AuthUser = {
  id: "1",
  name: "Ana Novak",
  firstName: "Ana",
  initials: "AN",
  email: "ana.novak@workit.si",
  roleId: "employee",
  roleLabel: "Zaposleni",
  jobTitle: "Zaposleni",
};

function renderProjects(user: AuthUser | null) {
  const auth = { user, loading: false, login: async () => {}, register: async () => {}, logout: () => {}, profileImage: undefined, setProfileImage: () => {} };
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={["/projects"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/projects" element={<p>Projekti</p>} />
          </Route>
          <Route path="/login" element={<p>Prijava</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

afterEach(cleanup);

describe("ProtectedRoute", () => {
  it("neprijavljenega uporabnika preusmeri na prijavo", () => {
    renderProjects(null);
    expect(screen.getByText("Prijava")).toBeTruthy();
    expect(screen.queryByText("Projekti")).toBeNull();
  });

  it("prijavljenemu uporabniku prikaže zaščiteno stran", () => {
    renderProjects(ana);
    expect(screen.getByText("Projekti")).toBeTruthy();
  });
});
