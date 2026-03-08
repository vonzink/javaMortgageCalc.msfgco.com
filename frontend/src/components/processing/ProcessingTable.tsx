import { ExternalLink, Pencil, Trash2, Mail, Phone } from 'lucide-react';

interface ProcessingLink {
  id: number;
  name: string;
  description?: string;
  url?: string;
  email?: string;
  phone?: string;
  fax?: string;
  agentName?: string;
  agentEmail?: string;
}

interface ProcessingTableProps {
  links: ProcessingLink[];
  canEdit: boolean;
  onEdit?: (link: ProcessingLink) => void;
  onDelete?: (id: number) => void;
  emptyMessage?: string;
}

export default function ProcessingTable({
  links,
  canEdit,
  onEdit,
  onDelete,
  emptyMessage = 'No processing links found for this category.',
}: ProcessingTableProps) {
  if (links.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {links.map((link) => (
        <div
          key={link.id}
          className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between gap-4"
        >
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 truncate">{link.name}</h3>
            {link.description && (
              <p className="text-sm text-gray-500 mt-0.5 truncate">
                {link.description}
              </p>
            )}
            {/* Contact info row */}
            {(link.email || link.phone || link.agentName) && (
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                {link.agentName && (
                  <span className="font-medium text-gray-600">
                    {link.agentName}
                  </span>
                )}
                {link.email && (
                  <a
                    href={`mailto:${link.email}`}
                    className="inline-flex items-center gap-1 hover:text-brand-600 transition-colors"
                  >
                    <Mail className="w-3 h-3" />
                    {link.email}
                  </a>
                )}
                {link.phone && (
                  <a
                    href={`tel:${link.phone}`}
                    className="inline-flex items-center gap-1 hover:text-brand-600 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    {link.phone}
                  </a>
                )}
                {link.fax && (
                  <span className="text-gray-400">Fax: {link.fax}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {link.url && (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open
              </a>
            )}
            {canEdit && (
              <>
                {onEdit && (
                  <button
                    onClick={() => onEdit(link)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(link.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
