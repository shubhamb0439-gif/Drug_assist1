import React, { useState, useEffect } from 'react';
import { Building2, UserSquare2, Pill, Plus, X, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, Clinic, Provider, Drug } from '../lib/supabase';

interface PatientDetailsProps {
  onNext: () => void;
}

const PatientDetails: React.FC<PatientDetailsProps> = ({ onNext }) => {
  const { user } = useAuth();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [userClinic, setUserClinic] = useState<string | null>(null);
  const [userProvider, setUserProvider] = useState<string | null>(null);
  const [userDrug, setUserDrug] = useState<string | null>(null);
  const [refillDate, setRefillDate] = useState<string>('');
  const [newClinicName, setNewClinicName] = useState('');
  const [newProviderName, setNewProviderName] = useState('');
  const [newDrugName, setNewDrugName] = useState('');
  const [showClinicInput, setShowClinicInput] = useState(false);
  const [showProviderInput, setShowProviderInput] = useState(false);
  const [showDrugInput, setShowDrugInput] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [clinicsRes, providersRes, drugsRes, userClinicsRes, userProvidersRes, userDrugRes] = await Promise.all([
        supabase.from('clinics').select('*').order('name'),
        supabase.from('providers').select('*').order('name'),
        supabase.from('drugs').select('*').order('name'),
        supabase.from('user_clinics').select('clinic_id').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_providers').select('provider_id').eq('user_id', user.id).maybeSingle(),
        supabase.from('patient_drugs').select('drug_id, refill_date').eq('user_id', user.id).maybeSingle(),
      ]);

      if (clinicsRes.data) setClinics(clinicsRes.data);
      if (providersRes.data) setProviders(providersRes.data);
      if (drugsRes.data) setDrugs(drugsRes.data);
      if (userClinicsRes.data) setUserClinic(userClinicsRes.data.clinic_id);
      if (userProvidersRes.data) setUserProvider(userProvidersRes.data.provider_id);
      if (userDrugRes.data?.drug_id) {
        setUserDrug(userDrugRes.data.drug_id);
        if (userDrugRes.data.refill_date) {
          setRefillDate(userDrugRes.data.refill_date);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClinic = async (clinicId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('user_clinics')
        .delete()
        .eq('user_id', user.id);

      const { error } = await supabase
        .from('user_clinics')
        .insert({ user_id: user.id, clinic_id: clinicId });

      if (error) throw error;
      setUserClinic(clinicId);

      const { data: clinicProviders } = await supabase
        .from('clinic_providers')
        .select('provider_id')
        .eq('clinic_id', clinicId)
        .limit(1)
        .maybeSingle();

      if (clinicProviders?.provider_id) {
        await handleAddProvider(clinicProviders.provider_id);
      }
    } catch (error) {
      console.error('Error adding clinic:', error);
    }
  };

  const handleRemoveClinic = async () => {
    if (!user || !userClinic) return;

    try {
      const { error } = await supabase
        .from('user_clinics')
        .delete()
        .eq('user_id', user.id)
        .eq('clinic_id', userClinic);

      if (error) throw error;
      setUserClinic(null);
    } catch (error) {
      console.error('Error removing clinic:', error);
    }
  };

  const handleAddProvider = async (providerId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('user_providers')
        .delete()
        .eq('user_id', user.id);

      const { error } = await supabase
        .from('user_providers')
        .insert({ user_id: user.id, provider_id: providerId });

      if (error) throw error;
      setUserProvider(providerId);
    } catch (error) {
      console.error('Error adding provider:', error);
    }
  };

  const handleRemoveProvider = async () => {
    if (!user || !userProvider) return;

    try {
      const { error } = await supabase
        .from('user_providers')
        .delete()
        .eq('user_id', user.id)
        .eq('provider_id', userProvider);

      if (error) throw error;
      setUserProvider(null);
    } catch (error) {
      console.error('Error removing provider:', error);
    }
  };

  const handleCreateClinic = async () => {
    if (!user || !newClinicName.trim()) return;

    try {
      const { data: newClinic, error: insertError } = await supabase
        .from('clinics')
        .insert({ name: newClinicName.trim() })
        .select()
        .single();

      if (insertError) throw insertError;
      if (newClinic) {
        setClinics([...clinics, newClinic]);
        await handleAddClinic(newClinic.id);
        setNewClinicName('');
        setShowClinicInput(false);
      }
    } catch (error) {
      console.error('Error creating clinic:', error);
    }
  };

  const handleCreateProvider = async () => {
    if (!user || !newProviderName.trim()) return;

    try {
      const { data: newProvider, error: insertError } = await supabase
        .from('providers')
        .insert({ name: newProviderName.trim() })
        .select()
        .single();

      if (insertError) throw insertError;
      if (newProvider) {
        setProviders([...providers, newProvider]);
        await handleAddProvider(newProvider.id);
        setNewProviderName('');
        setShowProviderInput(false);
      }
    } catch (error) {
      console.error('Error creating provider:', error);
    }
  };

  const handleAddDrug = async (drugId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('patient_drugs')
        .delete()
        .eq('user_id', user.id);

      const selectedDrug = drugs.find(d => d.id === drugId);
      if (!selectedDrug) return;

      const { error } = await supabase
        .from('patient_drugs')
        .insert({
          user_id: user.id,
          drug_id: selectedDrug.id,
          weekly_price: selectedDrug.weekly_price,
          monthly_price: selectedDrug.monthly_price,
          yearly_price: selectedDrug.yearly_price,
          refill_date: refillDate || null
        });

      if (error) throw error;
      setUserDrug(drugId);
    } catch (error) {
      console.error('Error adding drug:', error);
    }
  };

  const handleRemoveDrug = async () => {
    if (!user || !userDrug) return;

    try {
      const { error } = await supabase
        .from('patient_drugs')
        .delete()
        .eq('user_id', user.id)
        .eq('drug_id', userDrug);

      if (error) throw error;
      setUserDrug(null);
      setRefillDate('');
    } catch (error) {
      console.error('Error removing drug:', error);
    }
  };

  const handleUpdateRefillDate = async () => {
    if (!user || !userDrug || !refillDate) return;

    try {
      const { error } = await supabase
        .from('patient_drugs')
        .update({ refill_date: refillDate })
        .eq('user_id', user.id)
        .eq('drug_id', userDrug);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating refill date:', error);
    }
  };

  const handleCreateDrug = async () => {
    if (!user || !newDrugName.trim()) return;

    try {
      const { data: newDrug, error: insertError } = await supabase
        .from('drugs')
        .insert({
          name: newDrugName.trim(),
          weekly_price: 0,
          monthly_price: 0,
          yearly_price: 0
        })
        .select()
        .single();

      if (insertError) throw insertError;
      if (newDrug) {
        setDrugs([...drugs, newDrug]);
        await handleAddDrug(newDrug.id);
        setNewDrugName('');
        setShowDrugInput(false);
      }
    } catch (error) {
      console.error('Error creating drug:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 lg:flex lg:items-start lg:justify-center lg:p-12 lg:gap-12">
      <div className="lg:w-[420px] lg:flex-shrink-0 bg-white lg:rounded-3xl lg:shadow-2xl overflow-hidden flex flex-col min-h-screen lg:min-h-[850px] lg:max-h-[90vh]">
        <div className="p-6 lg:p-8 overflow-y-auto flex flex-col flex-1">
          <div className="flex items-center justify-between mb-8">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#009193' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold mb-2" style={{ color: '#009193' }}>1553</h1>
            <p className="text-xl font-semibold text-gray-800">Available Programs</p>
            <p className="text-sm text-gray-600 mt-1">STEP 1 OF 4</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              <div className="relative">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddDrug(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-4 pr-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-500"
                  value={userDrug || ""}
                >
                  <option value="">Search by drug</option>
                  {drugs.map(drug => (
                    <option key={drug.id} value={drug.id}>
                      {drug.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-teal-500">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div className="relative">
                <select
                  className="w-full px-4 py-4 pr-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-500"
                  value=""
                >
                  <option value="">Search by diagnosis</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-teal-500">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div className="relative">
                <select
                  className="w-full px-4 py-4 pr-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-500"
                  value=""
                >
                  <option value="">Search by insurance</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-teal-500">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-6">
              <button
                type="submit"
                className="w-full text-white font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
                style={{ backgroundColor: '#009193' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#007a7c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#009193'}
              >
                SEARCH
              </button>

              <div className="border-t border-gray-200 pt-6 text-center space-y-3">
                <div className="flex justify-center">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="8" y="16" width="32" height="20" rx="4" stroke="#531B93" strokeWidth="2"/>
                    <rect x="14" y="12" width="20" height="4" rx="2" fill="#531B93"/>
                    <circle cx="24" cy="26" r="4" stroke="#531B93" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="flex justify-center gap-3 text-xs">
                  <a href="#" className="text-blue-600 hover:underline">Terms of Use</a>
                  <span className="text-gray-400">|</span>
                  <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                  <span className="text-gray-400">|</span>
                  <a href="#" className="text-blue-600 hover:underline">Contact Us</a>
                </div>
                <p className="text-xs text-gray-600">For the best experience, view on mobile!</p>
                <p className="text-xs text-gray-600">© 2025 DrugAssist</p>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden lg:block lg:flex-1 lg:max-w-3xl bg-white rounded-3xl shadow-xl p-12 overflow-y-auto lg:max-h-[90vh]">
        <h2 className="text-5xl font-bold mb-8" style={{ color: '#531B93' }}>DrugAssist</h2>
        <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
          <p className="font-medium">Identify eligible drug assistance programs in just 3 steps:</p>
          <ol className="list-decimal list-inside space-y-3 pl-2">
            <li>Enter your medication, diagnosis, and insurance details</li>
            <li>Confirm your eligibility for the assistance programs DrugAssist has found</li>
            <li>Review and select the assistance programs you are interested in applying for</li>
          </ol>
          <p className="mt-8">
            No need to visit multiple websites, we bring everything together in a single search. Each program is reviewed in real time, so you receive only trusted and up-to-date results. All this, for free!
          </p>
          <p>
            Because applications can be lengthy and tricky, we offer an application service in collaboration with partner hospitals. We'll contact you separately by email with details of this service after you've received an email confirming the assistance programs you wish to apply for.
          </p>
          <p>
            For further assistance visit our{' '}
            <a href="#" className="text-teal-600 hover:underline font-medium">Support Center</a>
            {' '}to get help or open a support ticket.
          </p>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p>Warm regards</p>
            <p className="font-semibold text-gray-900">Team DrugAssist</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
