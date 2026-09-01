import { create } from 'zustand';
import { Product } from '../types';
import { db } from '../config/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { mockProducts } from '../data/mockProducts';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  initializeStore: () => () => void; // Returns unsubscribe function
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updatedProduct: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: true,
  initializeStore: () => {
    const q = collection(db, 'products');
    
    // Auto-seed if empty
    getDocs(q).then(async (snapshot) => {
      if (snapshot.empty) {
        console.log("Database products empty. Attempting to seed...");
        try {
          for (const product of mockProducts) {
            await setDoc(doc(db, 'products', product.id), product);
          }
        } catch(e) {
          console.log("Not authorized to auto-seed products. Using empty list or you need to login as Admin.");
        }
      }
    }).catch(console.error);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData: Product[] = [];
      snapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() } as Product);
      });
      set({ products: productsData, isLoading: false });
    }, (error) => {
      console.error("Firestore Error in products:", error);
      set({ isLoading: false });
    });
    return unsubscribe;
  },
  addProduct: async (product) => {
    try {
      await setDoc(doc(db, 'products', product.id), product);
    } catch (error) {
      console.error("Failed to add product:", error);
      throw error;
    }
  },
  updateProduct: async (id, updatedProduct) => {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, updatedProduct);
    } catch (error) {
      console.error("Failed to update product:", error);
      throw error;
    }
  },
  deleteProduct: async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error("Failed to delete product:", error);
      throw error;
    }
  },
}));
