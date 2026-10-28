import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { Pet, DoseSchedule, PrescriptionOrder, UserAccount, OrderStatus } from '../types';

/**
 * Remove campos undefined para evitar erros no Firestore
 */
function sanitizeForFirestore<T extends Record<string, any>>(data: T): Partial<T> {
  const clean: any = {};
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        clean[key] = sanitizeForFirestore(val);
      } else {
        clean[key] = val;
      }
    }
  }
  return clean;
}

// ==========================================
// 1. PERFIL DO USUÁRIO
// ==========================================

export const saveUserProfileToFirestore = async (user: UserAccount): Promise<void> => {
  try {
    const userRef = doc(db, 'users', user.id);
    const data = sanitizeForFirestore({
      ...user,
      updatedAt: serverTimestamp()
    });
    await setDoc(userRef, data, { merge: true });
  } catch (err) {
    console.warn('Erro ao salvar perfil no Firestore:', err);
  }
};

export const getUserProfileFromFirestore = async (userId: string): Promise<UserAccount | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserAccount;
    }
    return null;
  } catch (err) {
    console.warn('Erro ao buscar perfil do Firestore:', err);
    return null;
  }
};

// ==========================================
// 2. PETS
// ==========================================

export const subscribeUserPets = (
  userId: string,
  onUpdate: (pets: Pet[]) => void
): (() => void) => {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const q = query(
    collection(db, 'pets'),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const pets: Pet[] = [];
      snapshot.forEach((docSnap) => {
        pets.push(docSnap.data() as Pet);
      });
      onUpdate(pets);
    },
    (error) => {
      console.warn('Erro no listener de pets do Firestore (verifique as regras de segurança):', error);
    }
  );
};

export const savePetToFirestore = async (pet: Pet, userId: string): Promise<void> => {
  try {
    const petRef = doc(db, 'pets', pet.id);
    const data = sanitizeForFirestore({
      ...pet,
      userId,
      updatedAt: serverTimestamp()
    });
    await setDoc(petRef, data, { merge: true });
  } catch (err) {
    console.warn('Erro ao salvar pet no Firestore:', err);
  }
};

export const deletePetFromFirestore = async (petId: string): Promise<void> => {
  try {
    const petRef = doc(db, 'pets', petId);
    await deleteDoc(petRef);
  } catch (err) {
    console.warn('Erro ao remover pet no Firestore:', err);
  }
};

// ==========================================
// 3. HORÁRIOS & LEMBRETES DE REMÉDIO
// ==========================================

export const subscribeUserSchedules = (
  userId: string,
  onUpdate: (schedules: DoseSchedule[]) => void
): (() => void) => {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const q = query(
    collection(db, 'doseSchedules'),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const schedules: DoseSchedule[] = [];
      snapshot.forEach((docSnap) => {
        schedules.push(docSnap.data() as DoseSchedule);
      });
      onUpdate(schedules);
    },
    (error) => {
      console.warn('Erro no listener de horários do Firestore:', error);
    }
  );
};

export const saveScheduleToFirestore = async (
  schedule: DoseSchedule,
  userId: string
): Promise<void> => {
  try {
    const schedRef = doc(db, 'doseSchedules', schedule.id);
    const data = sanitizeForFirestore({
      ...schedule,
      userId,
      updatedAt: serverTimestamp()
    });
    await setDoc(schedRef, data, { merge: true });
  } catch (err) {
    console.warn('Erro ao salvar horário no Firestore:', err);
  }
};

export const updateScheduleInFirestore = async (
  scheduleId: string,
  updates: Partial<DoseSchedule>
): Promise<void> => {
  try {
    const schedRef = doc(db, 'doseSchedules', scheduleId);
    const data = sanitizeForFirestore({
      ...updates,
      updatedAt: serverTimestamp()
    });
    await updateDoc(schedRef, data);
  } catch (err) {
    console.warn('Erro ao atualizar horário no Firestore:', err);
  }
};

export const deleteScheduleFromFirestore = async (scheduleId: string): Promise<void> => {
  try {
    const schedRef = doc(db, 'doseSchedules', scheduleId);
    await deleteDoc(schedRef);
  } catch (err) {
    console.warn('Erro ao deletar alarme no Firestore:', err);
  }
};

// ==========================================
// 4. PEDIDOS DE RECEITAS (PRESCRIPTION ORDERS)
// ==========================================

export const subscribeOrders = (
  userId: string,
  role: string,
  onUpdate: (orders: PrescriptionOrder[]) => void
): (() => void) => {
  const colRef = collection(db, 'orders');
  
  // Admins veem todos os pedidos; tutores veem apenas os seus
  const q = role === 'admin'
    ? query(colRef)
    : query(colRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const orders: PrescriptionOrder[] = [];
      snapshot.forEach((docSnap) => {
        orders.push(docSnap.data() as PrescriptionOrder);
      });
      // Ordena por data mais recente
      orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onUpdate(orders);
    },
    (error) => {
      console.warn('Erro no listener de pedidos do Firestore:', error);
    }
  );
};

export const saveOrderToFirestore = async (
  order: PrescriptionOrder,
  userId?: string
): Promise<void> => {
  try {
    const orderRef = doc(db, 'orders', order.id);
    const data = sanitizeForFirestore({
      ...order,
      userId: userId || order.clientName,
      updatedAt: serverTimestamp()
    });
    await setDoc(orderRef, data, { merge: true });
  } catch (err) {
    console.warn('Erro ao salvar pedido no Firestore:', err);
  }
};

export const updateOrderStatusInFirestore = async (
  orderId: string,
  status: OrderStatus,
  extraUpdates?: Partial<PrescriptionOrder>
): Promise<void> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const data = sanitizeForFirestore({
      status,
      ...extraUpdates,
      updatedAt: serverTimestamp()
    });
    await updateDoc(orderRef, data);
  } catch (err) {
    console.warn('Erro ao atualizar status do pedido no Firestore:', err);
  }
};
