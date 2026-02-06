import React, { useState, useEffect } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

/* ===================== ESTILO ===================== */
const colors = {
  bg: "#f2f5f4",
  primary: "#1aa39a",
  border: "#e2e8e7",
  text: "#243333",
  subtext: "#6b7c7c",
  danger: "#c0392b",
};

const input = {
  width: "100%",
  padding: 14,
  fontSize: 15,
  borderRadius: 10,
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
    <button style={{ ...ghostBtn, marginBottom: 16 }} onClick={() => setScreen("menu")}>
      ← Voltar ao Menu
    </button>
  );
}

function recordKey(professionalId, patientId) {
  return `${professionalId}_${patientId}`;
}

async function buscarCEP(cep, setData) {
  if (cep.length !== 8) return;

  const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  const data = await res.json();

  if (data.erro) return alert("CEP inválido");

  setData(prev => ({
    ...prev,
    address: data.logradouro,
    neighborhood: data.bairro,
    city: data.localidade,
    state: data.uf
  }));
}

function calcularIdade(data) {
  if (!data) return "";
  const hoje = new Date();
  const nasc = new Date(data);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

function formatarDataBR(dataISO) {
  if (!dataISO) return "";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

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
        textAlign: "left"
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ width: 220, background: "#fff", borderRight: `1px solid ${colors.border}`, padding: 16 }}>
      <h3>Prontuário</h3>
      <Item id="menu" label="Menu" />
      <Item id="pacientes" label="Pacientes" />
      <Item id="agenda" label="Agenda" />
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${colors.border}`, padding: 20 }}>
      {title && <h2>{title}</h2>}
      {children}
    </div>
  );
}

/* ===================== APP ===================== */
export default function App() {
  const [screen, setScreen] = useState("login");

  function renderScreen() {
    switch (screen) {

      /* ================= LOGIN ================= */
      case "login":
        return (
          <div className="center">
            <h2>Login</h2>
            <input placeholder="Email" />
            <input placeholder="Senha" type="password" />
            <button onClick={()=>setScreen("menu")}>Entrar</button>
            <button onClick={()=>setScreen("esqueciSenha")}>
              Esqueci a senha
            </button>
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
            <input placeholder="Buscar paciente" />
            <div>Lista alfabética de pacientes</div>
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

  return renderScreen();
}