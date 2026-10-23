import React, { useState } from 'react';
import { X, Heart, Plus, Clock, Sparkles, Trash2, AlertTriangle } from 'lucide-react';
import { Pet } from '../../types';

interface PetsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  pets: Pet[];
  onOpenNewPet: () => void;
  onOpenNewReminder: (petId: string) => void;
  onDeletePet?: (petId: string) => void;
}

export const PetsListModal: React.FC<PetsListModalProps> = ({
  isOpen,
  onClose,
  pets,
  onOpenNewPet,
  onOpenNewReminder,
  onDeletePet
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-900 to-pink-950 px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600/30 border border-rose-400/40 flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-300 fill-rose-300/40" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Meus Pets Cadastrados</h3>
              <p className="text-[11px] text-rose-200/80">
                {pets.length} {pets.length === 1 ? 'pet cadastrado' : 'pets cadastrados'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-rose-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Lista de Pacientes</span>
            <button
              onClick={() => {
                onClose();
                onOpenNewPet();
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Novo Pet</span>
            </button>
          </div>

          {pets.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3 p-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-800 text-sm">Você ainda não possui pets cadastrados</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Adicione seu animalzinho para personalizar dosagens e fórmulas manipuladas.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenNewPet();
                }}
                className="px-4 py-2 rounded-xl bg-rose-700 text-white font-bold text-xs"
              >
                + Cadastrar Meu 1º Pet
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={pet.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=80'}
                      alt={pet.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{pet.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 capitalize">
                          {pet.species}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{pet.breed}</p>
                      <p className="text-xs font-semibold text-emerald-800">
                        {pet.weightKg} kg • {pet.ageYears} anos
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Sabor Favorito:</span>
                      <strong className="text-slate-800 capitalize flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        {pet.favoriteFlavor?.replace(/_/g, ' ') || 'Carne'}
                      </strong>
                    </div>

                    {pet.chronicCondition && (
                      <div className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded-lg border border-amber-200/50">
                        <strong>Condição:</strong> {pet.chronicCondition}
                      </div>
                    )}

                    {pet.allergies && (
                      <div className="text-[11px] text-rose-800 bg-rose-50 p-1.5 rounded-lg border border-rose-200/50">
                        <strong>Alergias:</strong> {pet.allergies}
                      </div>
                    )}
                  </div>

                  {confirmDeleteId === pet.id ? (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 animate-in fade-in">
                      <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Remover <strong>{pet.name}</strong> da sua lista de pets?</span>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (onDeletePet) onDeletePet(pet.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                        >
                          Sim, remover
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenNewReminder(pet.id);
                        }}
                        className="w-full sm:flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>+ Programar Remédio para {pet.name}</span>
                      </button>

                      {onDeletePet && (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(pet.id)}
                          className="w-full sm:w-auto py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:border-rose-300"
                          title={`Remover pet ${pet.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Remover Pet</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
