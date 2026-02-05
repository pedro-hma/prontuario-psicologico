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
  const [currentUser, setCurrentUser] = useState(null);

  const [users, setUsers] = useState(JSON.parse(localStorage.getItem("users") || "[]"));
  const [patients, setPatients] = useState(JSON.parse(localStorage.getItem("patients") || "[]"));
  const [appointments, setAppointments] = useState(JSON.parse(localStorage.getItem("appointments") || "[]"));
  const [records, setRecords] = useState(JSON.parse(localStorage.getItem("records") || "{}"));

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [currentPatient, setCurrentPatient] = useState(null);
  const [note, setNote] = useState("");

  const [schedulePatient, setSchedulePatient] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const [tempPatient, setTempPatient] = useState({
    name: "",
    phone: "",
    birthDate: "",
    age: "",
    cep: "",
    address: "",
    neighborhood: "",
    city: "",
    state: "",
    number: "",
    notes: ""
  });

  const myPatients = patients.filter(p => p.professionalId === currentUser?.id);
  const myAppointments = appointments.filter(a => a.professionalId === currentUser?.id);

  const filteredAppointments = myAppointments
    .filter(a => !filterDate || a.date === filterDate)
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

  /* ===================== PERSISTÊNCIA ===================== */
  useEffect(() => {
    setScreen("login");

    if (users.length === 0) {
      const admin = [{
        id: 1,
        name: "Administrador",
        email: "admin@admin.com",
        password: "123"
      }];
      setUsers(admin);
      localStorage.setItem("users", JSON.stringify(admin));
    }
  }, []);

  useEffect(() => localStorage.setItem("users", JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem("patients", JSON.stringify(patients)), [patients]);
  useEffect(() => localStorage.setItem("appointments", JSON.stringify(appointments)), [appointments]);
  useEffect(() => localStorage.setItem("records", JSON.stringify(records)), [records]);

  /* ===================== LOGIN ===================== */
  const ADMIN_BACKUP = {
    id: "admin-backup",
    name: "Administrador",
    email: "admin@backup.com",
    password: "admin123"
  };

  function handleLogin() {
    if (loginEmail === ADMIN_BACKUP.email && loginPass === ADMIN_BACKUP.password) {
      setCurrentUser(ADMIN_BACKUP);
      setScreen("menu");
      return;
    }

    const u = users.find(x => x.email === loginEmail && x.password === loginPass);
    if (!u) return alert("Login inválido");

    setCurrentUser(u);
    setScreen("menu");
  }

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
      </div>
    </div>
  );
  if (screen === "menu") return layout(
  <>
    <h1>Bem-vindo(a), {currentUser?.name}</h1>

    {/* CONSULTAS DO DIA */}
    <div
      style={{
        background:"#fff",
        border:`1px solid ${colors.border}`,
        borderRadius:14,
        padding:20,
        marginBottom:20,
        cursor:"pointer"
      }}
      onClick={()=>setScreen("consultasHoje")}
    >
      <div style={{ color: colors.subtext }}>Consultas do dia</div>
      <div style={{ fontSize:36, fontWeight:700 }}>
        {
          myAppointments.filter(
            a =>
              a.date === new Date().toISOString().split("T")[0] &&
              a.status !== "cancelado"
          ).length
        }
      </div>
    </div>

    {/* AÇÕES RÁPIDAS */}
    <Card title="Ações rápidas">
      <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
        <button style={primaryBtn} onClick={()=>setScreen("novoAtendimento")}>
          Novo Atendimento
        </button>

        <button style={ghostBtn} onClick={()=>setScreen("novoPaciente")}>
          Novo Paciente
        </button>

        <button style={ghostBtn} onClick={()=>setScreen("novoAgendamento")}>
          Novo Agendamento
        </button>
      </div>
    </Card>
  </>
);
if (screen === "pacientes") return layout(
  <>
    <button style={ghostBtn} onClick={()=>setScreen("menu")}> ← Voltar </button>
    <Card title="Pacientes">
      <input style={input}placeholder="Buscar paciente"value={search}onChange={e=>setSearch(e.target.value)}/>
      {myPatients
        .filter(p =>
          p.name.toLowerCase().includes(search.toLowerCase())
        )
        .map(p => (
          <div
            key={p.id}
            style={{
              padding:10,
              borderBottom:`1px solid ${colors.border}`
            }}
          >
            <b>{p.name}</b>
            <div style={{ marginTop:6, display:"flex", gap:8 }}>
              <button onClick={()=>{setCurrentPatient(p);setScreen("novoAtendimento");}}>Atender</button>
              <button onClick={()=>{setTempPatient(p);setScreen("novoPaciente");}}>Editar</button>
              <button style={ghostBtn}onClick={()=>{setCurrentPatient(p);setScreen("prontuario");}}>Prontuário</button>
            </div>
          </div>
        ))}
    </Card>
  </>
);
if (screen === "agenda") return layout(
  <>
    <button style={ghostBtn} onClick={()=>setScreen("menu")}>← Voltar</button>
    <input type="date" style={input}value={filterDate}onChange={e=>setFilterDate(e.target.value)}/>
    <button style={primaryBtn}onClick={()=>setScreen("novoAgendamento")}>+ Novo Agendamento</button>
    <Card title="Agenda">
      {filteredAppointments
        .sort((a,b)=>{
          const d1 = new Date(`${a.date}T${a.time}`);
          const d2 = new Date(`${b.date}T${b.time}`);
          return d1 - d2;
        })
        .map(a => (
          <div
            key={a.id}
            style={{
              padding:12,
              borderRadius:10,
              marginBottom:10,
              background:
                a.status === "cancelado" ? "#fdecea" :
                a.status === "realizado" ? "#e8f5e9" :
                "#fff3cd"
            }}
          >
            <b>{a.patientName}</b><br/>
            {formatarDataBR(a.date)} às {a.time}<br/>
            <small>Status: {a.status || "marcado"}</small>

            <div style={{ marginTop:8, display:"flex", gap:8 }}>
              {a.status !== "cancelado" && (
                <button onClick={()=>{setCurrentPatient(myPatients.find(p => p.id === a.patientId));
                    setAppointments(appointments.map(ap =>
                      ap.id === a.id
                        ? { ...ap, status:"realizado" }
                        : ap
                    ));
                    setScreen("novoAtendimento");
                  }}
                > Realizar</button>
              )}
              <button style={{ background:"#c0392b", color:"#fff", border:"none", padding:6, borderRadius:6 }}onClick={()=>{
                  setAppointments(appointments.map(ap =>
                    ap.id === a.id
                      ? { ...ap, status:"cancelado" }
                      : ap
                  ));
                }}
              >Cancelar</button>
            </div>
          </div>
        ))}
    </Card>
  </>
);
  return null;
}