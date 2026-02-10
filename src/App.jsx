import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

/* ===================== ESTILO ===================== */
const colors = {
  bg: "#f2f5f4",
  primary: "#1aa39a",
  border: "#e2e8e7",
  text: "#243333",
  subtext: "#6b7c7c",
};

const inputStyle = {
  width: "100%",
  padding: 14,
  fontSize: 15,
  borderRadius: 10,
  border: `1px solid ${colors.border}`,
  marginBottom: 14,
};

const primaryBtn = {
  background: colors.primary,
  color: "#fff",
  border: "none",
  padding: "12px 18px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
};

/* ===================== DADOS FAKE ===================== */
const users = [
  { email: "admin@email.com", password: "123456", name: "Admin" },
];

/* ===================== COMPONENTES ===================== */
function Sidebar({ current, setScreen }) {
  const Item = ({ id, label }) => (
    <button
      onClick={() => setScreen(id)}
      style={{
        width: "100%",
        padding: 12,
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        background: current === id ? colors.primary : "transparent",
        color: current === id ? "#fff" : colors.text,
        marginBottom: 6,
        textAlign: "left",
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        width: 220,
        background: "#fff",
        borderRight: `1px solid ${colors.border}`,
        padding: 16,
      }}
    >
      <h3>Prontuário</h3>
      <Item id="menu" label="Menu" />
      <Item id="pacientes" label="Pacientes" />
      <Item id="agenda" label="Agenda" />
    </div>
  );
}

/* ===================== APP ===================== */
export default function App() {
  const [screen, setScreen] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  function handleLogin() {
    if (!loginEmail || !loginPass) {
      alert("Informe email e senha");
      return;
    }

    const user = users.find(
      (u) => u.email === loginEmail && u.password === loginPass
    );

    if (!user) {
      alert("Login inválido");
      return;
    }

    setCurrentUser(user);
    setScreen("menu");
  }

  function layout(children) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: colors.bg }}>
        <Sidebar current={screen} setScreen={setScreen} />
        <div style={{ flex: 1, padding: 24 }}>{children}</div>
      </div>
    );
  }

  function renderScreen() {
    switch (screen) {
      /* ================= LOGIN ================= */
      case "login":
        return (
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: colors.bg,
            }}
          >
            <div
              style={{
                width: 360,
                background: "#fff",
                padding: 32,
                borderRadius: 16,
                border: `1px solid ${colors.border}`,
              }}
            >
              <h2 style={{ textAlign: "center" }}>Prontuário Psicológico</h2>

              <input
                style={inputStyle}
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />

              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  style={{ ...inputStyle, marginBottom: 0 }}
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ marginLeft: -40, cursor: "pointer" }}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>

              <button
                style={{ ...primaryBtn, width: "100%", marginTop: 16 }}
                onClick={handleLogin}
              >
                Entrar
              </button>
            </div>
          </div>
        );

      /* ================= MENU ================= */
      case "menu":
        return layout(
          <>
            <h1>Bem-vindo, {currentUser?.name}</h1>

            <button onClick={() => setScreen("pacientes")}>
              Ver pacientes
            </button>
          </>
        );

      /* ================= PACIENTES ================= */
      case "pacientes":
        return layout(
          <>
            <h2>Pacientes</h2>
            <p>Lista de pacientes (mock)</p>
            <button onClick={() => setScreen("menu")}>Voltar</button>
          </>
        );

      /* ================= AGENDA ================= */
      case "agenda":
        return layout(
          <>
            <h2>Agenda</h2>
            <p>Agenda vazia</p>
          </>
        );

      default:
        return <div>Tela não encontrada</div>;
    }
  }

  return renderScreen();
}