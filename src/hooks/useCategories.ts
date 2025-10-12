import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Category } from '../models';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erreur de création');
    }
  };

  const updateCategory = async (categoryId: string, updates: Partial<Category>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', categoryId);

      if (error) throw error;
      return true;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erreur de mise à jour');
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      return true;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erreur de suppression');
    }
  };

  useEffect(() => {
    fetchCategories();

    // Abonnement en temps réel aux catégories
    const subscription = supabase
      .channel('categories_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCategories(prev => [...prev, payload.new as Category]);
          } else if (payload.eventType === 'UPDATE') {
            setCategories(prev => 
              prev.map(c => c.id === payload.new.id ? payload.new as Category : c)
            );
          } else if (payload.eventType === 'DELETE') {
            setCategories(prev => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { 
    categories, 
    loading, 
    error, 
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
}