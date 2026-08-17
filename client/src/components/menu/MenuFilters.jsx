import cn from '@utils/cn';
import SearchAutocomplete from './SearchAutocomplete';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function MenuFilters({ categories, filters, onChange }) {
  const update = (patch) => onChange({ ...filters, ...patch, page: 1 });

  return (
    <div className="space-y-6">
      <SearchAutocomplete value={filters.search} onChange={(search) => update({ search })} />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => update({ category: '' })}
          className={cn(
            'rounded-full px-4 py-1.5 font-body text-sm font-medium transition-colors',
            !filters.category ? 'bg-ink text-cream' : 'border border-ink/15 text-ink/60 hover:border-ink/40',
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            type="button"
            onClick={() => update({ category: cat._id })}
            className={cn(
              'rounded-full px-4 py-1.5 font-body text-sm font-medium transition-colors',
              filters.category === cat._id
                ? 'bg-ink text-cream'
                : 'border border-ink/15 text-ink/60 hover:border-ink/40',
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-4 font-body text-sm text-ink/70">
          {[
            { key: 'vegetarian', label: 'Vegetarian' },
            { key: 'vegan', label: 'Vegan' },
            { key: 'halal', label: 'Halal' },
          ].map((diet) => (
            <label key={diet.key} className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={filters[diet.key]}
                onChange={(e) => update({ [diet.key]: e.target.checked })}
                className="accent-ink"
              />
              {diet.label}
            </label>
          ))}
        </div>

        <div className="flex items-center gap-2 font-body text-sm">
          <label htmlFor="minPrice" className="text-ink/50">
            Price
          </label>
          <input
            id="minPrice"
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => update({ minPrice: e.target.value })}
            className="w-20 border-b border-ink/15 bg-transparent px-1 py-1 text-ink outline-none focus:border-gold"
          />
          <span className="text-ink/30">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => update({ maxPrice: e.target.value })}
            className="w-20 border-b border-ink/15 bg-transparent px-1 py-1 text-ink outline-none focus:border-gold"
          />
        </div>

        <select
          value={filters.sort}
          onChange={(e) => update({ sort: e.target.value })}
          className="ml-auto cursor-pointer border-b border-ink/15 bg-transparent py-1.5 font-body text-sm text-ink outline-none focus:border-gold"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
