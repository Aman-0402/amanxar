import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg-base px-4">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="text-5xl font-black text-brand-primary">500</div>
            <h1 className="text-xl font-bold text-text-primary">Something went wrong</h1>
            <p className="text-text-secondary text-sm">
              An unexpected error occurred. Try refreshing the page.
            </p>
            <pre className="text-left text-xs text-text-muted bg-bg-elevated rounded-xl p-4 overflow-auto max-h-40">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary/90 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
