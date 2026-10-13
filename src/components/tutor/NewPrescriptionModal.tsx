import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  Clock, 
  AlertCircle,
  Camera,
  RefreshCw,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { Pet, PharmacyUnit, DosageForm, Flavor, PrescriptionOrder } from '../../types';
import { PHARMACY_UNITS } from '../../data/mockData';

interface NewPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  pets: Pet[];
  selectedUnit: PharmacyUnit;
  onSubmit: (newOrder: PrescriptionOrder) => void;
  onAddNewPetClick: () => void;
}

export const NewPrescriptionModal: React.FC<NewPrescriptionModalProps> = ({
  isOpen,
  onClose,
  pets,
  selectedUnit,
  onSubmit,
  onAddNewPetClick
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPetId, setSelectedPetId] = useState<string>(pets[0]?.id || '');
  const [unit, setUnit] = useState<PharmacyUnit>(selectedUnit);
  const [inputMode, setInputMode] = useState<'camera' | 'upload' | 'link'>('camera');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>('');
  const [externalLink, setExternalLink] = useState('');
  const [preferredForm, setPreferredForm] = useState<DosageForm>('biscoito_palatavel');
  const [preferredFlavor, setPreferredFlavor] = useState<Flavor>('carne');
  const [notes, setNotes] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'retirada_americana' | 'retirada_valinhos' | 'entrega_expressa_rmc' | 'sedex'>(
    selectedUnit === 'americana' ? 'retirada_americana' : 'retirada_valinhos'
  );

  // Estados e Refs da Câmera
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch {
      setCameraError('Acesso à webcam/câmera bloqueado ou indisponível. Você também pode clicar no botão "Câmera do Celular" abaixo.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setFilePreviewUrl(dataUrl);

      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `receita_foto_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setUploadedFile(file);
        });
      stopCamera();
    }
  };

  const handleClearPhoto = () => {
    setFilePreviewUrl('');
    setUploadedFile(null);
    stopCamera();
  };

  // Desliga a câmera se o modal for fechado ou sair do step 2
  useEffect(() => {
    if (!isOpen || step !== 2) {
      stopCamera();
    }
  }, [isOpen, step]);

  if (!isOpen) return null;

  const currentPet = pets.find(p => p.id === selectedPetId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setFilePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPet) return;

    const newCode = `AB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: PrescriptionOrder = {
      id: `ord-${Date.now()}`,
      code: newCode,
      createdAt: 'Agora mesmo',
      tutorName: currentPet.tutorName,
      tutorPhone: currentPet.tutorPhone,
      petId: currentPet.id,
      petName: currentPet.name,
      petSpecies: currentPet.species,
      petWeightKg: currentPet.weightKg,
      unit: unit,
      status: 'analise_farmaceutica',
      prescriptionImageUrl: filePreviewUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
      prescriptionExternalLink: externalLink,
      preferredForm: preferredForm,
      preferredFlavor: preferredFlavor,
      notes: notes,
      items: [
        {
          id: `item-${Date.now()}`,
          description: `Fórmula individualizada para ${currentPet.name} (${preferredForm === 'biscoito_palatavel' ? 'Biscoito Palatável' : preferredForm === 'gel_transdermico' ? 'Gel Transdérmico Auricular' : 'Formulação Especial'})`,
          activeSubstance: 'Princípio Ativo sob Prescrição Médica',
          concentration: 'Calculada por peso',
          dosageForm: preferredForm,
          flavor: preferredFlavor,
          quantity: 'Tratamento prescrito',
          unitPrice: 94.00
        }
      ],
      subtotal: 94.00,
      shippingMethod: shippingMethod,
      shippingCost: shippingMethod.startsWith('retirada') ? 0 : 15,
      total: shippingMethod.startsWith('retirada') ? 94.00 : 109.00,
      paymentStatus: 'aguardando_analise',
      estimatedDeliveryDate: 'Em até 24h úteis após aprovação',
      whatsappLogs: [
        {
          id: `wlog-${Date.now()}`,
          timestamp: 'Agora mesmo',
          recipient: currentPet.tutorPhone,
          message: `Olá ${currentPet.tutorName}! Recebemos a receita do(a) ${currentPet.name} na unidade ${PHARMACY_UNITS[unit].name}. Nossa equipe técnica da Amor ao Bicho já iniciou a análise farmacêutica.`,
          status: 'sent'
        }
      ]
    };

    onSubmit(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0b4d3a] px-6 py-4 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">Enviar Receita Veterinária</span>
              <span className="text-xs bg-emerald-700/80 text-emerald-100 px-2 py-0.5 rounded">
                Orçamento Sem Compromisso
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              Análise técnica pelas farmacêuticas Flávia Semeghini e Carolina Giordano
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="px-6 py-3 bg-emerald-50/50 border-b border-emerald-100/60 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 font-medium ${step >= 1 ? 'text-emerald-900' : 'text-slate-400'}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-200'}`}>1</span>
            <span>Pet & Unidade</span>
          </button>
          <div className="h-0.5 flex-1 mx-3 bg-emerald-200" />
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`flex items-center gap-2 font-medium ${step >= 2 ? 'text-emerald-900' : 'text-slate-400'}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-200'}`}>2</span>
            <span>Receita & Arquivo</span>
          </button>
          <div className="h-0.5 flex-1 mx-3 bg-emerald-200" />
          <button
            type="button"
            onClick={() => setStep(3)}
            className={`flex items-center gap-2 font-medium ${step >= 3 ? 'text-emerald-900' : 'text-slate-400'}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-200'}`}>3</span>
            <span>Forma & Sabor</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Selecione o Pet para esta Medicação:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {pets.map((pet) => (
                    <div
                      key={pet.id}
                      onClick={() => setSelectedPetId(pet.id)}
                      className={`cursor-pointer p-3 rounded-xl border text-left transition-all ${
                        selectedPetId === pet.id
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={pet.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80'}
                          alt={pet.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-sm text-slate-800">{pet.name}</p>
                          <p className="text-[11px] text-slate-500">{pet.breed} • {pet.weightKg}kg</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={onAddNewPetClick}
                    className="text-xs text-emerald-700 font-semibold hover:underline"
                  >
                    + Cadastrar novo pet
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Qual Unidade Amor ao Bicho deve manipular a fórmula?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => {
                      setUnit('americana');
                      setShippingMethod('retirada_americana');
                    }}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                      unit === 'americana'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Building2 className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-sm text-slate-800">Unidade Americana</p>
                        <p className="text-xs text-slate-500">Rua das Paineiras, 450 - Jd. São Paulo</p>
                        <span className="text-[11px] font-medium text-emerald-700">Resp: Dra. Flávia Semeghini</span>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setUnit('valinhos');
                      setShippingMethod('retirada_valinhos');
                    }}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                      unit === 'valinhos'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Building2 className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-sm text-slate-800">Unidade Valinhos</p>
                        <p className="text-xs text-slate-500">Av. Onze de Agosto, 1280 - Vila Clayton</p>
                        <span className="text-[11px] font-medium text-emerald-700">Resp: Dra. Carolina Giordano</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Avançar para Envio da Receita →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {/* Seletor de Modo de Envio com Aba da Câmera em Destaque */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setInputMode('camera');
                    stopCamera();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    inputMode === 'camera' 
                      ? 'bg-emerald-700 text-white shadow-xs' 
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>📷 Tirar Foto Agora (Câmera)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInputMode('upload');
                    stopCamera();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    inputMode === 'upload' 
                      ? 'bg-emerald-700 text-white shadow-xs' 
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>📁 Galeria / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInputMode('link');
                    stopCamera();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    inputMode === 'link' 
                      ? 'bg-emerald-700 text-white shadow-xs' 
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>🔗 Link Receita Digital</span>
                </button>
              </div>

              {/* Input escondido para acionamento nativo da câmera do celular */}
              <input
                ref={nativeCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* SEÇÃO 1: MODO CÂMERA */}
              {inputMode === 'camera' && (
                <div className="space-y-3">
                  {filePreviewUrl ? (
                    /* Foto já capturada */
                    <div className="border border-emerald-300 rounded-2xl p-4 bg-emerald-50/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Foto da Receita Capturada com Sucesso!
                        </span>
                        <button
                          type="button"
                          onClick={handleClearPhoto}
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Descartar e Fotografar Novamente</span>
                        </button>
                      </div>

                      <div className="relative rounded-xl overflow-hidden max-h-72 bg-black flex items-center justify-center border border-slate-200 shadow-inner">
                        <img
                          src={filePreviewUrl}
                          alt="Receita Capturada"
                          className="max-h-72 w-auto object-contain"
                        />
                      </div>

                      <p className="text-[11px] text-emerald-800 text-center">
                        ✓ Imagem pronta! Nossos farmacêuticos analisarão os princípios ativos e a posologia prescrita.
                      </p>
                    </div>
                  ) : isCameraActive ? (
                    /* Câmera Ativa / Viewfinder ao vivo */
                    <div className="space-y-3">
                      <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-emerald-500 shadow-lg">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-64 sm:h-72 object-cover"
                        />
                        {/* Moldura guia sobreposta */}
                        <div className="absolute inset-4 border-2 border-dashed border-white/70 rounded-xl pointer-events-none flex items-center justify-center">
                          <span className="bg-black/60 text-white text-[11px] px-3 py-1 rounded-full backdrop-blur-xs font-medium">
                            Enquadre a folha da receita aqui
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                        >
                          Cancelar Câmera
                        </button>

                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all animate-pulse"
                        >
                          <Camera className="w-4 h-4" />
                          <span>📸 Fotografar Receita</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Convite para Abrir Câmera */
                    <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-6 text-center bg-gradient-to-b from-emerald-50/50 to-white space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 mx-auto shadow-xs">
                        <Camera className="w-8 h-8 text-emerald-700" />
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-slate-900">
                          Tirar Foto da Receita Agora
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                          Aponte a câmera do seu celular ou computador diretamente para o papel da receita veterinária.
                        </p>
                      </div>

                      {cameraError && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 text-left flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>{cameraError}</span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Abrir Câmera na Tela</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => nativeCameraInputRef.current?.click()}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Abrir Câmera do Celular</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SEÇÃO 2: MODO UPLOAD DE ARQUIVO OU PDF */}
              {inputMode === 'upload' && (
                <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/30 rounded-2xl p-6 text-center cursor-pointer transition-colors relative">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-3">
                      <FileText className="w-6 h-6" />
                    </div>
                    {uploadedFile ? (
                      <div>
                        <p className="font-semibold text-sm text-emerald-900">{uploadedFile.name}</p>
                        <p className="text-xs text-emerald-600 mt-1">Arquivo pronto para conferência farmacêutica!</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-bold text-sm text-slate-800">Clique para enviar ou arraste a receita aqui</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Formatos aceitos: JPG, PNG, PDF da clínica veterinária
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SEÇÃO 3: MODO LINK DIGITAL */}
              {inputMode === 'link' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Cole o link ou código da receita digital:
                  </label>
                  <input
                    type="url"
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    placeholder="https://vetsmart.com.br/rx/123456 ou link Mevo/SimplesVet"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <p className="text-[11px] text-slate-500">
                    Nossa equipe farmacêutica acessará o documento assinado digitalmente pelo seu veterinário.
                  </p>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p>
                  <strong>Garantia de Segurança Farmacêutica:</strong> Toda receita passa por dupla checagem de posologia para o peso ({currentPet?.weightKg}kg) e conferência de CRMV do prescritor.
                </p>
              </div>

              <div className="pt-3 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  ← Voltar
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Avançar para Formas & Sabores →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Qual formato farmacêutico seu pet prefere?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  {[
                    { id: 'biscoito_palatavel', label: 'Biscoito Mastigável', desc: 'Em formato de osso/peixe' },
                    { id: 'gel_transdermico', label: 'Gel Transdérmico', desc: 'Na orelha (sem estresse)' },
                    { id: 'pasta_oral', label: 'Pasta Oral', desc: 'Seringa com dosador' },
                    { id: 'xarope_suspensao', label: 'Xarope / Suspensão', desc: 'Líquido aromatizado' },
                    { id: 'capsula', label: 'Mini-Cápsula', desc: 'Tamanho reduzido' },
                    { id: 'pomada_topica', label: 'Pomada / Tópico', desc: 'Para pele ou patas' }
                  ].map((f) => (
                    <button
                      type="button"
                      key={f.id}
                      onClick={() => setPreferredForm(f.id as DosageForm)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        preferredForm === f.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-bold">{f.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{f.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Qual o sabor predileto do(a) {currentPet?.name}?
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'carne', label: '🥩 Carne / Picanha' },
                    { id: 'frango', label: '🍗 Frango Grelhado' },
                    { id: 'bacon', label: '🥓 Bacon Crocante' },
                    { id: 'figado', label: '🍖 Fígado' },
                    { id: 'peixe_salmao', label: '🐟 Salmão / Peixe' },
                    { id: 'doce_de_leite', label: '🍯 Doce de Leite' },
                    { id: 'baunilha', label: '🍦 Baunilha' },
                    { id: 'sem_sabor', label: '⚪ Sem Sabor (Neutro)' }
                  ].map((fl) => (
                    <button
                      type="button"
                      key={fl.id}
                      onClick={() => setPreferredFlavor(fl.id as Flavor)}
                      className={`p-2 rounded-lg border text-left transition-all text-[11px] ${
                        preferredFlavor === fl.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {fl.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações para a Farmacêutica (opcional):
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Meu pet é muito desconfiado com cheiro de remédio; já teve vômito com comprimidos comuns; ou prefere sabor bem suave..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Previsão de Entrega / Retirada:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShippingMethod(unit === 'americana' ? 'retirada_americana' : 'retirada_valinhos')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      shippingMethod.startsWith('retirada')
                        ? 'border-emerald-600 bg-emerald-50 font-semibold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <p className="font-bold">Retirada na Unidade {unit === 'americana' ? 'Americana' : 'Valinhos'}</p>
                    <p className="text-[11px] text-emerald-700 font-medium">Grátis • Pronto mais rápido</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingMethod('entrega_expressa_rmc')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      shippingMethod === 'entrega_expressa_rmc'
                        ? 'border-emerald-600 bg-emerald-50 font-semibold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <p className="font-bold">Entrega Expressa por Motoboy</p>
                    <p className="text-[11px] text-slate-500">RMC (Campinas, Americana, Valinhos e região)</p>
                  </button>
                </div>
              </div>

              <div className="pt-3 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  ← Voltar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/20"
                >
                  Enviar para Orçamento Oficial ✓
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
