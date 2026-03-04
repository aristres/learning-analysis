export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
          <div className="h-7 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-32" />
        </div>

        {/* お子さまカード */}
        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-36 mb-4" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-1" />
                    <div className="h-3 bg-gray-100 rounded w-12" />
                  </div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-24" />
              </div>
            ))}
          </div>
        </div>

        {/* 診断履歴 */}
        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-28 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-50 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
