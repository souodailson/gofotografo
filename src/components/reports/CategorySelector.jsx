import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useData } from '@/contexts/DataContext';

const CategorySelector = ({ selectedCategory, setSelectedCategory }) => {
  const { user } = useData();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('transacoes')
        .select('category')
        .eq('user_id', user.id)
        .eq('tipo', 'ENTRADA')
        .not('category', 'is', null)
        .limit(100); 
      
      if (error) {
        console.error("Error fetching categories:", error);
        return;
      }
      const uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))];
      setCategories(uniqueCategories);
    };
    fetchCategories();
  }, [user]);

  return (
    <select
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
      className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
    >
      <option value="all">Todas as Categorias (Receita)</option>
      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
    </select>
  );
};

export default CategorySelector;