/**
 * Loading Spinner Component
 * Reusable loading state component
 */

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = "Loading Dashboard..." }: LoadingSpinnerProps) {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">{message}</p>
      </div>
    </div>
  );
}
