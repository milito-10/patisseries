

export const ProductSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse border border-gray-100">
        <div className="h-64 bg-gray-200" />
        <div className="p-6 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="flex justify-between items-center pt-4">
                <div className="h-6 bg-gray-200 rounded w-1/4" />
                <div className="h-10 bg-gray-200 rounded w-1/3" />
            </div>
        </div>
    </div>
);

export const CategorySkeleton = () => (
    <div className="h-10 w-24 bg-gray-200 rounded-full animate-pulse" />
);

export const ProductListSkeleton = ({ count = 6 }: { count?: number }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: count }).map((_, i) => (
            <ProductSkeleton key={i} />
        ))}
    </div>
);

export const ProductDetailSkeleton = () => (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-200 rounded-3xl" />
            <div className="space-y-6">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-10 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/4" />
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
                <div className="h-12 bg-gray-200 rounded w-full mt-8" />
            </div>
        </div>
    </div>
);
