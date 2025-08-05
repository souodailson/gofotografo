import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const usePageNavigation = (initialTab) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTabState] = useState(initialTab);
  const [initialFinancialFilter, setInitialFinancialFilter] = useState({ type: 'all', period: 'all' });

  const setActiveTab = useCallback((tab, filter = { type: 'all', period: 'all' }) => {
    setInitialFinancialFilter(filter);
    setActiveTabState(tab);
    navigate(`/${tab}`, { replace: true });
    window.scrollTo(0, 0);
  }, [navigate]);

  return { activeTab, setActiveTab, initialFinancialFilter };
};

export default usePageNavigation;