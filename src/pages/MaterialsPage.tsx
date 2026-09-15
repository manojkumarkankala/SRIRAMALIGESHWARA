import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  getAvailabilityLabel, getAvailabilityColor, getAvailabilityDot,
} from '@/lib/utils';
import type { Material, Category } from '@/types';
import { SectionHeading, LoadingSpinner, EmptyState } from '@/components/ui';

type SortOption = 'name' | 'price' | 'availability';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from('materials').select('*, category:categories(*)').order('sort_order', { ascending: true }),
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
    ]).then(([matRes, catRes]) => {
      setMaterials((matRes.data as Material[]) || []);
      setCategories((catRes.data as Category[]) || []);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let result = [...materials];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q) ||
          m.category?.name?.toLowerCase().includes(q)
      );
    }

    if (activeCategory !== 'all') {
      result = result.filter((m) => m.category?.name === activeCategory);
    }

    if (availabilityFilter !== 'all') {
      result = result.filter((m) => m.availability === availabilityFilter);
    }

    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'availability') {
      const order = { available: 0, limited_stock: 1, out_of_stock: 2 };
      result.sort((a, b) => order[a.availability] - order[b.availability]);
    }

    return result;
  }, [materials, search, activeCategory, availabilityFilter, sortBy]);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <SectionHeading
        title="Our Building Materials"
        subtitle="Browse our complete catalog of quality construction materials"
      />

      {/* Search and filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gradient-charcoal border border-gold/20 text-slate-200 text-sm focus:border-gold/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-gold"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gold/20 rounded-lg text-gold text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          <div className={`flex-1 flex flex-wrap items-center gap-2 ${showFilters ? 'flex' : 'hidden lg:flex'}`}>
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === 'all'
                  ? 'bg-gradient-gold text-black'
                  : 'border border-gold/20 text-slate-300 hover:border-gold/40'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === cat.name
                    ? 'bg-gradient-gold text-black'
                    : 'border border-gold/20 text-slate-300 hover:border-gold/40'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-gradient-charcoal border border-gold/20 text-slate-200 text-sm focus:border-gold/50"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="limited_stock">Limited Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 rounded-lg bg-gradient-charcoal border border-gold/20 text-slate-200 text-sm focus:border-gold/50"
            >
              <option value="name">Sort: Name</option>
              <option value="price">Sort: Price</option>
              <option value="availability">Sort: Availability</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSpinner message="Loading materials..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No materials found"
          message="Try adjusting your search or filters to find what you're looking for."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((material, idx) => (
            <div
              key={material.id}
              className="group rounded-2xl bg-gradient-dark border border-gold/10 overflow-hidden hover:border-gold/30 transition-all duration-300 hover:shadow-gold animate-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={material.image_url || ''}
                  alt={material.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-gold/20">
                  <span className={`w-2 h-2 rounded-full ${getAvailabilityDot(material.availability)}`} />
                  <span className={`text-xs font-medium ${getAvailabilityColor(material.availability)}`}>
                    {getAvailabilityLabel(material.availability)}
                  </span>
                </div>
                {material.category && (
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full glass-gold border border-gold/20 text-gold text-xs font-medium">
                    {material.category.name}
                  </span>
                )}
              </div>

              <div className="p-5">
                <h3 className="text-gold font-bold text-lg mb-1">{material.name}</h3>
                <p className="text-slate-400 text-sm line-clamp-2 mb-3">{material.description}</p>

                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-500">Price</span>
                    <span className="text-slate-300 font-medium">{material.price || 'Contact for Price'}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-500">Unit</span>
                    <span className="text-slate-300 font-medium">{material.unit || '-'}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-500">Min. Quantity</span>
                    <span className="text-slate-300 font-medium">{material.minimum_quantity || '-'} {material.unit}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/materials/${material.id}`}
                    className="flex-1 px-4 py-2.5 text-center border border-gold/30 text-gold text-sm font-medium rounded-lg hover:bg-gold/10 transition-colors"
                  >
                    VIEW DETAILS
                  </Link>
                  {material.availability !== 'out_of_stock' ? (
                    <Link
                      to={`/request/${material.id}`}
                      className="flex-1 px-4 py-2.5 text-center bg-gradient-gold text-black text-sm font-semibold rounded-lg hover:shadow-gold transition-all"
                    >
                      DEAL NOW
                    </Link>
                  ) : (
                    <span className="flex-1 px-4 py-2.5 text-center text-slate-500 text-sm font-medium rounded-lg bg-slate-800/50">
                      Unavailable
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
