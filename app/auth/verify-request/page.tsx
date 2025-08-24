export default function VerifyRequest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📧</span>
          </div>
          <h1 className="text-2xl font-bold text-emerald-900 mb-2">Check your email</h1>
          <p className="text-gray-600">
            We've sent you a secure sign-in link. Click the link in your email to access your IMAN Professional Network account.
          </p>
        </div>
        
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-emerald-700">
            <strong>Didn't receive the email?</strong> Check your spam folder or try requesting a new link.
          </p>
        </div>
        
        <a
          href="/auth/signin"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Back to Sign In
        </a>
      </div>
    </div>
  )
}