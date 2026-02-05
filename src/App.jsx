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
  const [tempPatient, setTempPatient] = useState({
  name: "",
  email: "",
  phone: "",
  birthDate: "",
  age: "",
  father: "",
  mother: "",
  school: "",
  cep: "",
  address: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  notes: ""
});
  const myPatients = patients.filter(p => p.professionalId === currentUser?.id);
  const myAppointments = appointments.filter(a => a.professionalId === currentUser?.id);
  const filteredAppointments = myAppointments .filter(a => !filterDate || a.date === filterDate).sort((a, b) => {const dataA = new Date(`${a.date}T${a.time}`);
    const dataB = new Date(`${b.date}T${b.time}`);
    return dataA - dataB;
  });

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
  const {
    name,
    email,
    password,
    cep,
    address,
    number,
    neighborhood,
    city,
    state
  } = newUser;
  setUsers([...users, { id: Date.now(), ...newUser }]);
  setScreen("login");
}
function addPatient() {
  if (!tempPatient.name) return alert("Preencha o nome");

  if (tempPatient.id) {
    // EDITANDO
    setPatients(patients.map(p =>
      p.id === tempPatient.id ? tempPatient : p
    ));
  } else {
    // NOVO
    setPatients([
      ...patients,
      {
        id: Date.now(),
        professionalId: currentUser.id,
        ...tempPatient
      }
    ]);
  }

  setTempPatient({ name: "" });
  setScreen("pacientes");
}
function saveAppointment() {
  if (!schedulePatient || !scheduleDate || !scheduleTime) {
    return alert("Preencha todos os campos");
  }

  // 🔴 VERIFICA CHOQUE
  const conflito = appointments.find(a =>
    a.professionalId === currentUser.id &&
    a.date === scheduleDate &&
    a.time === scheduleTime
  );

  if (conflito) {
    return alert("Já existe uma consulta marcada nesse dia e horário");
  }

  const p = myPatients.find(p => p.id === Number(schedulePatient));

  setAppointments([
    ...appointments,
    {
      id: Date.now(),
      professionalId: currentUser.id,
      patientId: p.id,
      patientName: p.name,
      date: scheduleDate,
      time: scheduleTime
    }
  ]);

  setSchedulePatient("");
  setScheduleDate("");
  setScheduleTime("");

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
        <input style={input}placeholder="CEP"value={newUser.cep}onChange={e=>{
          const cep = e.target.value.replace(/\D/g,"");setNewUser(prev=>({...prev, cep}));buscarCEP(cep, setNewUser);}}/>
          <input style={input} placeholder="Rua" value={newUser.address} readOnly /> 
          <input style={input} placeholder="Bairro" value={newUser.neighborhood} readOnly />
          <input style={input} placeholder="Cidade" value={newUser.city} readOnly />      
          <input style={input} placeholder="Estado" value={newUser.state} readOnly />
          <input style={input}placeholder="Número"onChange={e=>setNewUser({...newUser, number:e.target.value})}/>
          <input style={input}placeholder="Complemento"onChange={e=>setNewUser({...newUser, complement:e.target.value})}/>
        <div style={{display:"flex",alignItems:"center",border:"1px solid #ccc",borderRadius:8}}>
          <input  style={{...input,border:"none",marginBottom:0}}type={showRegisterPassword ? "text" : "password"}placeholder="Senha"onChange={e=>setNewUser({...newUser,password:e.target.value})}/>
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

    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
      marginBottom: 20
    }}>
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

    <Card title="Ações rápidas">
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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
      <VoltarMenu setScreen={setScreen} />
      <Card title="Pacientes">
        {myPatients.map(p => (
          <div key={p.id} style={{ marginBottom: 12 }}>
            <b>{p.name}</b>
  <div style={{ display: "flex", gap: 8, marginTop: 5 }}>
    <button onClick={()=>{setCurrentPatient(p);setScreen("novoAtendimento");}}>Atender</button>
    <button onClick={()=>{setCurrentPatient(p); setScreen("prontuario");}}>Prontuário</button>
    <button style={ghostBtn}onClick={()=>{setTempPatient(p);setScreen("novoPaciente");}}>Cadastro</button>
  </div>
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
        <button style={ghostBtn} onClick={()=>setScreen("pacientes")}>← Voltar</button>
        <input style={input} placeholder="Nome" value={tempPatient.name} onChange={e=>setTempPatient({name:e.target.value})}/>
        <input style={input}placeholder="CEP"value={tempPatient.cep}onChange={e=>{
          const cep = e.target.value.replace(/\D/g,"");setTempPatient(prev=>({...prev, cep}));buscarCEP(cep, setTempPatient);}}/>
          <input style={input} placeholder="Rua" value={tempPatient.address} readOnly />
          <input style={input} placeholder="Bairro" value={tempPatient.neighborhood} readOnly />
          <input style={input} placeholder="Cidade" value={tempPatient.city} readOnly />
          <input style={input} placeholder="Estado" value={tempPatient.state} readOnly />
          <input style={input}placeholder="Número"onChange={e=>setTempPatient({...tempPatient, number:e.target.value})}/>
          <input style={input}placeholder="Complemento"onChange={e=>setTempPatient({...tempPatient, complement:e.target.value})}/>
        <input type="date" style={input}value={tempPatient.birthDate}onChange={e=>{const data = e.target.value;setTempPatient({...tempPatient,birthDate: data,age: calcularIdade(data)});}}/>
        <input style={input} placeholder="Idade"value={tempPatient.age}disabled/>
        <input style={input} placeholder="Nome da mãe" value={tempPatient.mother}onChange={e=>setTempPatient({...tempPatient, mother:e.target.value})}/>
        <input style={input} placeholder="Nome do pai"value={tempPatient.father}onChange={e=>setTempPatient({...tempPatient, father:e.target.value})}/>
<input style={input} placeholder="Telefone" value={tempPatient.phone}onChange={e=>setTempPatient({...tempPatient, phone:e.target.value})}/>
<input style={input} placeholder="Escola" value={tempPatient.school}onChange={e=>setTempPatient({...tempPatient, school:e.target.value})}/>
        <button style={primaryBtn} onClick={addPatient}>Salvar</button>
      </Card>
    </>
  )
  if (screen === "agenda") return layout(
  <>
    <button style={ghostBtn} onClick={()=>setScreen("menu")}>
      ← Voltar
    </button>
    <input type="date"style={input}value={filterDate}onChange={e => setFilterDate(e.target.value)}/>
    <button style={primaryBtn}onClick={() => setScreen("novoAgendamento")}>+ Novo Agendamento</button>
    <Card title="Agenda">
      {filteredAppointments
        .sort((a, b) => {
          const d1 = new Date(`${a.date}T${a.time}`);
          const d2 = new Date(`${b.date}T${b.time}`);
          return d1 - d2;
        })
        .map(a => (
          <div
            key={a.id}
            style={{
              marginBottom: 12,
              padding: 10,
              borderRadius: 8,
              background:
                a.status === "cancelado" ? "#fdecea" :
                a.status === "realizado" ? "#e8f5e9" :
                "#fff3cd"
            }}
          >
            <b>{a.patientName}</b><br/>
            {formatarDataBR(a.date)} às {a.time}<br/>
            <small>Status: {a.status || "marcado"}</small>
            <div style={{ marginTop: 8, display:"flex", gap:8 }}>
              <button onClick={() => {setCurrentPatient(myPatients.find(p => p.id === a.patientId));setScreen("novoAtendimento");}}>Atender</button> 
              <button style={{ background:"#c0392b", color:"#fff", border:"none", padding:6, borderRadius:6 }}onClick={()=>{setAppointments(appointments.map(ap =>
                   ap.id === a.id ? { ...ap, status:"cancelado" }: ap));}}> Cancelar
              </button>
            </div>
          </div>
        ))}
    </Card>
  </>
);
  if (screen === "novoAgendamento") return layout(
  <>
    <VoltarMenu setScreen={setScreen} />
    <Card title="Novo Agendamento">
      <button style={ghostBtn} onClick={()=>setScreen("agenda")}>← Voltar</button>
      <select style={input}value={schedulePatient}onChange={e => setSchedulePatient(e.target.value)}>
        <option value="">Selecione o paciente</option>
        {myPatients.map(p => (<option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <input type="date"style={input}value={scheduleDate}onChange={e => setScheduleDate(e.target.value)}/>
      <input type="time"style={input}value={scheduleTime}onChange={e => setScheduleTime(e.target.value)}/>
      <button style={primaryBtn}onClick={saveAppointment}>Salvar Agendamento</button>
    </Card>
  </>
);
if (screen === "novoAtendimento") return layout(
  <>
    <VoltarMenu setScreen={setScreen} />
    <Card title={`Novo Atendimento • ${currentPatient?.name || ""}`}>
      <textarea style={{ ...input, height: 150 }}placeholder="Descreva o atendimento..." value={note}onChange={e => setNote(e.target.value)}/>
      <button style={primaryBtn}onClick={saveSession}> Salvar Atendimento</button>
    </Card>
  </>
);
  if (screen === "prontuario") {
    const key = recordKey(currentUser.id, currentPatient.id);
    return layout(
      <>
        <VoltarMenu setScreen={setScreen} />
        <Card title="Prontuário">
          <button style={{ ...ghostBtn, color:"#c0392b", marginTop:10 }}onClick={()=>{
    if (!window.confirm("Tem certeza que deseja apagar TODO o prontuário?")) return;
    if (!window.confirm("Isso não poderá ser desfeito. Confirmar novamente?")) return;
    const key = recordKey(currentUser.id, currentPatient.id);
    setRecords(prev => {
      const copy = {...prev};
      delete copy[key];
      return copy;
    });
  }}> Limpar prontuário</button>
          {(records[key] || []).map((r,i)=>(
            <div key={i}><small>{r.date}</small><p>{r.text}</p></div>
          ))}
        </Card>
      </>
    );
  }

  return null;
}