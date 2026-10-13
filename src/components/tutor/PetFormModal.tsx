import React, { useState } from 'react';
import { X, PawPrint, AlertCircle } from 'lucide-react';
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

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
      photoUrl: existingPet?.photoUrl || (
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
        <div className="bg-[#0b4d3a] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-base">
              {existingPet ? 'Editar Perfil do Pet' : 'Cadastrar Novo Pet'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          <div className="bg-emerald-50 rounded-xl p-3 text-[11px] text-emerald-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <p>
              O peso exato é crucial na farmácia veterinária: cada dose na Amor ao Bicho é calculada em miligramas por quilo específico do seu animal.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold"
            >
              Salvar Pet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
