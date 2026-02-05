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

  if (screen === "menu") return (
    <div style={{ display:"flex", minHeight:"100vh", background:colors.bg }}>
      <Sidebar current={screen} setScreen={setScreen} />
      <div style={{ padding:28 }}>
        <h1>Bem-vindo(a), {currentUser?.name}</h1>

        <Card title="Ações rápidas">
          <button style={primaryBtn} onClick={()=>setScreen("agenda")}>
            Ver Agenda
          </button>
        </Card>
      </div>
    </div>
  );

  if (screen === "agenda") return (
    <div style={{ display:"flex", minHeight:"100vh", background:colors.bg }}>
      <Sidebar current={screen} setScreen={setScreen} />
      <div style={{ padding:28, flex:1 }}>
        <button style={ghostBtn} onClick={()=>setScreen("menu")}>← Voltar</button>

        <input type="date" style={input} value={filterDate} onChange={e=>setFilterDate(e.target.value)} />

        <Card title="Agenda">
          {filteredAppointments.map(a=>(
            <div key={a.id} style={{ marginBottom:10 }}>
              <b>{a.patientName}</b> — {formatarDataBR(a.date)} {a.time}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );

  return null;
}