'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-gray-500 mb-3">
            コンテンツの読み込みに失敗しました
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-[#F7941D] hover:underline text-sm"
          >
            再読み込み
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
