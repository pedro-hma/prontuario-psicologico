import React, { useState } from "react";
import { FiEye, FiEyeOff, FiCalendar } from "react-icons/fi";

/* ===================== ESTILO ===================== */
const colors = {
  bg: "#f2f5f4",
  primary: "#1aa39a",
  border: "#e2e8e7",
  text: "#243333",
  danger: "#c0392b",
  warning: "#f1c40f",
  success: "#2ecc71",
};

const input = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: `1px solid ${colors.border}`,
  marginBottom: 12,
};

/* ===================== DADOS MOCK ===================== */
const users = [{ email: "admin@email.com", password: "123456", name: "Admin" }];

const pacientesMock = [
  { id: 1, nome: "Ana Paula" },
  { id: 2, nome: "Bruno Silva" },
  { id: 3, nome: "Carlos Eduardo" },
];

const consultasMock = [
  {
    id: 1,
    paciente: "Ana Paula",
    data: "2026-02-10",
    hora: "14:00",
    status: "agendado",
  },
  {
    id: 2,
    paciente: "Bruno Silva",
    data: "2026-02-10",
    hora: "16:00",
    status: "realizado",
  },
];

/* ===================== COMPONENTES ===================== */
function Sidebar({ setScreen }) {
  return (
    <div style={{ width: 220, background: "#fff", padding: 16 }}>
      <h3>Prontuário</h3>
      <button onClick={() => setScreen("menu")}>Menu</button>
      <button onClick={() => setScreen("pacientes")}>Pacientes</button>
      <button onClick={() => setScreen("agenda")}>Agenda</button>
    </div>
  );
}

function Status({ status }) {
  const map = {
    agendado: colors.warning,
    realizado: colors.success,
    cancelado: colors.danger,
  };

  return (
    <span
      style={{
        background: map[status],
        color: "#fff",
        padding: "4px 8px",
        borderRadius: 6,
        fontSize: 12,
      }}
    >
      {status}
    </span>
  );
}

/* ===================== APP ===================== */
export default function App() {
  const [screen, setScreen] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pacientes, setPacientes] = useState(pacientesMock);
  const [consultas, setConsultas] = useState(consultasMock);
  const [busca, setBusca] = useState("");

  const hoje = "2026-02-10";

  function layout(children) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: colors.bg }}>
        <Sidebar setScreen={setScreen} />
        <div style={{ flex: 1, padding: 24 }}>{children}</div>
      </div>
    );
  }

  function handleLogin() {
    const ok = users.find(
      (u) => u.email === loginEmail && u.password === loginPass
    );
    if (!ok) return alert("Login inválido");
    setScreen("menu");
  }

  function cancelarConsulta(id) {
    if (!window.confirm("Deseja realmente cancelar esta consulta?")) return;
    setConsultas((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "cancelado" } : c
      )
    );
  }

  /* ===================== TELAS ===================== */
  switch (screen) {
    case "login":
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 320, background: "#fff", padding: 24 }}>
            <h2>Login</h2>
            <input style={input} placeholder="Email" onChange={(e) => setLoginEmail(e.target.value)} />
            <input
              style={input}
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              onChange={(e) => setLoginPass(e.target.value)}
            />
            <button onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
            <button onClick={handleLogin}>Entrar</button>
          </div>
        </div>
      );

    /* ================= MENU ================= */
    case "menu":
      return layout(
        <>
          <h1>Menu</h1>

          <div>
            <strong>Pacientes:</strong> {pacientes.length} <br />
            <strong>Consultas hoje:</strong>{" "}
            {consultas.filter((c) => c.data === hoje).length}
          </div>

          <h3>Ações rápidas</h3>
          <button onClick={() => setScreen("novoAgendamento")}>Novo agendamento</button>
          <button onClick={() => setScreen("novoAtendimento")}>Novo atendimento</button>
          <button onClick={() => setScreen("novoPaciente")}>Novo paciente</button>
        </>
      );

    /* ================= PACIENTES ================= */
    case "pacientes":
      return layout(
        <>
          <button onClick={() => setScreen("menu")}>← Voltar</button>
          <input
            style={input}
            placeholder="Buscar paciente"
            onChange={(e) => setBusca(e.target.value)}
          />

          {pacientes
            .filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()))
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .map((p) => (
              <div key={p.id} style={{ background: "#fff", padding: 12, marginBottom: 8 }}>
                <strong>{p.nome}</strong>
                <div>
                  <button>Dados</button>
                  <button>Editar</button>
                  <button>Prontuário</button>
                  <button
                    onClick={() =>
                      window.confirm("Remover paciente?") &&
                      setPacientes(pacientes.filter((x) => x.id !== p.id))
                    }
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
        </>
      );

    /* ================= AGENDA ================= */
    case "agenda":
      return layout(
        <>
          <button onClick={() => setScreen("menu")}>← Voltar</button>
          <h2>
            <FiCalendar /> Agenda
          </h2>
          <button onClick={() => setScreen("novoAgendamento")}>
            Novo agendamento
          </button>

          {consultas
            .sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`))
            .map((c) => (
              <div key={c.id} style={{ background: "#fff", padding: 12, marginBottom: 8 }}>
                <strong>{c.paciente}</strong> – {c.data} {c.hora}
                <Status status={c.status} />
                {c.status === "agendado" && (
                  <button onClick={() => cancelarConsulta(c.id)}>
                    Cancelar
                  </button>
                )}
              </div>
            ))}
        </>
      );

    default:
      return <div>Tela em construção</div>;
  }
}