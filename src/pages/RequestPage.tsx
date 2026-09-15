import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, Upload, CheckCircle, Package, Loader2, X,
  Phone, MessageCircle,
} from 'lucide-react';
import { supabase, uploadFile, STORAGE_BUCKETS } from '@/lib/supabase';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/context/ToastContext';
import {
  validateMobile, getWhatsAppUrl, getWhatsAppMaterialMessage,
} from '@/lib/utils';
import type { Material } from '@/types';
import { LoadingSpinner, EmptyState } from '@/components/ui';

const UNITS = ['Ton', 'Kg', 'Bags', 'Load', 'Pieces', 'Sq.ft', 'Sq.m', 'Other'];
const TIME_SLOTS = ['Morning (8AM-12PM)', 'Afternoon (12PM-4PM)', 'Evening (4PM-8PM)', 'Any Time'];

export default function RequestPage() {
  const { materialId } = useParams<{ materialId: string }>();
  const navigate = useNavigate();
  const { contact } = useSettings();
  const { showToast } = useToast();

  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    customer_name: '',
    mobile: '',
    village: '',
    mandal: '',
    district: '',
    delivery_address: '',
    quantity: '',
    unit: 'Ton',
    required_date: '',
    preferred_time: '',
    additional_requirements: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!materialId) return;
    supabase
      .from('materials')
      .select('*, category:categories(*)')
      .eq('id', materialId)
      .maybeSingle()
      .then(({ data }) => {
        setMaterial(data as Material | null);
        if (data) {
          setForm((prev) => ({ ...prev, unit: (data as Material).unit || 'Ton' }));
        }
        setLoading(false);
      });
  }, [materialId]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.customer_name.trim()) e.customer_name = 'Please enter your full name.';
    if (!form.mobile.trim()) e.mobile = 'Please enter your mobile number.';
    else if (!validateMobile(form.mobile)) e.mobile = 'Please enter a valid 10-digit Indian mobile number.';
    if (!form.delivery_address.trim()) e.delivery_address = 'Please enter your delivery address.';
    if (!form.quantity.trim()) e.quantity = 'Please enter the required quantity.';
    else if (parseFloat(form.quantity) <= 0 || isNaN(parseFloat(form.quantity)))
      e.quantity = 'Quantity must be greater than zero.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) {
      setShowSummary(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showToast('Please fix the errors before continuing.', 'error');
    }
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    const { url, error } = await uploadFile(STORAGE_BUCKETS.CUSTOMER_UPLOADS, file);
    setUploading(false);
    if (error) {
      showToast('Failed to upload image. Please try again.', 'error');
    } else if (url) {
      setUploadedImageUrl(url);
      showToast('Image uploaded successfully.', 'success');
    }
  }

  async function handleSubmit() {
    if (!material) return;
    setSubmitting(true);

    // Generate request ID
    const { data: requestIdData } = await supabase.rpc('generate_request_id');
    const requestId = requestIdData as string;

    if (!requestId) {
      showToast('Failed to generate request ID. Please try again.', 'error');
      setSubmitting(false);
      return;
    }

    const insertData = {
      request_id: requestId,
      customer_name: form.customer_name,
      mobile: form.mobile,
      village: form.village || null,
      mandal: form.mandal || null,
      district: form.district || null,
      delivery_address: form.delivery_address,
      material_id: material.id,
      material_name: material.name,
      quantity: form.quantity,
      unit: form.unit,
      required_date: form.required_date || null,
      preferred_time: form.preferred_time || null,
      additional_requirements: form.additional_requirements || null,
      message: form.message || null,
      reference_image_url: uploadedImageUrl,
      status: 'pending',
    };

    const { error } = await supabase.from('deal_requests').insert(insertData);

    if (error) {
      showToast('Failed to submit request. Please try again.', 'error');
      setSubmitting(false);
      return;
    }

    // Create admin notification
    await supabase.from('notifications').insert({
      title: 'New Material Request',
      message: `${form.customer_name} requested ${material.name} - ${form.quantity} ${form.unit}`,
      type: 'request',
      request_id: requestId,
    });

    setSubmitting(false);
    navigate('/request-success', {
      state: {
        requestId,
        materialName: material.name,
        quantity: form.quantity,
        unit: form.unit,
        customerName: form.customer_name,
        location: form.village || form.delivery_address,
      },
    });
  }

  if (loading) return <LoadingSpinner message="Loading material..." />;

  if (!material) {
    return (
      <EmptyState
        icon={Package}
        title="Material Not Found"
        message="The material you're looking for doesn't exist."
        action={<Link to="/materials" className="px-6 py-3 bg-gradient-gold text-black font-semibold rounded-lg">BROWSE MATERIALS</Link>}
      />
    );
  }

  if (showSummary) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <div className="rounded-2xl bg-gradient-charcoal border border-gold/30 p-6 sm:p-8 shadow-gold">
          <h2 className="text-2xl font-bold text-gradient-gold text-center mb-2">REQUEST SUMMARY</h2>
          <p className="text-slate-400 text-center text-sm mb-8">Please review your request before sending</p>

          <div className="space-y-4 mb-8">
            <SummaryRow label="Material" value={material.name} />
            <SummaryRow label="Quantity" value={`${form.quantity} ${form.unit}`} />
            <SummaryRow label="Customer" value={form.customer_name} />
            <SummaryRow label="Mobile" value={form.mobile} />
            <SummaryRow label="Location" value={form.village || form.delivery_address} />
            {form.required_date && <SummaryRow label="Required Date" value={new Date(form.required_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />}
            {uploadedImageUrl && (
              <div>
                <p className="text-slate-500 text-sm mb-2">Reference Image</p>
                <img src={uploadedImageUrl} alt="Reference" className="w-32 h-32 rounded-lg object-cover border border-gold/20" />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowSummary(false)}
              className="flex-1 px-6 py-3.5 border-2 border-gold/30 text-gold font-semibold rounded-xl hover:bg-gold/10 transition-colors"
            >
              EDIT
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-6 py-3.5 bg-gradient-gold text-black font-bold rounded-xl hover:shadow-gold-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  SENDING...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  SEND DEAL REQUEST
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <Link
        to={`/materials/${material.id}`}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-gold transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {material.name}
      </Link>

      <div className="rounded-2xl bg-gradient-charcoal border border-gold/20 p-6 sm:p-8 shadow-dark-lg">
        {/* Material banner */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gold/10">
          <img
            src={material.image_url || ''}
            alt={material.name}
            className="w-16 h-16 rounded-xl object-cover border border-gold/20"
          />
          <div>
            <p className="text-slate-400 text-sm">You are requesting:</p>
            <h2 className="text-2xl font-bold text-gradient-gold">{material.name}</h2>
          </div>
        </div>

        <h3 className="text-gold font-semibold text-sm uppercase tracking-wider mb-4">Your Details</h3>

        <div className="space-y-4">
          {/* Name */}
          <Field label="Full Name *" error={errors.customer_name}>
            <input
              type="text"
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              placeholder="Enter your full name"
              className="form-input"
            />
          </Field>

          {/* Mobile */}
          <Field label="Mobile Number *" error={errors.mobile}>
            <input
              type="tel"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              placeholder="10-digit mobile number"
              maxLength={10}
              className="form-input"
            />
          </Field>

          {/* Location fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Village / City *">
              <input
                type="text"
                value={form.village}
                onChange={(e) => setForm({ ...form, village: e.target.value })}
                placeholder="Your village or city"
                className="form-input"
              />
            </Field>
            <Field label="Mandal">
              <input
                type="text"
                value={form.mandal}
                onChange={(e) => setForm({ ...form, mandal: e.target.value })}
                placeholder="Your mandal"
                className="form-input"
              />
            </Field>
          </div>

          <Field label="District">
            <input
              type="text"
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              placeholder="Your district"
              className="form-input"
            />
          </Field>

          <Field label="Delivery Address *" error={errors.delivery_address}>
            <textarea
              value={form.delivery_address}
              onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
              placeholder="Full delivery address"
              rows={3}
              className="form-input resize-none"
            />
          </Field>

          {/* Quantity and unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Quantity *" error={errors.quantity}>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="e.g. 5, 10, 20"
                min="1"
                className="form-input"
              />
            </Field>
            <Field label="Unit *">
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="form-input"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Date and time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Required Date">
              <input
                type="date"
                value={form.required_date}
                onChange={(e) => setForm({ ...form, required_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="form-input"
              />
            </Field>
            <Field label="Preferred Delivery Time">
              <select
                value={form.preferred_time}
                onChange={(e) => setForm({ ...form, preferred_time: e.target.value })}
                className="form-input"
              >
                <option value="">Select time slot</option>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Additional Requirements">
            <input
              type="text"
              value={form.additional_requirements}
              onChange={(e) => setForm({ ...form, additional_requirements: e.target.value })}
              placeholder="Any specific requirements"
              className="form-input"
            />
          </Field>

          <Field label="Message">
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Any additional message for the team"
              rows={3}
              className="form-input resize-none"
            />
          </Field>

          {/* Image upload */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Upload Reference Image (Optional)
            </label>
            {uploadedImageUrl ? (
              <div className="relative inline-block">
                <img src={uploadedImageUrl} alt="Reference" className="w-32 h-32 rounded-lg object-cover border border-gold/20" />
                <button
                  onClick={() => setUploadedImageUrl(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed border-gold/20 hover:border-gold/40 cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-gold animate-spin" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gold mb-2" />
                    <span className="text-slate-400 text-sm">Click to upload</span>
                  </>
                )}
              </label>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex gap-3">
          <Link
            to={`/materials/${material.id}`}
            className="flex-1 px-6 py-3.5 border-2 border-gold/30 text-gold font-semibold rounded-xl hover:bg-gold/10 transition-colors text-center"
          >
            CANCEL
          </Link>
          <button
            onClick={handleNext}
            className="flex-1 px-6 py-3.5 bg-gradient-gold text-black font-bold rounded-xl hover:shadow-gold-lg transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            REVIEW REQUEST
          </button>
        </div>

        {/* Quick contact */}
        <div className="mt-6 pt-6 border-t border-gold/10 flex items-center justify-center gap-4">
          <a
            href={`tel:${contact?.phone_1 || '8185817805'}`}
            className="flex items-center gap-2 text-emerald-400 text-sm font-medium hover:underline"
          >
            <Phone className="w-4 h-4" />
            Call for help
          </a>
          <a
            href={getWhatsAppUrl(contact?.whatsapp, getWhatsAppMaterialMessage(contact, material.name))}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-emerald-400 text-sm font-medium hover:underline"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </div>
      </div>

      <style>{`
        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          background: rgba(15, 15, 15, 0.8);
          border: 1px solid rgba(212, 175, 55, 0.15);
          color: #e2e8f0;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }
        .form-input:focus {
          border-color: rgba(212, 175, 55, 0.5);
        }
      `}</style>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-slate-300 text-sm font-medium mb-2">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-red-400 text-xs">{error}</p>}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gold/10">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="text-slate-200 font-medium text-sm">{value}</span>
    </div>
  );
}
