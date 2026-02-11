import { FiEye, FiEyeOff, FiCalendar } from "react-icons/fi";
import React, { useState, useEffect } from "react";

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
const container = {
  background: colors.bg,
  minHeight: "100vh",
  padding: 24
};

const card = {
  background: "#fff",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  marginBottom: 16
};

const button = {
  padding: "10px 14px",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontWeight: 500
};

const primaryButton = {
  ...button,
  background: colors.primary,
  color: "#fff"
};

const dangerButton = {
  ...button,
  background: colors.danger,
  color: "#fff"
};

const ghostButton = {
  ...button,
  background: "#f4f6f6",
  color: colors.text
};

const inputStyled = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: `1px solid ${colors.border}`,
  marginBottom: 12,
  fontSize: 14
};

const input = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: `1px solid ${colors.border}`,
  marginBottom: 12,
};
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
function calcularIdade(data) {
  if (!data) return "";
  const hoje = new Date();
  const nasc = new Date(data);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}
/* ===================== APP ===================== */
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [screen, setScreen] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [busca, setBusca] = useState("");
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [prontuarios, setProntuarios] = useState({});
  const [usuarios, setUsuarios] = useState([
  { email: "admin@email.com", password: "123456", name: "Administrador" }
]);
  const hoje = "2026-02-10";
  useEffect(() => {
  const usuariosSalvos = localStorage.getItem("usuarios");
  const userSalvo = localStorage.getItem("currentUser");
  if (usuariosSalvos) {
    setUsuarios(JSON.parse(usuariosSalvos));
  }
  if (userSalvo) {
    setCurrentUser(JSON.parse(userSalvo));
    setScreen("menu");
  } else {
    setScreen("login");
  }
}, []);
  function layout(children) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: colors.bg }}>
        <Sidebar setScreen={setScreen} />
        <div style={{ flex: 1, padding: 24 }}>{children}</div>
      </div>
    );
  }
  function handleLogin() {
  if (!loginEmail || !loginPass) {
    alert("Informe email e senha");
    return;
  }
  const user = usuarios.find(
    u => u.email === loginEmail && u.password === loginPass
  );
  if (!user) {
    alert("Email ou senha inválidos");
    return;
  }
  setCurrentUser(user);
  localStorage.setItem("currentUser", JSON.stringify(user));
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
  if (!currentUser) {
  return (
    <div style={{ inHeight: "100vh", display: "flex",alignItems: "center",justifyContent: "center"}}>
      <h2>Carregando...</h2>
    </div>
  );
}
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
  const pacientesDoUsuario = pacientes.filter(p => p.owner === currentUser?.email)
  const consultasHoje = consultas.filter(
    c => c.owner === currentUser.email && c.data === hoje
  );
  return layout(
    <>
      <h1>Menu</h1>
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <div style={{ ...card, flex: 1 }}>
          <h3>Pacientes</h3>
          <strong style={{ fontSize: 32 }}>{pacientesDoUsuario.length}</strong>
          </div>
        <div style={{ ...card, flex: 1 }}>
          <h3>Consultas hoje</h3>
          <strong style={{ fontSize: 32 }}>{consultasHoje.length}</strong>
        </div>
        </div>
        <div style={card}>
        <h3>Ações rápidas</h3>
        <div style={listActions}>
          <button style={btnPrimary} onClick={() => setScreen("novoAgendamento")}>Novo agendamento</button>
          <button style={btnGhost} onClick={() => setScreen("novoAtendimento")}>Novo atendimento</button>
          <button style={btnGhost} onClick={() => setScreen("novoPaciente")}>Novo paciente</button>
        </div>
        </div>
      <div style={card}>
        <button style={btnGhost} onClick={() => setScreen("novoUsuario")}>Cadastrar usuário</button>
        <button style={{ ...btnDanger, marginLeft: 12 }} onClick={() => {localStorage.removeItem("currentUser");setCurrentUser(null);setScreen("login");}}>Logout</button>
      </div>
    </>
  );
    /* ================= PACIENTES ================= */
    case "pacientes":
  return layout(
    <>
      <div style={pageHeader}>
        <button style={btnGhost} onClick={() => setScreen("menu")}>← Voltar</button>
        <input
          style={inputStyled}
          placeholder="Buscar paciente"
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {pacientes
       .filter(p => p.owner === currentUser?.email)
        .filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()))
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .map(p => (
          <div key={p.id} style={card}>
            <strong>{p.nome}</strong>

            <div style={listActions}>
              <button style={btnGhost} onClick={() => { setPacienteSelecionado(p); setScreen("dadosPaciente"); }}>Dados</button>
              <button style={btnGhost} onClick={() => { setPacienteSelecionado(p); setScreen("editarPaciente"); }}>Editar</button>
              <button style={btnPrimary} onClick={() => { setPacienteSelecionado(p); setScreen("prontuario"); }}>Prontuário</button>
              <button style={btnDanger}onClick={() => {
                if (!window.confirm("Deseja remover este paciente?")) return;
                  setPacientes(prev => prev.filter(x => x.id !== p.id));
                }}>Remover</button>
            </div>
          </div>
        ))}
    </>
  );
    /* ================= AGENDA ================= */
    case "agenda":
  return layout(
    <>
      <div style={pageHeader}>
        <button style={btnGhost} onClick={() => setScreen("menu")}>← Voltar</button>
        <h2><FiCalendar /> Agenda</h2>
      </div>
      <button style={btnPrimary} onClick={() => setScreen("novoAgendamento")}>Novo agendamento</button>
      {consultas
      .filter(c => c.owner === currentUser?.email)
        .sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`))
        .map(c => (
          <div key={c.id} style={card}>
            <strong>{c.paciente}</strong> – {c.data} {c.hora}
            <Status status={c.status} />
            {c.status === "agendado" && (
              <button style={{ ...btnDanger, marginLeft: 12 }}onClick={() => cancelarConsulta(c.id)}>Cancelar</button>
            )}
          </div>
        ))}
    </>
  );
  case "novoAtendimento":
  return layout(
    <>
      <h2>Novo atendimento</h2>
      <div style={card}>
        <select style={inputStyled} onChange={e => setPacienteSelecionado(e.target.value)}>
          <option value="">Selecione o paciente</option>
          {pacientes
           .filter(p => p.owner === currentUser?.email)
            .map(p => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
        </select>
        <textarea id="texto"placeholder="Escreva o atendimento..."style={{ ...inputStyled, height: 160 }}/>
        <button style={btnPrimary} onClick={() => {
          const texto = document.getElementById("texto").value;
          if (!texto) return alert("Texto obrigatório");
          setProntuarios(prev => ({
            ...prev,
            [`${currentUser.email}_${pacienteSelecionado}`]: [
              ...(prev[`${currentUser.email}_${pacienteSelecionado}`] || []),
              { data: new Date().toISOString(), texto }
            ]}));
          setScreen("prontuario");
        }}>Salvar atendimento
        </button>
      </div>
    </>
  );
  case "novoPaciente":
case "editarPaciente":
  return layout(
    <>
      <h2>{screen === "novoPaciente" ? "Novo paciente" : "Editar paciente"}</h2>
      <div style={card}>
        <input style={inputStyled} id="nome" placeholder="Nome" defaultValue={pacienteSelecionado?.nome || ""} />
        <input style={inputStyled} id="cpf" placeholder="CPF" defaultValue={pacienteSelecionado?.cpf || ""} />
        <input style={inputStyled} type="date"id="nasc"onChange={e => document.getElementById("idade").value = calcularIdade(e.target.value)}/>
        <input style={inputStyled} id="idade" placeholder="Idade" disabled />
        <select style={inputStyled} id="pagamento">
          <option>PIX</option>
          <option>Cartão</option>
          <option>Boleto</option>
        </select>
        <button style={btnPrimary} onClick={() => {
          const novo = {
            id: pacienteSelecionado?.id || Date.now(),
            nome: document.getElementById("nome").value,
            cpf: document.getElementById("cpf").value,
            pagamento: document.getElementById("pagamento").value,
            owner: currentUser.email
          };
          setPacientes(prev =>
            screen === "novoPaciente"
              ? [...prev, novo]
              : prev.map(p => p.id === novo.id ? novo : p)
          );
          setScreen("pacientes");
        }}>Salvar</button>
      </div>
    </>
  );
  case "prontuario":
  if (!pacienteSelecionado) return null;

  const chave = `${currentUser.email}_${pacienteSelecionado.id}`;
  const lista = prontuarios[chave] || [];

  return layout(
    <>
      <h2>Prontuário – {pacienteSelecionado.nome}</h2>

      {lista.length === 0 && (
        <div style={card}>
          <p style={{ color: "#777" }}>Nenhum atendimento registrado.</p>
        </div>
      )}

      {lista
        .sort((a, b) => new Date(a.data) - new Date(b.data))
        .map((item, index) => (
          <div key={index} style={card}>
            <strong>
              {new Date(item.data).toLocaleDateString()}
            </strong>
            <p style={{ marginTop: 8 }}>{item.texto}</p>
          </div>
        ))}

      {/* AÇÕES FINAIS */}
      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button
          style={btnGhost}
          onClick={() => setScreen("novoAtendimento")}
        >
          Editar
        </button>

        <button style={btnDanger}onClick={() => {
           if (!window.confirm("Tem certeza que deseja apagar TODO o prontuário deste paciente?"))
              return;
            setProntuarios(prev => ({
              ...prev,
              [chave]: []
            }));
          }}>Limpar prontuário</button>
      </div>
      <br />
      <button style={btnGhost} onClick={() => setScreen("pacientes")}>← Voltar</button>
    </>
  );
  case "dadosPaciente":
  if (!pacienteSelecionado) return null;
  return layout(
    <>
      <h2>Dados do paciente</h2>
      <div style={card}>
        <p><strong>Nome:</strong> {pacienteSelecionado.nome}</p>
        <p><strong>CPF:</strong> {pacienteSelecionado.cpf}</p>
        <p><strong>Forma de pagamento:</strong>{" "}{pacienteSelecionado.pagamento}</p>
        </div>
      <button style={btnGhost} onClick={() => setScreen("pacientes")}>← Voltar</button>
    </>
  );
  case "novoUsuario":
  return layout(
    <>
      <h2>Novo usuário</h2>
      <div style={card}>
        <input style={inputStyled} id="nomeUsuario"placeholder="Nome"/>
        <input style={inputStyled} id="emailUsuario"placeholder="Email"/>
        <input style={inputStyled} id="senhaUsuario"type="password"placeholder="Senha"/>
        <button style={btnPrimary}onClick={() => {
            const nome = document.getElementById("nomeUsuario").value;
            const email = document.getElementById("emailUsuario").value;
            const senha = document.getElementById("senhaUsuario").value;
            if (!nome || !email || !senha) {
              alert("Preencha todos os campos");
              return;
            }
            if (usuarios.find(u => u.email === email)) {
              alert("Já existe um usuário com esse email");
              return;
            }
            const novosUsuarios = [
              ...usuarios,
              { name: nome, email, password: senha }
            ];
            setUsuarios(novosUsuarios);
            localStorage.setItem(
              "usuarios",
              JSON.stringify(novosUsuarios)
            );
            alert("Usuário cadastrado com sucesso!");
            setScreen("menu");
          }}>Salvar usuário</button>
      </div>
      <button style={btnGhost} onClick={() => setScreen("menu")}>← Voltar</button>
    </>
  );
    default:
      return <div>Tela em construção</div>;
  }
}