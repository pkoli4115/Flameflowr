// src/firebase/userApi.ts

import { db } from './firebaseConfig';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  DocumentSnapshot,
} from 'firebase/firestore';

// TypeScript interface for a user
export interface User {
  uid: string;
  name: string;
  email: string;
  status: 'active' | 'banned' | 'pending';
  role: 'user' | 'admin' | 'superadmin';
  createdAt: number; // timestamp
  lastLogin: number; // timestamp
  notes?: string;
  photoURL?: string;
}

const usersRef = collection(db, 'users');

// Fetch users with cursor-based pagination
export async function fetchUsers(
  limitCount = 20,
  startAfterDoc?: DocumentSnapshot<DocumentData> | null
) {
  let q = query(usersRef, orderBy('createdAt', 'desc'), limit(limitCount));
  if (startAfterDoc) {
    q = query(usersRef, orderBy('createdAt', 'desc'), startAfter(startAfterDoc), limit(limitCount));
  }
  const snap = await getDocs(q);
  return {
    users: snap.docs.map((d) => ({ ...(d.data() as User), uid: d.id })),
    lastDoc: snap.docs.length ? snap.docs[snap.docs.length - 1] : null,
    hasNextPage: snap.docs.length === limitCount,
  };
}

// Update user
export async function updateUser(uid: string, updates: Partial<User>) {
  const userDoc = doc(usersRef, uid);
  return await updateDoc(userDoc, updates);
}

// Delete user
export async function deleteUser(uid: string) {
  const userDoc = doc(usersRef, uid);
  return await deleteDoc(userDoc);
}

// Add or update admin-only note
export async function addUserNote(uid: string, note: string) {
  const userDoc = doc(usersRef, uid);
  return await updateDoc(userDoc, { notes: note });
}
