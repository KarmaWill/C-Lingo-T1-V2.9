import { useState } from 'react'
import { AppBar, Toolbar, Typography, Box, Avatar, ButtonBase, MenuItem, Menu } from '@mui/material'
import { KeyboardArrowDown } from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'

const LANGUAGES = [
  { name: '中文', flag: '🇨🇳', label: 'CN' },
  { name: 'English', flag: '🇺🇸', label: 'EN' },
];

const COURSES = [
  'AI Class Studio',
  'HSK Standard',
  'Business Chinese'
];

/** Main curriculum track shown under AI Class Studio (English-first UI). */
const PROGRAMS = [
  'C-Lingo Chinese',
  'HSK Standard',
  'Business Chinese',
];

const LEVELS = ['Level 1', 'Level 2', 'Level 3'];

// Units for each Level (8 units per level)
const UNITS_BY_LEVEL: Record<string, string[]> = {
  'Level 1': [
    'Unit 1: Hello & Greetings',
    'Unit 2: My Family',
    'Unit 3: Numbers & Colors',
    'Unit 4: Daily Activities',
    'Unit 5: Food & Drinks',
    'Unit 6: Time & Dates',
    'Unit 7: Weather & Seasons',
    'Unit 8: Basic Questions'
  ],
  'Level 2': [
    'Unit 1: Shopping & Money',
    'Unit 2: Transportation',
    'Unit 3: Health & Body',
    'Unit 4: School & Study',
    'Unit 5: Hobbies & Sports',
    'Unit 6: Travel & Places',
    'Unit 7: Emotions & Feelings',
    'Unit 8: Descriptions'
  ],
  'Level 3': [
    'Unit 1: Work & Career',
    'Unit 2: Technology',
    'Unit 3: Culture & Traditions',
    'Unit 4: Environment',
    'Unit 5: Social Media',
    'Unit 6: Future Plans',
    'Unit 7: Opinions & Advice',
    'Unit 8: Complex Conversations'
  ]
};

export default function TopBanner() {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentLang, setCurrentLang] = useState('English')
  
  // Map language name to display label
  const getLangLabel = (name: string) => {
    return name === '中文' ? 'CN' : 'EN'
  }
  const [isLangOpen, setIsLangOpen] = useState(false)
  
  // Read screen size from environment variable
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768'
  const is960 = screenSize === '960x540'
  const is2000x1200 = screenSize === '2000x1200'
  const is1920x1125 = screenSize === '1920x1125'

  const isCameraPage = location.pathname === '/camera'
  const isAIPage = location.pathname === '/ai-chat'
  const isFullScreen = isCameraPage || isAIPage

  // Course/Level/Unit State
  const [currentCourse, setCurrentCourse] = useState('AI Class Studio');
  const [currentProgram, setCurrentProgram] = useState('C-Lingo Chinese');
  const [currentLevel, setCurrentLevel] = useState('Level 1');
  const [currentUnit, setCurrentUnit] = useState('Unit 1: Hello & Greetings');

  // Menu Anchors
  const [courseAnchor, setCourseAnchor] = useState<null | HTMLElement>(null);
  const [programAnchor, setProgramAnchor] = useState<null | HTMLElement>(null);
  const [levelAnchor, setLevelAnchor] = useState<null | HTMLElement>(null);
  const [unitAnchor, setUnitAnchor] = useState<null | HTMLElement>(null);
  
  const activeLang = LANGUAGES.find(l => l.name === currentLang)

  const isHomePage = location.pathname === '/AI' || location.pathname === '/'
  const isTextbooksPage = location.pathname === '/Home' || location.pathname === '/library'
  const isHSKPreparationHub = location.pathname === '/hsk-test'
  const showSystemBar = ['/', '/AI', '/Home', '/library', '/specialized', '/apps', '/profile', '/hsk-test'].includes(location.pathname)
  const isProfilePage = location.pathname === '/profile'
  const shouldHideTopBar = isFullScreen || isProfilePage
  const pageTitle =
    location.pathname === '/AI' ? 'AI Class Studio' :
    location.pathname === '/Home' ? 'Chinese Textbooks' :
    location.pathname === '/library' ? 'Chinese Textbooks' :
    location.pathname === '/specialized' ? 'Specialized Tracks' :
    location.pathname === '/camera' ? 'Camera Tools' :
    location.pathname === '/apps' ? 'Applications' :
    location.pathname === '/ai-chat' ? 'AI Tutor' :
    location.pathname === '/hsk-test' ? 'HSK Preparation' :
    location.pathname.startsWith('/lesson/') ? 'AI Class Studio' : 'NSK 1.0'

  const handleCourseSelect = (course: string) => {
    setCurrentCourse(course);
    setCurrentLevel('Level 1');
    const firstUnit = UNITS_BY_LEVEL['Level 1'][0];
    setCurrentUnit(firstUnit);
    setCourseAnchor(null);
  };

  const handleProgramSelect = (program: string) => {
    setCurrentProgram(program);
    setProgramAnchor(null);
  };

  const handleLevelSelect = (level: string) => {
    setCurrentLevel(level);
    const firstUnit = UNITS_BY_LEVEL[level][0];
    setCurrentUnit(firstUnit);
    setLevelAnchor(null);
  };

  const handleUnitSelect = (unit: string) => {
    setCurrentUnit(unit);
    setUnitAnchor(null);
  };

  return (
    <AppBar 
      position="absolute"
      elevation={0}
      sx={{ 
        top: showSystemBar ? (is960 ? 24 : (is2000x1200 ? 44 : (is1920x1125 ? 40 : 32))) : 0, 
        zIndex: 1100,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(30px) saturate(180%)',
        color: '#111827',
        borderBottom: '0.5px solid rgba(0,0,0,0.06)',
        transform: shouldHideTopBar ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: shouldHideTopBar ? 0 : 1,
        pointerEvents: shouldHideTopBar ? 'none' : 'auto',
      }}
    >
      <Toolbar sx={{ px: is960 ? 2 : (is2000x1200 ? 6 : (is1920x1125 ? 5 : 4)), py: is960 ? 0.5 : (is2000x1200 ? 1.75 : (is1920x1125 ? 1.5 : 1)), minHeight: is960 ? '56px !important' : (is2000x1200 ? '110px !important' : (is1920x1125 ? '100px !important' : '80px !important')) }}>
        {/* Left Section: App Title & Selectors (Only on Home) or Page Title */}
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          {isHomePage ? (
            <>
              {/* Row 1: App title + Online only (badge on the right) */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  minWidth: 0,
                  mb: is960 ? 0.75 : 1,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: is960 ? 0.6 : 0.75,
                    flexWrap: 'nowrap',
                    minWidth: 0,
                  }}
                >
                <Typography
                  variant="h6"
                  component="h6"
                  sx={{
                    fontWeight: 900,
                    fontSize: is960 ? '1.15rem' : (is2000x1200 ? '2rem' : (is1920x1125 ? '1.875rem' : '1.5rem')),
                    color: '#2D3436',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                    flexShrink: 0,
                  }}
                >
                  AI Class Studio
                </Typography>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.6,
                    flexShrink: 0,
                    px: is960 ? 0.9 : 1.1,
                    py: is960 ? 0.28 : 0.35,
                    borderRadius: '999px',
                    bgcolor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    color: '#047857',
                    fontSize: is960 ? '0.58rem' : '0.66rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    lineHeight: 1.1,
                  }}
                >
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: '#10B981',
                      boxShadow: '0 0 8px rgba(16,185,129,0.8)',
                      flexShrink: 0,
                    }}
                  />
                  Online only
                </Box>
                </Box>
              </Box>

              {/* Row 2: Program track + Level & Unit (one row) */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2.5,
                  rowGap: 1.25,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ButtonBase
                    onClick={(e) => setProgramAnchor(e.currentTarget)}
                    aria-haspopup="true"
                    aria-expanded={Boolean(programAnchor)}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: is960 ? 1.75 : 2.25,
                      py: is960 ? 1 : 1.25,
                      minHeight: is960 ? 44 : 48,
                      borderRadius: '14px',
                      bgcolor: '#F3F4F6',
                      border: '1px solid rgba(15, 23, 42, 0.08)',
                      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                      transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
                      '&:hover': {
                        bgcolor: '#EEF0F3',
                        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.06)',
                      },
                      '&:active': { bgcolor: '#E5E7EB' },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: is960 ? '0.8rem' : (is2000x1200 ? '1.2rem' : (is1920x1125 ? '1.1rem' : '0.95rem')),
                        fontWeight: 800,
                        color: '#374151',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {currentProgram}
                    </Typography>
                    <KeyboardArrowDown
                      sx={{
                        fontSize: is960 ? 18 : (is2000x1200 ? 26 : (is1920x1125 ? 24 : 20)),
                        color: '#9CA3AF',
                      }}
                    />
                  </ButtonBase>
                  <Menu
                    anchorEl={programAnchor}
                    open={Boolean(programAnchor)}
                    onClose={() => setProgramAnchor(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    PaperProps={{
                      sx: {
                        borderRadius: '16px',
                        mt: 1,
                        minWidth: 260,
                        boxShadow: '0 15px 40px rgba(0,0,0,0.12)',
                      },
                    }}
                  >
                    {PROGRAMS.map((p) => (
                      <MenuItem
                        key={p}
                        selected={p === currentProgram}
                        onClick={() => handleProgramSelect(p)}
                        sx={{ fontWeight: 700, fontSize: '1rem', py: 1.25 }}
                      >
                        {p}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>

                {/* Level Selector */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ButtonBase
                    onClick={(e) => setLevelAnchor(e.currentTarget)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.25,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '10px',
                      '&:active': { bgcolor: 'rgba(0,0,0,0.04)' }
                    }}
                  >
                    <Typography sx={{ fontSize: is960 ? '0.85rem' : (is2000x1200 ? '1.35rem' : (is1920x1125 ? '1.25rem' : '1rem')), fontWeight: 800, color: '#636E72' }}>
                      {currentLevel}
                    </Typography>
                    <KeyboardArrowDown sx={{ fontSize: is960 ? 17 : (is2000x1200 ? 26 : (is1920x1125 ? 24 : 18)), color: '#9CA3AF' }} />
                  </ButtonBase>
                  <Menu
                    anchorEl={levelAnchor}
                    open={Boolean(levelAnchor)}
                    onClose={() => setLevelAnchor(null)}
                    PaperProps={{ sx: { borderRadius: '16px', mt: 0.5, minWidth: 200, boxShadow: '0 15px 40px rgba(0,0,0,0.12)' } }}
                  >
                    {LEVELS.map(l => (
                      <MenuItem key={l} onClick={() => handleLevelSelect(l)} sx={{ fontWeight: 700, fontSize: '1rem', py: 1.25 }}>
                        {l}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>

                {/* Unit Selector */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ButtonBase
                    onClick={(e) => setUnitAnchor(e.currentTarget)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.25,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '10px',
                      '&:active': { bgcolor: 'rgba(0,0,0,0.04)' }
                    }}
                  >
                    <Typography sx={{ fontSize: is960 ? '0.85rem' : (is2000x1200 ? '1.35rem' : (is1920x1125 ? '1.25rem' : '1rem')), fontWeight: 800, color: '#636E72' }}>
                      {currentUnit}
                    </Typography>
                    <KeyboardArrowDown sx={{ fontSize: is960 ? 17 : (is2000x1200 ? 26 : (is1920x1125 ? 24 : 18)), color: '#9CA3AF' }} />
                  </ButtonBase>
                  <Menu
                    anchorEl={unitAnchor}
                    open={Boolean(unitAnchor)}
                    onClose={() => setUnitAnchor(null)}
                    PaperProps={{ sx: { borderRadius: '16px', mt: 0.5, minWidth: 280, boxShadow: '0 15px 40px rgba(0,0,0,0.12)' } }}
                  >
                    {UNITS_BY_LEVEL[currentLevel].map(u => (
                      <MenuItem key={u} onClick={() => handleUnitSelect(u)} sx={{ fontWeight: 700, fontSize: '1rem', py: 1.25 }}>
                        {u}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: is960 ? 0.6 : 0.75,
                flexWrap: 'wrap',
                rowGap: 0.75,
                minWidth: 0,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  color: '#1F2937',
                  fontSize: is960 ? '1.15rem' : (is2000x1200 ? '2rem' : (is1920x1125 ? '1.875rem' : '1.5rem')),
                  lineHeight: 1.2,
                  flexShrink: 0,
                }}
              >
                {pageTitle}
              </Typography>
              {isTextbooksPage && (
                <Box
                  sx={{
                    px: is960 ? 0.9 : 1.1,
                    py: is960 ? 0.28 : 0.35,
                    borderRadius: '999px',
                    bgcolor: '#EEF2FF',
                    border: '1px solid #C7D2FE',
                    color: '#4338CA',
                    fontSize: is960 ? '0.58rem' : '0.66rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    lineHeight: 1.1,
                  }}
                >
                  Offline
                </Box>
              )}
              {isHSKPreparationHub && (
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.6,
                    flexShrink: 0,
                    px: is960 ? 0.9 : 1.1,
                    py: is960 ? 0.28 : 0.35,
                    borderRadius: '999px',
                    bgcolor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    color: '#047857',
                    fontSize: is960 ? '0.58rem' : '0.66rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    lineHeight: 1.1,
                  }}
                >
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: '#10B981',
                      boxShadow: '0 0 8px rgba(16,185,129,0.8)',
                      flexShrink: 0,
                    }}
                  />
                  Online only
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Right Section: Language & Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {/* Language Switcher */}
          <Box sx={{ position: 'relative' }}>
            <ButtonBase
              onClick={() => setIsLangOpen(!isLangOpen)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1,
                borderRadius: '20px',
                bgcolor: '#F3F4F6',
                transition: 'all 0.2s',
                '&:active': { bgcolor: '#E5E7EB' }
              }}
            >
              <Typography sx={{ fontSize: '1.25rem' }}>{activeLang?.flag}</Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#4B5563' }}>{getLangLabel(currentLang)}</Typography>
              <Typography sx={{ fontSize: '0.625rem', color: '#9CA3AF', transform: isLangOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }}>▼</Typography>
            </ButtonBase>

            {isLangOpen && (
              <Box sx={{ position: 'absolute', top: '100%', right: 0, mt: 1.5, width: 200, bgcolor: 'white', border: '1px solid #E5E7EB', borderRadius: '24px', p: 1, zIndex: 1100, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                <Typography sx={{ px: 2, py: 1, fontSize: '9px', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', mb: 1, borderBottom: '1px solid #F3F4F6' }}>Language Switch</Typography>
                {LANGUAGES.map(l => (
                  <ButtonBase
                    key={l.name}
                    onClick={() => { setCurrentLang(l.name); setIsLangOpen(false); }}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      px: 2,
                      py: 1.5,
                      borderRadius: '12px',
                      justifyContent: 'flex-start',
                      bgcolor: currentLang === l.name ? '#00B4A00A' : 'transparent',
                      '&:active': { bgcolor: '#F9FAFB' }
                    }}
                  >
                    <Typography sx={{ fontSize: '1.25rem' }}>{l.flag}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: currentLang === l.name ? '#00B4A0' : '#4B5563' }}>{l.name}</Typography>
                  </ButtonBase>
                ))}
              </Box>
            )}
          </Box>

          {/* Profile entrance — same fox avatar as Profile sidebar */}
          <Avatar
            onClick={() => navigate('/profile')}
            sx={{
              width: is960 ? 36 : (is2000x1200 ? 60 : (is1920x1125 ? 56 : 44)),
              height: is960 ? 36 : (is2000x1200 ? 60 : (is1920x1125 ? 56 : 44)),
              bgcolor: 'white',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              border: '2px solid rgba(255,255,255,0.9)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
              '&:active': {
                transform: 'scale(0.95)',
                boxShadow: '0 4px 16px rgba(234, 88, 12, 0.22)',
              },
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(145deg, #FB923C 0%, #EA580C 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: is960 ? '1.1rem' : (is2000x1200 ? '1.95rem' : (is1920x1125 ? '1.8rem' : '1.4rem')),
                lineHeight: 1,
              }}
            >
              🦊
            </Box>
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
