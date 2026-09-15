import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import CheckIcon from '@mui/icons-material/Check'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CloseIcon from '@mui/icons-material/Close'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import RefreshIcon from '@mui/icons-material/Refresh'
import { type AppLocaleId } from '../data/localeConfig'
import { useLocale } from '../context/LocaleContext'
import SystemStatusBar from '../components/MainUI/SystemStatusBar'
import { APP_SCREEN_SIZE, figmaPx } from '../utils/figmaScale'
import { useOnboarding } from './OnboardingContext'
import { writeOnboarded, type OnboardHskLevel, type OnboardPath } from './onboardingStorage'
import { getExamDeviceId } from '../services/hskExamService'
import './onboarding.css'

const p = (n: number) => figmaPx(n, APP_SCREEN_SIZE)

/** Figma「开机向导1选择语言」1920 出数 → 运行时画布 */
const onboardCanvasStyle = {
  '--ob-rail': `${p(640)}px`,
  '--ob-logo-w': `${p(312)}px`,
  '--ob-logo-h': `${p(76)}px`,
  '--ob-rail-pad-x': `${p(60)}px`,
  '--ob-rail-pad-top': `${p(60)}px`,
  '--ob-logo-gap': `${p(120)}px`,
  '--ob-progress-gap': `${p(100)}px`,
  '--ob-progress-inner-gap': `${p(10)}px`,
  '--ob-track-h': `${p(20)}px`,
  '--ob-step-gap': `${p(40)}px`,
  '--ob-num': `${p(60)}px`,
  '--ob-num-r': `${p(16)}px`,
  '--ob-step-text-gap': `${p(28)}px`,
  '--ob-fs-32': `${p(32)}px`,
  '--ob-fs-48': `${p(48)}px`,
  '--ob-lh-32': `${p(51)}px`,
  '--ob-main-pad': `${p(100)}px`,
  '--ob-main-pad-bottom': `${p(60)}px`,
  '--ob-head-gap': `${p(60)}px`,
  '--ob-card-h': `${p(131)}px`,
  '--ob-card-pad': `${p(40)}px`,
  '--ob-card-r': `${p(24)}px`,
  '--ob-card-r-on': `${p(32)}px`,
  '--ob-lang-gap-y': `${p(40)}px`,
  '--ob-lang-gap-x': `${p(60)}px`,
  '--ob-flag': `${p(48)}px`,
  '--ob-next-h': `${p(100)}px`,
  '--ob-next-r': `${p(100)}px`,
  '--ob-next-icon': `${p(40)}px`,
  '--ob-glow': `${p(1000)}px`,
  '--ob-glow-blur': `${p(250)}px`,
  '--ob-avatar': `${p(168)}px`,
  '--ob-cam': `${p(60)}px`,
  '--ob-cam-inset': `${p(10)}px`,
  '--ob-field-h': `${p(100)}px`,
  '--ob-field-r': `${p(20)}px`,
  '--ob-field-pad': `${p(40)}px`,
  '--ob-fs-28': `${p(28)}px`,
  '--ob-fs-24': `${p(24)}px`,
  '--ob-back-w': `${p(263)}px`,
  '--ob-back-icon': `${p(60)}px`,
  '--ob-profile-gap': `${p(16)}px`,
  '--ob-cta-gap': `${p(24)}px`,
  '--ob-fs-40': `${p(40)}px`,
  '--ob-wlan-h': `${p(64)}px`,
  '--ob-wifi-row': `${p(100)}px`,
  '--ob-wifi-gap': `${p(40)}px`,
  '--ob-wifi-icon-box': `${p(80)}px`,
  '--ob-wifi-icon-r': `${p(20)}px`,
  '--ob-wifi-lock': `${p(60)}px`,
  '--ob-switch-w': `${p(90)}px`,
  '--ob-switch-h': `${p(50)}px`,
  '--ob-switch-knob': `${p(40)}px`,
  '--ob-refresh': `${p(40)}px`,
  '--ob-activate-gap': `${p(100)}px`,
  '--ob-activate-h': `${p(140)}px`,
  '--ob-activate-r': `${p(32)}px`,
  '--ob-check': `${p(30)}px`,
  '--ob-tos-hit': `${p(46)}px`,
  '--ob-fs-42': `${p(42)}px`,
  '--ob-path-gap': `${p(20)}px`,
  '--ob-path-pad': `${p(28)}px`,
  '--ob-path-r': `${p(32)}px`,
  '--ob-path-ico': `${p(80)}px`,
  '--ob-path-ico-r': `${p(24)}px`,
  '--ob-path-tick': `${p(56)}px`,
  '--ob-path-text-gap': `${p(16)}px`,
  '--ob-lh-40': `${p(50)}px`,
  '--ob-lh-24': `${p(30)}px`,
  '--ob-main-pad-path': `${p(48)}px`,
  '--ob-head-gap-path': `${p(32)}px`,
  '--ob-dialog-w': `${p(920)}px`,
  '--ob-dialog-h': `${p(650)}px`,
  '--ob-dialog-r': `${p(42)}px`,
  '--ob-dialog-pad': `${p(48)}px`,
  '--ob-dialog-title': `${p(42)}px`,
  '--ob-hsk-chip-h': `${p(86)}px`,
  '--ob-hsk-chip-r': `${p(22)}px`,
  '--ob-hsk-go-h': `${p(88)}px`,
  '--ob-hsk-x': `${p(60)}px`,
} as CSSProperties

const STEPS = [
  { id: 'language', labelKey: 'onboard.steps.language' },
  { id: 'wifi', labelKey: 'onboard.steps.wifi' },
  { id: 'email', labelKey: 'onboard.steps.activation' },
  { id: 'profile', labelKey: 'onboard.steps.personal' },
  { id: 'path', labelKey: 'onboard.steps.complete' },
] as const

/** id / th 一期没有 i18n 包，只记选择，界面仍走 en。ar 已接 locale。 */
const ONBOARD_LANGS = [
  { id: 'zh', localeId: 'zh' as AppLocaleId | null, label: '中文（简体）', flag: '🇨🇳' },
  { id: 'en', localeId: 'en', label: 'English', flag: '🇺🇸' },
  { id: 'vi', localeId: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { id: 'id', localeId: null, label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { id: 'ja', localeId: 'ja', label: '日本語', flag: '🇯🇵' },
  { id: 'ko', localeId: 'ko', label: '한국어', flag: '🇰🇷' },
  { id: 'th', localeId: null, label: 'ไทย', flag: '🇹🇭' },
  { id: 'es', localeId: 'es', label: 'Spanish', flag: '🇪🇸' },
  { id: 'fr', localeId: 'fr', label: 'French', flag: '🇫🇷' },
  { id: 'ar', localeId: 'ar', label: 'العربية', flag: '🇦🇪' },
] as const

const TITLE_KEYS = [
  'onboard.titles.language',
  'onboard.titles.wifi',
  'onboard.titles.activation',
  'onboard.titles.profile',
  'onboard.titles.path',
] as const

const SUB_KEYS = [
  '',
  'onboard.subs.wifi',
  '',
  'onboard.subs.profile',
  'onboard.subs.path',
] as const

/** 只展示匿名 deviceId 的短码，不是硬件序列号。 */
function formatOnboardSn(deviceId: string) {
  const compact = deviceId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase()
  return compact || 'DEVICE'
}

/** 一期 webview 扫不了真 WLAN，用稿上的办公室网 + 不同格数占位。 */
const WIFI_NETWORKS = [
  { id: 'office', ssid: 'C-Lingo_Office', bars: 3 },
  { id: 'office5g', ssid: 'C-Lingo_Office_5G', bars: 3 },
  { id: 'guest', ssid: 'C-Lingo_Guest', bars: 2 },
  { id: 'campus', ssid: 'Campus_WiFi', bars: 1 },
] as const

function WifiMark({ bars }: { bars: number }) {
  return (
    <svg className="clingo-onboard-wifi-mark" viewBox="0 0 56 56" aria-hidden="true">
      <path
        d="M8 22.5c11.2-11 28.8-11 40 0"
        fill="none"
        stroke="#2D3436"
        strokeWidth="5"
        strokeLinecap="round"
        opacity={bars >= 3 ? 1 : 0.15}
      />
      <path
        d="M14 30.5c7.8-7.6 20.2-7.6 28 0"
        fill="none"
        stroke="#2D3436"
        strokeWidth="5.5"
        strokeLinecap="round"
        opacity={bars >= 2 ? 1 : 0.15}
      />
      <circle cx="28" cy="42" r="5.5" fill="#2D3436" />
    </svg>
  )
}

function WifiLock({ on }: { on?: boolean }) {
  return (
    <span className={on ? 'clingo-onboard-wifi-lock clingo-onboard-wifi-lock-on' : 'clingo-onboard-wifi-lock'} aria-hidden="true">
      <svg viewBox="0 0 40 40">
        <rect x="11" y="18" width="18" height="14" rx="3" fill={on ? '#FFFFFF' : '#636E72'} />
        <path
          d="M15.5 18v-4.2a4.5 4.5 0 0 1 9 0V18"
          fill="none"
          stroke={on ? '#FFFFFF' : '#2D3436'}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

const AVATARS = [
  { id: 'clingo', src: '/images/clingo-mascot-avatar.png', emoji: '' },
  { id: 'mark', src: '', emoji: 'C' },
] as const

const GENDERS = [
  { id: 'Male', labelKey: 'onboard.genderMale' },
  { id: 'Female', labelKey: 'onboard.genderFemale' },
  { id: 'Prefer not to say', labelKey: 'onboard.genderUnspecified' },
] as const

const PATH_CARDS = [
  {
    id: 'clingo' as const,
    ico: '🎓',
    icoClass: 'clingo-onboard-path-ico-beginner',
    tagKey: 'onboard.pathBeginnerTag',
    titleKey: 'onboard.pathBeginnerTitle',
    bodyKey: 'onboard.pathBeginnerBody',
    ctaKey: 'onboard.startLevel1',
  },
  {
    id: 'hsk' as const,
    ico: '⌖',
    icoClass: 'clingo-onboard-path-ico-hsk',
    tagKey: 'onboard.pathHskTag',
    titleKey: 'onboard.pathHskTitle',
    bodyKey: 'onboard.pathHskBody',
    ctaKey: 'onboard.selectHskLevel',
  },
  {
    id: 'placement' as const,
    ico: '⌕',
    icoClass: 'clingo-onboard-path-ico-place',
    tagKey: 'onboard.pathPlaceTag',
    titleKey: 'onboard.pathPlaceTitle',
    bodyKey: 'onboard.pathPlaceBody',
    ctaKey: 'onboard.startPlacement',
  },
] as const

const HSK_DIALOG_LEVELS = [1, 2, 3, 4, 5, 6] as const

function isPhaseOneHsk(level: number): level is 1 | 2 {
  return level === 1 || level === 2
}

function AvatarFace({ id, className }: { id: string; className?: string }) {
  const avatar = AVATARS.find((item) => item.id === id) ?? AVATARS[0]
  return (
    <span className={className}>
      {avatar.src ? <img src={avatar.src} alt="" /> : avatar.emoji}
    </span>
  )
}

export function OnboardingFlow() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { locale, setLocaleId } = useLocale()
  const { markDone } = useOnboarding()
  const [step, setStep] = useState(0)
  const [lang, setLang] = useState<(typeof ONBOARD_LANGS)[number]['id']>(
    () => ONBOARD_LANGS.find((item) => item.localeId === locale.id)?.id ?? 'en',
  )
  const [wifiOn, setWifiOn] = useState(false)
  const [wifiId, setWifiId] = useState<string | null>(null)
  const [wifiScanning, setWifiScanning] = useState(false)
  const [email, setEmail] = useState('')
  const [tos, setTos] = useState(false)
  const [nickname, setNickname] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState<(typeof GENDERS)[number]['id']>('Prefer not to say')
  const [avatar, setAvatar] = useState<(typeof AVATARS)[number]['id']>('clingo')
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [learnPath, setLearnPath] = useState<OnboardPath>('clingo')
  const [hskOpen, setHskOpen] = useState(false)
  const [hskPick, setHskPick] = useState<OnboardHskLevel>(null)

  const deviceSn = formatOnboardSn(getExamDeviceId())
  const emailOk = email.trim().includes('@') && email.trim().length > 3
  const emailReady = emailOk && tos
  const profileReady = nickname.trim().length > 0 && dob.length > 0
  const pathCta = PATH_CARDS.find((item) => item.id === learnPath) ?? PATH_CARDS[0]
  const hskReady = hskPick === 1 || hskPick === 2
  const canNext =
    step === 0 ||
    (step === 1 && wifiId !== null) ||
    (step === 2 && emailReady) ||
    (step === 3 && profileReady) ||
    step === 4
  const showNext = step === 4 || (step < 4 && (step !== 1 || wifiOn))

  const finish = (path: OnboardPath, level: OnboardHskLevel = null) => {
    writeOnboarded({
      path,
      localeId: locale.id,
      email,
      nickname,
      dob,
      gender,
      avatar,
      wifiId,
      hskLevel: path === 'hsk' ? level : null,
    })
    markDone()
    if (path === 'placement') {
      navigate('/hsk-prep-test', { replace: true })
      return
    }
    if (path === 'hsk' && (level === 1 || level === 2)) {
      navigate(`/hsk-prep-training?level=${level}`, { replace: true })
      return
    }
    navigate('/Home', { replace: true })
  }

  const onPathCta = () => {
    if (learnPath === 'hsk') {
      setHskOpen(true)
      return
    }
    finish(learnPath)
  }

  const pickLang = (item: (typeof ONBOARD_LANGS)[number]) => {
    setLang(item.id)
    if (item.localeId) setLocaleId(item.localeId)
  }

  return (
    <div className="onboard clingo-onboard" style={{ ...onboardCanvasStyle, fontFamily: locale.fontFamily }}>
      <span className="clingo-onboard-glow" aria-hidden="true" />
      <SystemStatusBar variant="inline" />
      <div className="onboard-body clingo-onboard-body">
        <aside className="onboard-rail clingo-onboard-rail">
          <img
            className="clingo-onboard-logo"
            src="/branding/c-lingo-page-logo.png"
            alt="C-Lingo AIOS"
            draggable={false}
          />
          <div className="clingo-onboard-progress">
            <span><bdi>{t('onboard.progress')}</bdi></span>
            <b>
              {step + 1}/{STEPS.length}
            </b>
            <div className="clingo-onboard-track">
              <i style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>
          </div>
          <ol className="clingo-onboard-steps">
            {STEPS.map((item, index) => {
              const done = index < step
              const current = index === step
              return (
                <li
                  key={item.id}
                  className={
                    current
                      ? 'clingo-onboard-step clingo-onboard-step-on'
                      : done
                        ? 'clingo-onboard-step clingo-onboard-step-done'
                        : 'clingo-onboard-step'
                  }
                >
                  <span className="clingo-onboard-step-num">
                    {done ? <CheckIcon sx={{ fontSize: p(28) }} /> : index + 1}
                  </span>
                  <bdi>{t(item.labelKey)}</bdi>
                </li>
              )
            })}
          </ol>
          {step > 0 ? (
            <button type="button" className="clingo-onboard-back" onClick={() => {
              setHskOpen(false)
              setStep((n) => n - 1)
            }}>
              <span className="clingo-onboard-back-ico" aria-hidden="true">
                <ChevronLeftIcon sx={{ fontSize: p(32) }} />
              </span>
              <bdi>{t('onboard.back')}</bdi>
            </button>
          ) : null}
        </aside>

        <section className={step === 4 ? 'onboard-main clingo-onboard-main clingo-onboard-main-path' : 'onboard-main clingo-onboard-main'}>
          <header className={step === 2 ? 'clingo-onboard-head clingo-onboard-head-solo' : 'clingo-onboard-head'}>
            <h1><bdi>{t(TITLE_KEYS[step])}</bdi></h1>
            {SUB_KEYS[step] ? <p><bdi>{t(SUB_KEYS[step])}</bdi></p> : null}
          </header>

          {step === 0 ? (
            <div className="onboard-langs clingo-onboard-langs">
              {ONBOARD_LANGS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    lang === item.id
                      ? 'onboard-lang clingo-onboard-lang clingo-onboard-lang-on onboard-lang-on'
                      : 'onboard-lang clingo-onboard-lang'
                  }
                  onClick={() => pickLang(item)}
                >
                  <strong dir="auto">{item.label}</strong>
                  <span>{item.flag}</span>
                </button>
              ))}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="clingo-onboard-wifi-panel">
              <div className="clingo-onboard-wlan">
                <div className="clingo-onboard-wlan-label">
                  <b><bdi>{t('onboard.wlan')}</bdi></b>
                  <button
                    type="button"
                    className="clingo-onboard-wifi-refresh"
                    aria-label={t('onboard.wifiRefresh')}
                    disabled={!wifiOn || wifiScanning}
                    onClick={() => {
                      if (!wifiOn || wifiScanning) return
                      setWifiScanning(true)
                      window.setTimeout(() => setWifiScanning(false), 700)
                    }}
                  >
                    <RefreshIcon sx={{ fontSize: p(40) }} className={wifiScanning ? 'clingo-onboard-spin' : undefined} />
                  </button>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={wifiOn}
                  aria-label={t('onboard.wlan')}
                  className={wifiOn ? 'clingo-onboard-switch clingo-onboard-switch-on' : 'clingo-onboard-switch'}
                  onClick={() => {
                    if (wifiOn) setWifiId(null)
                    setWifiOn((on) => !on)
                  }}
                >
                  <i />
                </button>
              </div>
              {wifiOn ? (
                <div className="clingo-onboard-wifi">
                  {WIFI_NETWORKS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={
                        wifiId === item.id
                          ? 'clingo-onboard-wifi-row clingo-onboard-wifi-on'
                          : 'clingo-onboard-wifi-row'
                      }
                      onClick={() => setWifiId(item.id)}
                    >
                      <span className="clingo-onboard-wifi-icon">
                        <WifiMark bars={item.bars} />
                      </span>
                      <strong>{item.ssid}</strong>
                      <WifiLock on={wifiId === item.id} />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="clingo-onboard-activate">
              <div className="clingo-onboard-activate-fields">
                <label className="clingo-onboard-activate-field">
                  <span><bdi>{t('onboard.emailLabel')}</bdi></span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t('onboard.emailPlaceholder')}
                  />
                </label>
                <div className="clingo-onboard-activate-field">
                  <span><bdi>{t('onboard.snLabel')}</bdi></span>
                  <p className="clingo-onboard-sn" aria-readonly="true">
                    {t('onboard.snPrefix')}{deviceSn}
                  </p>
                </div>
              </div>
              {email.trim() !== '' && !emailOk ? (
                <p className="clingo-onboard-hint"><bdi>{t('onboard.emailHint')}</bdi></p>
              ) : null}
              <label className="clingo-onboard-tos">
                <input type="checkbox" checked={tos} onChange={(event) => setTos(event.target.checked)} />
                <i className={tos ? 'clingo-onboard-check clingo-onboard-check-on' : 'clingo-onboard-check'} aria-hidden="true" />
                <span>
                  <bdi>
                    <Trans
                      i18nKey="onboard.tos"
                      components={{ terms: <b />, privacy: <b />, kids: <b /> }}
                    />
                  </bdi>
                </span>
              </label>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="clingo-onboard-profile">
              <button type="button" className="clingo-onboard-avatar" onClick={() => setAvatarOpen(true)}>
                <span className="clingo-onboard-avatar-ring">
                  <AvatarFace id={avatar} className="clingo-onboard-avatar-face" />
                  <span className="clingo-onboard-avatar-cam" aria-hidden="true">
                    <PhotoCameraIcon sx={{ fontSize: p(28) }} />
                  </span>
                </span>
                <bdi>{t('onboard.avatarHint')}</bdi>
              </button>
              <div className="clingo-onboard-profile-row">
                <label className="clingo-onboard-field">
                  <bdi>{t('onboard.nickname')}</bdi>
                  <input
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                    placeholder={t('onboard.nicknamePlaceholder')}
                  />
                </label>
                <label className="clingo-onboard-field">
                  <bdi>{t('onboard.dob')}</bdi>
                  <span className={dob ? 'clingo-onboard-dob-wrap' : 'clingo-onboard-dob-wrap clingo-onboard-dob-empty'}>
                    <input type="date" value={dob} onChange={(event) => setDob(event.target.value)} />
                    {dob ? null : <span className="clingo-onboard-dob-ph"><bdi>{t('onboard.dobPlaceholder')}</bdi></span>}
                    <KeyboardArrowDownIcon className="clingo-onboard-dob-caret" sx={{ fontSize: p(40) }} />
                  </span>
                </label>
              </div>
              <div className="clingo-onboard-gender-block">
                <p className="clingo-onboard-label"><bdi>{t('onboard.gender')}</bdi></p>
                <div className="clingo-onboard-genders" role="radiogroup" aria-label={t('onboard.gender')}>
                  {GENDERS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={gender === item.id}
                      className={gender === item.id ? 'clingo-onboard-chip clingo-onboard-chip-on' : 'clingo-onboard-chip'}
                      onClick={() => setGender(item.id)}
                    >
                      <bdi>{t(item.labelKey)}</bdi>
                    </button>
                  ))}
                </div>
              </div>
              {avatarOpen ? (
                <div className="clingo-onboard-modal" role="dialog" aria-label={t('onboard.changeAvatar')}>
                  <div className="clingo-onboard-modal-card">
                    <h2><bdi>{t('onboard.changeAvatar')}</bdi></h2>
                    <div className="clingo-onboard-avatar-picks">
                      {AVATARS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={
                            avatar === item.id
                              ? 'clingo-onboard-avatar-pick clingo-onboard-avatar-pick-on'
                              : 'clingo-onboard-avatar-pick'
                          }
                          onClick={() => {
                            setAvatar(item.id)
                            setAvatarOpen(false)
                          }}
                        >
                          {item.src ? <img src={item.src} alt="" /> : item.emoji}
                        </button>
                      ))}
                    </div>
                    <button type="button" className="clingo-onboard-mini" onClick={() => setAvatarOpen(false)}>
                      <bdi>{t('onboard.close')}</bdi>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 4 ? (
            <div className="clingo-onboard-paths" role="radiogroup" aria-label={t('onboard.titles.path')}>
              {PATH_CARDS.map((item) => {
                const on = learnPath === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    className={on ? 'clingo-onboard-path clingo-onboard-path-on' : 'clingo-onboard-path'}
                    onClick={() => {
                      setLearnPath(item.id)
                      if (item.id !== 'hsk') setHskOpen(false)
                    }}
                  >
                    <span className={`clingo-onboard-path-ico ${item.icoClass}`} aria-hidden="true">
                      {item.ico}
                    </span>
                    <small dir="auto">{t(item.tagKey)}</small>
                    <strong dir="auto">{t(item.titleKey)}</strong>
                    <em dir="auto">{t(item.bodyKey)}</em>
                    {on ? <i className="clingo-onboard-path-tick" aria-hidden="true" /> : null}
                  </button>
                )
              })}
            </div>
          ) : null}

          {showNext ? (
            <div className="clingo-onboard-cta">
              <button
                type="button"
                className={
                  canNext && !hskOpen
                    ? 'clingo-onboard-next'
                    : 'clingo-onboard-next clingo-onboard-next-off'
                }
                disabled={!canNext || hskOpen}
                onClick={() => {
                  if (step === 4) {
                    onPathCta()
                    return
                  }
                  if (canNext) setStep((n) => n + 1)
                }}
              >
                <bdi>
                  {step === 2
                    ? t('onboard.activate')
                    : step === 3
                      ? t('onboard.confirm')
                      : step === 4
                        ? t(pathCta.ctaKey)
                        : t('onboard.next')}
                </bdi>
                {step === 3 || step === 4 ? null : <ChevronRightIcon sx={{ fontSize: p(40) }} />}
              </button>
            </div>
          ) : null}
        </section>
      </div>
      {hskOpen ? (
        <div className="clingo-onboard-modal" role="dialog" aria-modal="true" aria-labelledby="clingo-onboard-hsk-title">
          <div className="clingo-onboard-hsk-dialog">
            <button
              type="button"
              className="clingo-onboard-hsk-x"
              onClick={() => setHskOpen(false)}
              aria-label={t('onboard.close')}
            >
              <CloseIcon sx={{ fontSize: p(30) }} />
            </button>
            <h2 id="clingo-onboard-hsk-title"><bdi>{t('onboard.selectHskLevel')}</bdi></h2>
            <p><bdi>{t('onboard.hskDialogHint')}</bdi></p>
            <div className="clingo-onboard-hsk-grid">
              {HSK_DIALOG_LEVELS.map((level) => {
                const open = isPhaseOneHsk(level)
                const selected = hskPick === level
                return (
                  <button
                    key={level}
                    type="button"
                    disabled={!open}
                    aria-label={open ? `HSK ${level}` : t('onboard.hskLocked', { level })}
                    className={
                      selected ? 'clingo-onboard-hsk-chip clingo-onboard-hsk-chip-on' : 'clingo-onboard-hsk-chip'
                    }
                    onClick={() => {
                      if (open) setHskPick(level)
                    }}
                  >
                    <bdi>HSK {level}</bdi>
                    {open ? null : <LockOutlinedIcon sx={{ fontSize: p(22) }} />}
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              className={hskReady ? 'clingo-onboard-hsk-go' : 'clingo-onboard-hsk-go clingo-onboard-next-off'}
              disabled={!hskReady}
              onClick={() => {
                if (hskReady) finish('hsk', hskPick)
              }}
            >
              <bdi>{t('onboard.continue')}</bdi>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
