import React, { useState } from 'react';
import { 
  Stethoscope, 
  Calculator, 
  FileText, 
  BookOpen, 
  Users, 
  Send, 
  Share2, 
  CheckCircle2, 
  Calendar, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  AlertCircle,
  Download,
  Building2,
  Printer,
  ArrowLeft
} from 'lucide-react';
import { TherapeuticGuideItem, DosageForm, Flavor, PharmacyUnit } from '../../types';
import { THERAPEUTIC_GUIDE, PHARMACY_UNITS } from '../../data/mockData';
import { notificationService } from '../../services/notificationService';

interface VetModuleProps {
  selectedUnit: PharmacyUnit;
  onSendPrescriptionToPharmacy: (prescriptionSummary: any) => void;
  onBackToHome?: () => void;
}

export const VetModule: React.FC<VetModuleProps> = ({
  selectedUnit,
  onSendPrescriptionToPharmacy,
  onBackToHome
}) => {
  const [activeTab, setActiveTab] = useState<'calculadora' | 'prescricao' | 'guia' | 'pacientes' | 'visita'>('calculadora');

  // Dados do Veterinário logado
  const [vetData] = useState({
    name: 'Dr. Lucas Silveira',
    crmv: 'CRMV-SP 38.920',
    clinic: 'Centro Veterinário São Francisco - Americana / SP',
    phone: '(19) 98765-4321',
    email: 'lucas.silveira@veterinaria.com.br'
  });

  // Estado da Calculadora de Doses
  const [calcSpecies, setCalcSpecies] = useState<'canino' | 'felino'>('canino');
  const [calcWeight, setCalcWeight] = useState<number>(12.5);
  const [selectedSubstanceId, setSelectedSubstanceId] = useState<string>('tg-1'); // Meloxicam
  const [prescribedDoseMgKg, setPrescribedDoseMgKg] = useState<number>(0.1);
  const [calcFrequencyHours, setCalcFrequencyHours] = useState<number>(24);
  const [calcDays, setCalcDays] = useState<number>(5);

  // Estado da Prescrição Digital
  const [rxPetName, setRxPetName] = useState('Thor');
  const [rxPetSpecies, setRxPetSpecies] = useState<'Canino' | 'Felino'>('Canino');
  const [rxPetWeight, setRxPetWeight] = useState<number>(32.5);
  const [rxTutorName, setRxTutorName] = useState('Mariana Duarte');
  const [rxTutorPhone, setRxTutorPhone] = useState('(19) 99123-4567');
  const [rxMedication, setRxMedication] = useState('Condroitina 500mg + Glicosamina 500mg em Biscoito Palatável Sabor Carne');
  const [rxPosology, setRxPosology] = useState('Administrar 1 biscoito mastigável a cada 24 horas, pela manhã, por 60 dias ininterruptos.');
  const [rxTargetUnit, setRxTargetUnit] = useState<PharmacyUnit>(selectedUnit);
  const [rxGenerated, setRxGenerated] = useState(false);
  const [rxCode, setRxCode] = useState('');

  // Estado de Busca no Guia Terapêutico
  const [searchQuery, setSearchQuery] = useState('');

  // Estado de Solicitação de Visita Técnica
  const [visitRequestSent, setVisitRequestSent] = useState(false);
  const [requestedPharmacist, setRequestedPharmacist] = useState<'flavia' | 'carolina' | 'ambas'>('flavia');
  const [sampleKitRequested, setSampleKitRequested] = useState(true);

  // Funções de Cálculo Automático de Dose Veterinária por Espécie (Cão vs Gato)
  const getRecommendedDose = (substanceId: string, species: 'canino' | 'felino'): number => {
    const doseMap: Record<string, { canino: number; felino: number }> = {
      'tg-1': { canino: 0.1, felino: 0.05 },  // Meloxicam
      'tg-2': { canino: 10, felino: 8 },      // Gabapentina
      'tg-3': { canino: 0.25, felino: 0.15 },  // Pimobendan
      'tg-4': { canino: 0.7, felino: 0.7 },   // Omeprazol
      'tg-5': { canino: 10, felino: 5 },      // Doxiciclina
      'tg-6': { canino: 25, felino: 12.5 },   // Dipirona
      'tg-7': { canino: 0.5, felino: 1.0 },   // Prednisolona
      'tg-8': { canino: 20, felino: 20 },    // Condroitina + Glicosamina
    };
    return doseMap[substanceId]?.[species] || 1.0;
  };

  const handleSpeciesSelect = (species: 'canino' | 'felino') => {
    setCalcSpecies(species);
    const recDose = getRecommendedDose(selectedSubstanceId, species);
    setPrescribedDoseMgKg(recDose);
  };

  const handleSubstanceSelect = (substanceId: string) => {
    setSelectedSubstanceId(substanceId);
    const recDose = getRecommendedDose(substanceId, calcSpecies);
    setPrescribedDoseMgKg(recDose);
  };

  // Busca do item na calculadora
  const currentGuideItem = THERAPEUTIC_GUIDE.find(g => g.id === selectedSubstanceId) || THERAPEUTIC_GUIDE[0];
  const calculatedTotalDoseMg = (calcWeight * prescribedDoseMgKg).toFixed(2);

  const handleGenerateRx = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `RX-VET-${Math.floor(10000 + Math.random() * 90000)}`;
    setRxCode(code);
    setRxGenerated(true);
  };

  const handleSendRxDirectToPharmacy = () => {
    onSendPrescriptionToPharmacy({
      code: rxCode,
      petName: rxPetName,
      tutorName: rxTutorName,
      medication: rxMedication,
      posology: rxPosology,
      unit: rxTargetUnit,
      prescriber: `${vetData.name} (${vetData.crmv})`
    });
    alert(`Receita ${rxCode} enviada diretamente para a fila de manipulação da Unidade ${PHARMACY_UNITS[rxTargetUnit].name}! O tutor receberá a notificação para aprovação.`);
  };

  const handleRequestVisit = (e: React.FormEvent) => {
    e.preventDefault();
    setVisitRequestSent(true);
  };

  const filteredGuide = THERAPEUTIC_GUIDE.filter(item => 
    item.activeSubstance.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Botão Voltar para Área do Tutor */}
      {onBackToHome && (
        <button
          type="button"
          onClick={onBackToHome}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-sm font-semibold transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          ← Voltar para Área do Tutor (Início)
        </button>
      )}

      {/* Top Banner do Veterinário Prescritor */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">{vetData.name}</h1>
              <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {vetData.crmv} Verificado
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {vetData.clinic}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Canal Científico Direto:</span>
          <span className="font-bold text-teal-300">
            Dra. Flávia Semeghini & Dra. Carolina Giordano
          </span>
        </div>
      </div>

      {/* Tabs de Navegação do Módulo Vet */}
      <div className="flex border-b border-slate-200 overflow-x-auto text-xs font-semibold gap-2">
        <button
          onClick={() => setActiveTab('calculadora')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'calculadora'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-4 h-4 text-teal-600" />
          <span>Calculadora de Doses Veterinárias</span>
        </button>

        <button
          onClick={() => setActiveTab('prescricao')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'prescricao'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-teal-600" />
          <span>Gerador de Prescrição Digital</span>
        </button>

        <button
          onClick={() => setActiveTab('guia')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'guia'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-teal-600" />
          <span>Guia Terapêutico & Matérias-Primas</span>
        </button>

        <button
          onClick={() => setActiveTab('pacientes')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'pacientes'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-teal-600" />
          <span>Acompanhamento de Pacientes</span>
        </button>

        <button
          onClick={() => setActiveTab('visita')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'visita'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Visita Técnica & Kit Amostras</span>
        </button>
      </div>

      {/* CONTEÚDO 1: CALCULADORA DE DOSES VETERINÁRIAS */}
      {activeTab === 'calculadora' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-teal-700" />
                Cálculo de Dosagem Individualizada por Peso
              </h2>
              <p className="text-xs text-slate-500">
                Determine a miligramagem exata e receba a melhor sugestão de forma palatável
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Espécie do Paciente:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSpeciesSelect('canino')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      calcSpecies === 'canino'
                        ? 'border-teal-700 bg-teal-50 text-teal-900 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🐶 Canino
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSpeciesSelect('felino')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      calcSpecies === 'felino'
                        ? 'border-teal-700 bg-teal-50 text-teal-900 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🐱 Felino
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Peso do Animal (kg):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Princípio Ativo Farmacêutico:
                </label>
                <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Dose Recomendada Auto-ajustada
                </span>
              </div>
              <select
                value={selectedSubstanceId}
                onChange={(e) => handleSubstanceSelect(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                {THERAPEUTIC_GUIDE.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.activeSubstance} — {g.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dose Prescrita (mg/kg):
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.001"
                  value={prescribedDoseMgKg}
                  onChange={(e) => setPrescribedDoseMgKg(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono font-bold text-teal-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Frequência (horas):
                </label>
                <select
                  value={calcFrequencyHours}
                  onChange={(e) => setCalcFrequencyHours(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  <option value={24}>A cada 24 horas</option>
                  <option value={12}>A cada 12 horas</option>
                  <option value={8}>A cada 8 horas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Duração (dias):
                </label>
                <input
                  type="number"
                  min={1}
                  value={calcDays}
                  onChange={(e) => setCalcDays(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="font-semibold text-slate-700">Referência Farmacopeica Amor ao Bicho:</span>
              <p className="text-slate-600">
                {currentGuideItem.speciesIndications.find(s => s.species === calcSpecies || s.species === 'ambos')?.doseRange || 'Dose padrão'}
              </p>
            </div>
            {/* Alerta de Segurança Clínico Automático para Felinos / Cães */}
            {selectedSubstanceId === 'tg-1' && calcSpecies === 'felino' && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs flex items-start gap-2 text-amber-950">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Atenção Clínica Farmacopeica (Felinos):</strong> Em gatos, o Meloxicam deve respeitar dose estrita ≤ 0.05 mg/kg com monitoramento renal.
                </span>
              </div>
            )}

            {selectedSubstanceId === 'tg-5' && calcSpecies === 'felino' && (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs flex items-start gap-2 text-blue-950">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Recomendação Cat-Friendly:</strong> Doxiciclina nunca deve ser administrada em cápsula seca em felinos (risco de estenose esofágica). A Amor ao Bicho manipula em Pasta Oral Sabor Salmão ou Xarope.
                </span>
              </div>
            )}
          </div>

          {/* Resultado & Recomendação de Forma Farmacêutica */}
          <div className="lg:col-span-5 bg-gradient-to-b from-teal-900 to-[#0b4d3a] text-white p-6 rounded-2xl shadow-md flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-teal-300 font-semibold">
                  Resultado do Cálculo Automático
                </span>
                <span className="text-[11px] bg-teal-800 text-teal-200 px-2 py-0.5 rounded font-mono font-bold">
                  Amor ao Bicho Lab
                </span>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-teal-950/60 border border-teal-700/50 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-teal-200">Dose por Tomada:</span>
                  <span className="text-2xl font-black text-white font-mono">
                    {calculatedTotalDoseMg} mg
                  </span>
                </div>
                <div className="flex justify-between text-xs text-teal-300 pt-2 border-t border-teal-800">
                  <span>Quantidade Total no Tratamento:</span>
                  <span className="font-bold">
                    {((24 / calcFrequencyHours) * calcDays)} doses ({((Number(calculatedTotalDoseMg) * (24 / calcFrequencyHours) * calcDays)).toFixed(1)} mg)
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <span className="text-xs font-bold text-teal-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Veículo & Forma Farmacêutica Recomendada para {calcSpecies === 'felino' ? 'Felinos' : 'Caninos'}:
                </span>

                <div className="bg-white/10 p-3 rounded-xl border border-white/15 text-xs space-y-1">
                  <p className="font-bold text-white">
                    {calcSpecies === 'felino' 
                      ? '🐱 Gel Transdérmico Auricular (0.1 mL/click) ou Pasta Oral Salmão' 
                      : '🐶 Biscoito Palatável Mastigável Sabor Carne ou Frango'}
                  </p>
                  <p className="text-[11px] text-teal-200">
                    {calcSpecies === 'felino'
                      ? 'Evita estresse com cápsulas amargas. O gel é absorvido pela pele da orelha.'
                      : 'O cão come como petisco voluntário. 100% de aceitação sem engasgos.'}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                notificationService.playAlertSound();
                setRxPetSpecies(calcSpecies === 'canino' ? 'Canino' : 'Felino');
                setRxPetWeight(calcWeight);
                const vehicleName = calcSpecies === 'felino' 
                  ? 'Gel Transdérmico Auricular (0.1 mL/click)' 
                  : 'Biscoitos Palatáveis Mastigáveis (Sabor Carne)';
                setRxMedication(`${currentGuideItem.activeSubstance} ${calculatedTotalDoseMg}mg manipulado em ${vehicleName}`);
                setRxPosology(`Administrar 1 dose (${calculatedTotalDoseMg}mg) a cada ${calcFrequencyHours} horas durante ${calcDays} dias consecutivos.`);
                setActiveTab('prescricao');
              }}
              className="w-full py-3.5 bg-white hover:bg-teal-50 text-teal-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Exportar Automaticamente para a Prescrição Digital →</span>
            </button>
          </div>
        </div>
      )}

      {/* CONTEÚDO 2: GERADOR DE PRESCRIÇÃO DIGITAL */}
      {activeTab === 'prescricao' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-700" />
              Emitir Nova Receita Veterinária Digital
            </h2>

            <form onSubmit={handleGenerateRx} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome do Pet *
                  </label>
                  <input
                    type="text"
                    required
                    value={rxPetName}
                    onChange={(e) => setRxPetName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Peso (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={rxPetWeight}
                    onChange={(e) => setRxPetWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome do Tutor *
                  </label>
                  <input
                    type="text"
                    required
                    value={rxTutorName}
                    onChange={(e) => setRxTutorName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp do Tutor *
                  </label>
                  <input
                    type="text"
                    required
                    value={rxTutorPhone}
                    onChange={(e) => setRxTutorPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fórmula Manipulada / Itens Prescritos *
                </label>
                <textarea
                  required
                  rows={2}
                  value={rxMedication}
                  onChange={(e) => setRxMedication(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Posologia e Modo de Usar *
                </label>
                <textarea
                  required
                  rows={2}
                  value={rxPosology}
                  onChange={(e) => setRxPosology(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enviar para qual Unidade Amor ao Bicho:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRxTargetUnit('americana')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                      rxTargetUnit === 'americana'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Americana (Dra. Flávia)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRxTargetUnit('valinhos')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                      rxTargetUnit === 'valinhos'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Valinhos (Dra. Carolina)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Gerar Receita Digital Oficial ✓
              </button>
            </form>
          </div>

          {/* Pré-visualização da Receita Oficial */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border-2 border-teal-700/30 shadow-md flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 font-sans">
                    RECEITUÁRIO VETERINÁRIO DIGITAL
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Farmácia de Manipulação Conveniada: Amor ao Bicho ({rxTargetUnit.toUpperCase()})
                  </p>
                </div>
                {rxGenerated && (
                  <span className="font-mono text-xs bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded border border-teal-200">
                    {rxCode}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Paciente:</span>
                    <p className="font-bold text-slate-800">{rxPetName} ({rxPetSpecies} • {rxPetWeight}kg)</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Tutor:</span>
                    <p className="font-bold text-slate-800">{rxTutorName}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100 space-y-1">
                  <span className="text-teal-800 font-bold text-xs uppercase">Fórmula Manipulada:</span>
                  <p className="text-slate-800 font-medium">{rxMedication}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-500 font-bold text-xs uppercase">Posologia:</span>
                  <p className="text-slate-800">{rxPosology}</p>
                </div>

                <div className="pt-4 border-t border-slate-200 text-center">
                  <p className="font-bold text-slate-900">{vetData.name}</p>
                  <p className="text-[11px] text-teal-700 font-semibold">{vetData.crmv} • {vetData.clinic}</p>
                  <span className="text-[10px] text-slate-400">Assinatura Digital ICP-Brasil / CRMV-SP</span>
                </div>
              </div>
            </div>

            {/* Ações de Compartilhamento e Envio Direto */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSendRxDirectToPharmacy}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs shadow-xs flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Direto p/ Farmácia Amor ao Bicho ({rxTargetUnit.toUpperCase()})</span>
              </button>

              <div className="flex gap-2">
                <a
                  href={`https://wa.me/55${rxTutorPhone.replace(/\D/g, '')}?text=Olá%20${rxTutorName},%20aqui%20é%20o%20${vetData.name}.%20Segue%20a%20receita%20digital%20do%20${rxPetName}%20para%20orçamento%20na%20Amor%20ao%20Bicho:%20${rxMedication}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold rounded-xl text-xs border border-emerald-200 flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Enviar ao Tutor via WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO 3: GUIA TERAPÊUTICO & MATÉRIAS-PRIMAS */}
      {activeTab === 'guia' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-700" />
                Guia Farmacotécnico & Doses Terapêuticas
              </h2>
              <p className="text-xs text-slate-500">
                Consulta rápida de moléculas ativas, pH de estabilidade e veículos ideais
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por ativo ou classe..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredGuide.map((item) => (
              <div key={item.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{item.activeSubstance}</h3>
                    <span className="text-[11px] text-teal-700 font-medium">{item.category}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Amor ao Bicho Farmacopeia</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {item.speciesIndications.map((ind, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <span className="font-bold text-slate-800">
                        {ind.species === 'canino' ? '🐶 Cães' : ind.species === 'felino' ? '🐱 Gatos' : '🐾 Cães e Gatos'}
                      </span>
                      <p className="text-slate-700"><strong>Dose:</strong> {ind.doseRange}</p>
                      <p className="text-slate-500 text-[11px]">{ind.observations}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-1 flex flex-wrap gap-4 text-[11px] text-slate-500">
                  <span><strong>Contraindicações:</strong> {item.contraindications}</span>
                  <span><strong>Estabilidade:</strong> {item.phStability}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTEÚDO 4: ACOMPANHAMENTO DE PACIENTES */}
      {activeTab === 'pacientes' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-700" />
            Painel de Pacientes & Histórico de Fórmulas
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Paciente</th>
                  <th className="py-3 px-4">Tutor</th>
                  <th className="py-3 px-4">Fórmula Prescrita</th>
                  <th className="py-3 px-4">Unidade</th>
                  <th className="py-3 px-4">Status da Fórmula</th>
                  <th className="py-3 px-4">Adesão do Pet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-800">Thor (Golden Retriever)</td>
                  <td className="py-3 px-4 text-slate-600">Mariana Duarte</td>
                  <td className="py-3 px-4 text-slate-700">Condroitina 500mg em Biscoitos</td>
                  <td className="py-3 px-4 text-emerald-700 font-semibold">Americana</td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-medium">
                      Em Manipulação
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-700">96% (Excelente)</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-800">Mia (Siamês)</td>
                  <td className="py-3 px-4 text-slate-600">Mariana Duarte</td>
                  <td className="py-3 px-4 text-slate-700">Gel Transdérmico Renal Protect</td>
                  <td className="py-3 px-4 text-teal-700 font-semibold">Valinhos</td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-medium">
                      Entregue
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-700">100% (Sem estresse)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTEÚDO 5: VISITA TÉCNICA DAS FARMACÊUTICAS & KIT AMOSTRAS */}
      {activeTab === 'visita' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 max-w-2xl mx-auto">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Solicitar Visita Técnica & Kit de Degustação Palatável
            </h2>
            <p className="text-xs text-slate-500">
              Receba as farmacêuticas Dra. Flávia Semeghini e Dra. Carolina Giordano no seu consultório ou clínica
            </p>
          </div>

          {visitRequestSent ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-emerald-950 text-sm">
                Solicitação Enviada com Sucesso!
              </h3>
              <p className="text-xs text-emerald-800">
                A equipe técnica entrará em contato via WhatsApp para confirmar o melhor horário na sua clínica e levar o Kit Degustação Amor ao Bicho.
              </p>
            </div>
          ) : (
            <form onSubmit={handleRequestVisit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Com qual Farmacêutica Responsável deseja o alinhamento técnico?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div
                    onClick={() => setRequestedPharmacist('flavia')}
                    className={`cursor-pointer p-3 rounded-xl border transition-all ${
                      requestedPharmacist === 'flavia'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <p>Dra. Flávia Semeghini (CRF-SP 48.912)</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-normal">Unidade Americana</p>
                  </div>

                  <div
                    onClick={() => setRequestedPharmacist('carolina')}
                    className={`cursor-pointer p-3 rounded-xl border transition-all ${
                      requestedPharmacist === 'carolina'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <p>Dra. Carolina Giordano (CRF-SP 52.340)</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-normal">Unidade Valinhos</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="sampleKitCheck"
                  checked={sampleKitRequested}
                  onChange={(e) => setSampleKitRequested(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="sampleKitCheck" className="text-amber-900 cursor-pointer">
                  <strong>Levar Kit de Amostras de Palatabilizantes (Sem medicação)</strong>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Inclui biscoitos palatáveis (picanha, frango, fígado) e seringas teste para seus pacientes experimentarem na consulta.
                  </p>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Confirmar Solicitação de Visita Científica ✓
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
