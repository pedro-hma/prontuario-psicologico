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
  marginBottom: 14
};

const primaryBtn = {
  background: colors.primary,
  color: "#fff",
  border: "none",
  padding: "12px 18px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600
};

const ghostBtn = {
  background: "transparent",
  border: `1px solid ${colors.border}`,
  padding: "12px 18px",
  borderRadius: 10,
  cursor: "pointer"
};

/* ===================== HELPERS ===================== */
function VoltarMenu({ setScreen }) {
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
  function calcularIdade(data) {
  if (!data) return "";
  const hoje = new Date();
  const nasc = new Date(data);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}
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
  function handleLogin() {
  if (!loginEmail || !loginPass) {
    alert("Informe email e senha");
    return;
  }

  const user = users.find(
    u => u.email === loginEmail && u.password === loginPass
  );

  if (!user) {
    alert("Login inválido");
    return;
  }

  setCurrentUser(user);
  setScreen("menu");
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
        background: colors.bg
      }}
    >
      <div
        style={{
          width: 360,
          background: "#fff",
          padding: 32,
          borderRadius: 16,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
        }}
      >
        <h2 style={{ marginBottom: 6, textAlign: "center" }}>
          Prontuário Psicológico
        </h2>

        <p
          style={{
            textAlign: "center",
            color: colors.subtext,
            marginBottom: 24
          }}
        >
          Acesse sua conta
        </p>

        <input
          style={input}
          placeholder="Email"
          value={loginEmail}
          onChange={e => setLoginEmail(e.target.value)}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            marginBottom: 16
          }}
        >
          <input
            style={{
              ...input,
              border: "none",
              marginBottom: 0
            }}
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            value={loginPass}
            onChange={e => setLoginPass(e.target.value)}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              padding: 12,
              cursor: "pointer",
              color: colors.subtext
            }}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>

        <button
          style={{ ...primaryBtn, width: "100%", marginBottom: 12 }}
          onClick={handleLogin}
        >
          Entrar
        </button>

        <button
          style={{
            background: "transparent",
            border: "none",
            color: colors.primary,
            cursor: "pointer",
            width: "100%"
          }}
          onClick={() => setScreen("esqueciSenha")}
        >
          Esqueci minha senha
        </button>
      </div>
    </div>
  );
      case "esqueciSenha":
        return (
          <div className="center">
            <h2>Recuperar senha</h2>
            <input placeholder="Email" />
            <button onClick={()=>setScreen("login")}>Enviar</button>
          </div>
        );

    /* ================= MENU ================= */
    case "menu":
      return layout(
        <>
          <h1>Menu</h1>

            <div className="top-cards">
              <div onClick={()=>setScreen("pacientes")}>
                Pacientes
              </div>

              <div onClick={()=>setScreen("consultasHoje")}>
                Consultas do dia
              </div>
            </div>

            <button onClick={()=>setScreen("novoUsuario")}>
              Cadastrar usuário
            </button>

            <div className="actions">
              <button onClick={()=>setScreen("novoAtendimento")}>
                Novo atendimento
              </button>
              <button onClick={()=>setScreen("novoAgendamento")}>
                Novo agendamento
              </button>
              <button onClick={()=>setScreen("novoPaciente")}>
                Novo paciente
              </button>
            </div>
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
  .filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  )
  .sort((a, b) => a.nome.localeCompare(b.nome))
  .map(p => (
    <div
      key={p.id}
      style={{
        background: "#fff",
        padding: 12,
        marginBottom: 8,
        borderRadius: 8
      }}
    >
      <strong>{p.nome}</strong>

      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        {/* DADOS */}
        <button
          onClick={() => {
            setPacienteSelecionado(p);
            setScreen("dadosPaciente");
          }}
        >
          Dados
        </button>

        {/* EDITAR */}
        <button
          onClick={() => {
            setPacienteSelecionado(p);
            setScreen("editarPaciente");
          }}
        >
          Editar
        </button>

        {/* PRONTUÁRIO */}
        <button
          onClick={() => {
            setPacienteSelecionado(p);
            setScreen("prontuario");
          }}
        >
          Prontuário
        </button>

        {/* REMOVER */}
        <button
          onClick={() => {
            if (!window.confirm("Deseja remover este paciente?")) return;
            setPacientes(prev => prev.filter(x => x.id !== p.id));
          }}
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
            <button onClick={()=>setScreen("novoAgendamento")}>
              Novo agendamento
            </button>
            <div>Agenda cronológica</div>
          </>
        );

      /* ================= NOVO USUÁRIO ================= */
      case "novoUsuario":
        return layout(
          <>
            <h2>Novo usuário</h2>
            <input placeholder="Nome" />
            <input placeholder="Email" />
            <input placeholder="CEP" />
            <input placeholder="Rua" />
            <input placeholder="Bairro" />
            <input placeholder="Cidade" />
            <input placeholder="Número" />
            <input placeholder="Complemento" />
            <button onClick={()=>setScreen("menu")}>Salvar</button>
          </>
        );

      /* ================= NOVO PACIENTE ================= */
      case "novoPaciente":
        return layout(
          <>
            <h2>Novo paciente</h2>
            <input placeholder="Nome" />
            <input type="date" />
            <input placeholder="Idade (auto)" disabled />
            <select>
              <option>PIX</option>
              <option>Cartão</option>
              <option>Boleto</option>
            </select>
            <input placeholder="Nome da mãe" />
            <input placeholder="Nome do pai" />
            <input placeholder="Escola (se menor)" />
            <button>Salvar</button>
          </>
        );

      /* ================= NOVO AGENDAMENTO ================= */
      case "novoAgendamento":
        return layout(
          <>
            <select>
              <option>Paciente</option>
            </select>
            <input type="date" />
            <input type="time" />
            <button>Salvar</button>
          </>
        );

      /* ================= NOVO ATENDIMENTO ================= */
      case "novoAtendimento":
        return layout(
          <>
            <select>
              <option>Paciente</option>
            </select>
            <select>
              <option>Consulta agendada</option>
            </select>
            <textarea />
            <button>Salvar atendimento</button>
          </>
        );

      /* ================= PRONTUÁRIO ================= */
      case "prontuario":
        return layout(
          <>
            <h2>Prontuário</h2>
            <div>Histórico cronológico</div>
            <button>Editar</button>
            <button>Limpar prontuário</button>
          </>
        );

      default:
        return <div>Tela não encontrada</div>;
    }
  }
}