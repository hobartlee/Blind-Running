import { useState, useEffect, useRef } from 'react'
import './App.css'
import {
  HomeIcon,
  UserIcon,
  SettingsIcon,
  CalendarIcon,
  LocationIcon,
  ClockIcon,
  RunningIcon,
  WalkingIcon,
  ChevronLeftIcon,
  CheckIcon,
  PlusIcon,
  EyeIcon,
  HandshakeIcon,
  ClubIcon,
  PhoneIcon,
  MessageIcon,
  StarIcon,
  EmptyIcon,
  RefreshIcon,
  SpinnerIcon,
} from './components/Icons'

// ============ DESIGN TOKENS (JS side - for inline styles) ============
const colors = {
  primary: '#7DD3E8',
  primaryDark: '#5BC0DE',
  success: '#7DD3B8',
  successDark: '#5BC0A8',
  warning: '#F5C596',
  warningDark: '#E8A87C',
  danger: '#F5A5A5',
  dangerDark: '#E88A8A',
  gray50: '#FAFAFA',
  gray100: '#F5F5F7',
  gray200: '#EEEEF0',
  gray300: '#E0E0E3',
  gray400: '#C8C8CC',
  gray500: '#A0A0A5',
  gray600: '#787880',
  gray700: '#505058',
  gray900: '#2A2A30',
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
    clubName: '朝阳公园跑团', author: '跑团管理员', volunteerPhone: '138****1234', signups: 3, confirmed: 1, status: 'upcoming'
  },
  {
    id: 2, title: '周日奥森长跑训练', date: '2026-04-06', time: '06:30',
    location: '奥森南门', duration: '3', method: 'both', type: 'club',
    clubName: '奥森跑团', author: '跑团管理员', volunteerPhone: '139****5678', signups: 2, confirmed: 0, status: 'upcoming'
  },
  {
    id: 3, title: '周三晚间陪伴步行', date: '2026-04-09', time: '19:00',
    location: '朝阳公园西门', duration: '1', method: 'walk', type: 'volunteer',
    clubName: '朝阳公园跑团', author: '张三', volunteerPhone: '137****2222', signups: 1, confirmed: 0, status: 'upcoming'
  },
  {
    id: 4, title: '周六奥森晨跑陪跑', date: '2026-04-12', time: '06:00',
    location: '奥森北门', duration: '2', method: 'guide', type: 'volunteer',
    clubName: '朝阳公园跑团', author: '张三', volunteerPhone: '137****2222', signups: 1, confirmed: 0, status: 'upcoming'
  },
  {
    id: 5, title: '周日公园陪跑活动', date: '2026-04-13', time: '08:00',
    location: '朝阳公园南门', duration: '2', method: 'both', type: 'volunteer',
    clubName: '朝阳公园跑团', author: '张三', volunteerPhone: '137****2222', signups: 1, confirmed: 1, status: 'upcoming'
  },
]

// ============ UTILITY COMPONENTS ============

// Empty State Component
function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <EmptyIcon />
      <h4>{title}</h4>
      <p>{description}</p>
      {onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// Toast Component
function Toast({ message }) {
  return <div className="toast show">{message}</div>
}

// ============ BASE COMPONENTS ============

// Header Component
function Header({ title, onBack, actions }) {
  return (
    <div className="header">
      {onBack && (
        <button className="header-back" onClick={onBack} aria-label="返回">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
      )}
      <h1>{title}</h1>
      {actions && <div className="header-actions">{actions}</div>}
    </div>
  )
}

// Button Component
function Button({ children, variant = 'primary', size = 'md', disabled, onClick, full, style, ariaLabel }) {
  const cls = [
    'btn',
    `btn-${variant}`,
    size === 'lg' ? 'btn-lg' : size === 'sm' ? 'btn-sm' : '',
    full ? 'btn-full' : '',
  ].filter(Boolean).join(' ')
  return (
    <button className={cls} disabled={disabled} onClick={onClick} style={style} aria-label={ariaLabel}>
      {children}
    </button>
  )
}

// Card Component
function Card({ children, style, onClick, interactive }) {
  return (
    <div className={`card ${interactive ? 'interactive' : ''}`} style={style} onClick={onClick}>
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

// ============ SCREENS ============

// Role Selection Screen
function RoleSelectScreen({ onSelect }) {
  return (
    <div className="screen active">
      <div className="role-select">
        <h2>助盲跑</h2>
        <p>连接盲人跑者与志愿者/跑团的平台</p>
        <div className="role-cards stagger-children">
          <div className="role-card" onClick={() => onSelect('blind')} role="button" tabIndex={0} aria-label="选择盲人用户角色">
            <span className="tag">
              <EyeIcon />
              盲人用户
            </span>
            <h3>我是盲人，想跑步</h3>
            <p>浏览活动，报名参加，找到志愿者陪伴跑步</p>
          </div>
          <div className="role-card" onClick={() => onSelect('volunteer')} role="button" tabIndex={0} aria-label="选择志愿者角色">
            <span className="tag">
              <HandshakeIcon />
              志愿者
            </span>
            <h3>我想帮助盲人跑步</h3>
            <p>加入跑团，发布活动，陪伴盲人跑步</p>
          </div>
          <div className="role-card" onClick={() => onSelect('club')} role="button" tabIndex={0} aria-label="选择跑团管理员角色">
            <span className="tag secondary">
              <ClubIcon />
              跑团管理员
            </span>
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
  const [phoneError, setPhoneError] = useState('')
  const [codeError, setCodeError] = useState('')
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
      setPhoneError('请输入正确的11位手机号')
      return
    }
    setPhoneError('')
    setStep(2)
    setCountdown(60)
    setTimeout(() => codeRefs.current[0]?.focus(), 100)
  }

  const handleCodeChange = (idx, val) => {
    const digit = val.replace(/\D/g, '')
    const newCode = [...code]
    newCode[idx] = digit
    setCode(newCode)
    setCodeError('')
    if (digit && idx < 5) codeRefs.current[idx + 1]?.focus()
    if (newCode.every(c => c)) {
      const codeStr = newCode.join('')
      if (codeStr === '123456') {
        onVerified({ phone })
      } else {
        setCodeError('验证码错误，请输入 123456')
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
        {step === 1 ? (
          <>
            <div className="text-center" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>验证手机号</h3>
              <p className="text-secondary">作为<span style={{ fontWeight: 600 }}>{displayRole}</span>登录，请验证手机号</p>
            </div>
            <div className="form-group">
              <label htmlFor="phone" className="form-label">手机号 <span style={{ color: colors.primary }}>*</span></label>
              <input
                id="phone"
                type="tel"
                className={`form-input ${phoneError ? 'error' : ''}`}
                placeholder="请输入手机号"
                maxLength={11}
                value={phone}
                onChange={e => { setPhone(e.target.value); setPhoneError('') }}
                autoComplete="tel"
              />
              {phoneError && <span className="form-error">{phoneError}</span>}
            </div>
            <Button onClick={handleSendCode} full size="lg">
              获取验证码
            </Button>
          </>
        ) : (
          <>
            <div className="text-center" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>输入验证码</h3>
              <p className="text-secondary">已发送验证码至 <span style={{ fontWeight: 600 }}>{maskPhone(phone)}</span></p>
            </div>
            <div className="form-group">
              <label htmlFor="code-0" className="form-label">验证码 <span style={{ color: colors.primary }}>*</span></label>
              <div className="code-input-row">
                {code.map((c, i) => (
                  <input
                    key={i}
                    id={`code-${i}`}
                    ref={el => codeRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]*"
                    className={`code-digit ${c ? 'filled' : ''} ${codeError ? 'error' : ''}`}
                    maxLength="1"
                    value={c}
                    onChange={e => handleCodeChange(i, e.target.value)}
                    onKeyDown={e => handleCodeKey(i, e)}
                    aria-label={`验证码第${i + 1}位`}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                {countdown > 0 ? (
                  <span className="form-hint" style={{ color: colors.gray500 }}>{countdown}秒后可重发</span>
                ) : (
                  <span></span>
                )}
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={countdown > 0}
                  onClick={() => { setCountdown(60); }}
                  aria-label={countdown > 0 ? `${countdown}秒后可重发` : '重发验证码'}
                >
                  重发验证码
                </button>
              </div>
              {codeError && <span className="form-error" style={{ display: 'block', textAlign: 'center', marginTop: 12 }}>{codeError}</span>}
              <p className="form-hint text-center" style={{ marginTop: 12 }}>
                演示用验证码：<strong>123456</strong>
              </p>
            </div>
            <Button onClick={() => {
              const codeStr = code.join('')
              if (codeStr === '123456') {
                onVerified({ phone })
              } else {
                setCodeError('请输入6位验证码')
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
  const [errors, setErrors] = useState({})

  const handleNext = () => {
    const newErrors = {}
    if (!name) newErrors.name = '请输入姓名'
    if (!gender) newErrors.gender = '请选择性别'
    if (!experience) newErrors.experience = '请选择跑步经验'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    onNext({ name, gender, experience })
  }

  return (
    <div className="screen active">
      <Header title="填写个人信息" onBack={onBack} />
      <div className="page">
        <div className="text-center" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>填写个人信息</h3>
          <p className="text-secondary">帮助我们更好地为您服务</p>
        </div>
        <div className="form-group">
          <label htmlFor="name" className="form-label">姓名 <span style={{ color: colors.primary }}>*</span></label>
          <input
            id="name"
            type="text"
            className={`form-input ${errors.name ? 'error' : ''}`}
            placeholder="请输入您的姓名"
            value={name}
            onChange={e => { setName(e.target.value); setErrors({ ...errors, name: '' }) }}
            autoComplete="name"
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">性别 <span style={{ color: colors.primary }}>*</span></label>
          <div className="gender-select" role="radiogroup" aria-label="性别">
            {['男', '女'].map(g => (
              <button
                key={g}
                type="button"
                className={`gender-btn ${gender === g ? 'active' : ''}`}
                onClick={() => { setGender(g); setErrors({ ...errors, gender: '' }) }}
                aria-pressed={gender === g}
              >
                {g}
              </button>
            ))}
          </div>
          {errors.gender && <span className="form-error">{errors.gender}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="experience" className="form-label">跑步经验 <span style={{ color: colors.primary }}>*</span></label>
          <select
            id="experience"
            className={`form-input form-select ${errors.experience ? 'error' : ''}`}
            value={experience}
            onChange={e => { setExperience(e.target.value); setErrors({ ...errors, experience: '' }) }}
          >
            <option value="">请选择您的跑步经验</option>
            <option value="none">暂无跑步经验</option>
            <option value="experienced">有跑步经验</option>
          </select>
          {errors.experience && <span className="form-error">{errors.experience}</span>}
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
        <div className="text-center" style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 12 }}>
            <EyeIcon className="w-16 h-16" style={{ color: colors.primary }} />
          </div>
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>残疾人证明</h3>
          <p className="text-secondary">请确认您是否为视障人士</p>
        </div>
        <Card style={{ background: 'rgba(245, 197, 150, 0.15)', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <EyeIcon className="w-7 h-7" style={{ color: colors.warning }} />
            <div>
              <div style={{ fontWeight: 600 }}>视障人士认证</div>
              <div style={{ fontSize: 13, color: colors.gray500 }}>平台为视障跑者提供专属服务</div>
            </div>
          </div>
          <ul style={{ fontSize: 14, color: colors.gray600, listStyle: 'none', padding: 0 }}>
            {['专属活动推荐与匹配', '专业志愿者陪伴', '优先预约陪跑服务'].map((item, i) => (
              <li key={i} style={{ padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckIcon className="w-4 h-4" style={{ color: colors.success, flexShrink: 0 }} />
                {item}
              </li>
            ))}
          </ul>
        </Card>
        <div className="form-group" style={{ marginTop: 24 }}>
          <label className="form-label">是否持有残疾人证明？</label>
          <div className="gender-select" role="radiogroup" aria-label="是否有残疾人证明">
            <button
              type="button"
              className={`gender-btn ${hasProof === true ? 'active' : ''}`}
              onClick={() => setHasProof(true)}
              aria-pressed={hasProof === true}
            >
              有证明
            </button>
            <button
              type="button"
              className={`gender-btn ${hasProof === false ? 'active' : ''}`}
              onClick={() => setHasProof(false)}
              aria-pressed={hasProof === false}
            >
              暂无证明
            </button>
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
        <div className="text-center" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>选择要加入的跑团</h3>
          <p className="text-secondary">加入跑团后可以参与发布和管理活动</p>
        </div>
        <div className="section-title">可加入的跑团</div>
        {clubs.map(club => (
          <div
            key={club.id}
            className="club-list-item"
            onClick={() => onSelect(club)}
            role="button"
            tabIndex={0}
            aria-label={`选择 ${club.name}，位于 ${club.location}，有 ${club.members} 名成员`}
            onKeyDown={e => e.key === 'Enter' && onSelect(club)}
          >
            <div className="club-avatar">
              <RunningIcon className="w-5 h-5" />
            </div>
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
  const icon = isVolunteer ? <HandshakeIcon className="mission-icon" /> : <EyeIcon className="mission-icon" />
  const desc = isVolunteer
    ? '感谢您愿意帮助视障朋友跑步。您的每一次陪伴，都让他们感受到社会的温暖。'
    : '我们致力于为视障跑者提供安全、温暖的跑步体验。每位志愿者都经过跑团审核，确保您的安全。'

  return (
    <div className="screen active">
      <Header title={title} onBack={onBack} />
      <div className="page">
        <div className="mission-banner">
          {icon}
          <h2 className="mission-title">{title}</h2>
          <p className="mission-desc">{desc}</p>
        </div>
        <div className="guide-card">
          <h4>服务准则</h4>
          <ul>
            {guidelines.map((g, i) => <li key={i}>{g}</li>)}
          </ul>
        </div>
        <div
          className={`checkbox-agree ${agreed ? 'checked' : ''}`}
          onClick={() => setAgreed(!agreed)}
          role="checkbox"
          aria-checked={agreed}
          tabIndex={0}
          onKeyDown={e => e.key === ' ' && setAgreed(!agreed)}
        >
          <div className="checkbox-box">{agreed ? <CheckIcon className="w-4 h-4" /> : null}</div>
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
  const [errors, setErrors] = useState({})

  const handleStep1Next = () => {
    const newErrors = {}
    if (!name) newErrors.name = '请输入跑团名称'
    if (!contact || contact.length !== 11) newErrors.contact = '请输入正确的11位手机号'
    if (!location) newErrors.location = '请输入跑团所在地'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setStep(2)
  }

  return (
    <div className="screen active">
      <Header title="跑团入驻" onBack={onBack} />
      <div className="page">
        {step === 1 ? (
          <>
            <div className="text-center" style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 12 }}>
                <ClubIcon className="w-16 h-16" style={{ color: colors.primary }} />
              </div>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>跑团信息填写</h3>
              <p className="text-secondary">请填写跑团基本信息</p>
            </div>
            <div className="form-group">
              <label htmlFor="club-name" className="form-label">跑团名称 <span style={{ color: colors.primary }}>*</span></label>
              <input
                id="club-name"
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="例如：朝阳公园跑团"
                value={name}
                onChange={e => { setName(e.target.value); setErrors({ ...errors, name: '' }) }}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="club-contact" className="form-label">负责人联系方式 <span style={{ color: colors.primary }}>*</span></label>
              <input
                id="club-contact"
                type="tel"
                className={`form-input ${errors.contact ? 'error' : ''}`}
                placeholder="手机号（用于登录）"
                maxLength={11}
                value={contact}
                onChange={e => { setContact(e.target.value); setErrors({ ...errors, contact: '' }) }}
                autoComplete="tel"
              />
              {errors.contact && <span className="form-error">{errors.contact}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="club-location" className="form-label">跑团所在地 <span style={{ color: colors.primary }}>*</span></label>
              <input
                id="club-location"
                type="text"
                className={`form-input ${errors.location ? 'error' : ''}`}
                placeholder="例如：北京朝阳"
                value={location}
                onChange={e => { setLocation(e.target.value); setErrors({ ...errors, location: '' }) }}
              />
              {errors.location && <span className="form-error">{errors.location}</span>}
            </div>
            <Button onClick={handleStep1Next} full size="lg" style={{ marginTop: 24 }}>下一步</Button>
          </>
        ) : (
          <>
            <div className="mission-banner" style={{ margin: '0 -20px 24px', padding: 24 }}>
              <ClubIcon className="mission-icon" />
              <h2 className="mission-title">跑团服务须知</h2>
              <p className="mission-desc">作为跑团管理员，您将负责审核志愿者、管理跑团活动，确保助盲跑服务的安全与质量。</p>
            </div>
            <div className="guide-card">
              <h4>管理员职责</h4>
              <ul>
                {['审核志愿者加入申请', '发布和管理跑团活动', '确保活动安全进行', '处理活动中的问题与投诉', '维护跑团良好声誉'].map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </div>
            <div
              className={`checkbox-agree ${agreed ? 'checked' : ''}`}
              onClick={() => setAgreed(!agreed)}
              role="checkbox"
              aria-checked={agreed}
              tabIndex={0}
              onKeyDown={e => e.key === ' ' && setAgreed(!agreed)}
            >
              <div className="checkbox-box">{agreed ? <CheckIcon className="w-4 h-4" /> : null}</div>
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
function BlindHomeScreen({ userData, activities, signups, onSwitchRole, onViewDetail, onViewSignup, onMyProfile }) {
  return (
    <div className="screen active">
      <Header title="助盲跑" actions={<Button size="sm" variant="secondary" onClick={onSwitchRole} ariaLabel="切换角色">切换</Button>} />
      <div className="page stagger-children">
        <Card style={{ background: 'linear-gradient(135deg, rgba(125, 211, 232, 0.15) 0%, rgba(125, 211, 184, 0.15) 100%)', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="avatar avatar-lg" style={{ background: 'linear-gradient(135deg, #7DD3E8 0%, #5BC0DE 100%)' }}>
              <EyeIcon className="w-6 h-6" />
            </div>
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
                <Card
                  key={s.id}
                  style={{ borderLeft: `4px solid ${colors.primary}` }}
                  interactive
                  onClick={() => onViewSignup(s)}
                >
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
        {activities.length === 0 ? (
          <EmptyState
            title="暂无活动"
            description="暂时没有可参加的活动，敬请期待"
          />
        ) : (
          activities.map(act => (
            <Card
              key={act.id}
              interactive
              onClick={() => onViewDetail(act)}
              aria-label={`活动：${act.title}，${act.date}，${act.location}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{act.title}</div>
                <span className={`activity-badge ${act.type === 'club' ? 'club' : ''}`}>
                  {act.type === 'club' ? '跑团' : '志愿者'}
                </span>
              </div>
              <div style={{ fontSize: 14, color: colors.gray500, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CalendarIcon className="w-4 h-4" style={{ flexShrink: 0 }} />
                  {act.date} {act.time}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <LocationIcon className="w-4 h-4" style={{ flexShrink: 0 }} />
                  {act.location}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ClockIcon className="w-4 h-4" style={{ flexShrink: 0 }} />
                  约 {act.duration} 小时 · {act.method === 'guide' ? '引导跑步' : act.method === 'walk' ? '陪伴步行' : '均可'}
                </span>
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${colors.gray100}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: colors.gray500 }}>{act.clubName} · {act.author}</span>
                <span style={{ color: colors.primary, fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                  点击报名
                  <ChevronLeftIcon className="w-4 h-4" style={{ transform: 'rotate(180deg)' }} />
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
      <div className="bottom-nav">
        <button className="nav-item active" aria-label="首页">
          <HomeIcon className="nav-icon" />
          <span>首页</span>
        </button>
        <button className="nav-item" aria-label="我的" onClick={onMyProfile}>
          <UserIcon className="nav-icon" />
          <span>我的</span>
        </button>
      </div>
    </div>
  )
}

// Volunteer Home Screen
function VolunteerHomeScreen({ userData, activities, signups, onSwitchRole, onSimulateApprove, onCreateActivity, onViewSignups, onMyProfile, onShowToast, onCancelActivity }) {
  const hasClub = !!userData.joinedClub
  const isApproved = userData.auditStatus === 'approved'
  const myActivities = activities.filter(a => a.type === 'volunteer')
  const [activityFilter, setActivityFilter] = useState('all')

  // 根据报名状态计算活动状态
  const getActivityStatus = (activity) => {
    if (activity.status === 'cancelled') return 'cancelled'
    if (activity.status === 'completed') return 'completed'
    const activitySignups = signups.filter(s => s.activityId === activity.id)
    if (activitySignups.length === 0) return 'upcoming'
    const allCompleted = activitySignups.every(s => s.status === 3)
    if (allCompleted) return 'completed'
    const hasMatched = activitySignups.some(s => s.status === 2)
    // 检查是否过期：已过活动日期时间且有匹配成功的报名
    if (hasMatched) {
      const now = new Date()
      const activityDateTime = new Date(`${activity.date} ${activity.time.split('-')[0]}`)
      if (now > activityDateTime) return 'completed'
      return 'matched'
    }
    return 'pending'
  }

  const filteredActivities = myActivities.filter(a => {
    const status = getActivityStatus(a)
    if (activityFilter === 'all') return true
    if (activityFilter === 'in_progress') {
      return status === 'pending' || status === 'matched' || status === 'upcoming'
    }
    if (activityFilter === 'completed') return status === 'completed'
    return true
  })

  return (
    <div className="screen active">
      <Header title="助盲跑" actions={<Button size="sm" variant="secondary" onClick={onSwitchRole} ariaLabel="切换角色">切换</Button>} />
      <div className="page stagger-children">
        {/* 跑团信息卡片 - 融合审核状态 */}
        {hasClub ? (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="avatar" style={{ background: colors.success }}>
                <ClubIcon className="w-5 h-5" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{userData.joinedClub.name}</div>
                <div style={{ fontSize: 13, color: colors.gray500 }}>已入驻 · 志愿者</div>
              </div>
              {isApproved ? (
                <Badge variant="confirmed">已认证</Badge>
              ) : (
                <Badge variant="pending">审核中</Badge>
              )}
            </div>
            {!isApproved && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${colors.gray200}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: colors.gray500 }}>等待跑团审核通过</span>
                <Button variant="secondary" size="sm" onClick={onSimulateApprove}>模拟通过</Button>
              </div>
            )}
          </Card>
        ) : (
          <Card style={{ border: `2px dashed ${colors.gray300}`, background: colors.gray50, textAlign: 'center', padding: 32 }}>
            <RunningIcon style={{ width: 48, height: 48, margin: '0 auto 12px', color: colors.gray400 }} />
            <h3 style={{ marginBottom: 6 }}>您还未加入跑团</h3>
            <p style={{ fontSize: 14, color: colors.gray500 }}>加入跑团后才能发布助跑活动</p>
          </Card>
        )}

        {/* 统计区域 - 紧凑布局 */}
        {hasClub && isApproved && (
          <div className="stats-compact">
            <div className="stat-item">
              <div className="stat-number">{myActivities.length}</div>
              <div className="stat-text">发布活动</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">{myActivities.reduce((s, a) => s + parseInt(a.duration || 0), 0)}h</div>
              <div className="stat-text">陪伴时长</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">4.9</div>
              <div className="stat-text">评分</div>
            </div>
          </div>
        )}

        {/* 活动列表 */}
        {hasClub && isApproved && (
          <>
            <div className="section-title">我的活动</div>
            <div className="tabs" style={{ marginBottom: 16 }}>
              <button className={`tab ${activityFilter === 'all' ? 'active' : ''}`} onClick={() => setActivityFilter('all')}>全部</button>
              <button className={`tab ${activityFilter === 'in_progress' ? 'active' : ''}`} onClick={() => setActivityFilter('in_progress')}>进行中</button>
              <button className={`tab ${activityFilter === 'completed' ? 'active' : ''}`} onClick={() => setActivityFilter('completed')}>已完成</button>
            </div>
            {filteredActivities.length === 0 ? (
              <EmptyState
                title="暂无活动"
                description={activityFilter === 'all' ? '还没有发布任何活动' : activityFilter === 'in_progress' ? '没有进行中的活动' : '没有已完成的活动'}
              />
            ) : (
              filteredActivities.map(a => {
                const actStatus = getActivityStatus(a)
                const signupCount = signups.filter(s => s.activityId === a.id).length
                return (
                  <Card
                    key={a.id}
                    interactive={isApproved && actStatus !== 'cancelled'}
                    onClick={isApproved && actStatus !== 'cancelled' ? () => onViewSignups(a) : undefined}
                    aria-label={`活动：${a.title}，${a.date}，${a.location}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{a.title}</div>
                        <p style={{ fontSize: 13, color: colors.gray500 }}>{a.date} {a.time} · {a.location}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {actStatus === 'cancelled' ? (
                          <Badge variant="danger">已取消</Badge>
                        ) : actStatus === 'completed' ? (
                          <Badge variant="confirmed">已完成</Badge>
                        ) : actStatus === 'matched' ? (
                          <Badge variant="success">匹配成功</Badge>
                        ) : signupCount > 0 ? (
                          <Badge variant="pending">{signupCount}人待确认</Badge>
                        ) : (
                          <Badge variant="pending">待报名</Badge>
                        )}
                      </div>
                    </div>
                    {isApproved && actStatus !== 'cancelled' && actStatus !== 'completed' && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${colors.gray200}`, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onShowToast?.('请电话联络对方后取消活动'); onCancelActivity(a.id) }}>取消活动</Button>
                      </div>
                    )}
                    {actStatus === 'cancelled' && (
                      <div style={{ marginTop: 8, fontSize: 12, color: colors.danger }}>已取消，请电话联络对方</div>
                    )}
                  </Card>
                )
              })
            )}
            {/* 只有一个发布活动按钮 */}
            {isApproved ? (
              <Button onClick={onCreateActivity} full style={{ marginTop: 16 }}>
                <PlusIcon style={{ width: 20, height: 20 }} />
                发布新活动
              </Button>
            ) : (
              <Button onClick={() => onShowToast?.('请等待跑团审核通过后再发布活动')} full style={{ marginTop: 16, opacity: 0.6 }}>
                <PlusIcon style={{ width: 20, height: 20 }} />
                发布新活动
              </Button>
            )}
          </>
        )}
      </div>
      <div className="bottom-nav">
        <button className="nav-item active" aria-label="首页">
          <HomeIcon className="nav-icon" />
          <span>首页</span>
        </button>
        <button className="nav-item" aria-label="我的" onClick={onMyProfile}>
          <UserIcon className="nav-icon" />
          <span>我的</span>
        </button>
      </div>
    </div>
  )
}

// My Profile Screen
function MyProfileScreen({ userData, role, onBack }) {
  const experienceMap = {
    'none': '暂无跑步经验',
    'experienced': '有跑步经验',
    'beginner': '跑步新手',
    'intermediate': '有经验（1-3年）',
    'experienced_old': '经验丰富（3年以上）',
  }

  const roleLabels = {
    'blind': '视障跑者',
    'volunteer': '志愿者',
    'club': '跑团管理员',
  }

  return (
    <div className="screen active">
      <Header title="我的" onBack={onBack} />
      <div className="page stagger-children">
        <Card style={{ background: 'linear-gradient(135deg, rgba(125, 211, 232, 0.15) 0%, rgba(125, 211, 184, 0.15) 100%)', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="avatar avatar-lg" style={{ background: 'linear-gradient(135deg, #7DD3E8 0%, #5BC0DE 100%)' }}>
              {userData.name?.[0] || '我'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 600 }}>{userData.name || '未填写'}</div>
              <div style={{ fontSize: 13, color: colors.gray500, marginTop: 4 }}>{roleLabels[role] || '用户'}</div>
            </div>
            <Badge variant="warning">已认证</Badge>
          </div>
        </Card>

        <div className="section-title">基本信息</div>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: colors.gray500 }}>手机号</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{userData.phone || '未填写'}</span>
            </div>
            <div style={{ height: 1, background: colors.gray100 }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: colors.gray500 }}>姓名</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{userData.name || '未填写'}</span>
            </div>
            <div style={{ height: 1, background: colors.gray100 }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: colors.gray500 }}>性别</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{userData.gender === '男' ? '男' : userData.gender === '女' ? '女' : '未填写'}</span>
            </div>
            <div style={{ height: 1, background: colors.gray100 }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: colors.gray500 }}>跑步经验</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{experienceMap[userData.experience] || '未填写'}</span>
            </div>
            {userData.joinedClub && (
              <>
                <div style={{ height: 1, background: colors.gray100 }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: colors.gray500 }}>所属跑团</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{userData.joinedClub.name}</span>
                </div>
              </>
            )}
            {userData.hasDisabilityProof !== undefined && (
              <>
                <div style={{ height: 1, background: colors.gray100 }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: colors.gray500 }}>残疾人证明</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: userData.hasDisabilityProof ? colors.success : colors.warning }}>
                    {userData.hasDisabilityProof ? '已认证' : '暂无证明'}
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
      <div className="bottom-nav">
        <button className="nav-item" aria-label="首页" onClick={onBack}>
          <HomeIcon className="nav-icon" />
          <span>首页</span>
        </button>
        <button className="nav-item active" aria-label="我的">
          <UserIcon className="nav-icon" />
          <span>我的</span>
        </button>
      </div>
    </div>
  )
}

// Club Admin Home Screen
function ClubAdminHomeScreen({ clubData, activities, applications, members, onApprove, onReject, onSwitchRole, onCreateActivity }) {
  const [tab, setTab] = useState('activities')
  const clubActivities = activities.filter(a => a.type === 'club')
  const experienceMap = {
    'none': '暂无跑步经验',
    'experienced': '有跑步经验',
    'beginner': '跑步新手',
    'intermediate': '有经验（1-3年）',
    'experienced_old': '经验丰富（3年以上）',
  }

  return (
    <div className="screen active">
      <Header title={clubData.name || '跑团管理'} actions={<Button size="sm" variant="secondary" onClick={onSwitchRole} ariaLabel="切换角色">切换</Button>} />
      <div className="page stagger-children">
        <Card style={{ background: 'linear-gradient(135deg, rgba(125, 211, 232, 0.12) 0%, rgba(155, 125, 212, 0.12) 100%)', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="avatar avatar-lg" style={{ background: `linear-gradient(135deg, ${colors.success} 0%, ${colors.successDark} 100%)` }}>
              <ClubIcon className="w-6 h-6" />
            </div>
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
          <div className="stat-card">
            <div className="stat-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              4.8 <StarIcon className="w-4 h-4" style={{ color: colors.warning }} />
            </div>
            <div className="stat-label">评分</div>
          </div>
        </div>

        <div className="tabs" role="tablist">
          <button
            className={`tab ${tab === 'activities' ? 'active' : ''}`}
            onClick={() => setTab('activities')}
            role="tab"
            aria-selected={tab === 'activities'}
          >
            活动管理
          </button>
          <button
            className={`tab ${tab === 'members' ? 'active' : ''}`}
            onClick={() => setTab('members')}
            role="tab"
            aria-selected={tab === 'members'}
          >
            成员管理
          </button>
        </div>

        {tab === 'activities' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="section-title" style={{ marginBottom: 0 }}>跑团活动</div>
              <Button size="sm" variant="primary" onClick={onCreateActivity} ariaLabel="发布新活动">
                <PlusIcon className="w-4 h-4" />
                发布
              </Button>
            </div>
            {clubActivities.length === 0 ? (
              <EmptyState
                title="暂无活动"
                description="发布第一期跑团例跑吧"
                actionLabel="发布活动"
                onAction={onCreateActivity}
              />
            ) : (
              clubActivities.map(a => (
                <Card key={a.id}>
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
                    <div className="member-meta">
                      <PhoneIcon className="w-3 h-3" style={{ display: 'inline', marginRight: 4 }} />
                      {m.phone} · 申请于 {m.applyTime}
                    </div>
                    <div style={{ fontSize: 12, color: colors.gray400, marginTop: 2 }}>跑步经验：{experienceMap[m.experience] || m.experience}</div>
                  </div>
                  <div className="member-actions">
                    <Button size="sm" variant="success" onClick={() => onApprove(m.id)} ariaLabel={`通过 ${m.name} 的申请`}>通过</Button>
                    <Button size="sm" variant="danger" onClick={() => onReject(m.id)} ariaLabel={`拒绝 ${m.name} 的申请`}>拒绝</Button>
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
        <button className="nav-item active" aria-label="首页">
          <HomeIcon className="nav-icon" />
          <span>首页</span>
        </button>
        <button className="nav-item" aria-label="设置">
          <SettingsIcon className="nav-icon" />
          <span>设置</span>
        </button>
      </div>
    </div>
  )
}

// ============ ACTIVITY SCREENS ============

// Activity Detail Screen (Blind User View)
function ActivityDetailScreen({ activity, onSignup, onBack }) {
  if (!activity) return null

  const formatTitle = (title) => {
    // 如果title包含时间范围，直接返回
    if (title && title.includes('-')) return title
    return title || '活动'
  }

  return (
    <div className="screen active">
      <Header title="活动详情" onBack={onBack} />
      <div className="page">
        <Card style={{ marginBottom: 16 }}>
          <span className={`activity-badge ${activity.type === 'club' ? 'club' : ''}`} style={{ marginBottom: 12 }}>
            {activity.type === 'club' ? '跑团活动' : '志愿者活动'}
          </span>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{formatTitle(activity.title)}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 15, color: colors.gray700 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CalendarIcon style={{ width: 20, height: 20, color: colors.primary, flexShrink: 0 }} />
              <span>{activity.date}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <LocationIcon style={{ width: 20, height: 20, color: colors.primary, flexShrink: 0 }} />
              <span>{activity.location}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ClockIcon style={{ width: 20, height: 20, color: colors.primary, flexShrink: 0 }} />
              <span>{activity.time}</span>
            </div>
          </div>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="avatar" style={{ background: activity.type === 'club' ? colors.success : colors.primary }}>
              {activity.type === 'club' ? <ClubIcon style={{ width: 20, height: 20 }} /> : <UserIcon style={{ width: 20, height: 20 }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{activity.clubName}</div>
              <div style={{ fontSize: 13, color: colors.gray500 }}>{activity.author}</div>
            </div>
          </div>
          {activity.volunteerPhone && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${colors.gray200}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <PhoneIcon style={{ width: 16, height: 16, color: colors.primary }} />
              <span style={{ fontSize: 14, color: colors.gray700 }}>{activity.volunteerPhone}</span>
            </div>
          )}
        </Card>

        <Button onClick={onSignup} full style={{ marginTop: 8 }}>
          报名参加
        </Button>
      </div>
    </div>
  )
}

// Blind Signup Status Screen
function BlindSignupStatusScreen({ signup, activity, onAdvance, onBack, onShowToast }) {
  const statusLabels = ['待确认同行', '已确认待出行', '匹配成功待出行', '出行完成']
  const statusColors = ['pending', 'confirmed', 'success', 'status-3']

  if (!signup) return null

  const handleCopyPhone = () => {
    const phoneToCopy = activity?.volunteerPhone || '138****1234'
    navigator.clipboard?.writeText(phoneToCopy).then(() => {
      onShowToast?.('已复制志愿者电话')
    })
  }

  return (
    <div className="screen active">
      <Header title="报名状态" onBack={onBack} />
      <div className="page">
        <Card style={{ marginBottom: 16 }}>
          <span className={`activity-badge ${activity?.type === 'club' ? 'club' : ''}`} style={{ marginBottom: 12 }}>
            {activity?.type === 'club' ? '跑团活动' : '志愿者活动'}
          </span>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{activity?.title || '活动'}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 15, color: colors.gray700 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CalendarIcon style={{ width: 20, height: 20, color: colors.primary, flexShrink: 0 }} />
              <span>{activity?.date}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <LocationIcon style={{ width: 20, height: 20, color: colors.primary, flexShrink: 0 }} />
              <span>{activity?.location}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ClockIcon style={{ width: 20, height: 20, color: colors.primary, flexShrink: 0 }} />
              <span>{activity?.time}</span>
            </div>
          </div>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="avatar" style={{ background: activity?.type === 'club' ? colors.success : colors.primary }}>
              {activity?.type === 'club' ? <ClubIcon style={{ width: 20, height: 20 }} /> : <UserIcon style={{ width: 20, height: 20 }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{signup.volunteerName}</div>
              <div style={{ fontSize: 13, color: colors.gray500 }}>志愿者</div>
            </div>
          </div>
          {activity?.volunteerPhone && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${colors.gray200}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PhoneIcon style={{ width: 16, height: 16, color: colors.primary }} />
                <span style={{ fontSize: 14, color: colors.gray700 }}>{activity.volunteerPhone}</span>
              </div>
              <button className="copy-btn" onClick={handleCopyPhone}>复制电话</button>
            </div>
          )}
        </Card>

        <Card style={{ marginTop: 16 }}>
          <div className="section-title">状态进度</div>
          <div className="progress-steps">
            {statusLabels.map((label, i) => (
              <div
                key={i}
                className={`progress-step ${i < signup.status || signup.status === 3 ? 'completed' : i === signup.status ? 'active' : ''}`}
              >
                <div className="step-circle">{i < signup.status || signup.status === 3 ? <CheckIcon style={{ width: 14, height: 14 }} /> : i + 1}</div>
                <div className="step-label">{label}</div>
              </div>
            ))}
          </div>
          {signup.status < 3 ? (
            <Button onClick={() => onAdvance(signup.id)} full style={{ marginTop: 12 }}>
              {signup.status === 0 ? '确认已联络' : signup.status === 1 ? '确认出行' : '确认完成'}
            </Button>
          ) : (
            <div style={{ textAlign: 'center', color: colors.success, padding: 12, fontWeight: 500 }}>
              <CheckIcon style={{ width: 20, height: 20, display: 'inline', marginRight: 4 }} />
              已完成本次跑步活动
            </div>
          )}
        </Card>

        <Card style={{ marginTop: 16 }}>
          <div className="section-title">您的信息</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="avatar" style={{ background: colors.warning }}>
              <EyeIcon style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{signup.blindName}</div>
              <div style={{ fontSize: 13, color: colors.gray500 }}>
                {signup.blindPhone || '未填写'}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// Volunteer Create Activity Screen
function VolunteerCreateActivityScreen({ onCreate, onBack }) {
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('07:00')
  const [endTime, setEndTime] = useState('09:00')
  const [location, setLocation] = useState('')
  const [errors, setErrors] = useState({})

  const handleCreate = () => {
    const newErrors = {}
    if (!date) newErrors.date = '请选择日期'
    if (!startTime) newErrors.startTime = '请选择开始时间'
    if (!endTime) newErrors.endTime = '请选择结束时间'
    if (!location) newErrors.location = '请输入地点'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    // 计算时长（小时）
    const start = startTime.split(':').map(Number)
    const end = endTime.split(':').map(Number)
    const duration = (end[0] * 60 + end[1] - start[0] * 60 - start[1]) / 60
    // 生成标题：3月4日活动
    const dateObj = new Date(date)
    const month = dateObj.getMonth() + 1
    const day = dateObj.getDate()
    const title = `${month}月${day}日活动`
    onCreate({
      name: title,
      date,
      time: `${startTime}-${endTime}`,
      location,
      duration: String(Math.max(1, Math.round(duration))),
      method: 'both',
      note: ''
    })
  }

  return (
    <div className="screen active">
      <Header title="发布活动" onBack={onBack} />
      <div className="page">
        <div className="form-group">
          <label htmlFor="activity-date" className="form-label">日期</label>
          <input
            id="activity-date"
            type="date"
            className={`form-input ${errors.date ? 'error' : ''}`}
            value={date}
            onChange={e => { setDate(e.target.value); setErrors({ ...errors, date: '' }) }}
          />
          {errors.date && <span className="form-error">{errors.date}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="activity-location" className="form-label">地点</label>
          <input
            id="activity-location"
            className={`form-input ${errors.location ? 'error' : ''}`}
            placeholder="例如：朝阳公园东门"
            value={location}
            onChange={e => { setLocation(e.target.value); setErrors({ ...errors, location: '' }) }}
          />
          {errors.location && <span className="form-error">{errors.location}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">时间段</label>
          <div className="time-range">
            <input
              type="time"
              className={`form-input ${errors.startTime ? 'error' : ''}`}
              value={startTime}
              onChange={e => { setStartTime(e.target.value); setErrors({ ...errors, startTime: '' }) }}
            />
            <span className="time-separator">至</span>
            <input
              type="time"
              className={`form-input ${errors.endTime ? 'error' : ''}`}
              value={endTime}
              onChange={e => { setEndTime(e.target.value); setErrors({ ...errors, endTime: '' }) }}
            />
          </div>
          {errors.startTime && <span className="form-error">{errors.startTime}</span>}
        </div>
        <Button onClick={handleCreate} full style={{ marginTop: 24 }}>
          发布活动
        </Button>
      </div>
    </div>
  )
}

// Volunteer Signup List Screen
function VolunteerSignupListScreen({ activity, signups, onConfirm, onBack }) {
  const activitySignups = signups.filter(s => s.activityId === activity?.id)

  return (
    <div className="screen active">
      <Header title="报名列表" onBack={onBack} />
      <div className="page">
        <Card style={{ background: 'rgba(125, 211, 232, 0.08)', border: '1px solid rgba(125, 211, 232, 0.3)', marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{activity?.title}</div>
          <div style={{ fontSize: 13, color: colors.gray500 }}>
            <CalendarIcon className="w-4 h-4" style={{ display: 'inline', marginRight: 4 }} />
            {activity?.date} {activity?.time} · {activity?.location}
          </div>
        </Card>

        <div className="section-title">报名列表 ({activitySignups.length})</div>
        {activitySignups.length === 0 ? (
          <EmptyState title="暂无报名" description="还没有人报名此活动" />
        ) : (
          activitySignups.map(s => (
            <Card key={s.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.blindName}</div>
                  <div style={{ fontSize: 13, color: colors.gray500 }}>
                    <PhoneIcon className="w-3 h-3" style={{ display: 'inline', marginRight: 4 }} />
                    {s.blindPhone}
                  </div>
                </div>
                <Badge variant={s.status === 1 ? 'confirmed' : s.status === 2 ? 'success' : s.status === 3 ? 'confirmed' : 'pending'}>{s.statusText}</Badge>
              </div>
              {s.status === 0 && (
                <Button size="sm" variant="success" style={{ marginTop: 8 }} onClick={onConfirm} ariaLabel={`确认 ${s.blindName} 参加`}>
                  <CheckIcon className="w-4 h-4" />
                  确认参加
                </Button>
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
  const [errors, setErrors] = useState({})

  const handleCreate = () => {
    const newErrors = {}
    if (!name) newErrors.name = '请输入活动名称'
    if (!date) newErrors.date = '请选择日期'
    if (!time) newErrors.time = '请选择时间'
    if (!location) newErrors.location = '请输入集合地点'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    onCreate({ name, date, time, location, duration, note })
  }

  return (
    <div className="screen active">
      <Header title="发布跑团活动" onBack={onBack} />
      <div className="page">
        <div className="form-group">
          <label htmlFor="club-activity-name" className="form-label">活动名称</label>
          <input
            id="club-activity-name"
            className={`form-input ${errors.name ? 'error' : ''}`}
            placeholder="例如：周六例跑"
            value={name}
            onChange={e => { setName(e.target.value); setErrors({ ...errors, name: '' }) }}
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="club-activity-date" className="form-label">日期</label>
          <input
            id="club-activity-date"
            type="date"
            className={`form-input ${errors.date ? 'error' : ''}`}
            value={date}
            onChange={e => { setDate(e.target.value); setErrors({ ...errors, date: '' }) }}
          />
          {errors.date && <span className="form-error">{errors.date}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="club-activity-time" className="form-label">时间</label>
          <input
            id="club-activity-time"
            type="time"
            className={`form-input ${errors.time ? 'error' : ''}`}
            value={time}
            onChange={e => { setTime(e.target.value); setErrors({ ...errors, time: '' }) }}
          />
          {errors.time && <span className="form-error">{errors.time}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="club-activity-location" className="form-label">集合地点</label>
          <input
            id="club-activity-location"
            className={`form-input ${errors.location ? 'error' : ''}`}
            placeholder="例如：朝阳公园东门"
            value={location}
            onChange={e => { setLocation(e.target.value); setErrors({ ...errors, location: '' }) }}
          />
          {errors.location && <span className="form-error">{errors.location}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="club-activity-duration" className="form-label">预计时长</label>
          <select
            id="club-activity-duration"
            className="form-input form-select"
            value={duration}
            onChange={e => setDuration(e.target.value)}
          >
            <option value="1">1 小时</option>
            <option value="2">2 小时</option>
            <option value="3">3 小时</option>
            <option value="4">4 小时以上</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="club-activity-note" className="form-label">备注</label>
          <textarea
            id="club-activity-note"
            className="form-input"
            style={{ minHeight: 80 }}
            placeholder="其他说明（可选）"
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>
        <Button onClick={handleCreate} full size="lg">
          <PlusIcon className="w-5 h-5" />
          发布活动
        </Button>
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
    { id: 103, activityId: 4, blindName: '赵鹏', blindPhone: '134****7890', volunteerName: '张三', status: 0, statusText: '待确认同行' },
    { id: 104, activityId: 5, blindName: '周莉', blindPhone: '133****4567', volunteerName: '张三', status: 1, statusText: '已确认待出行' },
  ])
  const [applications, setApplications] = useState([
    { id: 1, name: '李明', phone: '138****1234', applyTime: '2026-04-01', experience: '有半年跑步经验' },
    { id: 2, name: '王芳', phone: '139****5678', applyTime: '2026-04-02', experience: '刚开始跑步' },
  ])
  const [members, setMembers] = useState([
    { id: 3, name: '张三', joinTime: '2025-01-15', phone: '137****2222', activities: 12, hours: 28 },
    { id: 4, name: '李四', joinTime: '2025-03-20', phone: '138****4444', activities: 8, hours: 16 },
  ])

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
    setSignups(prev => {
      const updated = prev.find(s => s.id === id)
      if (updated) setCurrentSignup(updated)
      return prev
    })
    showToast('状态已更新')
  }

  const handleCancelActivity = (activityId) => {
    setActivities(prev => prev.map(a => {
      if (a.id === activityId) {
        return { ...a, status: 'cancelled' }
      }
      return a
    }))
    showToast('活动已取消')
  }

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

  const handleViewSignups = (act) => {
    setCurrentActivity(act)
    goTo('volunteer-signups')
  }

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
          onMyProfile={() => goTo('my-profile')}
        />
      )}

      {screen === 'my-profile' && (
        <MyProfileScreen
          userData={userData}
          role={role}
          onBack={() => goTo(role === 'blind' ? 'blind-home' : 'volunteer-home')}
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
          onShowToast={setToast}
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
          onMyProfile={() => goTo('my-profile')}
          onShowToast={showToast}
          signups={signups}
          onCancelActivity={handleCancelActivity}
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
          signups={signups}
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
