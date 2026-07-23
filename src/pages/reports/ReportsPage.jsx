import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';

import PageContainer from '../../components/common/PageContainer';
import CustomButton from '../../components/common/CustomButton';
import AnalyticsStatistics from '../../components/analytics/AnalyticsStatistics';
import AnalyticsCharts from '../../components/analytics/AnalyticsCharts';
import TopBooksTable from '../../components/analytics/TopBooksTable';
import TopStudentsTable from '../../components/analytics/TopStudentsTable';
import OverdueReportTable from '../../components/analytics/OverdueReportTable';
import CategoryReportTable from '../../components/analytics/CategoryReportTable';
import DepartmentReportTable from '../../components/analytics/DepartmentReportTable';
import ExportDialog from '../../components/analytics/ExportDialog';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useRBAC } from '../../hooks/useRBAC';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { exportToCSV, exportToPDF } from '../../services/exportService';

export const ReportsPage = () => {
  const { dateRange, setDateRange, setExportModalOpen, exportModalOpen, topBooks, topStudents, categoryReport } = useAnalytics();
  const { currentRole } = useRBAC();
  const [activeTab, setActiveTab] = useState(0);

  const handleQuickCSVExport = () => {
    if (activeTab === 0) {
      exportToCSV('Top_Borrowed_Books', [{ label: 'Title', key: 'title' }, { label: 'Author', key: 'author' }, { label: 'Category', key: 'category' }, { label: 'Total Borrows', key: 'borrowCount' }], topBooks);
    } else if (activeTab === 1) {
      exportToCSV('Top_Student_Borrowers', [{ label: 'Name', key: 'name' }, { label: 'Register No', key: 'regNo' }, { label: 'Department', key: 'department' }, { label: 'Total Borrows', key: 'totalBorrowed' }], topStudents);
    } else {
      exportToCSV('Category_Report', [{ label: 'Category', key: 'category' }, { label: 'Titles', key: 'totalTitles' }, { label: 'Borrowed Copies', key: 'borrowedCopies' }], categoryReport);
    }
  };

  const handleQuickPDFPrint = () => {
    exportToPDF(`Library Audit Report (${dateRange})`, [{ label: 'Category / Title', key: 'category' }, { label: 'Total Titles', key: 'totalTitles' }, { label: 'Borrowed Copies', key: 'borrowedCopies' }], categoryReport);
  };

  return (
    <PageContainer
      title="Reports & Executive Analytics"
      subtitle="Analyze library circulation performance, popular catalog titles, department borrowing habits, and overdue reports."
      actions={
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            select
            size="small"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            sx={{ minWidth: 160, backgroundColor: '#FFFFFF', borderRadius: '10px' }}
          >
            <MenuItem value="Today">Today</MenuItem>
            <MenuItem value="Yesterday">Yesterday</MenuItem>
            <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
            <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
            <MenuItem value="This Month">This Month</MenuItem>
            <MenuItem value="This Year">This Year</MenuItem>
            <MenuItem value="All Time">All Time</MenuItem>
          </TextField>

          <CustomButton variant="outlined" startIcon={<PrintIcon />} onClick={handleQuickPDFPrint}>
            PDF / Print
          </CustomButton>

          <CustomButton
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={() => setExportModalOpen(true)}
          >
            Export Options
          </CustomButton>
        </Box>
      }
    >
      {/* 1. Metric Overview Statistics Cards */}
      <AnalyticsStatistics />

      {/* 2. Responsive Material 3 Charts Panel */}
      <AnalyticsCharts />

      {/* 3. Detailed Tabbed Reports */}
      <Box sx={{ backgroundColor: BORROW_COLORS.surface, borderRadius: '20px', border: `1px solid ${BORROW_COLORS.border}`, p: 3, boxShadow: BORROW_COLORS.cardShadow }}>
        <Box sx={{ borderBottom: 1, borderColor: BORROW_COLORS.border, mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Top 10 Most Borrowed Books" sx={{ fontWeight: 700 }} />
            <Tab label="Top Student Borrowers" sx={{ fontWeight: 700 }} />
            <Tab label="Overdue Books Audit" sx={{ fontWeight: 700 }} />
            <Tab label="Category Breakdown" sx={{ fontWeight: 700 }} />
            <Tab label="Department Usage" sx={{ fontWeight: 700 }} />
          </Tabs>
        </Box>

        {activeTab === 0 && <TopBooksTable />}
        {activeTab === 1 && <TopStudentsTable />}
        {activeTab === 2 && <OverdueReportTable />}
        {activeTab === 3 && <CategoryReportTable />}
        {activeTab === 4 && <DepartmentReportTable />}
      </Box>

      {/* Export Modal Dialog */}
      <ExportDialog open={exportModalOpen} onClose={() => setExportModalOpen(false)} />
    </PageContainer>
  );
};

export default ReportsPage;
