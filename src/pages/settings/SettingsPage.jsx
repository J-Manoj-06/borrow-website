import React, { useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Category Icons
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import CategoryIcon from '@mui/icons-material/Category';
import BusinessIcon from '@mui/icons-material/Business';
import SchoolIcon from '@mui/icons-material/School';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PaletteIcon from '@mui/icons-material/Palette';
import InfoIcon from '@mui/icons-material/Info';

import PageContainer from '../../components/common/PageContainer';
import CustomButton from '../../components/common/CustomButton';
import GeneralSettings from '../../components/settings/GeneralSettings';
import BorrowRulesSettings from '../../components/settings/BorrowRulesSettings';
import ReturnRulesSettings from '../../components/settings/ReturnRulesSettings';
import CategorySettings from '../../components/settings/CategorySettings';
import DepartmentSettings from '../../components/settings/DepartmentSettings';
import AcademicYearSettings from '../../components/settings/AcademicYearSettings';
import NotificationSettings from '../../components/settings/NotificationSettings';
import ProfileSettings from '../../components/settings/ProfileSettings';
import AppearanceSettings from '../../components/settings/AppearanceSettings';
import AboutSettings from '../../components/settings/AboutSettings';

import { useSettings } from '../../hooks/useSettings';
import { BORROW_COLORS } from '../../theme/borrowTheme';

const SETTINGS_TABS = [
  { id: 'general', label: 'General Library', icon: LocalLibraryIcon },
  { id: 'borrowRules', label: 'Borrow Loan Rules', icon: MenuBookIcon },
  { id: 'returnRules', label: 'Return Policies & Fines', icon: AssignmentReturnIcon },
  { id: 'categories', label: 'Subject Categories', icon: CategoryIcon },
  { id: 'departments', label: 'University Departments', icon: BusinessIcon },
  { id: 'academicYears', label: 'Academic Years', icon: SchoolIcon },
  { id: 'notifications', label: 'Notification Preferences', icon: NotificationsIcon },
  { id: 'profile', label: 'Admin Profile', icon: AccountCircleIcon },
  { id: 'appearance', label: 'Appearance & Theme', icon: PaletteIcon },
  { id: 'about', label: 'About & Version', icon: InfoIcon },
];

export const SettingsPage = () => {
  const {
    activeTab,
    setActiveTab,
    saveStatus,
    exportBackup,
    importBackup,
    resetDefaults,
  } = useSettings();

  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      importBackup(event.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <PageContainer
      title="Library Settings & System Configuration"
      subtitle="Central administrative hub for configuring library policies, loan durations, return rules, subject categories, and appearance."
      actions={
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Auto Save Status Badge */}
          {saveStatus === 'saving' && (
            <Chip
              icon={<CircularProgress size={14} color="inherit" />}
              label="Saving..."
              size="small"
              sx={{ backgroundColor: BORROW_COLORS.warningLight, color: BORROW_COLORS.warning, fontWeight: 700 }}
            />
          )}

          {saveStatus === 'saved' && (
            <Chip
              icon={<CheckCircleIcon fontSize="small" />}
              label="Saved Successfully"
              size="small"
              sx={{ backgroundColor: BORROW_COLORS.successLight, color: BORROW_COLORS.success, fontWeight: 700 }}
            />
          )}

          <CustomButton
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={exportBackup}
          >
            Backup JSON
          </CustomButton>

          <Button
            component="label"
            variant="outlined"
            startIcon={<FileUploadIcon />}
            sx={{ borderRadius: '10px', px: 2 }}
          >
            Import JSON
            <input type="file" ref={fileInputRef} hidden accept=".json" onChange={handleFileUpload} />
          </Button>

          <CustomButton variant="text" color="error" startIcon={<RestartAltIcon />} onClick={resetDefaults}>
            Reset Defaults
          </CustomButton>
        </Box>
      }
    >
      <Grid container spacing={3}>
        {/* Left Side: Category Tabs Navigation Menu */}
        <Grid item xs={12} md={3.5} lg={3}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '20px',
              border: `1px solid ${BORROW_COLORS.border}`,
              backgroundColor: BORROW_COLORS.surface,
              boxShadow: BORROW_COLORS.cardShadow,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 2, borderBottom: `1px solid ${BORROW_COLORS.border}` }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: BORROW_COLORS.textSecondary, letterSpacing: 0.5 }}>
                SETTINGS CATEGORIES
              </Typography>
            </Box>

            <List disablePadding>
              {SETTINGS_TABS.map((tab) => {
                const IconComponent = tab.icon;
                const isSelected = activeTab === tab.id;

                return (
                  <ListItemButton
                    key={tab.id}
                    selected={isSelected}
                    onClick={() => setActiveTab(tab.id)}
                    sx={{
                      py: 1.5,
                      px: 2.5,
                      borderLeft: `4px solid ${isSelected ? BORROW_COLORS.primary : 'transparent'}`,
                      backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(37, 99, 235, 0.05)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: isSelected ? BORROW_COLORS.primary : BORROW_COLORS.textSecondary, minWidth: 38 }}>
                      <IconComponent fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={tab.label}
                      primaryTypographyProps={{
                        variant: 'subtitle2',
                        fontWeight: isSelected ? 800 : 600,
                        color: isSelected ? BORROW_COLORS.primary : BORROW_COLORS.textPrimary,
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* Right Side: Active Settings Panel Content */}
        <Grid item xs={12} md={8.5} lg={9}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: '20px',
              border: `1px solid ${BORROW_COLORS.border}`,
              backgroundColor: BORROW_COLORS.surface,
              boxShadow: BORROW_COLORS.cardShadow,
              minHeight: 480,
            }}
          >
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'borrowRules' && <BorrowRulesSettings />}
            {activeTab === 'returnRules' && <ReturnRulesSettings />}
            {activeTab === 'categories' && <CategorySettings />}
            {activeTab === 'departments' && <DepartmentSettings />}
            {activeTab === 'academicYears' && <AcademicYearSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'appearance' && <AppearanceSettings />}
            {activeTab === 'about' && <AboutSettings />}
          </Paper>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default SettingsPage;
