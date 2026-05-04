export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      {icon && (
        <div className="w-16 h-16 text-gray-300 mb-4">{icon}</div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm text-center max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}

export function TableEmptyState({ action }) {
  return (
    <tr>
      <td colSpan="5" className="px-6 py-12 text-center">
        <EmptyState
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title="No data yet"
          description="Create your first item to get started"
          action={action}
        />
      </td>
    </tr>
  );
}

export function CardEmptyState({ action }) {
  return (
    <EmptyState
      icon={
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      }
      title="No items yet"
      description="Start by creating your first item"
      action={action}
    />
  );
}