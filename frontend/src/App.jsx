import React,{useEffect,useState}from'react';import{Building2,Home,ClipboardList,PlusCircle,Bell,Users,LogOut,Menu,X,ShieldCheck,Sparkles,Send,ChevronRight,RefreshCw,AlertTriangle,CheckCircle2,Clock3,MessageCircle,Star}from'lucide-react';
const API=import.meta.env.VITE_API_URL||'http://localhost:5000/api';
async function api(path,token,options={}){const r=await fetch(API+path,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...(options.headers||{})}});const d=await r.json().catch(()=>({message:'Server did not return JSON'}));if(!r.ok)throw Error(d.message||'Request failed');return d}
const statusClass=s=>(s||'').toLowerCase().replaceAll(' ','-');
function App() {
  const [token, setToken] = useState(localStorage.token || '');
  const [user, setUser] = useState(JSON.parse(localStorage.user || 'null'));
  const [page, setPage] = useState('overview');
  const [mode, setMode] = useState('login');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    room: '',
    block: ''
  });

  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);

  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);

  const [draft, setDraft] = useState({
    title: '',
    description: ''
  });

  const [selected, setSelected] = useState(null);

  const [update, setUpdate] = useState({
    status: 'Acknowledged',
    assignedTo: '',
    note: ''
  });

  const [staff, setStaff] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    department: ''
  });

 // AI Chatbot states
const [question, setQuestion] = useState('');
const [chatMessages, setChatMessages] = useState([]);
const [chatLoading, setChatLoading] = useState(false);

// Feedback states
const [rating, setRating] = useState(5);
const [feedback, setFeedback] = useState('');
const manager=user&&['admin','staff'].includes(user.role);const flash=m=>{setToast(m);setTimeout(()=>setToast(''),3200)};
async function load(){if(!token)return;try{const[d,c,n]=await Promise.all([api('/dashboard',token),api('/complaints',token),api('/notifications',token)]);setDashboard(d);setComplaints(c.complaints);setNotifications(n.notifications);if(user?.role==='admin'){const u=await api('/users',token);setUsers(u.users)}}catch(e){setError(e.message)}}useEffect(()=>{if(token)load()},[token]);
async function authSubmit(e){e.preventDefault();setBusy(true);setError('');try{const d=await api(mode==='login'?'/auth/login':'/auth/register','',{method:'POST',body:JSON.stringify(form)});localStorage.token=d.token;localStorage.user=JSON.stringify(d.user);setToken(d.token);setUser(d.user);flash('Welcome to HostelEase!')}catch(e){setError(e.message)}finally{setBusy(false)}}
function logout(){localStorage.clear();setToken('');setUser(null);setPage('overview')}
async function submitComplaint(e){e.preventDefault();try{const d=await api('/complaints',token,{method:'POST',body:JSON.stringify(draft)});setDraft({title:'',description:''});flash(d.duplicate?'Submitted. A similar open complaint was detected.':'Complaint submitted successfully!');setPage('complaints');load()}catch(e){setError(e.message)}}
async function updateComplaint(e){e.preventDefault();try{await api(`/complaints/${selected._id}`,token,{method:'PATCH',body:JSON.stringify(update)});setSelected(null);flash('Updated. Student has been notified.');load()}catch(e){setError(e.message)}}
async function readNotice(id){await api(id?`/notifications/${id}/read`:'/notifications/read-all',token,{method:'PATCH'});load()}
async function createStaff(e){e.preventDefault();try{await api('/users',token,{method:'POST',body:JSON.stringify(staff)});setStaff({name:'',email:'',password:'',role:'staff',department:''});flash('Team account created.');load()}catch(e){setError(e.message)}}
async function ask(e, customQuestion) {
  if (e) e.preventDefault();

  const message = (customQuestion ?? question).trim();

  if (!message || chatLoading) return;

  setQuestion('');

  setChatMessages(prev => [
    ...prev,
    { role: 'student', text: message }
  ]);

  setChatLoading(true);

  try {
    const d = await api('/support/ask', token, {
      method: 'POST',
      body: JSON.stringify({ question: message })
    });

    setChatMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        text: d.answer || 'Sorry, I could not find an answer.'
      }
    ]);
  } catch (error) {
    setChatMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        text: 'Sorry! Something went wrong. Please try again.'
      }
    ]);
  } finally {
    setChatLoading(false);
  }
}
async function sendFeedback(){try{await api(`/complaints/${selected._id}/feedback`,token,{method:'POST',body:JSON.stringify({rating,comment:feedback})});setSelected(null);flash('Thank you for your feedback!');load()}catch(e){setError(e.message)}}
const nav=[['overview',Home,'Overview'],['complaints',ClipboardList,manager?'All complaints':'My complaints'],['new',PlusCircle,'New complaint'],['notifications',Bell,'Notifications'],...(user?.role==='admin'?[['team',Users,'Team management']]:[]),...(!manager?[['support',MessageCircle,'Student support']]:[])];const unread=notifications.filter(n=>!n.read).length;
if(!token||!user)return <div className="auth"><section className="auth-art"><div className="logo"><span><Building2/></span> HostelEase</div><div className="hero-copy"><small>YOUR HOSTEL. YOUR VOICE.</small><h1>A better hostel experience starts with being heard.</h1><p>One simple place to raise concerns, follow progress and get the support you deserve.</p><div className="pills"><span>✦ Smart complaint routing</span><span>◷ Live status tracking</span><span>♡ Student-first support</span></div></div><small className="foot">HOSTELEEase · STUDENT SUPPORT PLATFORM</small></section><section className="auth-form"><div className="auth-card"><div className="mobile-logo"><Building2/> HostelEase</div><small className="purple">WELCOME {mode==='login'?'BACK':'ABOARD'}</small><h2>{mode==='login'?'Sign in to your space':'Create your student account'}</h2><p className="muted">Access your hostel support dashboard.</p>{error&&<div className="error">{error}</div>}<form onSubmit={authSubmit} className="fields">{mode==='register'&&<><label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></label><div className="two"><label>Room<input value={form.room} onChange={e=>setForm({...form,room:e.target.value})} placeholder="204"/></label><label>Block<input value={form.block} onChange={e=>setForm({...form,block:e.target.value})} placeholder="A"/></label></div></>}<label>Email address<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label><label>Password<input required type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 6 characters"/></label><button className="primary full" disabled={busy}>{busy?'Please wait…':mode==='login'?'Sign in →':'Create account →'}</button></form><p className="switch">{mode==='login'?'New to HostelEase?':'Already have an account?'} <button onClick={()=>{setMode(mode==='login'?'register':'login');setError('')}}>{mode==='login'?'Create account':'Sign in'}</button></p><div className="secure"><ShieldCheck size={15}/> Secure role-based access</div></div></section></div>;
return <div className="shell"><aside className="sidebar"><div className="logo"><span><Building2/></span> HostelEase</div><small className="workspace">WORKSPACE</small><nav>{nav.map(([id,I,label])=><button className={page===id?'nav active':'nav'} key={id} onClick={()=>{setPage(id);setError('')}}><I size={18}/>{label}{id==='notifications'&&unread>0&&<b className="count">{unread}</b>}</button>)}</nav><div className="side-bottom"><div className="help"><Sparkles/><b>Every voice matters.</b><p>Hostel support, made simpler.</p></div><div className="profile"><span className="avatar">{user.name[0]}</span><div><b>{user.name}</b><small>{user.role}{user.room?` · Room ${user.room}`:''}</small></div><button className="logout" onClick={logout}><LogOut size={17}/></button></div></div></aside><main className="main"><header className="topbar"><div><small>HOSTELEEase / <b>{page.toUpperCase()}</b></small><h2>{nav.find(n=>n[0]===page)?.[2]||'Overview'}</h2></div><div className="top-right"><span className="online">● <i>System online</i></span><button className="bell" onClick={()=>setPage('notifications')}><Bell/>{unread>0&&<em/>}</button><span className="avatar">{user.name[0]}</span></div></header><div className="content">{error&&<div className="error">{error}<button onClick={()=>setError('')}>×</button></div>}
{page==='overview'&&<><div className="welcome"><div><small className="purple">YOUR HOSTEL HUB</small><h1>{manager?'Good to see you, ':'Hello, '}{user.name.split(' ')[0]} <span>✦</span></h1><p className="muted">{manager?'Here’s what is happening across your hostel today.':'Your comfort matters. Let’s make your hostel experience better.'}</p></div>{!manager&&<button className="primary" onClick={()=>setPage('new')}><PlusCircle size={17}/> Raise a complaint</button>}</div><div className="stats"><Stat label="Total complaints" value={dashboard?.total??'—'} tone="violet"/><Stat label="Open / pending" value={dashboard?.pending??'—'} tone="orange"/><Stat label="Resolved" value={dashboard?.resolved??'—'} tone="green"/><Stat label="Overdue" value={dashboard?.overdue??'—'} tone="red"/></div><div className="grid"><section className="panel wide"><div className="panel-head"><div><h3>Recent complaints</h3><p>Latest activity from your hostel</p></div><button className="link" onClick={()=>setPage('complaints')}>View all <ChevronRight size={15}/></button></div><Table items={complaints.slice(0,5)} manager={manager} select={c=>{setSelected(c);setUpdate({status:c.status,assignedTo:c.assignedTo?._id||'',note:''})}}/>{!complaints.length&&<Empty text="New complaints will appear here."/>}</section><section className="panel"><h3>Issue overview</h3><p className="muted">Complaints by category</p>{Object.entries(dashboard?.byCategory||{}).map(([k,v])=><div className="cat" key={k}><div><span>{k}</span><b>{v}</b></div><div className="bar"><i style={{width:`${v/Math.max(1,...Object.values(dashboard.byCategory))*100}%`}}/></div></div>)}{!Object.keys(dashboard?.byCategory||{}).length&&<Empty text="Category insights appear when complaints are submitted."/>}</section></div><div className="tip"><Sparkles/><div><b>Need a quick answer?</b><p>Ask the support assistant about Wi-Fi, mess, water or complaint tracking.</p></div><button className="secondary" onClick={()=>setPage('support')}>Ask assistant <ChevronRight size={15}/></button></div></>}
{page==='new'&&<div className="form-grid"><section className="panel form-panel"><div className="panel-head"><div><small className="purple">LET US KNOW</small><h3>Raise a new complaint</h3><p>Share the issue. We’ll help route it to the right team.</p></div><span className="form-icon"><PlusCircle/></span></div><form className="fields" onSubmit={submitComplaint}><label>Complaint title<input required maxLength="100" value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} placeholder="Briefly describe the issue"/></label><label>Describe the issue<textarea required minLength="10" rows="6" value={draft.description} onChange={e=>setDraft({...draft,description:e.target.value})} placeholder="Tell us what happened, where it happened and when…"/></label><div className="ai-hint"><Sparkles/><div><b>Smart assistance is on</b><p>HostelEase suggests a category, priority and department from your description. Management reviews urgent cases.</p></div></div><button className="primary">Submit complaint <Send size={16}/></button></form></section><aside><section className="panel"><h3>What happens next?</h3>{['Your complaint is recorded securely','Smart routing suggests the right team','Warden / staff reviews and updates it','Track every status change here'].map((s,i)=><div className="step"><b>{i+1}</b><span>{s}</span></div>)}</section><div className="urgent"><AlertTriangle/><b>Is this an emergency?</b><p>For immediate danger, contact your warden or hostel security directly. Do not wait for an online response.</p></div></aside></div>}
{page==='complaints'&&<section className="panel"><div className="panel-head"><div><h3>{manager?'Hostel complaint queue':'Your complaints'}</h3><p>{complaints.length} record(s)</p></div><button className="secondary" onClick={load}><RefreshCw size={15}/> Refresh</button></div><Table items={complaints} manager={manager} select={c=>{setSelected(c);setUpdate({status:c.status,assignedTo:c.assignedTo?._id||'',note:''})}}/>{!complaints.length&&<Empty text="Nothing here yet. Submit a complaint to get started."/>}</section>}
{page==='notifications'&&<section className="panel"><div className="panel-head"><div><h3>Notifications</h3><p>Updates from your hostel support team.</p></div><button className="link" onClick={()=>readNotice()}>Mark all as read</button></div>{notifications.map(n=><button className={'notice '+(!n.read?'unread':'')} key={n._id} onClick={()=>{readNotice(n._id);setPage('complaints')}}><span className="notice-icon"><Bell/></span><span><b>{n.title}</b><small>{n.message}</small><time>{new Date(n.createdAt).toLocaleString()}</time></span>{!n.read&&<i/>}</button>)}{!notifications.length&&<Empty text="You’re all caught up. Notifications appear here."/>}</section>}
{page==='support'&&
<div className="ai-chat-page">

  <div className="ai-hero">
    <div className="ai-orb">
      <Sparkles size={32}/>
    </div>

    <span className="ai-label">
      HOSTELEEase INTELLIGENT ASSISTANT
    </span>

    <h1>Your hostel companion.</h1>

    <p>
      Ask anything about hostel facilities, complaints,
      maintenance and student support.
    </p>

    <div className="ai-status">
      <span></span> Assistant ready to help
    </div>
  </div>

  <section className="ai-chat-card">

    <div className="ai-chat-header">
      <div className="ai-avatar">
        <Sparkles size={22}/>
      </div>

      <div>
        <b>HostelEase AI</b>
        <small>Your personal hostel support assistant</small>
      </div>

      <button
        className="clear-chat"
        onClick={() => setChatMessages([])}
      >
        Clear chat
      </button>
    </div>

    <div className="ai-chat-body">

      <div className="ai-message">
        <div className="message-avatar">
          <Sparkles size={17}/>
        </div>

        <div className="message-content">
          <small>HOSTELEEase AI</small>
          <p>
            Hi {user.name.split(' ')[0]}! 👋

            Welcome to your personal hostel assistant.
            I can help you with Wi-Fi, electricity,
            water, food, cleanliness and complaint tracking.

            What would you like to know today?
          </p>
        </div>
      </div>

      {chatMessages.map((msg, index) => (
        <div
          className={
            msg.role === 'student'
              ? 'student-message'
              : 'ai-message'
          }
          key={index}
        >

          {msg.role === 'assistant' && (
            <div className="message-avatar">
              <Sparkles size={17}/>
            </div>
          )}

          <div className="message-content">
            <small>
              {msg.role === 'student' ? 'YOU' : 'HOSTELEEase AI'}
            </small>

            <p>{msg.text}</p>
          </div>

          {msg.role === 'student' && (
            <div className="student-avatar">
              {user.name[0].toUpperCase()}
            </div>
          )}

        </div>
      ))}

      {chatLoading && (
        <div className="ai-message">
          <div className="message-avatar">
            <Sparkles size={17}/>
          </div>

          <div className="message-content">
            <small>HOSTELEEase AI</small>
            <div className="typing">
              <span></span>
              <span></span>
              <span></span>
              <label>Thinking...</label>
            </div>
          </div>
        </div>
      )}

    </div>

    <div className="ai-chat-footer">

      <div className="quick-heading">
        <Sparkles size={14}/>
        TRY ASKING
      </div>

      <div className="ai-quick">
        {[
          'How do I track my complaint?',
          'Wi-Fi is not working',
          'Food quality issue',
          'Water supply problem',
          'How can I contact the warden?'
        ].map((q, index) => (
          <button
            key={index}
            disabled={chatLoading}
            onClick={() => ask(null, q)}
          >
            {q}
          </button>
        ))}
      </div>

      <form className="ai-input-area" onSubmit={ask}>
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ask your hostel assistant anything..."
          disabled={chatLoading}
        />

        <button
          className="ai-send"
          type="submit"
          disabled={chatLoading || !question.trim()}
        >
          <Send size={19}/>
        </button>
      </form>

      <div className="ai-disclaimer">
        <ShieldCheck size={13}/>
        HostelEase student support assistant
      </div>

    </div>

  </section>
</div>
}
{page==='team'&&user.role==='admin'&&<div className="team-grid"><section className="panel"><h3>Add staff / warden</h3><p className="muted">Create an account for a hostel team member.</p><form className="fields" onSubmit={createStaff}><label>Full name<input required value={staff.name} onChange={e=>setStaff({...staff,name:e.target.value})}/></label><label>Email<input required type="email" value={staff.email} onChange={e=>setStaff({...staff,email:e.target.value})}/></label><label>Temporary password<input required minLength="6" value={staff.password} onChange={e=>setStaff({...staff,password:e.target.value})}/></label><label>Role<select value={staff.role} onChange={e=>setStaff({...staff,role:e.target.value})}><option value="staff">Staff / Warden</option><option value="admin">Admin</option></select></label><label>Department<input value={staff.department} onChange={e=>setStaff({...staff,department:e.target.value})} placeholder="Electrical, Mess…"/></label><button className="primary">Create account</button></form></section><section className="panel"><h3>Hostel team</h3><p className="muted">{users.length} registered accounts</p>{users.map(u=><div className="user-row"><span className="avatar">{u.name[0]}</span><div><b>{u.name}</b><small>{u.email} · {u.department||u.role}</small></div><em>{u.role}</em></div>)}</section></div>}
</div></main>
{selected&&<div className="overlay" onClick={()=>setSelected(null)}><section className="modal" onClick={e=>e.stopPropagation()}><div className="panel-head"><div><small className="purple">COMPLAINT DETAILS</small><h3>{selected.title}</h3></div><button className="close" onClick={()=>setSelected(null)}><X/></button></div><div className="detail-tags"><Status status={selected.status}/><span className={'priority '+selected.priority?.toLowerCase()}>{selected.priority} priority</span><small>#{selected._id.slice(-6).toUpperCase()}</small></div><p>{selected.description}</p><div className="details"><div><small>Category</small><b>{selected.category}</b></div><div><small>Department</small><b>{selected.department}</b></div><div><small>Student</small><b>{selected.student?.name||user.name}</b></div><div><small>Room / Block</small><b>{selected.student?.room||user.room||'—'} / {selected.student?.block||user.block||'—'}</b></div></div><h4>Status timeline</h4><div className="timeline">{selected.history?.map(h=><div><b>{h.status}</b><p>{h.note}</p><small>{h.by} · {new Date(h.at).toLocaleString()}</small></div>)}</div>{manager&&<form className="fields" onSubmit={updateComplaint}><h4>Update complaint</h4><label>Status<select value={update.status} onChange={e=>setUpdate({...update,status:e.target.value})}>{['Submitted','Acknowledged','In Progress','On Hold','Resolved','Rejected'].map(s=><option>{s}</option>)}</select></label><label>Assign to<select value={update.assignedTo} onChange={e=>setUpdate({...update,assignedTo:e.target.value})}><option value="">Keep current assignment</option>{users.filter(u=>['staff','admin'].includes(u.role)).map(u=><option value={u.id}>{u.name} · {u.role}</option>)}</select></label><label>Update note<input value={update.note} onChange={e=>setUpdate({...update,note:e.target.value})} placeholder="Add an update for the student"/></label><button className="primary">Save update & notify student</button></form>}{!manager&&selected.status==='Resolved'&&<div className="fields"><h4>Rate the resolution</h4><div className="stars">{[1,2,3,4,5].map(n=><button onClick={()=>setRating(n)}><Star fill={n<=rating?'currentColor':'none'}/></button>)}</div><input value={feedback} onChange={e=>setFeedback(e.target.value)} placeholder="Optional feedback"/><button className="primary" onClick={sendFeedback}>Submit feedback</button></div>}</section></div>}{toast&&<div className="toast"><CheckCircle2/>{toast}</div>}</div>}
function Stat({label,value,tone}){return <div className="stat"><span className={tone}><ClipboardList/></span><div><small>{label}</small><b>{value}</b></div><i>✦</i></div>}
function Status({status}){return <span className={'status '+statusClass(status)}>{status}</span>}
function Table({items,manager,select}){return <div className="table-wrap"><table><thead><tr><th>COMPLAINT</th>{manager&&<th>STUDENT</th>}<th>CATEGORY</th><th>PRIORITY</th><th>STATUS</th><th>DATE</th><th/></tr></thead><tbody>{items.map(c=><tr key={c._id} onClick={()=>select(c)}><td><b>{c.title}</b><small>#{c._id.slice(-6).toUpperCase()}</small></td>{manager&&<td>{c.student?.name||'Student'}<small>Room {c.student?.room||'—'}</small></td>}<td>{c.category}</td><td><span className={'priority '+c.priority?.toLowerCase()}>{c.priority}</span></td><td><Status status={c.status}/></td><td>{new Date(c.createdAt).toLocaleDateString()}</td><td><ChevronRight size={16}/></td></tr>)}</tbody></table></div>}
function Empty({text}){return <div className="empty"><ClipboardList/><b>All clear for now</b><p>{text}</p></div>}
export default App;
