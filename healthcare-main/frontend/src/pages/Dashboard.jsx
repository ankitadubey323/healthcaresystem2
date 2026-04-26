import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useChat } from '../context/ChatContext'
import { useNavigate } from 'react-router-dom'
import { uploadDocument, updateProfile, uploadProfilePhoto } from '../utils/api'
import NewsSection from '../components/NewsSection'
import RateChart from '../components/RateChart'
import HospitalList from '../components/HospitalList'
import DocumentVault from '../components/DocumentVault'
import WaterIntake from '../components/WaterIntake'
import HealthFeatures from '../components/HealthFeatures'
import MedicineTracker from '../components/MedicineTracker'

const D = {
  bg:           '#0A0F1E',
  surface:      '#111827',
  surfaceAlt:   '#1A2236',
  surfaceBorder:'#1E2D45',
  header:       '#0D1526',
  blue:         '#2563EB',
  blueLight:    '#3B82F6',
  blueDim:      '#1D3461',
  accent:       '#38BDF8',
  text:         '#F1F5F9',
  textSub:      '#94A3B8',
  textMuted:    '#475569',
  border:       'rgba(255,255,255,0.07)',
  borderBlue:   'rgba(37,99,235,0.3)',
  success:      '#10B981',
  error:        '#EF4444',
  shadow:       '0 1px 3px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3)',
  shadowMd:     '0 4px 16px rgba(0,0,0,0.5)',
  shadowLg:     '0 8px 32px rgba(0,0,0,0.6)',
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background:D.surface, borderRadius:'14px', padding:'18px', border:`1px solid ${D.border}`, boxShadow:D.shadow, ...style }}>
      {children}
    </div>
  )
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'16px' }}>
      <div>
        <p style={{ margin:0, fontSize:'10px', fontWeight:'700', letterSpacing:'0.12em', textTransform:'uppercase', color:D.accent }}>{subtitle}</p>
        <h2 style={{ margin:'4px 0 0', fontSize:'17px', fontWeight:'700', color:D.text, letterSpacing:'-0.2px' }}>{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { user, logout, setUser } = useAuth()
  const { t, themeName, toggleTheme } = useTheme()
  const { toggleChat } = useChat()
  const navigate = useNavigate()
  const isDesktop = false
  const isLight = themeName === 'light'

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h >= 5 && h < 12) return 'Good Morning'
    if (h >= 12 && h < 17) return 'Good Afternoon'
    if (h >= 17 && h < 21) return 'Good Evening'
    return 'Good Night'
  }

  const [showProfileMenu, setShowProfileMenu]         = useState(false)
  const [showPhotoOptions, setShowPhotoOptions]       = useState(false)
  const [showWaterPopup, setShowWaterPopup]           = useState(false)
  const [activeTab, setActiveTab]                     = useState('home')
  const [showNewsSection, setShowNewsSection]         = useState(false)
  const [showUploadMenu, setShowUploadMenu]           = useState(false)
  const [showProfileSettings, setShowProfileSettings] = useState(false)
  const [showMedicineTracker, setShowMedicineTracker] = useState(false)
  const [profileSaving, setProfileSaving]             = useState(false)
  const [profileMessage, setProfileMessage]           = useState('')
  const [profileError, setProfileError]               = useState('')
  const [profileForm, setProfileForm]                 = useState({ name:'',phone:'',city:'',state:'',age:'',weight:'',height:'' })
  const [notifications, setNotifications]             = useState(3)
  const [docRefreshKey, setDocRefreshKey]             = useState(0)
  const fileInputRef   = useRef(null)
  const cameraInputRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowWaterPopup(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  const handleLogout = () => { logout(); navigate('/') }
  const avatarLetter = user?.name?.[0]?.toUpperCase() || 'U'

  useEffect(() => {
    if (!user) return
    setProfileForm({ name:user.name||'', phone:user.phone||'', city:user.city||'', state:user.state||'', age:user.age||'', weight:user.weight||'', height:user.height||'' })
  }, [user])

  const Avatar = ({ size = 40 }) => (
    user?.profilePhoto
      ? <img src={user.profilePhoto} alt={user.name} style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', border:`2px solid ${D.blue}` }} />
      : <div style={{ width:size, height:size, borderRadius:'50%', background:`linear-gradient(135deg, ${D.blue}, ${D.accent})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.38, fontWeight:'800', color:'#fff', flexShrink:0 }}>{avatarLetter}</div>
  )

  const handleUploadFile = async (file) => {
    if (!file) return
    try { const fd=new FormData(); fd.append('document',file); await uploadDocument(fd); setDocRefreshKey(k=>k+1) }
    catch(err) { console.error('Upload failed',err) }
    finally { setShowUploadMenu(false) }
  }
  const onSelectUploadFile = async (e) => { const f=e.target.files?.[0]; if(f) await handleUploadFile(f); e.target.value='' }
  const handleProfileInput = (field,value) => setProfileForm(p=>({...p,[field]:value}))

  const handleSaveProfile = async (e) => {
    e.preventDefault(); setProfileSaving(true); setProfileError(''); setProfileMessage('')
    try {
      const {data} = await updateProfile(profileForm)
      setUser(data.user); localStorage.setItem('user',JSON.stringify(data.user))
      setProfileMessage('Details updated.'); setShowProfileSettings(false)
    } catch(err) { setProfileError(err?.response?.data?.message||err.message||'Unable to save') }
    finally { setProfileSaving(false) }
  }

  const handleChangePhoto = () => { setShowProfileMenu(false); setShowPhotoOptions(true) }

  const handlePhotoSelected = async (e) => {
    const file=e.target.files?.[0]; if(!file) return
    setShowPhotoOptions(false); setProfileError(''); setProfileMessage('')
    try {
      const fd=new FormData(); fd.append('profilePhoto',file)
      const {data}=await uploadProfilePhoto(fd)
      setUser(data.user); localStorage.setItem('user',JSON.stringify(data.user))
      setProfileMessage('Photo updated.')
    } catch(err) { setProfileError(err?.response?.data?.message||'Failed') }
    finally { e.target.value='' }
  }

  const handleRemovePhoto = async () => {
    setShowProfileMenu(false); setShowPhotoOptions(false); setProfileError(''); setProfileMessage('')
    try {
      const {data}=await updateProfile({removePhoto:'true'})
      setUser(data.user); localStorage.setItem('user',JSON.stringify(data.user))
      setProfileMessage('Photo removed.')
    } catch(err) { setProfileError(err?.response?.data?.message||'Failed') }
  }

  const inp = { padding:'10px 12px', borderRadius:'10px', border:`1px solid ${D.surfaceBorder}`, background:D.surfaceAlt, color:D.text, fontSize:'13px', outline:'none', fontFamily:'inherit', width:'100%' }
  const primaryBtn = { padding:'10px 20px', borderRadius:'10px', border:'none', background:D.blue, color:'#fff', fontWeight:'700', cursor:'pointer', fontFamily:'inherit', fontSize:'13px' }
  const ghostBtn   = { padding:'10px 20px', borderRadius:'10px', border:`1px solid ${D.surfaceBorder}`, background:'none', color:D.textSub, fontWeight:'600', cursor:'pointer', fontFamily:'inherit', fontSize:'13px' }

  function DropBtn({ children, onClick, danger }) {
    return (
      <button onClick={onClick}
        style={{ display:'flex', alignItems:'center', gap:'8px', width:'100%', padding:'10px 12px', borderRadius:'10px', border:'none', background:'none', cursor:'pointer', fontSize:'13px', fontWeight:'600', color:danger?D.error:D.text, textAlign:'left', fontFamily:'inherit' }}
        onMouseEnter={e=>e.currentTarget.style.background=danger?'rgba(239,68,68,0.08)':D.surfaceAlt}
        onMouseLeave={e=>e.currentTarget.style.background='none'}
      >{children}</button>
    )
  }

  const ActionRow = () => (
    <div style={{ display:'flex', gap:'10px' }}>
      <button onClick={e=>{e.stopPropagation();setShowNewsSection(v=>!v);setShowUploadMenu(false)}}
        style={{ flex:1, padding:'16px 6px', borderRadius:'12px', border:`1px solid ${showNewsSection?D.blue:D.border}`, cursor:'pointer', background:showNewsSection?D.blueDim:D.surfaceAlt, display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', transition:'all 0.15s ease' }}>
        <span style={{fontSize:'22px'}}>📰</span>
        <span style={{fontSize:'11px',fontWeight:'700',color:showNewsSection?D.accent:D.text}}>News</span>
        <span style={{fontSize:'10px',color:D.textMuted}}>Health</span>
      </button>

      <button onClick={e=>{e.stopPropagation();setShowMedicineTracker(true);setShowUploadMenu(false);setShowNewsSection(false)}}
        style={{ flex:1, padding:'16px 6px', borderRadius:'12px', border:`1px solid ${D.borderBlue}`, cursor:'pointer', background:`linear-gradient(145deg, ${D.blueDim}, #0F1E38)`, display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', transition:'all 0.15s ease', position:'relative', overflow:'hidden' }}>
        <span style={{position:'absolute',top:'7px',right:'7px',width:'6px',height:'6px',borderRadius:'50%',background:D.success,boxShadow:`0 0 6px ${D.success}`}} />
        <span style={{fontSize:'22px'}}>💊</span>
        <span style={{fontSize:'11px',fontWeight:'700',color:D.accent}}>Medicines</span>
        <span style={{fontSize:'10px',color:D.textMuted}}>Doses</span>
      </button>

      <div style={{flex:1,position:'relative'}}>
        <button onClick={e=>{e.stopPropagation();setShowUploadMenu(v=>!v);setShowNewsSection(false)}}
          style={{ width:'100%', padding:'16px 6px', borderRadius:'12px', border:`1px solid ${showUploadMenu?D.blue:D.border}`, cursor:'pointer', background:showUploadMenu?D.blueDim:D.surfaceAlt, display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', transition:'all 0.15s ease' }}>
          <span style={{fontSize:'22px'}}>📁</span>
          <span style={{fontSize:'11px',fontWeight:'700',color:showUploadMenu?D.accent:D.text}}>Upload</span>
          <span style={{fontSize:'10px',color:D.textMuted}}>Docs</span>
        </button>
        {showUploadMenu && (
          <div onClick={e=>e.stopPropagation()} style={{ position:'absolute', top:'calc(100% + 8px)', right:0, left:0, background:D.surface, borderRadius:'12px', boxShadow:D.shadowMd, padding:'6px', zIndex:200, border:`1px solid ${D.border}` }}>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{display:'none'}} onChange={onSelectUploadFile} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={onSelectUploadFile} />
            {[{icon:'📄',label:'Upload File',sub:'PDF, images',ref:fileInputRef},{icon:'📷',label:'Take Photo',sub:'Camera',ref:cameraInputRef}].map((opt,i)=>(
              <button key={i} onClick={()=>opt.ref.current?.click()}
                style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'10px', borderRadius:'8px', border:'none', background:'none', cursor:'pointer', fontFamily:'inherit', marginBottom:i===0?'2px':0 }}
                onMouseEnter={e=>e.currentTarget.style.background=D.surfaceAlt}
                onMouseLeave={e=>e.currentTarget.style.background='none'}>
                <span style={{fontSize:'18px'}}>{opt.icon}</span>
                <div>
                  <div style={{fontWeight:'600',fontSize:'12px',color:D.text}}>{opt.label}</div>
                  <div style={{fontSize:'10px',color:D.textMuted}}>{opt.sub}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const ProfileSettingsModal = () => (
    <div onClick={()=>setShowProfileSettings(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:500,padding:'18px'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:'480px',background:D.surface,borderRadius:'18px',padding:'24px',boxShadow:D.shadowLg,border:`1px solid ${D.border}`}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
          <div>
            <h2 style={{margin:0,fontSize:'18px',fontWeight:'700',color:D.text}}>Edit your details</h2>
            <p style={{margin:'4px 0 0',color:D.textSub,fontSize:'12px'}}>Update your profile information</p>
          </div>
          <button onClick={()=>setShowProfileSettings(false)} style={{border:'none',background:D.surfaceAlt,cursor:'pointer',fontSize:'15px',color:D.textMuted,width:'32px',height:'32px',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
        </div>
        <form onSubmit={handleSaveProfile} style={{display:'grid',gap:'12px'}}>
          {profileError && <div style={{color:D.error,fontSize:'12px',padding:'10px 12px',background:'rgba(239,68,68,0.1)',borderRadius:'8px',border:'1px solid rgba(239,68,68,0.2)'}}>{profileError}</div>}
          {profileMessage && <div style={{color:D.success,fontSize:'12px',padding:'10px 12px',background:'rgba(16,185,129,0.1)',borderRadius:'8px',border:'1px solid rgba(16,185,129,0.2)'}}>{profileMessage}</div>}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            {[['Full name','name'],['Phone','phone'],['City','city'],['State','state']].map(([label,field])=>(
              <label key={field} style={{display:'grid',gap:'5px',fontSize:'11px',color:D.textSub,fontWeight:'600'}}>
                {label}<input value={profileForm[field]} onChange={e=>handleProfileInput(field,e.target.value)} style={inp} />
              </label>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px'}}>
            {[['Age','age'],['Weight','weight'],['Height','height']].map(([label,field])=>(
              <label key={field} style={{display:'grid',gap:'5px',fontSize:'11px',color:D.textSub,fontWeight:'600'}}>
                {label}<input value={profileForm[field]} onChange={e=>handleProfileInput(field,e.target.value)} style={inp} />
              </label>
            ))}
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:'8px',marginTop:'4px'}}>
            <button type="button" onClick={()=>setShowProfileSettings(false)} style={ghostBtn}>Cancel</button>
            <button type="submit" disabled={profileSaving} style={primaryBtn}>{profileSaving?'Saving...':'Save changes'}</button>
          </div>
        </form>
      </div>
    </div>
  )

  const PhotoOptionsMenu = () => (
    <div onClick={()=>setShowPhotoOptions(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(6px)',display:'flex',alignItems:'flex-end',justifyContent:'center',zIndex:600}}>
      <div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:'520px',background:D.surface,borderRadius:'18px 18px 0 0',padding:'22px 18px 36px',boxShadow:D.shadowLg,border:`1px solid ${D.border}`}}>
        <div style={{width:'36px',height:'4px',borderRadius:'2px',background:D.surfaceBorder,margin:'0 auto 18px'}} />
        <h3 style={{margin:'0 0 16px',fontSize:'17px',fontWeight:'700',color:D.text,textAlign:'center'}}>Change Profile Photo</h3>
        {[{id:'cam-in',icon:'📷',label:'Take Photo',sub:'Open camera'},{id:'gal-in',icon:'🖼️',label:'Choose from Gallery',sub:'Pick from photos'}].map(opt=>(
          <label key={opt.id} htmlFor={opt.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 14px',borderRadius:'12px',background:D.surfaceAlt,cursor:'pointer',marginBottom:'8px',border:`1px solid ${D.border}`}}>
            <span style={{width:'40px',height:'40px',borderRadius:'10px',background:`linear-gradient(135deg,${D.blue},${D.accent})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',flexShrink:0}}>{opt.icon}</span>
            <div>
              <div style={{fontWeight:'700',fontSize:'13px',color:D.text}}>{opt.label}</div>
              <div style={{fontSize:'11px',color:D.textMuted}}>{opt.sub}</div>
            </div>
          </label>
        ))}
        <input id="cam-in" type="file" accept="image/*" capture="user" style={{display:'none'}} onChange={handlePhotoSelected} />
        <input id="gal-in" type="file" accept="image/*" style={{display:'none'}} onChange={handlePhotoSelected} />
        {user?.profilePhoto && (
          <button onClick={handleRemovePhoto} style={{display:'flex',alignItems:'center',gap:'12px',width:'100%',padding:'12px 14px',borderRadius:'12px',border:'1px solid rgba(239,68,68,0.2)',background:'rgba(239,68,68,0.07)',cursor:'pointer',marginBottom:'8px',fontFamily:'inherit'}}>
            <span style={{width:'40px',height:'40px',borderRadius:'10px',background:'linear-gradient(135deg,#f6546a,#e53e3e)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',flexShrink:0}}>🗑️</span>
            <div style={{fontWeight:'700',fontSize:'13px',color:D.error,textAlign:'left'}}>Remove Photo</div>
          </button>
        )}
        <button onClick={()=>setShowPhotoOptions(false)} style={{width:'100%',marginTop:'6px',padding:'12px',borderRadius:'10px',border:`1px solid ${D.border}`,background:'none',cursor:'pointer',fontSize:'13px',fontWeight:'600',color:D.textSub,fontFamily:'inherit'}}>Cancel</button>
      </div>
    </div>
  )

  const UserCard = () => (
    <div style={{background:'linear-gradient(135deg, #0D1F3C, #1A2F56)',borderRadius:'14px',padding:'18px',position:'relative',overflow:'hidden',border:`1px solid ${D.borderBlue}`}}>
      <div style={{position:'absolute',top:'-25px',right:'-25px',width:'100px',height:'100px',borderRadius:'50%',background:D.blue,opacity:0.15}} />
      <div style={{position:'absolute',bottom:'-30px',left:'40%',width:'80px',height:'80px',borderRadius:'50%',background:D.accent,opacity:0.07}} />
      <div style={{display:'flex',alignItems:'center',gap:'12px',position:'relative'}}>
        <div style={{position:'relative'}}>
          <Avatar size={52} />
          <div style={{position:'absolute',bottom:1,right:1,width:'11px',height:'11px',borderRadius:'50%',background:D.success,border:'2px solid #0D1F3C'}} />
        </div>
        <div>
          <p style={{color:'rgba(255,255,255,0.4)',fontSize:'10px',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',margin:0}}>My Profile</p>
          <p style={{color:D.text,fontSize:'16px',fontWeight:'700',margin:'4px 0 0'}}>{user?.name||'User'}</p>
          <p style={{color:'rgba(255,255,255,0.45)',fontSize:'12px',margin:'4px 0 0'}}>📍 {[user?.city,user?.state].filter(Boolean).join(', ')||'Location not set'}</p>
          {user?.age && <p style={{color:'rgba(255,255,255,0.35)',fontSize:'11px',margin:'4px 0 0'}}>Age: {user.age}{user?.bmi?`  •  BMI: ${user.bmi}`:''}</p>}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:D.bg,display:'flex',justifyContent:'center'}}>
      <div style={{width:'100%',maxWidth:'520px',minHeight:'100vh',background:D.bg,position:'relative',paddingBottom:'80px'}}
        onClick={()=>{setShowProfileMenu(false);setShowUploadMenu(false)}}>

        {/* Header */}
        <div style={{padding:'13px 16px',background:D.header,borderBottom:`1px solid ${D.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100,boxShadow:'0 2px 12px rgba(0,0,0,0.4)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',position:'relative'}}>
            <div onClick={e=>{e.stopPropagation();setShowProfileMenu(v=>!v)}} style={{position:'relative',cursor:'pointer'}}>
              <Avatar size={38} />
              <div style={{position:'absolute',bottom:1,right:1,width:'9px',height:'9px',borderRadius:'50%',background:D.success,border:`2px solid ${D.header}`}} />
            </div>
            <div>
              <p style={{fontSize:'10px',color:D.textMuted,fontWeight:'600',margin:0}}>{getGreeting()} 👋</p>
              <p style={{fontSize:'14px',fontWeight:'700',color:D.text,margin:0}}>{user?.name||'User'}</p>
            </div>
            {showProfileMenu && (
              <div style={{position:'absolute',top:'50px',left:0,background:D.surface,borderRadius:'14px',boxShadow:D.shadowMd,padding:'6px',minWidth:'185px',zIndex:200,border:`1px solid ${D.border}`}}>
                <DropBtn onClick={()=>{setShowProfileMenu(false);setShowProfileSettings(true)}}>✏️  Edit your details</DropBtn>
                <DropBtn onClick={handleChangePhoto}>🖼️  Change photo</DropBtn>
                {user?.profilePhoto && <DropBtn onClick={handleRemovePhoto} danger>🗑️  Remove photo</DropBtn>}
                <div style={{height:'1px',background:D.border,margin:'4px 0'}} />
                <DropBtn onClick={handleLogout} danger>🚪  Logout</DropBtn>
              </div>
            )}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <button onClick={e=>{e.stopPropagation();toggleTheme()}} style={{width:'34px',height:'34px',borderRadius:'9px',background:D.surfaceAlt,border:`1px solid ${D.border}`,cursor:'pointer',fontSize:'15px',display:'flex',alignItems:'center',justifyContent:'center'}}>{isLight?'🌙':'☀️'}</button>
            <div onClick={e=>{e.stopPropagation();setNotifications(0)}} style={{position:'relative',cursor:'pointer'}}>
              <div style={{width:'34px',height:'34px',borderRadius:'9px',background:D.surfaceAlt,border:`1px solid ${D.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>🔔</div>
              {notifications>0 && <div style={{position:'absolute',top:'-3px',right:'-3px',background:D.blue,color:'#fff',borderRadius:'50%',width:'15px',height:'15px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:'700',border:`2px solid ${D.header}`}}>{notifications}</div>}
            </div>
          </div>
        </div>

        {/* Hero */}
        <div style={{margin:'14px 14px 0',background:'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 60%, #2563EB 100%)',borderRadius:'16px',padding:'20px',position:'relative',overflow:'hidden',border:'1px solid rgba(59,130,246,0.3)'}}>
          <div style={{position:'absolute',top:'-30px',right:'-30px',width:'130px',height:'130px',borderRadius:'50%',background:'rgba(255,255,255,0.06)'}} />
          <div style={{position:'absolute',bottom:'-20px',right:'80px',width:'80px',height:'80px',borderRadius:'50%',background:'rgba(255,255,255,0.04)'}} />
          <div style={{position:'absolute',right:'20px',top:'50%',transform:'translateY(-50%)',fontSize:'52px',opacity:0.18}}>🩺</div>
          <div style={{position:'relative'}}>
            <p style={{margin:0,fontSize:'10px',color:'rgba(255,255,255,0.6)',fontWeight:'700',letterSpacing:'0.12em',textTransform:'uppercase'}}>Health AI Platform</p>
            <h1 style={{margin:'6px 0 4px',fontSize:'20px',fontWeight:'800',color:'#fff',letterSpacing:'-0.4px'}}>{getGreeting()}, {user?.name?.split(' ')[0]||'User'} 👋</h1>
            <p style={{margin:0,fontSize:'12px',color:'rgba(255,255,255,0.65)'}}>Stay on top of your health today</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{padding:'14px 14px 0'}}>
          <p style={{margin:'0 0 10px',fontSize:'10px',fontWeight:'700',color:D.textMuted,letterSpacing:'0.1em',textTransform:'uppercase'}}>Quick Actions</p>
          <ActionRow />
        </div>

        {/* Rate Chart */}
        <div style={{padding:'14px 14px 0'}}>
          <Card><SectionHeader title="India birth vs death rate" subtitle="Vital rates" /><RateChart /></Card>
        </div>

        {/* News */}
        {showNewsSection && (
          <div style={{padding:'14px 14px 0'}}>
            <Card>
              <SectionHeader title="Health updates" subtitle="Insights"
                action={<button onClick={()=>setShowNewsSection(false)} style={{border:`1px solid ${D.border}`,background:D.surfaceAlt,cursor:'pointer',borderRadius:'8px',padding:'5px 10px',fontSize:'13px',color:D.textMuted}}>✕</button>}
              />
              <NewsSection />
            </Card>
          </div>
        )}

        {/* User Card */}
        <div style={{padding:'14px 14px 0'}}><UserCard /></div>

        {/* Water */}
        <div style={{padding:'14px 14px 0'}}><WaterIntake /></div>

        {/* Health Features */}
        <div style={{padding:'14px 14px 0'}}>
          <Card><SectionHeader title="Health features" subtitle="Wellness" /><HealthFeatures /></Card>
        </div>

        {/* Hospitals */}
        <div style={{padding:'14px 14px 0'}}>
          <Card><HospitalList /></Card>
        </div>

        {/* Documents */}
        <div style={{padding:'14px 14px 28px'}}>
          <Card><DocumentVault refreshKey={docRefreshKey} /></Card>
        </div>

        {/* Bottom Nav */}
        <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'520px',background:D.header,borderTop:`1px solid ${D.border}`,padding:'10px 8px 20px',display:'flex',justifyContent:'space-around',alignItems:'center',zIndex:150,boxShadow:'0 -4px 20px rgba(0,0,0,0.4)'}}>
          {[{id:'home',icon:'🏠',label:'Home'},{id:'health',icon:'❤️',label:'Health'},{id:'hospitals',icon:'🏥',label:'Hospitals'},{id:'profile',icon:'👤',label:'Profile'}].map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
              style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',border:'none',cursor:'pointer',padding:'8px 14px',borderRadius:'10px',fontFamily:'inherit',background:activeTab===tab.id?D.blueDim:'none',transition:'all 0.15s ease'}}>
              <span style={{fontSize:'20px',lineHeight:1}}>{tab.icon}</span>
              <span style={{fontSize:'10px',fontWeight:activeTab===tab.id?'700':'500',color:activeTab===tab.id?D.accent:D.textMuted}}>{tab.label}</span>
              {activeTab===tab.id && <div style={{width:'4px',height:'4px',borderRadius:'50%',background:D.accent,marginTop:'-2px'}} />}
            </button>
          ))}
        </div>

        {showProfileSettings && <ProfileSettingsModal />}
        {showPhotoOptions && <PhotoOptionsMenu />}
        {showMedicineTracker && <MedicineTracker onClose={()=>setShowMedicineTracker(false)} />}
        {showWaterPopup && <WaterPopup onYes={()=>setShowWaterPopup(false)} onNo={()=>setShowWaterPopup(false)} />}
      </div>

      <style>{`
        @keyframes popIn{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}
        @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#1E2D45;border-radius:3px;}
      `}</style>
    </div>
  )
}

function WaterPopup({ onYes, onNo }) {
  return (
    <div onClick={onNo} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:400,padding:'20px',cursor:'pointer'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:D.surface,borderRadius:'18px',padding:'26px 22px',textAlign:'center',boxShadow:D.shadowLg,maxWidth:'290px',width:'100%',animation:'popIn 0.22s ease',border:`1px solid ${D.border}`,cursor:'default'}}>
        <div style={{fontSize:'44px',marginBottom:'10px'}}>💧</div>
        <h3 style={{fontSize:'17px',fontWeight:'700',color:D.text,margin:'0 0 8px'}}>Stay Hydrated!</h3>
        <p style={{color:D.textSub,fontSize:'13px',lineHeight:1.6,margin:'0 0 18px'}}>Did you drink water in the last hour?</p>
        <div style={{display:'flex',gap:'10px'}}>
          <button onClick={onYes} style={{flex:1,padding:'11px',borderRadius:'10px',border:'none',background:D.blue,color:'#fff',fontWeight:'700',fontSize:'13px',cursor:'pointer',fontFamily:'inherit'}}>Yes, I did!</button>
          <button onClick={onNo} style={{flex:1,padding:'11px',borderRadius:'10px',border:`1px solid ${D.border}`,background:'none',color:D.textSub,fontWeight:'600',fontSize:'13px',cursor:'pointer',fontFamily:'inherit'}}>Not yet</button>
        </div>
      </div>
    </div>
  )
}
