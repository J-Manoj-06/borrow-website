import { useContext } from 'react';
import { StudentContext } from '../contexts/StudentContext';

export const useStudents = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudents must be used within a StudentProvider');
  }
  return context;
};

export default useStudents;
