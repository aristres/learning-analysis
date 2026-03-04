export default function ReportLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="bg-white rounded-xl shadow-sm p-6 text-center animate-pulse">
          <div className="h-7 bg-gray-200 rounded w-48 mx-auto mb-2" />
          <div className="h-4 bg-gray-100 rounded w-32 mx-auto" />
        </div>

        {/* サマリー */}
        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-36 mb-3" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
            <div className="h-4 bg-gray-100 rounded w-4/6" />
          </div>
        </div>

        {/* スコア */}
        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <div className="h-4 bg-gray-100 rounded w-24" />
                  <div className="h-4 bg-gray-100 rounded w-16" />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* 強み・つまずき */}
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-20 mb-3" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-5/6" />
              <div className="h-4 bg-gray-100 rounded w-4/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
