export default function PlanLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="bg-gradient-to-br from-[#1B2A4A] to-[#2C3E6B] rounded-xl p-6 text-center animate-pulse">
          <div className="h-7 bg-white/20 rounded w-56 mx-auto mb-2" />
          <div className="h-4 bg-white/10 rounded w-40 mx-auto" />
        </div>

        {/* 概要 */}
        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-3" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-4/5" />
          </div>
        </div>

        {/* 週別メニュー */}
        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-36 mb-4" />
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <div className="h-5 bg-gray-200 rounded w-20 mb-2" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 手立て */}
        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-28 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-50 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
