import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import {
  deleteReadingBuddyDocument,
  loadReadingBuddyDocuments,
  upsertReadingBuddyDocument,
} from '../data/readingBuddyStorage';
import { createSampleDocument, processUploadedFile } from '../utils/readingBuddyProcessor';

export default function ReadingBuddyPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenSize = import.meta.env.VITE_SCREEN_SIZE || '1024x768';
  const is960 = screenSize === '960x540';

  const [docs, setDocs] = useState(() => loadReadingBuddyDocuments());
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState<string | null>(null);

  const refreshDocs = useCallback(() => {
    setDocs(loadReadingBuddyDocuments());
  }, []);

  const openReader = (docId: string) => {
    navigate(`/reading-buddy/${docId}`);
  };

  const handleFile = async (file: File) => {
    setProcessing(true);
    setError(null);
    try {
      const doc = await processUploadedFile(file, setProgressMsg);
      upsertReadingBuddyDocument(doc);
      refreshDocs();
      openReader(doc.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setProcessing(false);
      setProgressMsg('');
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void handleFile(file);
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const addSample = () => {
    const sample = createSampleDocument();
    upsertReadingBuddyDocument(sample);
    refreshDocs();
    openReader(sample.id);
  };

  const sortedDocs = useMemo(
    () =>
      [...docs].sort(
        (a, b) => (b.lastOpenedAt ?? b.createdAt) - (a.lastOpenedAt ?? a.createdAt),
      ),
    [docs],
  );

  const touchMin = is960 ? 44 : 52;

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#F4F7FB',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: is960 ? 1 : 1.5,
          px: is960 ? 2 : 3,
          py: is960 ? 1.25 : 1.75,
          flexShrink: 0,
        }}
      >
        <IconButton
          onClick={() => navigate('/AI')}
          aria-label="Back"
          sx={{
            width: touchMin,
            height: touchMin,
            bgcolor: 'white',
            boxShadow: '0 4px 14px rgba(37,99,235,0.12)',
            '&:hover': { bgcolor: '#EFF6FF' },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 900, fontSize: is960 ? '1.15rem' : '1.45rem', color: '#0F172A' }}>
            Reading Buddy AI
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: is960 ? '0.78rem' : '0.92rem' }}>
            Upload local text · segmented reading · tap to look up words
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          px: is960 ? 2 : 3,
          pb: is960 ? 2 : 3,
          display: 'grid',
          gridTemplateColumns: is960 ? '1fr' : '1fr 1fr',
          gap: is960 ? 1.5 : 2,
          alignContent: 'start',
        }}
      >
        <Box
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            borderRadius: is960 ? '20px' : '28px',
            border: dragOver ? '2px solid #2563EB' : '2px dashed #93C5FD',
            bgcolor: dragOver ? '#EFF6FF' : 'white',
            p: is960 ? 2.5 : 3.5,
            cursor: 'pointer',
            minHeight: is960 ? 180 : 220,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 1.25,
            transition: '0.2s',
            boxShadow: '0 8px 28px rgba(37,99,235,0.08)',
            '&:active': { transform: 'scale(0.99)' },
          }}
        >
          <Box
            sx={{
              width: touchMin + 8,
              height: touchMin + 8,
              borderRadius: '18px',
              bgcolor: '#2563EB',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UploadFileIcon sx={{ fontSize: is960 ? 28 : 34 }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: is960 ? '1rem' : '1.15rem', color: '#1E293B' }}>
            Upload .txt or .md
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: is960 ? '0.82rem' : '0.9rem', maxWidth: 360 }}>
            Drop a file here or tap to browse. AI will segment words and build an interactive reader.
          </Typography>
          <Typography sx={{ color: '#94A3B8', fontSize: is960 ? '0.72rem' : '0.78rem' }}>
            DOC/DOCX coming soon · English UI · multilingual lookup
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.text"
            hidden
            onChange={onFileChange}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: is960 ? 1.25 : 1.5, minHeight: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontWeight: 800, fontSize: is960 ? '0.95rem' : '1.05rem', color: '#334155' }}>
              Your documents
            </Typography>
            {sortedDocs.length === 0 && (
              <Button
                size="small"
                startIcon={<AutoAwesomeRoundedIcon />}
                onClick={addSample}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '12px' }}
              >
                Try sample
              </Button>
            )}
          </Box>

          {sortedDocs.length === 0 ? (
            <Box
              sx={{
                flex: 1,
                borderRadius: '20px',
                bgcolor: 'white',
                p: 2.5,
                color: '#64748B',
                boxShadow: '0 4px 18px rgba(15,23,42,0.06)',
              }}
            >
              <Typography sx={{ fontSize: is960 ? '0.88rem' : '0.95rem' }}>
                No uploads yet. Add a text file or open the sample story to see word segmentation and AI read-along.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1, maxHeight: is960 ? 280 : 360, overflow: 'auto' }}>
              {sortedDocs.map((doc) => (
                <Box
                  key={doc.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    p: is960 ? 1.25 : 1.5,
                    borderRadius: '18px',
                    bgcolor: 'white',
                    boxShadow: '0 4px 16px rgba(15,23,42,0.06)',
                    cursor: 'pointer',
                    minHeight: touchMin,
                    '&:active': { transform: 'scale(0.99)' },
                  }}
                  onClick={() => openReader(doc.id)}
                >
                  <Box
                    sx={{
                      width: touchMin - 4,
                      height: touchMin - 4,
                      borderRadius: '14px',
                      bgcolor: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MenuBookRoundedIcon />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography noWrap sx={{ fontWeight: 800, color: '#0F172A', fontSize: is960 ? '0.9rem' : '1rem' }}>
                      {doc.title}
                    </Typography>
                    <Typography noWrap sx={{ color: '#64748B', fontSize: is960 ? '0.72rem' : '0.8rem' }}>
                      {doc.paragraphs.length} paragraphs · {doc.fileName}
                    </Typography>
                  </Box>
                  <IconButton
                    aria-label="Delete document"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteReadingBuddyDocument(doc.id);
                      refreshDocs();
                    }}
                    sx={{ width: 40, height: 40, flexShrink: 0 }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {processing && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(15,23,42,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1400,
          }}
        >
          <Box
            sx={{
              bgcolor: 'white',
              borderRadius: '24px',
              p: 3,
              minWidth: 280,
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            <CircularProgress sx={{ color: '#2563EB', mb: 2 }} />
            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>Preparing your reading buddy</Typography>
            <Typography sx={{ color: '#64748B', fontSize: '0.9rem' }}>{progressMsg || 'Processing…'}</Typography>
          </Box>
        </Box>
      )}

      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError(null)}>
        <Alert severity="warning" onClose={() => setError(null)} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
