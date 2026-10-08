export const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-16">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" style={{ borderColor: 'var(--color-primary)' }}></div>
  </div>
);

export const ErrorMessage = ({ message }) => (
  <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-md my-4">
    <p>{message || 'Something went wrong. Please try again.'}</p>
  </div>
);

export const EmptyState = ({ message, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center text-secondary">
    {Icon && <Icon size={48} className="mb-4 opacity-50" />}
    <p className="text-xl">{message || 'No data available.'}</p>
  </div>
);
