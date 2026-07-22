import React from 'react';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import SwapHorizontalCircleOutlinedIcon from '@mui/icons-material/SwapHorizontalCircleOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import { useBooks } from '../../hooks/useBooks';
import { useStudents } from '../../hooks/useStudents';
import { useBorrowRequests } from '../../hooks/useBorrowRequests';
import { useTransactions } from '../../hooks/useTransactions';
import { useQRCode } from '../../hooks/useQRCode';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { ROUTES } from '../../constants/routes';
import { StatusChip } from '../common/CustomTable';

export const CommandPalette = () => {
  const {
    commandPaletteOpen,
    closeCommandPalette,
    searchQuery,
    setSearchQuery,
    searchResults,
    recentSearches,
    selectRecentSearch,
    commitSearch,
    setSavedFiltersDialogOpen,
  } = useGlobalSearch();

  const navigate = useNavigate();
  const { selectBookForDetails } = useBooks();
  const { selectStudentForProfile } = useStudents();
  const { selectRequestForDrawer } = useBorrowRequests();
  const { selectTransactionForDetails } = useTransactions();

  const handleNavigateAndClose = (path, actionCallback) => {
    if (searchQuery) commitSearch(searchQuery);
    closeCommandPalette();
    if (actionCallback) actionCallback();
    if (path) navigate(path);
  };

  return (
    <Dialog
      open={commandPaletteOpen}
      onClose={closeCommandPalette}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          backgroundColor: BORROW_COLORS.surface,
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden',
          border: `1px solid ${BORROW_COLORS.border}`,
        },
      }}
      BackdropProps={{
        sx: {
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
        },
      }}
    >
      {/* Search Header Bar */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: `1px solid ${BORROW_COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          backgroundColor: BORROW_COLORS.surface,
        }}
      >
        <SearchIcon sx={{ color: BORROW_COLORS.primary, fontSize: 28 }} />
        <InputBase
          autoFocus
          fullWidth
          placeholder="Search books, copy IDs, students, requests, checkouts, or audit logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchQuery && commitSearch(searchQuery)}
          sx={{ fontSize: '1.15rem', fontWeight: 600, color: BORROW_COLORS.textPrimary }}
        />

        <Chip
          label="Ctrl + K"
          size="small"
          sx={{ backgroundColor: '#F1F5F9', color: BORROW_COLORS.textSecondary, fontWeight: 800, fontSize: '0.75rem' }}
        />

        <Tooltip title="Saved Filter Presets">
          <IconButton size="small" onClick={() => setSavedFiltersDialogOpen(true)} sx={{ color: BORROW_COLORS.primary }}>
            <AutoAwesomeIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <IconButton onClick={closeCommandPalette} sx={{ color: BORROW_COLORS.textSecondary }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Results & Empty State Body */}
      <Box sx={{ maxHeight: 480, overflowY: 'auto', p: 2 }}>
        {!searchQuery.trim() ? (
          /* Empty State: Recent Searches & Navigation Shortcuts */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 1 }}>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: BORROW_COLORS.textSecondary, mb: 1, display: 'block', letterSpacing: 0.5 }}>
                  RECENT SEARCHES
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {recentSearches.map((rec) => (
                    <Chip
                      key={rec}
                      label={rec}
                      onClick={() => selectRecentSearch(rec)}
                      sx={{
                        backgroundColor: '#F8FAFC',
                        border: `1px solid ${BORROW_COLORS.border}`,
                        fontWeight: 600,
                        '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.08)', borderColor: BORROW_COLORS.primary },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Quick Navigation Shortcuts */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: BORROW_COLORS.textSecondary, mb: 1.5, display: 'block', letterSpacing: 0.5 }}>
                QUICK MODULE NAVIGATION
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                <Box
                  onClick={() => handleNavigateAndClose(ROUTES.BOOKS)}
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    border: `1px solid ${BORROW_COLORS.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#F8FAFC', borderColor: BORROW_COLORS.primary },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <MenuBookIcon sx={{ color: BORROW_COLORS.primary }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Book Catalog Inventory</Typography>
                  </Box>
                  <ArrowForwardIcon fontSize="small" sx={{ color: BORROW_COLORS.textSecondary }} />
                </Box>

                <Box
                  onClick={() => handleNavigateAndClose(ROUTES.REQUESTS)}
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    border: `1px solid ${BORROW_COLORS.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#F8FAFC', borderColor: BORROW_COLORS.primary },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <SwapHorizontalCircleOutlinedIcon sx={{ color: BORROW_COLORS.warning }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Borrow Applications</Typography>
                  </Box>
                  <ArrowForwardIcon fontSize="small" sx={{ color: BORROW_COLORS.textSecondary }} />
                </Box>

                <Box
                  onClick={() => handleNavigateAndClose(ROUTES.RETURNS)}
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    border: `1px solid ${BORROW_COLORS.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#F8FAFC', borderColor: BORROW_COLORS.primary },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AssignmentReturnOutlinedIcon sx={{ color: BORROW_COLORS.info }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Issue & Returns System</Typography>
                  </Box>
                  <ArrowForwardIcon fontSize="small" sx={{ color: BORROW_COLORS.textSecondary }} />
                </Box>

                <Box
                  onClick={() => handleNavigateAndClose(ROUTES.STUDENTS)}
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    border: `1px solid ${BORROW_COLORS.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#F8FAFC', borderColor: BORROW_COLORS.primary },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PeopleOutlineIcon sx={{ color: BORROW_COLORS.success }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Student Member Directory</Typography>
                  </Box>
                  <ArrowForwardIcon fontSize="small" sx={{ color: BORROW_COLORS.textSecondary }} />
                </Box>
              </Box>
            </Box>
          </Box>
        ) : searchResults.totalMatches === 0 ? (
          /* No Results State */
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <SearchIcon sx={{ fontSize: 64, color: '#CBD5E1', mb: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary, mb: 0.5 }}>
              No matching records found for "{searchQuery}"
            </Typography>
            <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary }}>
              Try searching by book ISBN, author name, student register number, or copy ID.
            </Typography>
          </Box>
        ) : (
          /* Grouped Search Results List */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Category 1: Books */}
            {searchResults.books.length > 0 && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: BORROW_COLORS.primary, mb: 1, display: 'block' }}>
                  BOOKS & CATALOG ({searchResults.books.length})
                </Typography>
                {searchResults.books.map((book) => (
                  <Box
                    key={book.id}
                    onClick={() => handleNavigateAndClose(ROUTES.BOOKS, () => selectBookForDetails(book))}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.06)' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={book.coverUrl} variant="rounded" sx={{ width: 36, height: 48 }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{book.title}</Typography>
                        <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>By {book.author} • ISBN: {book.isbn}</Typography>
                      </Box>
                    </Box>
                    <StatusChip status={book.status} />
                  </Box>
                ))}
              </Box>
            )}

            {/* Category 2: Students */}
            {searchResults.students.length > 0 && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: BORROW_COLORS.success, mb: 1, display: 'block' }}>
                  STUDENT MEMBERS ({searchResults.students.length})
                </Typography>
                {searchResults.students.map((stu) => (
                  <Box
                    key={stu.id}
                    onClick={() => handleNavigateAndClose(ROUTES.STUDENTS, () => selectStudentForProfile(stu))}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'rgba(34, 197, 94, 0.06)' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={stu.avatarUrl} sx={{ width: 36, height: 36, bgcolor: BORROW_COLORS.primary }}>{(stu.fullName || stu.name)[0]}</Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{stu.fullName || stu.name}</Typography>
                        <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 700 }}>Reg No: {stu.registerNumber} • {stu.department}</Typography>
                      </Box>
                    </Box>
                    <StatusChip status={stu.computedStatus || stu.status} />
                  </Box>
                ))}
              </Box>
            )}

            {/* Category 3: Borrow Requests */}
            {searchResults.requests.length > 0 && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: BORROW_COLORS.warning, mb: 1, display: 'block' }}>
                  BORROW APPLICATIONS ({searchResults.requests.length})
                </Typography>
                {searchResults.requests.map((req) => (
                  <Box
                    key={req.id}
                    onClick={() => handleNavigateAndClose(ROUTES.REQUESTS, () => selectRequestForDrawer(req))}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'rgba(245, 158, 11, 0.06)' },
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{req.bookTitle}</Typography>
                      <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>Student: {req.studentName} ({req.registerNumber})</Typography>
                    </Box>
                    <StatusChip status={req.status} />
                  </Box>
                ))}
              </Box>
            )}

            {/* Category 4: Transactions */}
            {searchResults.transactions.length > 0 && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: BORROW_COLORS.info, mb: 1, display: 'block' }}>
                  ISSUE & RETURN TRANSACTIONS ({searchResults.transactions.length})
                </Typography>
                {searchResults.transactions.map((txn) => (
                  <Box
                    key={txn.id}
                    onClick={() => handleNavigateAndClose(ROUTES.RETURNS, () => selectTransactionForDetails(txn))}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.06)' },
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{txn.bookTitle}</Typography>
                      <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 700, fontFamily: 'monospace' }}>Copy ID: {txn.bookCopyId} • {txn.studentName}</Typography>
                    </Box>
                    <StatusChip status={txn.computedStatus || txn.status} />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default CommandPalette;
