import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

export interface CompareProperty {
  id: string;
  _id?: string;
  title: string;
  price: number;
  location: string;
  town?: string;
  area?: string;
  state?: string;
  size?: number;
  sizeUnit?: string;
  status?: string;
  images?: string[];
  listingType?: string;
  type?: string;
  description?: string;
  features?: string[];
}

interface CompareStore {
  properties: CompareProperty[];
  addProperty: (property: CompareProperty) => void;
  removeProperty: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
}

export const useCompareStore = create<CompareStore>((set, get) => ({
  properties: [],
  addProperty: (property) => {
    const id = property._id || property.id;
    const currentProps = get().properties;
    
    if (currentProps.some(p => (p._id || p.id) === id)) {
      return;
    }
    
    if (currentProps.length >= 3) {
      toast.error("You can only compare up to 3 properties.");
      return;
    }
    
    set({ properties: [...currentProps, property] });
    toast.success("Added to Compare");
  },
  removeProperty: (id) => {
    set({
      properties: get().properties.filter((p) => (p._id || p.id) !== id)
    });
  },
  clearCompare: () => set({ properties: [] }),
  isInCompare: (id) => get().properties.some((p) => (p._id || p.id) === id),
}));
