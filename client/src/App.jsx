import { useState, useEffect, useRef } from 'react'
import './App.css'

// ============ DESIGN TOKENS ============
const colors = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#dc2626',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray500: '#6b7280',
  gray700: '#374151',
  gray900: '#111827',
}

// ============ INITIAL DATA ============
const INITIAL_CLUBS = [
  { id: 1, name: '朝阳公园跑团', location: '北京朝阳', members: 128 },
  { id: 2, name: '奥森跑团', location: '北京海淀', members: 95 },
  { id: 3, name: '通州跑步协会', location: '北京通州', members: 67 },
]

const INITIAL_ACTIVITIES = [
  {
    id: 1, title: '周六朝阳公园例跑', date: '2026-04-05', time: '07:00',
    location: '朝阳公园东门', duration: '2', method: 'guide', type: 'club',
    clubName: '朝阳公园跑团', author: '跑团管理员', signups: 3, confirmed: 1, status: 'upcoming'
  },
  {
    id: 2, title: '周日奥森长跑训练', date: '2026-04-06', time: '06:30',
    location: '奥森南门', duration: '3', method: 'both', type: 'club',
    clubName: '奥森跑团', author: '跑团管理员', signups: 2, confirmed: 0, status: 'upcoming'
  },
  {
    id: 3, title: '周三晚间陪伴步行', date: '2026-04-09', time: '19:00',
    location: '朝阳公园西门', duration: '1', method: 'walk', type: 'volunteer',
    clubName: '朝阳公园跑团', author: '张三', signups: 1, confirmed: 0, status: 'upcoming'
  },
]

// ============ COMPONENTS ============

// Header Component
function Header({ title, onBack, actions }) {
  return (
    <div className="header">
      {onBack && (
        <button className="header-back" onClick={onBack}>←</button>
      )}
      <h1>{title}</h1>
      {actions && <div className="header-actions">{actions}</div>}
    </div>
  )
}

// Button Component
function Button({ children, variant = 'primary', size = 'md', disabled, onClick, full, style }) {
  const cls = [
    'btn',
    `btn-${variant}`,
    size === 'lg' ? 'btn-lg' : size === 'sm' ? 'btn-sm' : '',
    full ? 'btn-full' : '',
  ].filter(Boolean).join(' ')
  return (
    <button className={cls} disabled={disabled} onClick={onClick} style={style}>
      {children}
    </button>
  )
}

// Card Component
function Card({ children, style, onClick }) {
  return (
    <div className="card" style={style} onClick={onClick}>
      {children}
    </div>
  )
}

// Badge Component
function Badge({ children, variant = 'default' }) {
  return (
    <span className={`badge badge-${variant}`}>{children}</span>
  )
}

// Toast Component
function Toast({ message }) {
  return <div className="toast show">{message}</div>
}

// ============ SCREENS ============

// Role Selection Screen
function RoleSelectScreen({ onSelect }) {
  return (
    <div className="screen active">
      <div className="role-select">
        <h2>助盲跑</h2>
        <p>连接盲人跑者与志愿者/跑团的平台</p>
        <div className="role-cards">
          <div className="role-card" onClick={() => onSelect('blind')}>
            <span className="tag">盲人用户</span>
            <h3>我是盲人，想跑步</h3>
            <p>浏览活动，报名参加，找到志愿者陪伴跑步</p>
          </div>
          <div className="role-card" onClick={() => onSelect('volunteer')}>
            <span className="tag">志愿者</span>
            <h3>我想帮助盲人跑步</h3>
            <p>加入跑团，发布活动，陪伴盲人跑步</p>
          </div>
          <div className="role-card" onClick={() => onSelect('club')}>
            <span className="tag secondary">跑团管理员</span>
            <h3>我是跑团组织者</h3>
            <p>管理跑团成员，发布例跑活动，审核志愿者</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Phone Login Screen
function PhoneLoginScreen({ roleName, onVerified, onBack }) {
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(0)
  const codeRefs = useRef([])

  const roleNames = { blind: '盲人', volunteer: '志愿者', club: '跑团' }
  const displayRole = roleNames[roleName] || '用户'

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  const handleSendCode = () => {
    if (phone.length !== 11) {
      alert('请输入正确的手机号')
      return
    }
    setStep(2)
    setCountdown(60)
    setTimeout(() => codeRefs.current[0]?.focus(), 100)
  }

  const handleCodeChange = (idx, val) => {
    const digit = val.replace(/\D/g, '')
    const newCode = [...code]
    newCode[idx] = digit
    setCode(newCode)
    if (digit && idx < 5) codeRefs.current[idx + 1]?.focus()
    if (newCode.every(c => c)) {
      const codeStr = newCode.join('')
      if (codeStr === '123456') {
        onVerified({ phone })
      } else {
        alert('验证码错误，请输入 123456')
        setCode(['', '', '', '', '', ''])
        codeRefs.current[0]?.focus()
      }
    }
  }

  const handleCodeKey = (idx, e) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      codeRefs.current[idx - 1]?.focus()
    }
  }

  const maskPhone = (p) => p.slice(0, 3) + '****' + p.slice(-4)

  return (
    <div className="screen active">
      <Header title="验证手机号" onBack={onBack} />
      <div className="page">
        <div className="step-indicator">
          <div className={`step-dot ${step >= 1 ? (step > 1 ? 'completed' : 'active') : ''}`}></div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}></div>
        </div>

        {step === 1 ? (
          <>
            <div className="text-center" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>验证手机号</h3>
              <p className="text-secondary">作为<span style={{ fontWeight: 600 }}>{displayRole}</span>登录，请验证手机号</p>
            </div>
            <div className="form-group">
              <input
                type="tel"
                className="form-input"
                placeholder="请输入手机号"
                maxLength={11}
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
            <Button onClick={handleSendCode} full size="lg">
              获取验证码
            </Button>
          </>
        ) : (
          <>
            <div className="text-center" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>输入验证码</h3>
              <p className="text-secondary">已发送验证码至 <span>{maskPhone(phone)}</span></p>
            </div>
            <div className="form-group">
              <div className="code-input-row">
                {code.map((c, i) => (
                  <input
                    key={i}
                    ref={el => codeRefs.current[i] = el}
                    type="text"
                    className={`code-digit ${c ? 'filled' : ''}`}
                    maxLength={1}
                    value={c}
                    onChange={e => handleCodeChange(i, e.target.value)}
                    onKeyDown={e => handleCodeKey(i, e)}
                  />
                ))}
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={countdown > 0}
                  onClick={() => { setCountdown(60); alert('验证码已发送') }}
                >
                  {countdown > 0 ? `${countdown}s` : '重发'}
                </button>
              </div>
              <p className="form-hint text-center" style={{ marginTop: 12 }}>
                演示用验证码：<strong>123456</strong>
              </p>
            </div>
            <Button onClick={() => {
              const codeStr = code.join('')
              if (codeStr === '123456') {
                onVerified({ phone })
              } else {
                alert('请输入6位验证码')
              }
            }} full size="lg" style={{ marginTop: 24 }}>
              验证并登录
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

// Personal Info Screen
function PersonalInfoScreen({ onNext, onBack }) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState('')
  const [experience, setExperience] = useState('')

  const handleNext = () => {
    if (!name) { alert('请输入姓名'); return }
    if (!gender) { alert('请选择性别'); return }
    if (!experience) { alert('请选择跑步经验'); return }
    onNext({ name, gender, experience })
  }

  return (
    <div className="screen active">
      <Header title="填写个人信息" onBack={onBack} />
      <div className="page">
        <div className="step-indicator">
          <div className="step-dot completed"></div>
          <div className="step-dot active"></div>
          <div className="step-dot"></div>
        </div>
        <div className="text-center" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>填写个人信息</h3>
          <p className="text-secondary">帮助我们更好地为您服务</p>
        </div>
        <div className="form-group">
          <label className="form-label">姓名 <span style={{ color: colors.primary }}>*</span></label>
          <input type="text" className="form-input" placeholder="请输入您的姓名" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">性别 <span style={{ color: colors.primary }}>*</span></label>
          <div className="gender-select">
            {['男', '女', '其他'].map(g => (
              <button key={g} className={`gender-btn ${gender === g ? 'active' : ''}`} onClick={() => setGender(g)}>{g}</button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">跑步经验 <span style={{ color: colors.primary }}>*</span></label>
          <select className="form-input form-select" value={experience} onChange={e => setExperience(e.target.value)}>
            <option value="">请选择您的跑步经验</option>
            <option value="none">暂无跑步经验</option>
            <option value="beginner">跑步新手（1年以下）</option>
            <option value="intermediate">有经验（1-3年）</option>
            <option value="experienced">经验丰富（3年以上）</option>
          </select>
        </div>
        <Button onClick={handleNext} full size="lg" style={{ marginTop: 24 }}>下一步</Button>
      </div>
    </div>
  )
}

// Disability Proof Screen
function DisabilityProofScreen({ onNext, onBack }) {
  const [hasProof, setHasProof] = useState(null)

  return (
    <div className="screen active">
      <Header title="残疾人证明" onBack={onBack} />
      <div className="page">
        <div className="step-indicator">
          <div className="step-dot completed"></div>
          <div className="step-dot completed"></div>
          <div className="step-dot active"></div>
        </div>
        <div className="text-center" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>👁</div>
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>残疾人证明</h3>
          <p className="text-secondary">请确认您是否为视障人士</p>
        </div>
        <Card style={{ background: '#fffbeb', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 28 }}>👁</span>
            <div>
              <div style={{ fontWeight: 600 }}>视障人士认证</div>
              <div style={{ fontSize: 13, color: colors.gray500 }}>平台为视障跑者提供专属服务</div>
            </div>
          </div>
          <ul style={{ fontSize: 14, color: colors.gray600, listStyle: 'none', padding: 0 }}>
            {['专属活动推荐与匹配', '专业志愿者陪伴', '优先预约陪跑服务'].map((item, i) => (
              <li key={i} style={{ padding: '4px 0' }}>✓ {item}</li>
            ))}
          </ul>
        </Card>
        <div className="form-group" style={{ marginTop: 24 }}>
          <label className="form-label">是否持有残疾人证明？</label>
          <div className="gender-select">
            <button className={`gender-btn ${hasProof === true ? 'active' : ''}`} onClick={() => setHasProof(true)}>有证明</button>
            <button className={`gender-btn ${hasProof === false ? 'active' : ''}`} onClick={() => setHasProof(false)}>暂无证明</button>
          </div>
          {hasProof === false && (
            <p className="form-hint" style={{ color: colors.warning, marginTop: 8 }}>
              暂无证明也可使用平台部分功能，但无法享受专属服务
            </p>
          )}
        </div>
        <Button onClick={() => hasProof !== null && onNext({ hasDisabilityProof: hasProof })} disabled={hasProof === null} full size="lg" style={{ marginTop: 24 }}>
          下一步
        </Button>
      </div>
    </div>
  )
}

// Select Club Screen
function SelectClubScreen({ clubs, onSelect, onBack }) {
  return (
    <div className="screen active">
      <Header title="选择跑团" onBack={onBack} />
      <div className="page">
        <div className="step-indicator">
          <div className="step-dot completed"></div>
          <div className="step-dot active"></div>
          <div className="step-dot"></div>
        </div>
        <div className="text-center" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🏃</div>
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>选择要加入的跑团</h3>
          <p className="text-secondary">加入跑团后可以参与发布和管理活动</p>
        </div>
        <div className="section-title">可加入的跑团</div>
        {clubs.map(club => (
          <div key={club.id} className="club-list-item" onClick={() => onSelect(club)}>
            <div className="club-avatar">🏃</div>
            <div className="club-info">
              <div className="club-name">{club.name}</div>
              <div className="club-meta">{club.location} · {club.members} 名成员</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Platform Mission Screen
function PlatformMissionScreen({ role, onComplete, onBack }) {
  const [agreed, setAgreed] = useState(false)

  const isVolunteer = role === 'volunteer'
  const guidelines = isVolunteer ? [
    '尊重盲人朋友，保护个人隐私',
    '按时参加活动，如有变动请提前通知',
    '使用陪跑绳时确保安全',
    '活动过程中保持专注，避免使用手机',
    '积极反馈活动情况，帮助改进服务',
  ] : [
    '活动前请确认集合地点和时间',
    '如有特殊需求请提前告知志愿者',
    '活动过程中注意安全，听从志愿者引导',
    '如需取消请提前通知',
    '活动结束后可对志愿者进行评价',
  ]

  const title = isVolunteer ? '志愿者服务须知' : '盲人服务须知'
  const icon = isVolunteer ? '🤝' : '👁'
  const desc = isVolunteer
    ? '感谢您愿意帮助视障朋友跑步。您的每一次陪伴，都让他们感受到社会的温暖。'
    : '我们致力于为视障跑者提供安全、温暖的跑步体验。每位志愿者都经过跑团审核，确保您的安全。'

  return (
    <div className="screen active">
      <Header title={title} onBack={onBack} />
      <div className="page">
        <div className="step-indicator">
          <div className="step-dot completed"></div>
          <div className="step-dot completed"></div>
          <div className="step-dot active"></div>
        </div>
        <div className="mission-banner">
          <div className="mission-icon">{icon}</div>
          <h2 className="mission-title">{title}</h2>
          <p className="mission-desc">{desc}</p>
        </div>
        <div className="guide-card">
          <h4>服务准则</h4>
          <ul>
            {guidelines.map((g, i) => <li key={i}>{g}</li>)}
          </ul>
        </div>
        <div className={`checkbox-agree ${agreed ? 'checked' : ''}`} onClick={() => setAgreed(!agreed)}>
          <div className="checkbox-box">{agreed ? '✓' : ''}</div>
          <div className="checkbox-text">
            {isVolunteer ? '我已阅读并同意遵守志愿者服务准则' : '我已阅读并同意遵守服务须知'}
          </div>
        </div>
        <Button onClick={() => agreed && onComplete()} disabled={!agreed} full size="lg" style={{ marginTop: 24 }}>
          进入首页
        </Button>
      </div>
    </div>
  )
}

// Club Registration Screen
function ClubRegisterScreen({ onComplete, onBack }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [location, setLocation] = useState('')
  const [agreed, setAgreed] = useState(false)

  const handleStep1Next = () => {
    if (!name) { alert('请输入跑团名称'); return }
    if (!contact || contact.length !== 11) { alert('请输入正确的手机号'); return }
    if (!location) { alert('请输入跑团所在地'); return }
    setStep(2)
  }

  return (
    <div className="screen active">
      <Header title="跑团入驻" onBack={onBack} />
      <div className="page">
        <div className="step-indicator">
          <div className={`step-dot ${step >= 1 ? (step > 1 ? 'completed' : 'active') : ''}`}></div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}></div>
        </div>

        {step === 1 ? (
          <>
            <div className="text-center" style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🏃</div>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>跑团信息填写</h3>
              <p className="text-secondary">请填写跑团基本信息</p>
            </div>
            <div className="form-group">
              <label className="form-label">跑团名称 <span style={{ color: colors.primary }}>*</span></label>
              <input type="text" className="form-input" placeholder="例如：朝阳公园跑团" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">负责人联系方式 <span style={{ color: colors.primary }}>*</span></label>
              <input type="tel" className="form-input" placeholder="手机号（用于登录）" maxLength={11} value={contact} onChange={e => setContact(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">跑团所在地 <span style={{ color: colors.primary }}>*</span></label>
              <input type="text" className="form-input" placeholder="例如：北京朝阳" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <Button onClick={handleStep1Next} full size="lg" style={{ marginTop: 24 }}>下一步</Button>
          </>
        ) : (
          <>
            <div className="mission-banner" style={{ margin: '0 -20px 24px', padding: 24 }}>
              <div className="mission-icon">🏃</div>
              <h2 className="mission-title">跑团服务须知</h2>
              <p className="mission-desc">作为跑团管理员，您将负责审核志愿者、管理跑团活动，确保助盲跑服务的安全与质量。</p>
            </div>
            <div className="guide-card">
              <h4>管理员职责</h4>
              <ul>
                {['审核志愿者加入申请', '发布和管理跑团活动', '确保活动安全进行', '处理活动中的问题与投诉', '维护跑团良好声誉'].map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </div>
            <div className={`checkbox-agree ${agreed ? 'checked' : ''}`} onClick={() => setAgreed(!agreed)}>
              <div className="checkbox-box">{agreed ? '✓' : ''}</div>
              <div className="checkbox-text">我已阅读并同意遵守跑团服务准则</div>
            </div>
            <Button onClick={() => agreed && onComplete({ name, contact, location })} disabled={!agreed} full size="lg" style={{ marginTop: 24 }}>
              进入跑团首页
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

// ============ HOME SCREENS ============

// Blind Home Screen
function BlindHomeScreen({ userData, activities, signups, onSwitchRole, onViewDetail, onViewSignup, onSignup }) {
  return (
    <div className="screen active">
      <Header title="助盲跑" actions={<Button size="sm" variant="secondary" onClick={onSwitchRole}>切换</Button>} />
      <div className="page" style={{ paddingBottom: 80 }}>
        <Card style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="avatar avatar-lg" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>👁</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{userData.name || '欢迎'}</div>
              <div style={{ fontSize: 13, color: colors.gray500 }}>视障跑者</div>
            </div>
            <Badge variant="warning">认证用户</Badge>
          </div>
        </Card>

        {signups.length > 0 && (
          <>
            <div className="section-title">我的报名</div>
            {signups.map(s => {
              const act = activities.find(a => a.id === s.activityId)
              if (!act) return null
              const statusColors = ['pending', 'confirmed', 'success', 'status-3']
              return (
                <Card key={s.id} style={{ marginBottom: 10, borderLeft: `4px solid ${colors.primary}`, cursor: 'pointer' }} onClick={() => onViewSignup(s)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{act.title}</div>
                      <p style={{ fontSize: 13, color: colors.gray500 }}>{act.date} {act.time}</p>
                    </div>
                    <Badge variant={statusColors[s.status]}>{s.statusText}</Badge>
                  </div>
                </Card>
              )
            })}
            <div className="divider" style={{ margin: '20px -20px' }}></div>
          </>
        )}

        <div className="section-title">可参加的活动</div>
        {activities.map(act => (
          <Card key={act.id} style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => onViewDetail(act)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{act.title}</div>
              <span className={`activity-badge ${act.type === 'club' ? 'club' : ''}`}>
                {act.type === 'club' ? '跑团' : '志愿者'}
              </span>
            </div>
            <div style={{ fontSize: 14, color: colors.gray500, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span>📅 {act.date} {act.time}</span>
              <span>📍 {act.location}</span>
              <span>⏱ 约 {act.duration} 小时 · {act.method === 'guide' ? '引导跑步' : act.method === 'walk' ? '陪伴步行' : '均可'}</span>
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${colors.gray100}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: colors.gray500 }}>{act.clubName} · {act.author}</span>
              <span style={{ color: colors.primary, fontSize: 14 }}>点击报名 ›</span>
            </div>
          </Card>
        ))}
      </div>
      <div className="bottom-nav">
        <button className="nav-item active"><span className="nav-icon">🏠</span><span>首页</span></button>
        <button className="nav-item"><span className="nav-icon">📋</span><span>我的</span></button>
      </div>
    </div>
  )
}

// Volunteer Home Screen
function VolunteerHomeScreen({ userData, activities, onSwitchRole, onSimulateApprove, onCreateActivity, onViewSignups }) {
  const hasClub = !!userData.joinedClub
  const isApproved = userData.auditStatus === 'approved'
  const myActivities = activities.filter(a => a.type === 'volunteer' && a.author === userData.name)

  return (
    <div className="screen active">
      <Header title="助盲跑" actions={<Button size="sm" variant="secondary" onClick={onSwitchRole}>切换</Button>} />
      <div className="page" style={{ paddingBottom: 80 }}>
        {!hasClub ? (
          <Card style={{ border: `2px dashed ${colors.gray300}`, background: colors.gray50, textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏃</div>
            <h3 style={{ marginBottom: 8 }}>您还未加入跑团</h3>
            <p style={{ fontSize: 14, color: colors.gray500, marginBottom: 20 }}>加入跑团后才能发布助跑活动</p>
          </Card>
        ) : !isApproved ? (
          <div className="audit-banner">
            <div style={{ fontSize: 40, marginBottom: 8 }}>⏳</div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>等待跑团审核中</div>
            <div style={{ fontSize: 13, color: colors.gray500 }}>
              您的加入申请已提交，请等待 <strong>{userData.joinedClub.name}</strong> 审核。
            </div>
            <Button onClick={onSimulateApprove} style={{ marginTop: 12 }}>模拟审核通过（演示）</Button>
          </div>
        ) : (
          <div className="audit-banner approved">
            <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>审核已通过</div>
            <div style={{ fontSize: 13, color: colors.gray500 }}>您可以发布助跑活动了</div>
          </div>
        )}

        {hasClub && (
          <>
            <Card style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div className="avatar" style={{ background: colors.success }}>跑</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{userData.joinedClub.name}</div>
                  <div style={{ fontSize: 13, color: colors.gray500 }}>已入驻 · 志愿者</div>
                </div>
              </div>
            </Card>
            <div className="stats">
              <div className="stat-card">
                <div className="stat-value">{myActivities.length}</div>
                <div className="stat-label">发布活动</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{myActivities.reduce((s, a) => s + parseInt(a.duration), 0)}</div>
                <div className="stat-label">陪伴时长(h)</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">4.9</div>
                <div className="stat-label">评分</div>
              </div>
            </div>
            <div className="section-title">我的活动</div>
            {myActivities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: colors.gray500 }}>暂无活动</div>
            ) : (
              myActivities.map(a => (
                <Card key={a.id} style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => onViewSignups(a)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{a.title}</div>
                      <p style={{ fontSize: 13, color: colors.gray500 }}>{a.date} {a.time} · {a.location}</p>
                    </div>
                    <Badge variant={a.confirmed > 0 ? 'confirmed' : 'pending'}>
                      {a.confirmed > 0 ? `${a.confirmed}人已确认` : '待确认'}
                    </Badge>
                  </div>
                </Card>
              ))
            )}
            {isApproved && (
              <Button onClick={onCreateActivity} full size="lg" style={{ marginTop: 16 }}>+ 发布新活动</Button>
            )}
          </>
        )}
      </div>
      <div className="bottom-nav">
        <button className="nav-item active"><span className="nav-icon">🏠</span><span>首页</span></button>
        <button className="nav-item"><span className="nav-icon">📋</span><span>我的</span></button>
      </div>
    </div>
  )
}

// Club Admin Home Screen
function ClubAdminHomeScreen({ clubData, activities, applications, members, onApprove, onReject, onSwitchRole, onCreateActivity }) {
  const [tab, setTab] = useState('activities')
  const clubActivities = activities.filter(a => a.type === 'club')

  return (
    <div className="screen active">
      <Header title={clubData.name || '跑团管理'} actions={<Button size="sm" variant="secondary" onClick={onSwitchRole}>切换</Button>} />
      <div className="page" style={{ paddingBottom: 80 }}>
        <Card style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #e0e7ff 100%)', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="avatar avatar-lg" style={{ background: `linear-gradient(135deg, ${colors.success} 0%, #16a34a 100%)` }}>🏃</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{clubData.name}</div>
              <div style={{ fontSize: 13, color: colors.gray500 }}>跑团管理员</div>
              <div style={{ fontSize: 13, color: colors.gray500, marginTop: 4 }}>
                {members.length} 名成员 · {applications.length} 待审核
              </div>
            </div>
          </div>
        </Card>

        <div className="stats">
          <div className="stat-card"><div className="stat-value">{clubActivities.length}</div><div className="stat-label">发布活动</div></div>
          <div className="stat-card"><div className="stat-value">{clubActivities.reduce((s, a) => s + a.signups, 0)}</div><div className="stat-label">帮助人次</div></div>
          <div className="stat-card"><div className="stat-value">4.8</div><div className="stat-label">评分</div></div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === 'activities' ? 'active' : ''}`} onClick={() => setTab('activities')}>活动管理</button>
          <button className={`tab ${tab === 'members' ? 'active' : ''}`} onClick={() => setTab('members')}>成员管理</button>
        </div>

        {tab === 'activities' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="section-title" style={{ marginBottom: 0 }}>跑团活动</div>
              <Button size="sm" variant="primary" onClick={onCreateActivity}>+ 发布</Button>
            </div>
            {clubActivities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: colors.gray500 }}>暂无活动，发布第一期跑团例跑吧</div>
            ) : (
              clubActivities.map(a => (
                <Card key={a.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{a.title}</div>
                      <p style={{ fontSize: 13, color: colors.gray500 }}>{a.date} {a.time} · {a.location}</p>
                    </div>
                    <Badge variant="confirmed">{a.confirmed}/{a.signups} 已确认</Badge>
                  </div>
                </Card>
              ))
            )}
          </>
        ) : (
          <>
            <div className="section-title">待审核 ({applications.length})</div>
            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: colors.gray500, marginBottom: 20 }}>暂无待审核成员</div>
            ) : (
              applications.map(m => (
                <div key={m.id} className="member-card pending">
                  <div className="member-avatar">{m.name[0]}</div>
                  <div className="member-info">
                    <div className="member-name">{m.name}</div>
                    <div className="member-meta">{m.phone} · 申请于 {m.applyTime}</div>
                    <div style={{ fontSize: 12, color: colors.gray400, marginTop: 2 }}>跑步经验：{m.experience}</div>
                  </div>
                  <div className="member-actions">
                    <Button size="sm" variant="success" onClick={() => onApprove(m.id)}>通过</Button>
                    <Button size="sm" variant="danger" onClick={() => onReject(m.id)}>拒绝</Button>
                  </div>
                </div>
              ))
            )}
            <div className="section-title" style={{ marginTop: 20 }}>已入驻成员 ({members.length})</div>
            {members.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: colors.gray500 }}>暂无已入驻成员</div>
            ) : (
              members.map(m => (
                <div key={m.id} className="member-card">
                  <div className="member-avatar">{m.name[0]}</div>
                  <div className="member-info">
                    <div className="member-name">{m.name}</div>
                    <div className="member-meta">加入于 {m.joinTime}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 12, color: colors.gray500 }}>
                    <div>{m.activities} 次活动</div>
                    <div>{m.hours} 小时</div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
      <div className="bottom-nav">
        <button className="nav-item active"><span className="nav-icon">🏠</span><span>首页</span></button>
        <button className="nav-item"><span className="nav-icon">⚙</span><span>设置</span></button>
      </div>
    </div>
  )
}

// ============ ACTIVITY SCREENS ============

// Activity Detail Screen (Blind User View)
function ActivityDetailScreen({ activity, onSignup, onBack }) {
  if (!activity) return null
  return (
    <div className="screen active">
      <Header title="活动详情" onBack={onBack} />
      <div className="page">
        <div className="card" style={{ marginBottom: 16 }}>
          <span className={`activity-badge ${activity.type === 'club' ? 'club' : ''}`} style={{ marginBottom: 12 }}>
            {activity.type === 'club' ? '跑团活动' : '志愿者活动'}
          </span>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{activity.title}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: colors.gray500 }}>
            <span>📅 {activity.date} {activity.time}</span>
            <span>📍 {activity.location}</span>
            <span>⏱ 约 {activity.duration} 小时</span>
            <span>🏃 {activity.method === 'guide' ? '引导跑步（陪跑绳）' : activity.method === 'walk' ? '陪伴步行' : '跑步+步行均可'}</span>
          </div>
        </div>

        <Card style={{ marginBottom: 16 }}>
          <div className="section-title">组织者</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="avatar" style={{ background: activity.type === 'club' ? colors.success : colors.primary }}>
              {activity.type === 'club' ? '跑' : activity.author[0]}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{activity.clubName}</div>
              <div style={{ fontSize: 13, color: colors.gray500 }}>{activity.author}</div>
            </div>
          </div>
        </Card>

        <Card style={{ marginBottom: 20 }}>
          <div className="section-title">活动信息</div>
          <p style={{ fontSize: 14, color: colors.gray700 }}>
            {activity.type === 'club'
              ? '这是跑团定期举办的例跑活动，欢迎视障朋友参加。我们有专业的陪跑志愿者，使用陪跑绳确保安全。'
              : '志愿者发布的个人助跑活动，有丰富的陪跑经验。'}
          </p>
        </Card>

        <Button onClick={onSignup} full size="lg">报名参加</Button>
      </div>
    </div>
  )
}

// Blind Signup Status Screen
function BlindSignupStatusScreen({ signup, activity, onAdvance, onBack }) {
  const statusLabels = ['待确认同行', '已确认待出行', '匹配成功待出行', '出行完成']
  const statusColors = ['badge-pending', 'badge-confirmed', 'badge-success', 'badge-status-3']

  if (!signup) return null

  return (
    <div className="screen active">
      <Header title="报名状态" onBack={onBack} />
      <div className="page">
        <Card style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>{activity?.title || '活动'}</span>
            <Badge variant={statusColors[signup.status] || 'pending'}>{signup.statusText}</Badge>
          </div>
          <p style={{ fontSize: 13, color: colors.gray500, marginTop: 8 }}>
            {activity?.date} {activity?.time} · {activity?.location}
          </p>
        </Card>

        <Card style={{ marginTop: 16 }}>
          <div className="section-title">状态进度</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            {statusLabels.map((label, i) => (
              <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: i <= signup.status ? colors.primary : colors.gray200,
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 6px', fontSize: 12
                }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 11, color: i <= signup.status ? colors.primary : colors.gray400 }}>{label}</div>
              </div>
            ))}
          </div>
          {signup.status < 3 ? (
            <Button onClick={() => onAdvance(signup.id)} full style={{ marginTop: 12 }}>
              {signup.status === 0 ? '确认已联络' : signup.status === 1 ? '确认出行' : '确认完成'}
            </Button>
          ) : (
            <div style={{ textAlign: 'center', color: colors.success, padding: 12 }}>
              已完成本次跑步活动
            </div>
          )}
        </Card>

        <Card style={{ marginTop: 16 }}>
          <div className="section-title">联络信息</div>
          <p style={{ fontSize: 14, color: colors.gray700, marginBottom: 12 }}>请电话联络志愿者确认出行细节：</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="avatar" style={{ background: colors.primary }}>志</div>
            <div>
              <div style={{ fontWeight: 600 }}>{signup.volunteerName}</div>
              <div style={{ fontSize: 13, color: colors.gray500 }}>志愿者</div>
            </div>
          </div>
        </Card>

        <Card style={{ marginTop: 16 }}>
          <div className="section-title">您的信息</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="avatar" style={{ background: colors.warning }}>盲</div>
            <div>
              <div style={{ fontWeight: 600 }}>{signup.blindName}</div>
              <div style={{ fontSize: 13, color: colors.gray500 }}>手机：{signup.blindPhone || '未填写'}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// Volunteer Create Activity Screen
function VolunteerCreateActivityScreen({ onCreate, onBack }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('07:00')
  const [location, setLocation] = useState('')
  const [duration, setDuration] = useState('2')
  const [method, setMethod] = useState('guide')
  const [note, setNote] = useState('')

  const handleCreate = () => {
    if (!name || !date || !time || !location) {
      return
    }
    onCreate({ name, date, time, location, duration, method, note })
  }

  return (
    <div className="screen active">
      <Header title="发布活动" onBack={onBack} />
      <div className="page">
        <div className="form-group">
          <label className="form-label">活动名称</label>
          <input className="form-input" placeholder="例如：周六朝阳公园助盲跑" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">日期</label>
          <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">时间</label>
          <input className="form-input" type="time" value={time} onChange={e => setTime(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">地点</label>
          <input className="form-input" placeholder="例如：朝阳公园东门集合" value={location} onChange={e => setLocation(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">预计时长</label>
          <select className="form-input form-select" value={duration} onChange={e => setDuration(e.target.value)}>
            <option value="1">1 小时</option>
            <option value="2">2 小时</option>
            <option value="3">3 小时</option>
            <option value="4">4 小时以上</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">陪伴方式</label>
          <select className="form-input form-select" value={method} onChange={e => setMethod(e.target.value)}>
            <option value="guide">引导跑步（陪跑绳）</option>
            <option value="walk">陪伴步行</option>
            <option value="both">跑步+步行均可</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">备注</label>
          <textarea className="form-input" style={{ minHeight: 80 }} placeholder="其他说明（可选）" value={note} onChange={e => setNote(e.target.value)} />
        </div>
        <Button onClick={handleCreate} full size="lg">发布活动</Button>
      </div>
    </div>
  )
}

// Volunteer Signup List Screen
function VolunteerSignupListScreen({ activity, onConfirm, onBack }) {
  // Filter signups for this activity
  const [signups, setSignups] = useState([
    { id: 101, activityId: 1, blindName: '王明', blindPhone: '136****1111', status: 0, statusText: '待确认' },
    { id: 102, activityId: 2, blindName: '刘芳', blindPhone: '135****3333', status: 1, statusText: '已确认' },
  ])
  const activitySignups = signups.filter(s => s.activityId === activity?.id)

  return (
    <div className="screen active">
      <Header title="报名列表" onBack={onBack} />
      <div className="page">
        <Card style={{ background: '#f0f7ff', border: '1px solid #bfdbfe', marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{activity?.title}</div>
          <div style={{ fontSize: 13, color: colors.gray500 }}>{activity?.date} {activity?.time} · {activity?.location}</div>
        </Card>

        <div className="section-title">报名列表 ({activitySignups.length})</div>
        {activitySignups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: colors.gray500 }}>暂无报名</div>
        ) : (
          activitySignups.map(s => (
            <Card key={s.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.blindName}</div>
                  <div style={{ fontSize: 13, color: colors.gray500 }}>{s.blindPhone}</div>
                </div>
                <Badge variant={s.status === 1 ? 'confirmed' : 'pending'}>{s.statusText}</Badge>
              </div>
              {s.status === 0 && (
                <Button size="sm" variant="success" style={{ marginTop: 8 }} onClick={onConfirm}>确认参加</Button>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

// Club Create Activity Screen
function ClubCreateActivityScreen({ onCreate, onBack }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('07:00')
  const [location, setLocation] = useState('')
  const [duration, setDuration] = useState('2')
  const [note, setNote] = useState('')

  const handleCreate = () => {
    if (!name || !date || !time || !location) {
      return
    }
    onCreate({ name, date, time, location, duration, note })
  }

  return (
    <div className="screen active">
      <Header title="发布跑团活动" onBack={onBack} />
      <div className="page">
        <div className="form-group">
          <label className="form-label">活动名称</label>
          <input className="form-input" placeholder="例如：周六例跑" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">日期</label>
          <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">时间</label>
          <input className="form-input" type="time" value={time} onChange={e => setTime(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">集合地点</label>
          <input className="form-input" placeholder="例如：朝阳公园东门" value={location} onChange={e => setLocation(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">预计时长</label>
          <select className="form-input form-select" value={duration} onChange={e => setDuration(e.target.value)}>
            <option value="1">1 小时</option>
            <option value="2">2 小时</option>
            <option value="3">3 小时</option>
            <option value="4">4 小时以上</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">备注</label>
          <textarea className="form-input" style={{ minHeight: 80 }} placeholder="其他说明（可选）" value={note} onChange={e => setNote(e.target.value)} />
        </div>
        <Button onClick={handleCreate} full size="lg">发布活动</Button>
      </div>
    </div>
  )
}

// ============ MAIN APP ============
export default function App() {
  const [screen, setScreen] = useState('role')
  const [role, setRole] = useState(null)
  const [userData, setUserData] = useState({})
  const [clubData, setClubData] = useState({ name: '', contact: '', location: '' })
  const [toast, setToast] = useState('')
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES)
  const [signups, setSignups] = useState([
    { id: 101, activityId: 1, blindName: '王明', blindPhone: '136****1111', volunteerName: '张三', status: 0, statusText: '待确认同行' },
    { id: 102, activityId: 2, blindName: '刘芳', blindPhone: '135****3333', volunteerName: '李四', status: 1, statusText: '已确认待出行' },
  ])
  const [applications, setApplications] = useState([
    { id: 1, name: '李明', phone: '138****1234', applyTime: '2026-04-01', experience: '有半年跑步经验' },
    { id: 2, name: '王芳', phone: '139****5678', applyTime: '2026-04-02', experience: '刚开始跑步' },
  ])
  const [members, setMembers] = useState([
    { id: 3, name: '张三', joinTime: '2025-01-15', phone: '137****2222', activities: 12, hours: 28 },
    { id: 4, name: '李四', joinTime: '2025-03-20', phone: '138****4444', activities: 8, hours: 16 },
  ])

  // Current context for detail screens
  const [currentActivity, setCurrentActivity] = useState(null)
  const [currentSignup, setCurrentSignup] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const goTo = (s) => setScreen(s)
  const goBack = () => setScreen('role')
  const switchRole = () => { setScreen('role'); setRole(null); setUserData({}) }

  const handleRoleSelect = (r) => { setRole(r); goTo('phone') }

  const handlePhoneVerified = (data) => {
    setUserData(prev => ({ ...prev, phone: data.phone }))
    if (role === 'club') {
      goTo('club-reg')
    } else {
      goTo('personal-info')
    }
  }

  const handlePersonalInfoNext = (data) => {
    setUserData(prev => ({ ...prev, ...data }))
    if (role === 'blind') {
      goTo('disability-proof')
    } else {
      goTo('select-club')
    }
  }

  const handleDisabilityProofNext = (data) => {
    setUserData(prev => ({ ...prev, ...data }))
    goTo('mission')
  }

  const handleSelectClub = (club) => {
    setUserData(prev => ({ ...prev, joinedClub: club }))
    goTo('mission')
  }

  const handleMissionComplete = () => {
    goTo(role === 'blind' ? 'blind-home' : 'volunteer-home')
  }

  const handleClubRegComplete = (data) => {
    setClubData({ name: data.name, contact: data.contact, location: data.location })
    goTo('club-home')
  }

  const handleApprove = (id) => {
    const m = applications.find(a => a.id === id)
    if (m) {
      setApplications(prev => prev.filter(a => a.id !== id))
      setMembers(prev => [{ ...m, joinTime: new Date().toISOString().split('T')[0], activities: 0, hours: 0 }, ...prev])
      showToast('已通过审核')
    }
  }

  const handleReject = (id) => {
    setApplications(prev => prev.filter(a => a.id !== id))
    showToast('已拒绝')
  }

  // Blind: View activity detail and signup
  const handleViewActivityDetail = (act) => {
    setCurrentActivity(act)
    goTo('blind-activity-detail')
  }

  const handleBlindSignup = () => {
    const act = currentActivity
    const newSignup = {
      id: Date.now(),
      activityId: act.id,
      blindName: userData.name || '我',
      blindPhone: userData.phone || '',
      volunteerName: act.author,
      status: 0,
      statusText: '待确认同行'
    }
    setSignups(prev => [...prev, newSignup])
    setCurrentSignup(newSignup)
    showToast('报名成功！')
    goTo('blind-signup-status')
  }

  const handleViewSignup = (signup) => {
    setCurrentSignup(signup)
    goTo('blind-signup-status')
  }

  const handleAdvanceSignup = (id) => {
    setSignups(prev => prev.map(s => {
      if (s.id === id && s.status < 3) {
        const newStatus = s.status + 1
        const labels = ['待确认同行', '已确认待出行', '匹配成功待出行', '出行完成']
        return { ...s, status: newStatus, statusText: labels[newStatus] }
      }
      return s
    }))
    // Update currentSignup too
    setSignups(prev => {
      const updated = prev.find(s => s.id === id)
      if (updated) setCurrentSignup(updated)
      return prev
    })
    showToast('状态已更新')
  }

  // Volunteer: Create activity
  const handleCreateVolunteerActivity = (data) => {
    const newActivity = {
      id: Date.now(),
      title: data.name,
      date: data.date,
      time: data.time,
      location: data.location,
      duration: data.duration,
      method: data.method,
      type: 'volunteer',
      clubName: userData.joinedClub?.name || '个人',
      author: userData.name || '我',
      signups: 0,
      confirmed: 0,
      status: 'upcoming'
    }
    setActivities(prev => [newActivity, ...prev])
    showToast('活动发布成功！')
    goTo('volunteer-home')
  }

  // Volunteer: View signups
  const handleViewSignups = (act) => {
    setCurrentActivity(act)
    goTo('volunteer-signups')
  }

  // Club: Create activity
  const handleCreateClubActivity = (data) => {
    const newActivity = {
      id: Date.now(),
      title: data.name,
      date: data.date,
      time: data.time,
      location: data.location,
      duration: data.duration,
      method: 'guide',
      type: 'club',
      clubName: clubData.name || '我的跑团',
      author: '跑团管理员',
      signups: 0,
      confirmed: 0,
      status: 'upcoming'
    }
    setActivities(prev => [newActivity, ...prev])
    showToast('活动发布成功！')
    goTo('club-home')
  }

  return (
    <div className="container">
      {screen === 'role' && <RoleSelectScreen onSelect={handleRoleSelect} />}

      {screen === 'phone' && (
        <PhoneLoginScreen
          roleName={role}
          onVerified={handlePhoneVerified}
          onBack={goBack}
        />
      )}

      {screen === 'personal-info' && (
        <PersonalInfoScreen
          onNext={handlePersonalInfoNext}
          onBack={goBack}
        />
      )}

      {screen === 'disability-proof' && (
        <DisabilityProofScreen
          onNext={handleDisabilityProofNext}
          onBack={goBack}
        />
      )}

      {screen === 'select-club' && (
        <SelectClubScreen
          clubs={INITIAL_CLUBS}
          onSelect={handleSelectClub}
          onBack={goBack}
        />
      )}

      {screen === 'mission' && (
        <PlatformMissionScreen
          role={role}
          onComplete={handleMissionComplete}
          onBack={goBack}
        />
      )}

      {screen === 'club-reg' && (
        <ClubRegisterScreen
          onComplete={handleClubRegComplete}
          onBack={goBack}
        />
      )}

      {screen === 'blind-home' && (
        <BlindHomeScreen
          userData={userData}
          activities={activities}
          signups={signups}
          onSwitchRole={switchRole}
          onViewDetail={handleViewActivityDetail}
          onViewSignup={handleViewSignup}
        />
      )}

      {screen === 'blind-activity-detail' && (
        <ActivityDetailScreen
          activity={currentActivity}
          onSignup={handleBlindSignup}
          onBack={() => goTo('blind-home')}
        />
      )}

      {screen === 'blind-signup-status' && (
        <BlindSignupStatusScreen
          signup={currentSignup}
          activity={activities.find(a => a.id === currentSignup?.activityId)}
          onAdvance={handleAdvanceSignup}
          onBack={() => goTo('blind-home')}
        />
      )}

      {screen === 'volunteer-home' && (
        <VolunteerHomeScreen
          userData={userData}
          activities={activities}
          onSwitchRole={switchRole}
          onSimulateApprove={() => {
            setUserData(prev => ({ ...prev, auditStatus: 'approved' }))
            showToast('已模拟审核通过')
          }}
          onCreateActivity={() => goTo('volunteer-create-activity')}
          onViewSignups={handleViewSignups}
        />
      )}

      {screen === 'volunteer-create-activity' && (
        <VolunteerCreateActivityScreen
          onCreate={handleCreateVolunteerActivity}
          onBack={() => goTo('volunteer-home')}
        />
      )}

      {screen === 'volunteer-signups' && (
        <VolunteerSignupListScreen
          activity={currentActivity}
          onConfirm={() => showToast('已确认参加')}
          onBack={() => goTo('volunteer-home')}
        />
      )}

      {screen === 'club-home' && (
        <ClubAdminHomeScreen
          clubData={clubData}
          activities={activities}
          applications={applications}
          members={members}
          onApprove={handleApprove}
          onReject={handleReject}
          onSwitchRole={switchRole}
          onCreateActivity={() => goTo('club-create-activity')}
        />
      )}

      {screen === 'club-create-activity' && (
        <ClubCreateActivityScreen
          onCreate={handleCreateClubActivity}
          onBack={() => goTo('club-home')}
        />
      )}

      {toast && <Toast message={toast} />}
    </div>
  )
}
