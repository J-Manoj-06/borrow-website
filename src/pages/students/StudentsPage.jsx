import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import toast from 'react-hot-toast';

// Icons
import TableRowsIcon from '@mui/icons-material/TableRows';
import GridViewIcon from '@mui/icons-material/GridView';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';

import PageContainer from '../../components/common/PageContainer';
import CustomButton from '../../components/common/CustomButton';
import UniversalSearchBar from '../../components/common/UniversalSearchBar';
import UniversalFilterBar from '../../components/common/UniversalFilterBar';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import CustomDialog from '../../components/common/CustomDialog';

import StudentTable from '../../components/students/StudentTable';
import StudentGridView from '../../components/students/StudentGridView';
import StudentBulkActionBar from '../../components/students/StudentBulkActionBar';
import StudentProfileDrawer from '../../components/students/StudentProfileDrawer';

import { useStudents } from '../../hooks/useStudents';
import { useTransactions } from '../../hooks/useTransactions';
import { useAuth } from '../../hooks/useAuth';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { exportToCSV } from '../../services/exportService';

export const StudentsPage = () => {
  const { user } = useAuth();
  const {
    students,
    filteredStudents,
    loading,
    searchQuery,
    setSearchQuery,
    filterOptions,
    setFilterOptions,
    resetFilters,
    selectedStudent,
    drawerOpen,
    setDrawerOpen,
    selectStudentForProfile,
  } = useStudents();

  const { openIssueModal, openReturnModal } = useTransactions();

  // Local View Toggle ('table' | 'grid')
  const [viewMode, setViewMode] = useState('table');

  // Multi-Select Selected Student IDs State
  const [selectedIds, setSelectedIds] = useState([]);

  // Add Student Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    fullName: '',
    registerNumber: '',
    department: 'Computer Science',
    year: '3',
    email: '',
  });

  // Calculate Header Statistics
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeBorrowers = students.filter((s) => (s.borrowedCount || 0) > 0).length;
    return { totalStudents, activeBorrowers };
  }, [students]);

  // Department & Filter Options
  const departmentOptions = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'];
  const sortOptions = [
    { label: 'Alphabetical (A-Z)', value: 'Alphabetical' },
    { label: 'Newest First', value: 'Newest' },
    { label: 'Oldest First', value: 'Oldest' },
    { label: 'Active Loans', value: 'Recently Active' },
  ];

  const handleFilterChange = (key, value) => {
    setFilterOptions((prev) => ({ ...prev, [key]: value }));
  };

  // Multi-Select Handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleToggleSelectAll = (pageIds) => {
    const isAllSelected = pageIds.every((id) => selectedIds.includes(id));
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Quick Action Handlers
  const handleIssueBookForStudent = (student) => {
    selectStudentForProfile(student);
    if (openIssueModal) openIssueModal(student);
  };

  const handleEditStudent = (student) => {
    toast.success(`Editing details for ${student.fullName || student.name}`);
  };

  const handleNotifyStudent = (student) => {
    toast.success(`Notification alert sent to ${student.fullName || student.name}`);
  };

  const handleToggleBlockStudent = (student) => {
    const isBlocked = student.computedStatus === 'Blocked';
    toast.success(`Student ${student.fullName || student.name} has been ${isBlocked ? 'unblocked' : 'deactivated'}.`);
  };

  const handleDeleteStudent = (student) => {
    toast.error(`Student record ${student.registerNumber} deleted.`);
  };

  // Bulk Action Operations
  const handleBulkNotify = () => {
    toast.success(`Notifications broadcast to ${selectedIds.length} students!`);
    setSelectedIds([]);
  };

  const handleBulkExport = () => {
    const selectedData = filteredStudents.filter((s) => selectedIds.includes(s.id));
    const exportRows = (selectedData.length > 0 ? selectedData : filteredStudents).map((s) => ({
      StudentID: s.id,
      FullName: s.fullName || s.name,
      RegisterNumber: s.registerNumber,
      Department: s.department,
      Year: s.year,
      Email: s.email,
      ActiveLoans: s.borrowedCount || 0,
      Status: s.computedStatus || s.status || 'Active',
    }));
    exportToCSV(exportRows, `Student_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success('Student directory export generated!');
  };

  const handleBulkActivate = () => {
    toast.success(`Activated ${selectedIds.length} student accounts!`);
    setSelectedIds([]);
  };

  const handleBulkDeactivate = () => {
    toast.success(`Deactivated ${selectedIds.length} student accounts!`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    toast.error(`Deleted ${selectedIds.length} student records.`);
    setSelectedIds([]);
  };

  // Add Student Submission
  const handleAddStudentSubmit = () => {
    if (!newStudent.fullName || !newStudent.registerNumber) {
      toast.error('Please enter Student Name and Register Number!');
      return;
    }
    toast.success(`New student "${newStudent.fullName}" added successfully!`);
    setAddModalOpen(false);
    setNewStudent({ fullName: '', registerNumber: '', department: 'Computer Science', year: '3', email: '' });
  };

  return (
    <PageContainer
      title="Students Management"
      subtitle={`Directory — Total Students: ${stats.totalStudents} | Active Borrowers: ${stats.activeBorrowers}`}
      actions={
        <CustomButton
          variant="primary"
          startIcon={<PersonAddOutlinedIcon />}
          onClick={() => setAddModalOpen(true)}
        >
          + Add Student
        </CustomButton>
      }
    >
      {/* 1. Universal Search Bar & View Switcher */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
        }}
      >
        <UniversalSearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          placeholder="Search by Student Name, Register No, Email, Phone, Department, or Year..."
          width="100%"
          sx={{ flexGrow: 1 }}
        />

        {/* View Switcher Toggle */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newView) => newView && setViewMode(newView)}
          size="small"
          aria-label="View Switcher"
          sx={{ backgroundColor: BORROW_COLORS.surface, alignSelf: { xs: 'flex-end', sm: 'center' } }}
        >
          <ToggleButton value="table" aria-label="Table View">
            <Tooltip title="Table View">
              <TableRowsIcon sx={{ fontSize: 18 }} />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="grid" aria-label="Card View">
            <Tooltip title="Card View">
              <GridViewIcon sx={{ fontSize: 18 }} />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* 2. Universal Filter Bar */}
      <UniversalFilterBar
        filters={filterOptions}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        departmentOptions={departmentOptions}
        sortOptions={sortOptions}
        statusOptions={[
          { label: 'Active', value: 'Active' },
          { label: 'Blocked', value: 'Blocked' },
          { label: 'Overdue', value: 'Overdue' },
        ]}
      />

      {/* 3. Student Data Content (Table View vs Grid Card View) */}
      {loading ? (
        <SkeletonLoader type={viewMode === 'grid' ? 'grid' : 'table'} rows={8} count={8} />
      ) : viewMode === 'grid' ? (
        <StudentGridView
          students={filteredStudents}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectProfile={selectStudentForProfile}
          onIssueBook={handleIssueBookForStudent}
          onEdit={handleEditStudent}
          onNotify={handleNotifyStudent}
          onToggleBlock={handleToggleBlockStudent}
          onDelete={handleDeleteStudent}
        />
      ) : (
        <StudentTable
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onIssueBook={handleIssueBookForStudent}
          onEdit={handleEditStudent}
          onNotify={handleNotifyStudent}
          onToggleBlock={handleToggleBlockStudent}
          onDelete={handleDeleteStudent}
        />
      )}

      {/* 4. Sticky Bulk Actions Bar */}
      <StudentBulkActionBar
        selectedCount={selectedIds.length}
        onClearSelection={handleClearSelection}
        onBulkNotify={handleBulkNotify}
        onBulkExport={handleBulkExport}
        onBulkActivate={handleBulkActivate}
        onBulkDeactivate={handleBulkDeactivate}
        onBulkDelete={handleBulkDelete}
      />

      {/* --- MODALS & DRAWERS --- */}

      {/* Student Profile Side Drawer */}
      <StudentProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        student={selectedStudent}
        onIssueBook={handleIssueBookForStudent}
        onNotify={handleNotifyStudent}
        onReturnBook={(loan) => openReturnModal && openReturnModal(loan)}
      />

      {/* Add Student Form Modal */}
      <CustomDialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Student Member"
        subtitle="Register a student member manually in the library portal."
        actions={
          <>
            <CustomButton variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </CustomButton>
            <CustomButton variant="primary" onClick={handleAddStudentSubmit}>
              Save Student
            </CustomButton>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Full Student Name"
            placeholder="John Doe"
            fullWidth
            required
            value={newStudent.fullName}
            onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
          />
          <TextField
            label="Register Number"
            placeholder="ST-2024-001"
            fullWidth
            required
            value={newStudent.registerNumber}
            onChange={(e) => setNewStudent({ ...newStudent, registerNumber: e.target.value })}
          />
          <TextField
            select
            label="Department"
            fullWidth
            value={newStudent.department}
            onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
          >
            {departmentOptions.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Email Address"
            placeholder="john.doe@university.edu"
            fullWidth
            value={newStudent.email}
            onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
          />
        </Box>
      </CustomDialog>
    </PageContainer>
  );
};

export default StudentsPage;
