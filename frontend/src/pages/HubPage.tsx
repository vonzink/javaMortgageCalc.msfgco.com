import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { CATEGORIES, CALCULATORS } from '@/utils/calculatorRegistry';
import { Search } from 'lucide-react';

export default function HubPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const filteredCalcs = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return CALCULATORS;
    return CALCULATORS.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        c.features.some((f: string) => f.toLowerCase().includes(term))
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof CALCULATORS>();
    for (const cat of CATEGORIES) {
      map.set(cat.id, []);
    }
    for (const calc of filteredCalcs) {
      const list = map.get(calc.category);
      if (list) list.push(calc);
    }
    return map;
  }, [filteredCalcs]);

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-gray-500 mt-1">
          Select a calculator to get started, or search by keyword.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search calculators..."
          className="input-field pl-10"
        />
      </div>

      {/* Calculator grid by category */}
      {CATEGORIES.map((cat: { id: string; label: string; color: string }) => {
        const calcs = grouped.get(cat.id) || [];
        if (calcs.length === 0) return null;

        return (
          <div key={cat.id}>
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              {cat.label}
              <span className="text-sm font-normal text-gray-400">({calcs.length})</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {calcs.map((calc) => {
                const path = calc.category === 'income'
                  ? `/calculators/income/${calc.slug}`
                  : `/calculators/${calc.slug}`;

                return (
                  <Link
                    key={calc.slug}
                    to={path}
                    className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-brand-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{calc.icon}</span>
                      <div className="min-w-0">
                        <h3 className="font-medium text-gray-900 group-hover:text-brand-600 transition-colors truncate">
                          {calc.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {calc.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      {filteredCalcs.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No calculators found matching "{search}"</p>
          <button
            onClick={() => setSearch('')}
            className="mt-2 text-brand-600 hover:text-brand-700 text-sm font-medium"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
