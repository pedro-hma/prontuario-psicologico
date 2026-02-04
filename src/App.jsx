import React, { useState, useEffect } from "react";

/* ===================== ESTILO ===================== */
const colors = {
  bg: "#f2f5f4",
  sidebar: "#ffffff",
  primary: "#1aa39a",
  border: "#e2e8e7",
  text: "#243333",
  subtext: "#6b7c7c",
  danger: "#c0392b",
  success: "#27ae60",
  info: "#2980b9"
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
function BackToDashboard({ setScreen }) {
  return (
    <button style={{ ...ghostBtn, marginBottom: 16 }} onClick={() => setScreen("dashboard")}>
      ← Voltar ao Dashboard
    </button>
  );
}

function calcAge(birthDate) {
  if (!birthDate) return "-";
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function statusColor(status) {
  if (status === "agendada") return colors.info;
  if (status === "realizada") return colors.success;
  if (status === "cancelada") return colors.danger;
  return colors.subtext;
}

function recordKey(professionalId, patientId) {
  return `${professionalId}_${patientId}`;
}

/* ===================== COMPONENTES ===================== */
function Sidebar({ current, setScreen }) {
  const Item = ({ id, label }) => (
    <button
      onClick={() => setScreen(id)}
      style={{
        width: "100%",
        textAlign: "left",
        padding: 12,
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        background: current === id ? colors.primary : "transparent",
        color: current === id ? "#fff" : colors.text,
        marginBottom: 6
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ width: 220, background: "#fff", borderRight: `1px solid ${colors.border}`, padding: 16 }}>
      <h3>Prontuário</h3>
      <Item id="dashboard" label="Dashboard" />
      <Item id="pacientes" label="Pacientes" />
      <Item id="agenda" label="Agenda" />
    </div>
  );
}

function Card({ title, children, right }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${colors.border}`, padding: 20, marginBottom: 18 }}>
      {(title || right) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          {right}
        </div>
      )}
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
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });

  const [search, setSearch] = useState("");
  const [currentPatient, setCurrentPatient] = useState(null);
  const [note, setNote] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const [tempPatient, setTempPatient] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    address: "",
    notes: ""
  });

  const [editingPatient, setEditingPatient] = useState(null);

  const [schedulePatient, setSchedulePatient] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  /* ---------- persistência ---------- */
  useEffect(() => localStorage.setItem("users", JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem("patients", JSON.stringify(patients)), [patients]);
  useEffect(() => localStorage.setItem("appointments", JSON.stringify(appointments)), [appointments]);
  useEffect(() => localStorage.setItem("records", JSON.stringify(records)), [records]);
  useEffect(() => setConfirmClear(false), [screen]);

  /* ---------- controle por profissional ---------- */
  const myPatients = patients.filter(p => p.professionalId === currentUser?.id);
  const myAppointments = appointments.filter(a => a.professionalId === currentUser?.id);

  const today = new Date().toISOString().split("T")[0];
  const todaysAppointments = myAppointments.filter(
    a => a.date === today && a.status === "agendada"
  );

  /* ---------- auth ---------- */
  function handleLogin() {
    const u = users.find(x => x.email === loginEmail && x.password === loginPass);
    if (!u) return alert("Login inválido");
    setCurrentUser(u);
    setScreen("dashboard");
  }

  function handleRegister() {
    setUsers([...users, { id: Date.now(), ...newUser }]);
    setNewUser({ name: "", email: "", password: "" });
    setScreen("login");
  }

  /* ---------- pacientes ---------- */
  function addPatient() {
    if (!tempPatient.name) return;

    if (editingPatient) {
      setPatients(patients.map(p => p.id === editingPatient.id ? { ...p, ...tempPatient } : p));
    } else {
      setPatients([...patients, { id: Date.now(), professionalId: currentUser.id, ...tempPatient }]);
    }

    setEditingPatient(null);
    setTempPatient({ name: "", email: "", phone: "", birthDate: "", address: "", notes: "" });
    setScreen("pacientes");
  }

  /* ---------- atendimento ---------- */
  function saveSession() {
    if (!currentPatient || !note) return alert("Selecione o paciente e escreva a anotação.");

    const key = recordKey(currentUser.id, currentPatient.id);
    const entry = { date: new Date().toLocaleString("pt-BR"), text: note };

    setRecords(prev => ({ ...prev, [key]: [...(prev[key] || []), entry] }));
    setNote("");
    setScreen("prontuario");
  }

  /* ---------- agenda ---------- */
  function saveAppointment() {
    if (!schedulePatient || !scheduleDate || !scheduleTime) return alert("Preencha tudo.");

    if (editingAppointment) {
      setAppointments(appointments.map(a => a.id === editingAppointment.id ? { ...a, date: scheduleDate, time: scheduleTime } : a));
    } else {
      const p = myPatients.find(p => p.id === Number(schedulePatient));
      setAppointments([...appointments, {
        id: Date.now(),
        professionalId: currentUser.id,
        patientId: p.id,
        patientName: p.name,
        date: scheduleDate,
        time: scheduleTime,
        status: "agendada"
      }]);
    }

    setEditingAppointment(null);
    setScreen("agenda");
  }

  function startAppointment(a) {
    setAppointments(appointments.map(x => x.id === a.id ? { ...x, status: "realizada" } : x));
    setCurrentPatient(myPatients.find(p => p.id === a.patientId));
    setScreen("novoAtendimento");
  }

  function cancelAppointment(id) {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: "cancelada" } : a));
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
        <input style={input} type="password" placeholder="Senha" onChange={e=>setLoginPass(e.target.value)} />
        <button style={{...primaryBtn,width:"100%"}} onClick={handleLogin}>Entrar</button>
        <button style={{...ghostBtn,width:"100%",marginTop:8}} onClick={()=>setScreen("register")}>Cadastrar</button>
      </div>
    </div>
  );
  console.log("SCREEN ATUAL :",senha)
  if (screen === "register") return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh"}}>
      <div style={{background:"#fff",padding:30,borderRadius:14,width:360}}>
        <h2>Novo Usuário</h2>
        <input style={input} placeholder="Nome" onChange={e=>setNewUser({...newUser,name:e.target.value})}/>
        <input style={input} placeholder="Email" onChange={e=>setNewUser({...newUser,email:e.target.value})}/>
        <input style={input} placeholder="Senha" onChange={e=>setNewUser({...newUser,password:e.target.value})}/>
        <button style={primaryBtn} onClick={handleRegister}>Salvar</button>
      </div>
    </div>
  );

  if (screen === "dashboard") return layout(
    <>
      <h1>Bem-vindo(a), {currentUser?.name}</h1>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card>
          <div style={{color:colors.subtext}}>Meus Pacientes</div>
          <div style={{fontSize:36,fontWeight:700}}>{myPatients.length}</div>
        </Card>
        <Card>
          <div style={{color:colors.subtext}}>Consultas Hoje</div>
          <div style={{fontSize:36,fontWeight:700}}>{todaysAppointments.length}</div>
        </Card>
      </div>

      <Card title="Ações rápidas">
        <button style={primaryBtn} onClick={()=>setScreen("novoAtendimento")}>Realizar Atendimento</button>
      </Card>
    </>
  );

  if (screen === "pacientes") return layout(
    <>
      <BackToDashboard setScreen={setScreen} />
      <Card title="Pacientes">
        <input style={input} placeholder="Buscar" onChange={e=>setSearch(e.target.value)} />
        {myPatients.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())).map(p=>(
          <div key={p.id} style={{borderTop:`1px solid ${colors.border}`,padding:12}}>
            <b>{p.name}</b> • {calcAge(p.birthDate)} anos
            <div style={{marginTop:8}}>
              <button style={primaryBtn} onClick={()=>{setCurrentPatient(p);setScreen("novoAtendimento");}}>Atender</button>
              <button style={ghostBtn} onClick={()=>{setCurrentPatient(p);setScreen("prontuario");}}>Prontuário</button>
              <button style={ghostBtn} onClick={()=>{setEditingPatient(p);setTempPatient(p);setScreen("novoPaciente");}}>Editar</button>
            </div>
          </div>
        ))}
      </Card>
    </>
  );

  if (screen === "novoPaciente") return layout(
    <>
      <BackToDashboard setScreen={setScreen} />
      <Card title="Novo Paciente">
        <input style={input} placeholder="Nome" value={tempPatient.name} onChange={e=>setTempPatient({...tempPatient,name:e.target.value})}/>
        <input style={input} placeholder="Email" value={tempPatient.email} onChange={e=>setTempPatient({...tempPatient,email:e.target.value})}/>
        <input style={input} placeholder="Telefone" value={tempPatient.phone} onChange={e=>setTempPatient({...tempPatient,phone:e.target.value})}/>
        <input type="date" style={input} value={tempPatient.birthDate} onChange={e=>setTempPatient({...tempPatient,birthDate:e.target.value})}/>
        <textarea style={input} placeholder="Endereço" value={tempPatient.address} onChange={e=>setTempPatient({...tempPatient,address:e.target.value})}/>
        <textarea style={input} placeholder="Observações" value={tempPatient.notes} onChange={e=>setTempPatient({...tempPatient,notes:e.target.value})}/>
        <button style={primaryBtn} onClick={addPatient}>Salvar</button>
      </Card>
    </>
  );

  if (screen === "novoAtendimento") return layout(
    <>
      <BackToDashboard setScreen={setScreen} />
      <Card title="Novo Atendimento">
        <textarea style={{...input,height:140}} value={note} onChange={e=>setNote(e.target.value)} />
        <button style={primaryBtn} onClick={saveSession}>Salvar Atendimento</button>
      </Card>
    </>
  );

  if (screen === "agenda") return layout(
    <>
      <BackToDashboard setScreen={setScreen} />
      <Card title="Agenda">
        {myAppointments.map(a=>(
          <div key={a.id} style={{borderTop:`1px solid ${colors.border}`,padding:12}}>
            <b>{a.patientName}</b> — {a.date} {a.time}<br/>
            <span style={{color:statusColor(a.status),fontWeight:600}}>{a.status}</span>
            {a.status==="agendada" && (
              <div>
                <button style={primaryBtn} onClick={()=>startAppointment(a)}>Iniciar</button>
                <button style={ghostBtn} onClick={()=>cancelAppointment(a.id)}>Cancelar</button>
              </div>
            )}
          </div>
        ))}
      </Card>
    </>
  );

  if (screen === "prontuario") {
    const key = recordKey(currentUser.id, currentPatient.id);
    const list = records[key] || [];

    return layout(
      <>
        <BackToDashboard setScreen={setScreen} />
        <Card title={`Prontuário • ${currentPatient.name}`}>
          {list.map((r,i)=>(
            <div key={i} style={{borderTop:`1px solid ${colors.border}`,padding:12}}>
              <small>{r.date}</small>
              <p>{r.text}</p>
            </div>
          ))}

          <button style={primaryBtn} onClick={()=>setScreen("novoAtendimento")}>
            Novo Atendimento
          </button>

          {!confirmClear && (
            <button style={{...ghostBtn,color:colors.danger,marginLeft:8}} onClick={()=>setConfirmClear(true)}>
              Limpar prontuário
            </button>
          )}

          {confirmClear && (
            <div style={{marginTop:12}}>
              <p style={{color:colors.danger}}>Tem certeza? Essa ação não pode ser desfeita.</p>
              <button style={{...primaryBtn,background:colors.danger}} onClick={()=>{
                setRecords(prev=>{
                  const copy={...prev};
                  delete copy[key];
                  return copy;
                });
                setConfirmClear(false);
              }}>
                Sim, apagar tudo
              </button>
              <button style={ghostBtn} onClick={()=>setConfirmClear(false)}>Cancelar</button>
            </div>
          )}
        </Card>
      </>
    );
  }

  return null;
}