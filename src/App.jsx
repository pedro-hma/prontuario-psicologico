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
  const [pacientes, setPacientes] = useState(pacientesMock);
  const [consultas, setConsultas] = useState(consultasMock);
  const [busca, setBusca] = useState("");
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [prontuarios, setProntuarios] = useState({});
  const [usuarios, setUsuarios] = useState([
  { email: "admin@email.com", password: "123456", name: "Administrador" }
]);
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
 // setCurrentUser(user);
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
            <button onClick={() => setScreen("novoUsuario")} style={{ marginTop: 12 }}>Cadastrar usuário</button>
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
        <button onClick={() => {setPacienteSelecionado(p);setScreen("dadosPaciente");}}>Dados </button>
        {/* EDITAR */}
        <button onClick={() => {setPacienteSelecionado(p);setScreen("editarPaciente");}}>Editar</button>
        {/* PRONTUÁRIO */}
        <button onClick={() => {setPacienteSelecionado(p);setScreen("prontuario");}}>Prontuário</button>
        {/* REMOVER */}
        <button onClick={() => {if (!window.confirm("Deseja remover este paciente?")) return;
            setPacientes(prev => prev.filter(x => x.id !== p.id));}}>Remover</button>
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
      case "novoAgendamento":
  return layout(
    <>
      <h2>Novo agendamento</h2>
      <select id="paciente">
        {pacientes.map(p => (
          <option key={p.id} value={p.nome}>{p.nome}</option>
        ))}
      </select>
      <input type="date" id="data" />
      <input type="time" id="hora" />
      <button onClick={() => {
        const paciente = document.getElementById("paciente").value;
        const data = document.getElementById("data").value;
        const hora = document.getElementById("hora").value;
        const conflito = consultas.find(c =>
          c.data === data &&
          c.hora === hora &&
          c.status !== "cancelado"
        );
        if (conflito) {
          alert("Já existe consulta nesse horário");
          return;
        }
        setConsultas(prev => [
          ...prev,
          {
            id: Date.now(),
            paciente,
            data,
            hora,
            status: "agendado"
          }
        ]);
        setScreen("agenda");
      }}>
        Salvar
      </button>
    </>
  );
  case "novoAtendimento":
  return layout(
    <>
      <h2>Novo atendimento</h2>
      <select onChange={e => setPacienteSelecionado(e.target.value)}>
        <option value="">Selecione o paciente</option>
        {pacientes.map(p => (
          <option key={p.id} value={p.id}>{p.nome}</option>
        ))}
      </select>
      <textarea
        id="texto"
        placeholder="Escreva o atendimento..."
        style={{ width: "100%", height: 200 }}
      />
      <button onClick={() => {
        const texto = document.getElementById("texto").value;
        if (!texto) return alert("Texto obrigatório");

        setProntuarios(prev => ({
          ...prev,
          [pacienteSelecionado]: [
            ...(prev[pacienteSelecionado] || []),
            { data: new Date().toISOString(), texto }
          ]
        }));
        setScreen("prontuario");
      }}>
        Salvar atendimento
      </button>
    </>
  );
  case "novoPaciente":
case "editarPaciente":
  return layout(
    <>
      <h2>{screen === "novoPaciente" ? "Novo paciente" : "Editar paciente"}</h2>
      <input id="nome" placeholder="Nome" defaultValue={pacienteSelecionado?.nome || ""} />
      <input id="cpf" placeholder="CPF" defaultValue={pacienteSelecionado?.cpf || ""} />
      <input
        type="date"
        id="nasc"
        onChange={e =>
          document.getElementById("idade").value = calcularIdade(e.target.value)
        }
      />
      <input id="idade" placeholder="Idade" disabled />

      <select id="pagamento">
        <option>PIX</option>
        <option>Cartão</option>
        <option>Boleto</option>
      </select>

      <button onClick={() => {
        const novo = {
          id: pacienteSelecionado?.id || Date.now(),
          nome: document.getElementById("nome").value,
          cpf: document.getElementById("cpf").value,
        };

        setPacientes(prev =>
          screen === "novoPaciente"
            ? [...prev, novo]
            : prev.map(p => p.id === novo.id ? novo : p)
        );

        setScreen("pacientes");
      }}>
        Salvar
      </button>
    </>
  );
  case "prontuario":
  if (!pacienteSelecionado) return null;
  const lista = prontuarios[pacienteSelecionado.id] || [];
  return layout(
    <>
      <h2>Prontuário – {pacienteSelecionado.nome}</h2>
      {lista.length === 0 && <p>Sem registros.</p>}
      {lista
        .sort((a, b) => new Date(a.data) - new Date(b.data))
        .map((item, index) => (
          <div key={index} style={{ marginBottom: 12 }}>
            <strong>{new Date(item.data).toLocaleDateString()}</strong>
            <p>{item.texto}</p>
          </div>
        ))}
      <button
        onClick={() => {
          if (!window.confirm("Deseja limpar todo o prontuário?")) return;
          setProntuarios(prev => ({
            ...prev,
            [pacienteSelecionado.id]: []
          }));
        }}
      >Limpar prontuário</button>
      <br /><br />
      <button onClick={() => setScreen("pacientes")}> ← Voltar</button>
    </>
  );
  case "dadosPaciente":
  if (!pacienteSelecionado) return null;
  return layout(
    <>
      <h2>Dados do paciente</h2>

      <p><strong>Nome:</strong> {pacienteSelecionado.nome}</p>
      <p><strong>CPF:</strong> {pacienteSelecionado.cpf}</p>
      <p><strong>Forma de pagamento:</strong> {pacienteSelecionado.pagamento}</p>

      <button onClick={() => setScreen("pacientes")}> ← Voltar</button>
    </>
  );
  case "novoUsuario":
  return layout(
    <>
      <h2>Novo usuário</h2>
      <input id="nomeUsuario" placeholder="Nome" />
      <input id="emailUsuario" placeholder="Email" />
      <input id="senhaUsuario" type="password"placeholder="Senha"/>
      <button onClick={() => {
          const nome = document.getElementById("nomeUsuario").value;
          const email = document.getElementById("emailUsuario").value;
          const senha = document.getElementById("senhaUsuario").value;
          if (!nome || !email || !senha) {
            alert("Preencha todos os campos");
            return;
          }
          const existe = usuarios.find(u => u.email === email);
          if (existe) {
            alert("Já existe um usuário com esse email");
            return;
          }
          setUsuarios(prev => [
            ...prev,
            { name: nome, email, password: senha }
          ]);
          alert("Usuário cadastrado com sucesso!");
          setScreen("menu");
        }}
      >
        Salvar usuário
      </button>
      <br /><br />
      <button onClick={() => setScreen("menu")}>
        ← Voltar
      </button>
    </>
  );
    default:
      return <div>Tela em construção</div>;
  }
}