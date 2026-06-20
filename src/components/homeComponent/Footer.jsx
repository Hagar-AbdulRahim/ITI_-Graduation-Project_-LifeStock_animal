import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-6 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-text-dark text-base">رعاية الماشية AI</span>
          <span className="text-xl">🐾</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-xs text-text-gray">
          <a href="#" className="hover:text-text-dark transition-colors">سياسة الخصوصية</a>
          <a href="#" className="hover:text-text-dark transition-colors">شروط الخدمة</a>
          <a href="#" className="hover:text-text-dark transition-colors">نقاط API</a>
          <a href="#" className="hover:text-text-dark transition-colors">مزرعة الحيوانية</a>
        </div>

        {/* Copyright + Icons */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-text-gray hover:bg-gray-200 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </button>
            <button className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-text-gray hover:bg-gray-200 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </button>
          </div>
          <span className="text-xs text-text-gray">© 2026 رعاية الماشية AI</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
