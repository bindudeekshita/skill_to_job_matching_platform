import { useEffect, useMemo, useState } from 'react'
import { api } from './api'
import { BriefcaseBusiness, GraduationCap, LayoutDashboard, LogOut, Search, Settings2, Sparkles, Users, UserRound, Plus, CheckCircle2, ArrowUpRight, MapPin, Clock3, Building2, X, Menu } from 'lucide-react'

const sampleJobs = [
  { id: 'demo-1', title: 'Junior Java Developer', company: 'Northstar Digital', location: 'Hyderabad · Hybrid', jobType: 'Full-time', description: 'Build REST APIs and contribute to Java-based web applications.', requiredSkills: 'java,spring boot,mysql,rest api', eligibility: 'B.Tech / relevant skills', experienceYears: 0 },
  { id: 'demo-2', title: 'Frontend Developer Intern', company: 'PixelCraft Labs', location: 'Remote', jobType: 'Internship', description: 'Create responsive interfaces and collaborate with product designers.', requiredSkills: 'react,javascript,html,css', eligibility: 'Students and freshers', experienceYears: 0 },
  { id: 'demo-3', title: 'Full Stack Engineer — Graduate', company: 'Orbit Systems', location: 'Bengaluru · Hybrid', jobType: 'Full-time', description: 'Work across React interfaces, Spring services and relational databases.', requiredSkills: 'java,react,spring boot,mysql,git', eligibility: 'Graduate / final-year students', experienceYears: 0 },
  { id: 'demo-4', title: 'Software Engineering Trainee', company: 'BluePeak Technologies', location: 'Hyderabad · On-site', jobType: 'Trainee', description: 'Learn engineering practices while delivering features with a product team.', requiredSkills: 'java,sql,git,problem solving', eligibility: 'Entry-level', experienceYears: 0 }
]
const demoUser = { id: 'demo-student', name: 'Deekshita', email: 'demo@skillmatch.local', role: 'STUDENT', education: 'Computer Science and Engineering', skills: 'Java, React, MySQL, HTML, CSS, Spring Boot, Git' }
const parseSkills = s => (s || '').split(/[,;\n]/).map(x => x.trim()).filter(Boolean)
const matchFor = (skills, job) => {
  const mine = new Set(parseSkills(skills).map(s => s.toLowerCase()))
  const req = parseSkills(job.requiredSkills)
  const matched = req.filter(s => mine.has(s.toLowerCase()))
  return { score: req.length ? Math.round(matched.length / req.length * 100) : 0, matched, missing: req.filter(s => !mine.has(s.toLowerCase())) }
}
function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('skillmatch-user')) } catch { return null } })
  const [page, setPage] = useState('Overview')
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [showAuth, setShowAuth] = useState(!user)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', role: 'STUDENT', education: '', company: '' })
  const [profile, setProfile] = useState({ name: user?.name || '', education: user?.education || '', skills: user?.skills || '', resumeUrl: user?.resumeUrl || '' })
  const [jobForm, setJobForm] = useState({ title: '', company: '', location: 'Hyderabad', jobType: 'Full-time', description: '', requiredSkills: '', eligibility: 'Entry-level', experienceYears: 0 })
  const [mobileNav, setMobileNav] = useState(false)

  const isDemo = typeof user?.id === 'string' && user.id.startsWith('demo-')
  const isStudent = user?.role === 'STUDENT'
  const isRecruiter = user?.role === 'RECRUITER'

  async function refresh() {
    try {
      const fetched = await api('/jobs')
      setJobs(fetched.length ? fetched : sampleJobs)
    } catch { setJobs(sampleJobs) }
    if (user && !isDemo) {
      try {
        if (isStudent) {
          const p = await api(`/students/${user.id}`)
          setProfile({ name: p.name || '', education: p.education || '', skills: p.skills || '', resumeUrl: p.resumeUrl || '' })
          setApplications(await api(`/applications/student/${user.id}`))
        } else if (isRecruiter) setApplications(await api(`/applications/recruiter/${user.id}`))
      } catch {}
    }
  }
  useEffect(() => { refresh() }, [user?.id])
  useEffect(() => { if (user) { setShowAuth(false); setProfile({ name: user.name || '', education: user.education || '', skills: user.skills || '', resumeUrl: user.resumeUrl || '' }) } }, [user?.id])

  const recommended = useMemo(() => jobs.map(job => ({ ...job, ...matchFor(profile.skills, job) })).sort((a,b) => b.score - a.score), [jobs, profile.skills])
  const visibleJobs = recommended.filter(j => `${j.title} ${j.company} ${j.requiredSkills} ${j.location}`.toLowerCase().includes(query.toLowerCase()))
  const stats = [
    { label: 'Available opportunities', value: jobs.length, icon: BriefcaseBusiness, note: 'Roles to explore' },
    { label: 'Applications', value: applications.length, icon: CheckCircle2, note: 'Your activity' },
    { label: 'Profile skills', value: parseSkills(profile.skills).length, icon: Sparkles, note: 'Skills listed' }
  ]

  async function authenticate(e) {
    e.preventDefault(); setBusy(true); setNotice('')
    try {
      if (authMode === 'register') {
        const created = await api('/auth/register', { method: 'POST', body: authForm })
        setUser(created); localStorage.setItem('skillmatch-user', JSON.stringify(created)); setShowAuth(false); setNotice('Account created successfully.')
      } else {
        const logged = await api('/auth/login', { method: 'POST', body: { email: authForm.email, password: authForm.password } })
        setUser(logged); localStorage.setItem('skillmatch-user', JSON.stringify(logged)); setShowAuth(false); setNotice(`Welcome back, ${logged.name}.`)
      }
    } catch (err) {
      if (authMode === 'login' && authForm.email === 'demo@skillmatch.local' && authForm.password === 'demo1234') {
        setUser(demoUser); localStorage.setItem('skillmatch-user', JSON.stringify(demoUser)); setShowAuth(false); setNotice('Demo workspace opened. Connect MySQL and backend for persistent accounts.')
      } else setNotice(err.message || 'Could not sign in. Start the backend and try again.')
    } finally { setBusy(false) }
  }
  function logout() { localStorage.removeItem('skillmatch-user'); setUser(null); setShowAuth(true); setPage('Overview'); setNotice('You have been signed out.') }
  async function saveProfile(e) {
    e.preventDefault()
    if (isDemo) { const next = { ...user, ...profile }; setUser(next); localStorage.setItem('skillmatch-user', JSON.stringify(next)); setNotice('Demo profile updated locally.'); return }
    try { const next = await api(`/students/${user.id}`, { method: 'PUT', body: profile }); setUser({ ...user, ...next }); localStorage.setItem('skillmatch-user', JSON.stringify({ ...user, ...next })); setNotice('Profile saved successfully.') }
    catch (err) { setNotice(err.message) }
  }
  async function apply(job) {
    if (isDemo || String(job.id).startsWith('demo-')) { setNotice('Demo mode: connect the backend and use a registered account to submit applications.'); return }
    try { await api('/applications', { method: 'POST', body: { studentId: user.id, jobId: job.id, coverNote: '' } }); setNotice(`Application submitted for ${job.title}.`); refresh() }
    catch (err) { setNotice(err.message) }
  }
  async function createJob(e) {
    e.preventDefault()
    try { await api('/jobs', { method: 'POST', body: { ...jobForm, recruiterId: user.id, company: jobForm.company || user.company || user.name } }); setNotice('Job published successfully.'); setJobForm({ title: '', company: '', location: 'Hyderabad', jobType: 'Full-time', description: '', requiredSkills: '', eligibility: 'Entry-level', experienceYears: 0 }); refresh(); setPage('Jobs') }
    catch (err) { setNotice(err.message) }
  }
  async function changeStatus(id, status) {
    try { await api(`/applications/${id}/status`, { method: 'PATCH', body: { status } }); setNotice(`Application status updated to ${status}.`); refresh() }
    catch (err) { setNotice(err.message) }
  }

  const nav = [
    { label: 'Overview', icon: LayoutDashboard },
    ...(isStudent ? [{ label: 'Find Jobs', icon: Search }, { label: 'My Applications', icon: CheckCircle2 }, { label: 'My Profile', icon: UserRound }] : []),
    ...(isRecruiter ? [{ label: 'Post a Job', icon: Plus }, { label: 'Candidates', icon: Users }] : []),
    ...(!isStudent && !isRecruiter ? [{ label: 'Find Jobs', icon: Search }, { label: 'My Profile', icon: UserRound }] : [])
  ]
  if (showAuth || !user) return <div className="auth-page">
    <div className="auth-art"><div className="brand brand-light"><span className="brand-icon"><Sparkles size={20}/></span> skillmatch</div><div className="auth-message"><span className="eyebrow light-eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h1>Let your skills<br/>open doors.</h1><p>One place to discover opportunities that fit your strengths, build your profile, and move your career forward.</p><div className="auth-proof"><div className="avatar-stack"><span>JD</span><span>SK</span><span>AM</span></div><span>Built for ambitious students and teams.</span></div></div><div className="auth-bottom">A clearer path from skills to opportunity.</div></div>
    <div className="auth-panel"><form className="auth-form" onSubmit={authenticate}><div className="mobile-brand brand"><span className="brand-icon"><Sparkles size={20}/></span> skillmatch</div><span className="eyebrow">{authMode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}</span><h2>{authMode === 'login' ? 'Sign in to SkillMatch' : 'Create your account'}</h2><p className="muted">{authMode === 'login' ? 'Pick up where your career journey left off.' : 'Set up your profile and find your next opportunity.'}</p>
      {authMode === 'register' && <><label>Full name<input required value={authForm.name} onChange={e=>setAuthForm({...authForm,name:e.target.value})} placeholder="Your name"/></label><label>I am joining as<select value={authForm.role} onChange={e=>setAuthForm({...authForm,role:e.target.value})}><option value="STUDENT">Student / Job seeker</option><option value="RECRUITER">Recruiter</option></select></label>{authForm.role==='STUDENT'?<label>Education<input value={authForm.education} onChange={e=>setAuthForm({...authForm,education:e.target.value})} placeholder="e.g. B.Tech CSE"/></label>:<label>Company<input value={authForm.company} onChange={e=>setAuthForm({...authForm,company:e.target.value})} placeholder="Company name"/></label>}</>}
      <label>Email address<input required type="email" value={authForm.email} onChange={e=>setAuthForm({...authForm,email:e.target.value})} placeholder="you@example.com"/></label><label>Password<input required minLength="8" type="password" value={authForm.password} onChange={e=>setAuthForm({...authForm,password:e.target.value})} placeholder="At least 8 characters"/></label>
      <button className="btn primary full" disabled={busy}>{busy?'Please wait…':authMode==='login'?'Sign in':'Create account'} <ArrowUpRight size={17}/></button>
      <p className="auth-switch">{authMode==='login'?'New to SkillMatch?':'Already have an account?'} <button type="button" className="link-button" onClick={()=>{setAuthMode(authMode==='login'?'register':'login');setNotice('')}}>{authMode==='login'?'Create an account':'Sign in'}</button></p>
      {authMode==='login' && <button type="button" className="demo-link" onClick={()=>{setAuthForm({...authForm,email:'demo@skillmatch.local',password:'demo1234'});setUser(demoUser);localStorage.setItem('skillmatch-user',JSON.stringify(demoUser));setShowAuth(false);setNotice('Demo workspace opened.')}}>Explore the demo workspace →</button>}
      {notice && <div className="notice">{notice}</div>}
    </form></div>
  </div>

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?'sidebar-open':''}`}><div className="brand"><span className="brand-icon"><Sparkles size={20}/></span><span>skillmatch</span></div><div className="workspace-label">WORKSPACE</div><nav>{nav.map(n=><button key={n.label} className={`nav-item ${page===n.label?'active':''}`} onClick={()=>{setPage(n.label);setMobileNav(false)}}><n.icon size={18}/><span>{n.label}</span>{n.label==='Find Jobs'&&<span className="nav-count">{jobs.length}</span>}</button>)}</nav><div className="sidebar-bottom"><div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={17}/></div><strong>Your next opportunity</strong><p>Keep your profile up to date to get better matches.</p><button onClick={()=>setPage(isStudent?'My Profile':'Find Jobs')}>Improve your profile <ArrowUpRight size={14}/></button></div><div className="user-mini"><div className="user-avatar">{(user.name||'U').slice(0,1).toUpperCase()}</div><div className="user-mini-info"><strong>{user.name}</strong><span>{isRecruiter?'Recruiter account':'Student account'}</span></div><button className="icon-button" title="Sign out" onClick={logout}><LogOut size={17}/></button></div></div></aside>
    {mobileNav&&<button className="mobile-scrim" onClick={()=>setMobileNav(false)} aria-label="Close navigation"/>}
    <main className="main-area"><header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-button" onClick={()=>setMobileNav(!mobileNav)}><Menu size={20}/></button><div className="breadcrumb">Workspace <span>/</span> <strong>{page}</strong></div></div><div className="topbar-right"><span className="status-dot"/><span className="online-label">Career workspace</span><div className="top-avatar">{(user.name||'U').slice(0,1).toUpperCase()}</div></div></header>
      <div className="page-content">
        {notice && <div className="toast"><span>{notice}</span><button onClick={()=>setNotice('')}><X size={16}/></button></div>}
        {page==='Overview' && <><div className="welcome-row"><div><span className="eyebrow">YOUR CAREER, IN FOCUS</span><h1>Good to see you, {user.name?.split(' ')[0] || 'there'} <span className="wave">✳</span></h1><p className="muted">{isRecruiter?'Manage your open roles and meet promising candidates.':'Your next opportunity could be closer than you think.'}</p></div><button className="btn primary" onClick={()=>setPage(isRecruiter?'Post a Job':'Find Jobs')}>{isRecruiter?'Post a new job':'Explore matching jobs'} <ArrowUpRight size={17}/></button></div>
          <div className="stats-grid">{stats.map(s=><div className="stat-card" key={s.label}><div className="stat-top"><span>{s.label}</span><span className="stat-icon"><s.icon size={18}/></span></div><div className="stat-number">{s.value}</div><div className="stat-note">{s.note}</div></div>)}</div>
          <div className="section-heading"><div><h2>{isRecruiter?'Recently posted opportunities':'Recommended for your skills'}</h2><p className="muted">{isRecruiter?'Your latest job openings.':'Roles ranked by your current skill profile.'}</p></div><button className="text-action" onClick={()=>setPage(isRecruiter?'Candidates':'Find Jobs')}>View all <ArrowUpRight size={15}/></button></div>
          <div className="job-grid">{(isRecruiter?jobs:recommended).slice(0,3).map(j=><JobCard key={j.id} job={j} onApply={()=>apply(j)} isStudent={isStudent}/>)}</div>
          <div className="tip-banner"><div className="tip-symbol"><Sparkles size={20}/></div><div><strong>A little profile polish goes a long way.</strong><p>Add the skills you use most often so your matches become more relevant.</p></div><button onClick={()=>setPage('My Profile')}>Update profile <ArrowUpRight size={15}/></button></div>
        </>}
        {page==='Find Jobs' && <><div className="page-title"><span className="eyebrow">OPPORTUNITY DISCOVERY</span><h1>Find your next role</h1><p className="muted">Explore roles and see how your skills line up with each opportunity.</p></div><div className="search-row"><div className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search roles, companies, or skills…"/></div><span className="results-count">{visibleJobs.length} opportunities</span></div><div className="job-list">{visibleJobs.map(j=><JobCard key={j.id} job={j} onApply={()=>apply(j)} isStudent={isStudent} detailed/>)}</div></>}
        {page==='My Profile' && <><div className="page-title"><span className="eyebrow">YOUR PROFESSIONAL STORY</span><h1>My profile</h1><p className="muted">Help employers understand what you bring to the table.</p></div><form className="profile-layout" onSubmit={saveProfile}><div className="profile-card"><div className="profile-cover"/><div className="profile-person"><div className="profile-avatar">{(profile.name||'U').slice(0,1).toUpperCase()}</div><h2>{profile.name||user.name}</h2><p>{profile.education||'Add your education'}</p><span className="pill">Student profile</span></div><div className="profile-completion"><div><span>Profile skills</span><strong>{parseSkills(profile.skills).length} listed</strong></div><div className="progress-track"><div style={{width:`${Math.min(100,parseSkills(profile.skills).length*12)}%`}}/></div><p>Specific skills help us calculate more useful job matches.</p></div></div><div className="form-card"><h2>Profile details</h2><p className="muted">Keep your information current.</p><label>Full name<input required value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})}/></label><label>Education<input value={profile.education} onChange={e=>setProfile({...profile,education:e.target.value})} placeholder="e.g. B.Tech in Computer Science"/></label><label>Skills <span className="label-hint">Separate each skill with a comma</span><textarea rows="4" value={profile.skills} onChange={e=>setProfile({...profile,skills:e.target.value})} placeholder="Java, React, SQL, Spring Boot…"/></label><label>Resume link <span className="label-hint">Optional public link</span><input value={profile.resumeUrl} onChange={e=>setProfile({...profile,resumeUrl:e.target.value})} placeholder="https://…"/></label><div className="form-actions"><button className="btn primary">Save changes <CheckCircle2 size={16}/></button></div></div></form></>}
        {page==='My Applications' && <><div className="page-title"><span className="eyebrow">YOUR JOB SEARCH</span><h1>My applications</h1><p className="muted">Track your progress from application to decision.</p></div>{applications.length===0?<EmptyState title="Your story starts with an application" text="Explore matching roles and apply when you find a good fit." action="Find jobs" onAction={()=>setPage('Find Jobs')}/>:<div className="application-list">{applications.map((a,i)=>{const app=a.application||a;const job=a.job||jobs.find(j=>j.id===app.jobId);return <div className="application-row" key={app.id||i}><div className="company-mark"><Building2 size={19}/></div><div className="application-main"><strong>{job?.title||`Job #${app.jobId}`}</strong><span>{job?.company||'Company'} · {app.appliedAt?new Date(app.appliedAt).toLocaleDateString():'Recently'}</span></div><span className={`status-pill ${(app.status||'APPLIED').toLowerCase()}`}>{app.status||'APPLIED'}</span></div>})}</div>}</>}
        {page==='Post a Job' && <><div className="page-title"><span className="eyebrow">RECRUITER WORKSPACE</span><h1>Post an opportunity</h1><p className="muted">Describe the role and the skills candidates will need.</p></div><form className="form-card job-form" onSubmit={createJob}><div className="form-grid"><label>Job title<input required value={jobForm.title} onChange={e=>setJobForm({...jobForm,title:e.target.value})} placeholder="e.g. Junior Java Developer"/></label><label>Company<input value={jobForm.company} onChange={e=>setJobForm({...jobForm,company:e.target.value})} placeholder={user.company||'Company name'}/></label><label>Location<input value={jobForm.location} onChange={e=>setJobForm({...jobForm,location:e.target.value})} placeholder="Remote / Hyderabad"/></label><label>Employment type<select value={jobForm.jobType} onChange={e=>setJobForm({...jobForm,jobType:e.target.value})}><option>Full-time</option><option>Internship</option><option>Trainee</option><option>Contract</option></select></label><label>Required skills <span className="label-hint">Comma-separated</span><input required value={jobForm.requiredSkills} onChange={e=>setJobForm({...jobForm,requiredSkills:e.target.value})} placeholder="Java, Spring Boot, MySQL"/></label><label>Minimum experience (years)<input type="number" min="0" value={jobForm.experienceYears} onChange={e=>setJobForm({...jobForm,experienceYears:Number(e.target.value)})}/></label></div><label>Eligibility<input value={jobForm.eligibility} onChange={e=>setJobForm({...jobForm,eligibility:e.target.value})} placeholder="e.g. B.Tech / entry-level"/></label><label>Role description<textarea required rows="5" value={jobForm.description} onChange={e=>setJobForm({...jobForm,description:e.target.value})} placeholder="Responsibilities, team, and what success looks like…"/></label><div className="form-actions"><button className="btn primary">Publish job <ArrowUpRight size={16}/></button></div></form></>}
        {page==='Candidates' && <><div className="page-title"><span className="eyebrow">RECRUITER WORKSPACE</span><h1>Candidate applications</h1><p className="muted">Review applicants and keep the hiring process moving.</p></div>{applications.length===0?<EmptyState title="No applications yet" text="When candidates apply to your jobs, they will appear here." action="Post a job" onAction={()=>setPage('Post a Job')}/>:<div className="candidate-list">{applications.map((a,i)=>{const app=a.application||a;const job=a.job;const candidate=a.student||{};return <div className="candidate-row" key={app.id||i}><div className="user-avatar">{(candidate.name||'C').slice(0,1)}</div><div className="candidate-info"><strong>{candidate.name||`Candidate #${app.studentId}`}</strong><span>{candidate.email||'Candidate'} · {job?.title||`Job #${app.jobId}`}</span><small>Skills: {candidate.skills||'Not provided'}</small></div><select value={app.status||'APPLIED'} onChange={e=>changeStatus(app.id,e.target.value)}>{['APPLIED','SHORTLISTED','INTERVIEW','SELECTED','REJECTED'].map(s=><option key={s}>{s}</option>)}</select></div>})}</div>}</>}
      </div><footer className="footer"><span>© 2026 SkillMatch</span><span>Built around skills. Designed for opportunity.</span></footer>
    </main>
  </div>
}
function JobCard({job,onApply,isStudent,detailed=false}) {
  const skills = parseSkills(job.requiredSkills)
  const score = job.score ?? 0
  return <article className={`job-card ${detailed?'job-card-detailed':''}`}><div className="job-card-top"><div className="company-mark"><Building2 size={20}/></div><div className="job-heading"><h3>{job.title}</h3><span>{job.company||'Growing company'}</span></div>{detailed&&<span className={`match-badge ${score>=70?'high':''}`}>{score}% match</span>}</div><div className="job-meta"><span><MapPin size={14}/>{job.location||'Location flexible'}</span><span><Clock3 size={14}/>{job.jobType||'Full-time'}</span></div><p className="job-description">{job.description}</p><div className="skill-tags">{skills.slice(0,5).map(s=><span className={`skill-tag ${job.matched?.some(m=>m.toLowerCase()===s.toLowerCase())?'matched':''}`} key={s}>{s}</span>)}</div>{detailed&&<div className="match-details"><div className="match-track"><div style={{width:`${score}%`}}/></div><span>{job.matched?.length||0} skills match · {job.missing?.length||0} to develop</span></div>}<div className="job-card-bottom"><span className="eligibility">{job.eligibility||'Entry-level friendly'}</span>{isStudent&&<button className="btn small-btn" onClick={onApply}>Apply now <ArrowUpRight size={15}/></button>}</div></article>
}
function EmptyState({title,text,action,onAction}) { return <div className="empty-state"><div className="empty-icon"><BriefcaseBusiness size={24}/></div><h3>{title}</h3><p>{text}</p><button className="btn primary" onClick={onAction}>{action} <ArrowUpRight size={16}/></button></div> }
export default App