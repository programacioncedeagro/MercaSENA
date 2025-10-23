import { Leaf, Drumstick } from 'lucide-react';
import type { Production } from './types';
import { PlaceHolderImages } from './placeholder-images';

// This file is now mostly deprecated in favor of real-time Firestore data.
// It can be kept for type reference or removed later.

const findImage = (id: string) => PlaceHolderImages.find((img) => img.id === id)?.imageUrl || '';

export const mockProductions: Production[] = [];
