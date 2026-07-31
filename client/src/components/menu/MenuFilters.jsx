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
            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            !filters.category
              ? 'bg-primary-500 text-white'
              : 'bg-secondary-500/10 text-secondary-600 dark:text-secondary-300',
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
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              filters.category === cat._id
                ? 'bg-primary-500 text-white'
                : 'bg-secondary-500/10 text-secondary-600 dark:text-secondary-300',
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3 text-sm">
          {[
            { key: 'vegetarian', label: 'Vegetarian' },
            { key: 'vegan', label: 'Vegan' },
            { key: 'halal', label: 'Halal' },
          ].map((diet) => (
            <label key={diet.key} className="flex items-center gap-1.5 text-secondary-600 dark:text-secondary-300">
              <input
                type="checkbox"
                checked={filters[diet.key]}
                onChange={(e) => update({ [diet.key]: e.target.checked })}
                className="rounded"
              />
              {diet.label}
            </label>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="minPrice" className="text-secondary-500">
            Price
          </label>
          <input
            id="minPrice"
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => update({ minPrice: e.target.value })}
            className="w-20 rounded-lg border border-secondary-500/20 bg-white px-2 py-1 dark:bg-secondary-800 dark:text-secondary-50"
          />
          <span className="text-secondary-400">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => update({ maxPrice: e.target.value })}
            className="w-20 rounded-lg border border-secondary-500/20 bg-white px-2 py-1 dark:bg-secondary-800 dark:text-secondary-50"
          />
        </div>

        <select
          value={filters.sort}
          onChange={(e) => update({ sort: e.target.value })}
          className="ml-auto rounded-lg border border-secondary-500/20 bg-white px-3 py-1.5 text-sm dark:bg-secondary-800 dark:text-secondary-50"
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
