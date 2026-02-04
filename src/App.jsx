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
    city: "",
    state: ""
  });

  const myPatients = patients.filter(p => p.professionalId === currentUser?.id);
  const myAppointments = appointments.filter(a => a.professionalId === currentUser?.id);
  const filteredAppointments = myAppointments.filter(a => !filterDate || a.date === filterDate);

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

  function addPatient() {
    if (!tempPatient.name) return;
    setPatients([...patients, { id: Date.now(), professionalId: currentUser.id, ...tempPatient }]);
    setTempPatient({ name: "" });
    setScreen("pacientes");
  }

  function saveAppointment() {
    const p = myPatients.find(p => p.id === Number(schedulePatient));
    if (!p) return;
    setAppointments([...appointments, {
      id: Date.now(),
      professionalId: currentUser.id,
      patientId: p.id,
      patientName: p.name,
      date: scheduleDate,
      time: scheduleTime
    }]);
    setScreen("agenda");
  }

  function saveSession() {
    if (!currentPatient || !note) return;
    const key = recordKey(currentUser.id, currentPatient.id);
    setRecords(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), { date: new Date().toLocaleString(), text: note }]
    }));
    setNote("");
    setScreen("prontuario");
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

  if (screen === "menu") return layout(
    <>
      <h1>Bem-vindo(a), {currentUser?.name}</h1>
      <Card title="Ações rápidas">
        <button style={primaryBtn} onClick={()=>setScreen("pacientes")}>Pacientes</button>
      </Card>
    </>
  );

  if (screen === "pacientes") return layout(
    <>
      <VoltarMenu setScreen={setScreen} />
      <Card title="Pacientes">
        {myPatients.map(p => (
          <div key={p.id}>
            <b>{p.name}</b>
            <button onClick={()=>{setCurrentPatient(p);setScreen("novoAtendimento");}}>Atender</button>
          </div>
        ))}
        <button style={primaryBtn} onClick={()=>setScreen("novoPaciente")}>+ Novo</button>
      </Card>
    </>
  );

  if (screen === "novoPaciente") return layout(
    <>
      <VoltarMenu setScreen={setScreen} />
      <Card title="Novo Paciente">
        <input style={input} placeholder="Nome" value={tempPatient.name} onChange={e=>setTempPatient({name:e.target.value})}/>
        <button style={primaryBtn} onClick={addPatient}>Salvar</button>
      </Card>
    </>
  );

  if (screen === "agenda") return layout(
    <>
      <VoltarMenu setScreen={setScreen} />
      <Card title="Agenda">
        {filteredAppointments.map(a => (
          <div key={a.id}>{a.patientName} — {a.date} {a.time}</div>
        ))}
      </Card>
    </>
  );

  if (screen === "novoAgendamento") return layout(
    <>
      <VoltarMenu setScreen={setScreen} />
      <Card title="Novo Agendamento">
        <button style={primaryBtn} onClick={saveAppointment}>Salvar</button>
      </Card>
    </>
  );

  if (screen === "novoAtendimento") return layout(
    <>
      <VoltarMenu setScreen={setScreen} />
      <Card title={`Novo Atendimento • ${currentPatient?.name}`}>
        <textarea style={input} value={note} onChange={e=>setNote(e.target.value)} />
        <button style={primaryBtn} onClick={saveSession}>Salvar</button>
      </Card>
    </>
  );

  if (screen === "prontuario") {
    const key = recordKey(currentUser.id, currentPatient.id);
    return layout(
      <>
        <VoltarMenu setScreen={setScreen} />
        <Card title="Prontuário">
          {(records[key] || []).map((r,i)=>(
            <div key={i}><small>{r.date}</small><p>{r.text}</p></div>
          ))}
        </Card>
      </>
    );
  }

  return null;
}