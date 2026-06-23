"use client";

import { Component, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mb-3 h-10 w-10 text-red-400" aria-hidden />
          <h2 className="text-lg font-semibold text-slate-900">
            Something went wrong
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            The dashboard encountered an unexpected error. Please refresh the
            page or try again later.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="mt-6 rounded-lg bg-[#1e3a5f] px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-[#162d4a]"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
