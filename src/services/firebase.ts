import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  Auth,
  User as FirebaseUser 
} from 'firebase/auth';
import { UserAccount, RegisterData, PharmacyUnit } from '../types';
import { INITIAL_USERS } from '../data/mockData';

// Configuração do Firebase via Vite Environment Variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

import { getFirestore, Firestore } from 'firebase/firestore';

// Inicialização segura
let app: FirebaseApp;
if (getApps().length > 0) {
  app = getApp();
} else {
  app = initializeApp(firebaseConfig);
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Provedor Google configurado para sempre permitir seleção de conta
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

const PROFILE_STORAGE_KEY_PREFIX = 'amor_ao_bicho_user_profile_';

/**
 * Salva metadados estendidos do perfil no localStorage indexados pelo UID do Firebase
 */
export const saveStoredProfile = (uid: string, profile: Partial<UserAccount>) => {
  try {
    const existingStr = localStorage.getItem(`${PROFILE_STORAGE_KEY_PREFIX}${uid}`);
    const existing = existingStr ? JSON.parse(existingStr) : {};
    const merged = { ...existing, ...profile };
    localStorage.setItem(`${PROFILE_STORAGE_KEY_PREFIX}${uid}`, JSON.stringify(merged));
  } catch (e) {
    console.error('Erro ao salvar perfil no localStorage:', e);
  }
};

/**
 * Recupera metadados estendidos do perfil do localStorage
 */
export const getStoredProfile = (uid: string): Partial<UserAccount> => {
  try {
    const data = localStorage.getItem(`${PROFILE_STORAGE_KEY_PREFIX}${uid}`);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Erro ao ler perfil do localStorage:', e);
    return {};
  }
};

/**
 * Converte um FirebaseUser em nosso tipo UserAccount
 */
export const mapFirebaseUserToUserAccount = (
  fbUser: FirebaseUser,
  extraData?: Partial<UserAccount>
): UserAccount => {
  const cleanEmail = (fbUser.email || '').toLowerCase().trim();

  // Verifica se o email corresponde a um usuário admin inicial da Amor ao Bicho
  const adminMatch = INITIAL_USERS.find(
    u => u.email.toLowerCase() === cleanEmail && u.role === 'admin'
  );

  const stored = getStoredProfile(fbUser.uid);
  const city = extraData?.address?.city || stored.address?.city || extraData?.city || 'Americana';
  const unit: PharmacyUnit = city.toLowerCase().includes('valinhos') ? 'valinhos' : 'americana';

  const userAccount: UserAccount = {
    id: fbUser.uid,
    name: fbUser.displayName || extraData?.name || stored.name || cleanEmail.split('@')[0] || 'Tutor',
    email: cleanEmail,
    phone: fbUser.phoneNumber || extraData?.phone || stored.phone || '(19) 99000-0000',
    cpf: extraData?.cpf || stored.cpf,
    role: adminMatch ? 'admin' : (extraData?.role || stored.role || 'tutor'),
    avatarUrl: fbUser.photoURL || stored.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    pharmacyUnit: adminMatch?.pharmacyUnit || stored.pharmacyUnit || unit,
    crf: adminMatch?.crf || stored.crf,
    address: {
      street: extraData?.address?.street || stored.address?.street || 'Rua Principal',
      number: extraData?.address?.number || stored.address?.number || '100',
      complement: extraData?.address?.complement || stored.address?.complement,
      neighborhood: extraData?.address?.neighborhood || stored.address?.neighborhood || 'Centro',
      city: city,
      state: 'SP',
      cep: extraData?.address?.cep || stored.address?.cep || (city.toLowerCase().includes('valinhos') ? '13270-000' : '13465-000')
    }
  };

  // Atualiza cache
  saveStoredProfile(fbUser.uid, userAccount);

  return userAccount;
};

/**
 * Login com E-mail e Senha no Firebase
 */
export const loginWithEmail = async (email: string, password: string): Promise<UserAccount> => {
  const cleanEmail = email.trim().toLowerCase();
  const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
  return mapFirebaseUserToUserAccount(credential.user);
};

/**
 * Cadastro com E-mail e Senha no Firebase
 */
export const registerWithEmail = async (data: RegisterData): Promise<UserAccount> => {
  const cleanEmail = data.email.trim().toLowerCase();
  const password = data.password || '123456';
  
  const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  
  // Atualiza nome de exibição no Firebase Auth
  if (data.name) {
    try {
      await updateProfile(credential.user, {
        displayName: data.name.trim()
      });
    } catch (e) {
      console.warn('Não foi possível atualizar o displayName no Firebase:', e);
    }
  }

  const extra: Partial<UserAccount> = {
    name: data.name.trim(),
    phone: data.phone.trim(),
    cpf: data.cpf?.trim(),
    role: data.role,
    crmv: data.crmv,
    crmvState: data.crmvState,
    clinicName: data.clinicName,
    pharmacyUnit: data.unit,
    address: {
      street: 'Rua Principal',
      number: '100',
      neighborhood: 'Centro',
      city: data.city || 'Americana',
      state: 'SP',
      cep: data.city?.toLowerCase().includes('valinhos') ? '13270-000' : '13465-000'
    }
  };

  saveStoredProfile(credential.user.uid, extra);
  return mapFirebaseUserToUserAccount(credential.user, extra);
};

/**
 * Login com o Google (Popup)
 */
export const loginWithGoogle = async (): Promise<UserAccount> => {
  const result = await signInWithPopup(auth, googleProvider);
  return mapFirebaseUserToUserAccount(result.user);
};

/**
 * Logout do Firebase
 */
export const logoutFirebase = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Listener de estado de autenticação do Firebase
 */
export const subscribeToAuthChanges = (
  onUserChanged: (user: UserAccount | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, (fbUser) => {
    if (fbUser) {
      const user = mapFirebaseUserToUserAccount(fbUser);
      onUserChanged(user);
    } else {
      onUserChanged(null);
    }
  });
};

/**
 * Tradutor de mensagens de erro do Firebase Auth para Português
 */
export const formatFirebaseError = (error: any): string => {
  if (!error) return 'Ocorreu um erro inesperado.';
  
  const code = error.code || '';
  const message = error.message || '';

  switch (code) {
    case 'auth/invalid-email':
      return 'O formato do e-mail é inválido. Verifique se digitou corretamente.';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada pelo administrador.';
    case 'auth/user-not-found':
      return 'Nenhuma conta encontrada com este e-mail. Crie seu cadastro!';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos. Verifique suas credenciais.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado. Alterne para a aba "Já Tenho Conta" para entrar.';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres para garantir a segurança.';
    case 'auth/popup-closed-by-user':
      return 'O login com Google foi cancelado na janela pop-up.';
    case 'auth/popup-blocked':
      return 'A janela do Google foi bloqueada pelo navegador. Permita pop-ups para continuar.';
    case 'auth/operation-not-allowed':
      return 'Este método de login precisa ser ativado no Firebase Console (Authentication > Sign-in method).';
    case 'auth/network-request-failed':
      return 'Falha de conexão com os servidores. Verifique sua internet.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas sem sucesso. Aguarde alguns instantes e tente novamente.';
    case 'auth/cancelled-popup-request':
      return 'Ação cancelada.';
    default:
      if (message.includes('popup')) {
        return 'Falha ao abrir a janela do Google. Tente novamente.';
      }
      return message || 'Não foi possível concluir a autenticação. Tente novamente.';
  }
};
