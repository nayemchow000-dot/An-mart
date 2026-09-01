import { create } from 'zustand';
import { Category } from '../types';
import { db } from '../config/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  initializeStore: () => () => void;
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (id: string, updatedCategory: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  isLoading: true,
  initializeStore: () => {
    const q = collection(db, 'categories');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categoriesData: Category[] = [];
      snapshot.forEach((doc) => {
        categoriesData.push({ id: doc.id, ...doc.data() } as Category);
      });
      // Sort by display order
      categoriesData.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      set({ categories: categoriesData, isLoading: false });
    }, (error) => {
      console.error("Firestore Error in categories:", error);
      set({ isLoading: false });
    });
    return unsubscribe;
  },
  addCategory: async (category) => {
    try {
      await setDoc(doc(db, 'categories', category.id), category);
    } catch (error) {
      console.error("Failed to add category:", error);
      throw error;
    }
  },
  updateCategory: async (id, updatedCategory) => {
    try {
      const docRef = doc(db, 'categories', id);
      await updateDoc(docRef, updatedCategory);
    } catch (error) {
      console.error("Failed to update category:", error);
      throw error;
    }
  },
  deleteCategory: async (id) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      console.error("Failed to delete category:", error);
      throw error;
    }
  },
}));
