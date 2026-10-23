import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  PawPrint, 
  AlertCircle, 
  Camera, 
  Upload, 
  Trash2, 
  Sparkles,
  Check
} from 'lucide-react';
import { Pet, PetSpecies, Flavor } from '../../types';

interface PetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pet: Pet) => void;
  existingPet?: Pet | null;
}

export const PetFormModal: React.FC<PetFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingPet
}) => {
  const [name, setName] = useState(existingPet?.name || '');
  const [species, setSpecies] = useState<PetSpecies>(existingPet?.species || 'canino');
  const [breed, setBreed] = useState(existingPet?.breed || '');
  const [ageYears, setAgeYears] = useState<number>(existingPet?.ageYears || 3);
  const [weightKg, setWeightKg] = useState<number>(existingPet?.weightKg || 10.0);
  const [allergies, setAllergies] = useState(existingPet?.allergies || '');
  const [chronicCondition, setChronicCondition] = useState(existingPet?.chronicCondition || '');
  const [favoriteFlavor, setFavoriteFlavor] = useState<Flavor>(existingPet?.favoriteFlavor || 'carne');
  const [tutorName, setTutorName] = useState(existingPet?.tutorName || 'Mariana Duarte');
  const [tutorPhone, setTutorPhone] = useState(existingPet?.tutorPhone || '(19) 99123-4567');
  
  // Estado da Foto do Pet e Câmera
  const [photoUrl, setPhotoUrl] = useState<string>(existingPet?.photoUrl || '');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Parar câmera ao fechar modal ou desmontar componente
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Quando o modal fecha, desliga a câmera
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    } else {
      if (existingPet) {
        setName(existingPet.name || '');
        setSpecies(existingPet.species || 'canino');
        setBreed(existingPet.breed || '');
        setAgeYears(existingPet.ageYears || 3);
        setWeightKg(existingPet.weightKg || 10.0);
        setAllergies(existingPet.allergies || '');
        setChronicCondition(existingPet.chronicCondition || '');
        setFavoriteFlavor(existingPet.favoriteFlavor || 'carne');
        setPhotoUrl(existingPet.photoUrl || '');
      }
    }
  }, [isOpen, existingPet]);

  // Conecta o stream no elemento de vídeo assim que a câmera é ativada
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isCameraActive]);

  if (!isOpen) return null;

  // Iniciar câmera com getUserMedia ou fallback para input nativo
  const handleStartCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        cameraInputRef.current?.click();
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err) {
      console.warn('getUserMedia indisponível, abrindo captura nativa:', err);
      cameraInputRef.current?.click();
    }
  };

  // Capturar foto do vídeo
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setPhotoUrl(dataUrl);
    }
    stopCamera();
  };

  // Processar arquivo selecionado da galeria ou câmera nativa
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCloseModal = () => {
    stopCamera();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    stopCamera();

    const petData: Pet = {
      id: existingPet?.id || `pet-${Date.now()}`,
      name: name.trim(),
      species,
      breed: breed.trim() || 'Sem Raça Definida (SRD)',
      ageYears: Number(ageYears),
      weightKg: Number(weightKg),
      allergies: allergies.trim() || undefined,
      chronicCondition: chronicCondition.trim() || undefined,
      favoriteFlavor,
      photoUrl: photoUrl || existingPet?.photoUrl || (
        species === 'felino'
          ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80'
          : species === 'ave'
          ? 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=400&q=80'
          : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'
      ),
      tutorName,
      tutorPhone
    };

    onSave(petData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0b4d3a] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-base">
              {existingPet ? 'Editar Perfil do Pet' : 'Cadastrar Novo Pet'}
            </h3>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-1 rounded-lg text-emerald-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* ================= SEÇÃO DE FOTO DO PET & CÂMERA ================= */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>Foto do Pet</span>
              </label>
              {photoUrl && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-700" />
                  Foto anexada
                </span>
              )}
            </div>

            {/* Inputs escondidos para Câmera e Galeria de Fotos */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Câmera Ativa com Visualizador ao Vivo */}
            {isCameraActive ? (
              <div className="space-y-2.5 animate-in fade-in">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-56 flex items-center justify-center shadow-inner border border-emerald-300">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1.5 shadow-md animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    CÂMERA ATIVA
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>📸 Capturar Foto Agora</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="py-2.5 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : photoUrl ? (
              /* Foto Selecionada / Capturada */
              <div className="flex items-center gap-3.5 bg-white p-2.5 rounded-xl border border-emerald-200 shadow-2xs">
                <img
                  src={photoUrl}
                  alt="Foto do Pet"
                  className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500 shadow-xs shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">Foto pronta para o perfil!</p>
                  <p className="text-[11px] text-slate-500">Aparecerá nos alarmes e doses do remédio.</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={handleStartCamera}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer underline"
                    >
                      <Camera className="w-3 h-3 text-emerald-600" />
                      Tirar outra foto
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Botões de Ação para Adicionar Foto */
              <div className="space-y-1.5">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={handleStartCamera}
                    className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
                  >
                    <Camera className="w-4 h-4 text-emerald-200 shrink-0" />
                    <span>Tirar Foto com a Câmera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Escolher Arquivo</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 text-center sm:text-left">
                  Tire uma foto do seu pet com a câmera do celular/computador ou escolha da sua galeria.
                </p>
              </div>
            )}
          </div>

          {/* Nome e Espécie */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do Pet *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Thor, Mia, Pipoca"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Espécie *
              </label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value as PetSpecies)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
              >
                <option value="canino">Cão (Canino)</option>
                <option value="felino">Gato (Felino)</option>
                <option value="ave">Ave</option>
                <option value="roedor">Roedor / Coelho</option>
                <option value="exotico">Exótico / Réptil</option>
                <option value="equino">Equino</option>
              </select>
            </div>
          </div>

          {/* Raça, Idade e Peso */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Raça
              </label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="Ex: SRD, Poodle"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Idade (anos)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                value={ageYears}
                onChange={(e) => setAgeYears(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Peso Exato (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.05"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold text-emerald-900"
              />
            </div>
          </div>

          {/* Sabor Preferido */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sabor Preferido (Palatabilizante):
            </label>
            <select
              value={favoriteFlavor}
              onChange={(e) => setFavoriteFlavor(e.target.value as Flavor)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
            >
              <option value="carne">Carne / Picanha (Favorito dos cães)</option>
              <option value="frango">Frango Grelhado</option>
              <option value="bacon">Bacon Crocante</option>
              <option value="figado">Fígado Nobre</option>
              <option value="peixe_salmao">Salmão / Peixe (Favorito dos gatos)</option>
              <option value="doce_de_leite">Doce de Leite</option>
              <option value="baunilha">Baunilha Doce</option>
              <option value="sem_sabor">Sem Sabor / Neutro</option>
            </select>
          </div>

          {/* Alergias */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alergias ou Hipersensibilidades Conhecidas:
            </label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Ex: Alergia a frango, corante artificial, etc."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Condição Crônica */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Condição Crônica (se houver):
            </label>
            <input
              type="text"
              value={chronicCondition}
              onChange={(e) => setChronicCondition(e.target.value)}
              placeholder="Ex: Artrose, cardiopatia, insuficiência renal..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Aviso Importante sobre Peso */}
          <div className="bg-emerald-50 rounded-xl p-3 text-[11px] text-emerald-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <p>
              O peso exato é crucial na farmácia veterinária: cada dose na Amor ao Bicho é calculada em miligramas por quilo específico do seu animal.
            </p>
          </div>

          {/* Botões do Rodapé */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
            >
              Salvar Pet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
