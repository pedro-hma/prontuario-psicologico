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
  const [currentUser, setCurrentUser] = useState(null);

  const [users, setUsers] = useState(JSON.parse(localStorage.getItem("users") || "[]"));
  const [patients, setPatients] = useState(JSON.parse(localStorage.getItem("patients") || "[]"));
  const [appointments, setAppointments] = useState(JSON.parse(localStorage.getItem("appointments") || "[]"));
  const [records, setRecords] = useState(JSON.parse(localStorage.getItem("records") || "{}"));

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [search, setSearch] = useState("");
  const [currentPatient, setCurrentPatient] = useState(null);
  const [note, setNote] = useState("");

  const [tempPatient, setTempPatient] = useState({ name: "" });
  const [editingPatient, setEditingPatient] = useState(null);

  const [schedulePatient, setSchedulePatient] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: ""
  });

  const myPatients = patients.filter(p => p.professionalId === currentUser?.id);
  const myAppointments = appointments.filter(a => a.professionalId === currentUser?.id);

  const filteredAppointments = myAppointments.filter(
    a => !filterDate || a.date === filterDate
  );

  useEffect(() => localStorage.setItem("users", JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem("patients", JSON.stringify(patients)), [patients]);
  useEffect(() => localStorage.setItem("appointments", JSON.stringify(appointments)), [appointments]);
  useEffect(() => localStorage.setItem("records", JSON.stringify(records)), [records]);

  function handleLogin() {
    const u = users.find(x => x.email === loginEmail && x.password === loginPass);
    if (!u) return alert("Login inválido");
    setCurrentUser(u);
    setScreen("menu");
  }

  function handleRegister() {
    const { name, email, password, cep, address, number } = newUser;
    if (!name || !email || !password || !cep || !address || !number) {
      return alert("Preencha todos os campos");
    }
    setUsers([...users, { id: Date.now(), ...newUser }]);
    setScreen("login");
  }

  const layout = content => (
    <div style={{ display: "flex", minHeight: "100vh", background: colors.bg }}>
      <Sidebar current={screen} setScreen={setScreen} />
      <div style={{ flex: 1, padding: 28 }}>{content}</div>
    </div>
  );

  /* ===================== TELAS ===================== */

  if (screen === "login") return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh"}}>
      <div style={{background:"#fff",padding:30,borderRadius:14,width:360}}>
        <h2>Login</h2>
        <input style={input} placeholder="Email" onChange={e=>setLoginEmail(e.target.value)} />
        <div style={{display:"flex",alignItems:"center",border:`1px solid ${colors.border}`,borderRadius:10}}>
          <input
            style={{...input,border:"none",marginBottom:0}}
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            onChange={e=>setLoginPass(e.target.value)}
          />
          <span onClick={()=>setShowPassword(!showPassword)} style={{padding:10,cursor:"pointer"}}>
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>
        <button style={{...primaryBtn,width:"100%"}} onClick={handleLogin}>Entrar</button>
        <button style={{...ghostBtn,width:"100%",marginTop:8}} onClick={()=>setScreen("register")}>Cadastrar</button>
        <button style={{...ghostBtn,width:"100%",marginTop:8}} onClick={()=>setScreen("resetSenha")}>Esqueci minha senha</button>
      </div>
    </div>
  );

  if (screen === "register") return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh"}}>
      <div style={{background:"#fff",padding:30,borderRadius:14,width:360}}>
        <h2>Novo Usuário</h2>

        <input style={input} placeholder="Nome" onChange={e=>setNewUser({...newUser,name:e.target.value})}/>
        <input style={input} placeholder="Email" onChange={e=>setNewUser({...newUser,email:e.target.value})}/>

        <input
          style={input}
          placeholder="CEP"
          value={newUser.cep}
          onChange={e=>{
            const cep = e.target.value.replace(/\D/g,"");
            setNewUser(prev=>({...prev,cep}));
            buscarCEP(cep, setNewUser);
          }}
        />

        <input style={input} placeholder="Rua" value={newUser.address}/>
        <input style={input} placeholder="Número" onChange={e=>setNewUser({...newUser,number:e.target.value})}/>
        <input style={input} placeholder="Cidade" value={newUser.city}/>
        <input style={input} placeholder="Estado" value={newUser.state}/>

        <div style={{display:"flex",alignItems:"center",border:"1px solid #ccc",borderRadius:8}}>
          <input
            style={{...input,border:"none",marginBottom:0}}
            type={showRegisterPassword ? "text" : "password"}
            placeholder="Senha"
            onChange={e=>setNewUser({...newUser,password:e.target.value})}
          />
          <span onClick={()=>setShowRegisterPassword(!showRegisterPassword)} style={{padding:10,cursor:"pointer"}}>
            {showRegisterPassword ? <FiEyeOff/> : <FiEye/>}
          </span>
        </div>

        <button style={primaryBtn} onClick={handleRegister}>Salvar</button>
      </div>
    </div>
  );

  if (screen === "resetSenha") return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh"}}>
      <div style={{background:"#fff",padding:30,borderRadius:14,width:360}}>
        <h2>Redefinir senha</h2>
        <input style={input} placeholder="Email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)}/>
        <input style={input} type="password" placeholder="Nova senha" value={loginPass} onChange={e=>setLoginPass(e.target.value)}/>
        <button
          style={primaryBtn}
          onClick={()=>{
            const idx = users.findIndex(u=>u.email===loginEmail);
            if (idx === -1) return alert("Email não encontrado");
            const copy = [...users];
            copy[idx] = { ...copy[idx], password: loginPass };
            setUsers(copy);
            setScreen("login");
          }}
        >
          Salvar nova senha
        </button>
      </div>
    </div>
  );

  return null;
  if (screen === "menu") return layout(
  <>
    <h1>Bem-vindo(a), {currentUser?.name}</h1>

    {/* Cards de resumo */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        marginBottom: 20
      }}
    >
      <Card>
        <div style={{ color: colors.subtext }}>Meus Pacientes</div>
        <div style={{ fontSize: 36, fontWeight: 700 }}>
          {myPatients.length}
        </div>
      </Card>

      <Card>
        <div style={{ color: colors.subtext }}>Consultas Hoje</div>
        <div style={{ fontSize: 36, fontWeight: 700 }}>
          {
            myAppointments.filter(
              a => a.date === new Date().toISOString().split("T")[0]
            ).length
          }
        </div>
      </Card>
    </div>

    {/* Ações rápidas */}
    <Card title="Ações rápidas">
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          style={primaryBtn}
          onClick={() => setScreen("novoAtendimento")}
        >
          Novo Atendimento
        </button>

        <button
          style={ghostBtn}
          onClick={() => setScreen("novoPaciente")}
        >
          Novo Paciente
        </button>

        <button
          style={ghostBtn}
          onClick={() => setScreen("novoAgendamento")}
        >
          Novo Agendamento
        </button>
      </div>
    </Card>
  </>
);

if (screen === "pacientes") return layout(
  <>
    <VoltarMenu setScreen={setScreen} />
    <Card title="Pacientes">
      <input
        style={input}
        placeholder="Buscar"
        onChange={e => setSearch(e.target.value)}
      />

      <button
        style={primaryBtn}
        onClick={() => setScreen("novoPaciente")}
      >
        + Novo paciente
      </button>

      {myPatients
        .filter(p =>
          p.name.toLowerCase().includes(search.toLowerCase())
        )
        .map(p => (
          <div key={p.id}>
            <b>{p.name}</b>
            <button
              onClick={() => {
                setCurrentPatient(p);
                setScreen("novoAtendimento");
              }}
            >
              Atender
            </button>
          </div>
        ))}
    </Card>
  </>
);

if (screen === "novoPaciente") return layout(
  <>
    <VoltarMenu setScreen={setScreen} />
    <Card title="Novo Paciente">
      <input
        style={input}
        placeholder="Nome"
        value={tempPatient.name}
        onChange={e =>
          setTempPatient({ ...tempPatient, name: e.target.value })
        }
      />

      <input
        style={input}
        placeholder="Email"
        value={tempPatient.email}
        onChange={e =>
          setTempPatient({ ...tempPatient, email: e.target.value })
        }
      />

      <input
        style={input}
        placeholder="Telefone"
        value={tempPatient.phone}
        onChange={e =>
          setTempPatient({ ...tempPatient, phone: e.target.value })
        }
      />

      <input
        type="date"
        style={input}
        value={tempPatient.birthDate}
        onChange={e =>
          setTempPatient({ ...tempPatient, birthDate: e.target.value })
        }
      />

      <input style={input} placeholder="CEP" />
      <input style={input} placeholder="Rua" />
      <input style={input} placeholder="Número" />
      <input style={input} placeholder="Complemento" />
      <input style={input} placeholder="Bairro" />
      <input style={input} placeholder="Cidade" />
      <input style={input} placeholder="Estado" />

      <textarea
        style={input}
        placeholder="Observações"
        value={tempPatient.notes}
        onChange={e =>
          setTempPatient({ ...tempPatient, notes: e.target.value })
        }
      />

      <button style={primaryBtn} onClick={addPatient}>
        Salvar
      </button>
    </Card>
  </>
);

if (screen === "agenda") return layout(
  <>
    <VoltarMenu setScreen={setScreen} />
    <Card title="Agenda">
      <input
        type="date"
        style={input}
        value={scheduleDate}
        onChange={e => setScheduleDate(e.target.value)}
      />

      <button
        style={primaryBtn}
        onClick={() => setScreen("novoAgendamento")}
      >
        + Novo Agendamento
      </button>

      {filteredAppointments.map(a => (
        <div key={a.id}>
          <b>{a.patientName}</b> — {a.date} {a.time}
          <button
            onClick={() => {
              setCurrentPatient(
                myPatients.find(p => p.id === a.patientId)
              );
              setScreen("novoAtendimento");
            }}
          >
            Atender
          </button>
        </div>
      ))}
    </Card>
  </>
);

if (screen === "novoAgendamento") return layout(
  <>
    <VoltarMenu setScreen={setScreen} />
    <Card title="Novo Agendamento">
      <select
        style={input}
        onChange={e => setSchedulePatient(e.target.value)}
      >
        <option value="">Paciente</option>
        {myPatients.map(p => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        style={input}
        value={scheduleDate}
        onChange={e => setScheduleDate(e.target.value)}
      />

      <input
        type="time"
        style={input}
        onChange={e => setScheduleTime(e.target.value)}
      />

      <button style={primaryBtn} onClick={saveAppointment}>
        Salvar
      </button>
    </Card>
  </>
);

if (screen === "novoAtendimento") return layout(
  <>
    <VoltarMenu setScreen={setScreen} />
    <Card title={`Novo Atendimento • ${currentPatient?.name}`}>
      <textarea
        style={{ ...input, height: 140 }}
        value={note}
        onChange={e => setNote(e.target.value)}
      />
      <button style={primaryBtn} onClick={saveSession}>
        Salvar Atendimento
      </button>
    </Card>
  </>
);

if (screen === "prontuario") {
  const key = recordKey(currentUser.id, currentPatient.id);
  return layout(
    <>
      <VoltarMenu setScreen={setScreen} />
      <Card title={`Prontuário • ${currentPatient.name}`}>
        {(records[key] || []).map((r, i) => (
          <div key={i}>
            <small>{r.date}</small>
            <p>{r.text}</p>
          </div>
        ))}
      </Card>
    </>
  );
}
}