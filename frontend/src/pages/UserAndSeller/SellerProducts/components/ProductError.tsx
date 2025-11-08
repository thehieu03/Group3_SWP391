import { memo, useCallback } from "react";

interface ProductErrorProps {
  error: string;
  onRetry: () => void;
}

const ProductError = memo(({ error, onRetry }: ProductErrorProps) => {
  const handleRetry = useCallback(() => {
    onRetry();
  }, [onRetry]);

  return (
    <div className="p-8 text-center">
      <p className="text-red-600">{error}</p>
      <button
        onClick={handleRetry}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
      >
        Thử lại
      </button>
    </div>
  );
});

ProductError.displayName = "ProductError";

export default ProductError;

