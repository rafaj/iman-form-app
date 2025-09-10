import SwiftUI

struct ContentView: View {
    @State private var isAuthenticated = false
    @State private var user: User?
    @State private var isLoading = false
    @State private var errorMessage: String?
    @EnvironmentObject private var deepLinkHandler: DeepLinkHandler
    
    var body: some View {
        Group {
            if isAuthenticated {
                MainTabView()
            } else {
                LoginView(
                    isAuthenticated: $isAuthenticated,
                    user: $user,
                    isLoading: $isLoading,
                    errorMessage: $errorMessage
                )
            }
        }
        .onAppear {
            checkInitialAuthState()
        }
        .onChange(of: deepLinkHandler.shouldAuthenticate) { shouldAuth in
            if shouldAuth {
                handleDeepLinkAuthentication()
            }
        }
    }
    
    func checkInitialAuthState() {
        // Check for any persistent authentication state if needed
        // For now, start with unauthenticated state
    }
    
    func handleDeepLinkAuthentication() {
        guard let token = deepLinkHandler.authToken,
              let email = deepLinkHandler.authEmail else {
            errorMessage = "Invalid authentication link"
            return
        }
        
        isLoading = true
        
        // Validate the magic link token with the server
        validateMagicLinkToken(token: token, email: email) { result in
            DispatchQueue.main.async {
                isLoading = false
                
                switch result {
                case .success(let user):
                    // Authentication successful
                    self.user = user
                    self.isAuthenticated = true
                    deepLinkHandler.completeAuthentication()
                case .failure(let error):
                    errorMessage = error.localizedDescription
                    deepLinkHandler.completeAuthentication()
                }
            }
        }
    }
    
    func validateMagicLinkToken(token: String, email: String, completion: @escaping (Result<User, Error>) -> Void) {
        guard let url = URL(string: "https://iman-form-app.vercel.app/api/auth/callback/resend") else {
            completion(.failure(URLError(.badURL)))
            return
        }
        
        var components = URLComponents(url: url, resolvingAgainstBaseURL: false)!
        components.queryItems = [
            URLQueryItem(name: "token", value: token),
            URLQueryItem(name: "email", value: email),
            URLQueryItem(name: "callbackUrl", value: "/")
        ]
        
        guard let finalURL = components.url else {
            completion(.failure(URLError(.badURL)))
            return
        }
        
        var request = URLRequest(url: finalURL)
        request.httpMethod = "GET"
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            // If we get here, the token was valid
            // Create a user object from the email
            let user = User(
                id: UUID().uuidString,
                name: email.components(separatedBy: "@").first?.capitalized ?? "User",
                email: email,
                image: nil
            )
            
            completion(.success(user))
        }.resume()
    }
}

struct LoginView: View {
    @Binding var isAuthenticated: Bool
    @Binding var user: User?
    @Binding var isLoading: Bool
    @Binding var errorMessage: String?
    @State private var emailAddress = ""
    @State private var emailSent = false
    
    var body: some View {
        VStack(spacing: 30) {
            // Logo and title
            VStack(spacing: 20) {
                Text("IMAN")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.blue)
                
                Text("Professional Network")
                    .font(.title2)
                    .foregroundColor(.secondary)
                
                Text("Connect with Iranian-American professionals")
                    .font(.body)
                    .multilineTextAlignment(.center)
                    .foregroundColor(.secondary)
                    .padding(.horizontal)
            }
            .padding(.top, 50)
            
            Spacer()
            
            // Sign-in section
            VStack(spacing: 20) {
                if let errorMessage = errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .font(.caption)
                        .multilineTextAlignment(.center)
                        .padding()
                }
                
                if emailSent {
                    VStack(spacing: 15) {
                        Image(systemName: "envelope.circle.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.green)
                        
                        Text("Email Sent!")
                            .font(.title2)
                            .fontWeight(.semibold)
                            .foregroundColor(.green)
                        
                        Text("Check your email and click the link to sign in")
                            .font(.body)
                            .multilineTextAlignment(.center)
                            .foregroundColor(.secondary)
                        
                        Button("Send Another Email") {
                            emailSent = false
                            emailAddress = ""
                        }
                        .foregroundColor(.blue)
                        .padding(.top)
                    }
                } else {
                    VStack(spacing: 15) {
                        // Email input field
                        TextField("Enter your email address", text: $emailAddress)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                        
                        // Email Sign-In Button
                        Button(action: signInWithEmail) {
                            HStack {
                                Image(systemName: "envelope.fill")
                                    .foregroundColor(.white)
                                Text("Send Sign-In Link")
                                    .foregroundColor(.white)
                                    .fontWeight(.medium)
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(Color.blue)
                            .cornerRadius(10)
                        }
                        .disabled(isLoading || emailAddress.isEmpty)
                    }
                }
                
                if isLoading {
                    ProgressView()
                        .scaleEffect(1.2)
                        .padding()
                }
            }
            .padding(.horizontal, 30)
            
            Spacer()
            
            // Terms and privacy
            Text("By signing in, you agree to our Terms of Service and Privacy Policy")
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
                .padding(.bottom, 30)
        }
        .background(Color(.systemBackground))
    }
    
    func signInWithEmail() {
        guard !emailAddress.isEmpty else { return }
        
        isLoading = true
        errorMessage = nil
        
        // Call your web app's magic link API
        sendMagicLink(email: emailAddress) { result in
            DispatchQueue.main.async {
                isLoading = false
                
                switch result {
                case .success:
                    emailSent = true
                    errorMessage = nil
                case .failure(let error):
                    errorMessage = "Failed to send email: \(error.localizedDescription)"
                }
            }
        }
    }
    
    func sendMagicLink(email: String, completion: @escaping (Result<Void, Error>) -> Void) {
        guard let url = URL(string: "https://iman-form-app.vercel.app/api/auth/send-magic-link") else {
            completion(.failure(URLError(.badURL)))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let requestBody = [
            "to": email,
            "url": "https://iman-form-app.vercel.app/api/auth/callback/resend?token=PLACEHOLDER&email=\(email)&callbackUrl=/"
        ]
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)
        } catch {
            completion(.failure(error))
            return
        }
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            // Check if the response indicates success
            if let httpResponse = response as? HTTPURLResponse,
               httpResponse.statusCode == 200 {
                completion(.success(()))
            } else {
                completion(.failure(URLError(.badServerResponse)))
            }
        }.resume()
    }
}

struct MainTabView: View {
    var body: some View {
        TabView {
            DirectoryView()
                .tabItem {
                    Image(systemName: "person.3.fill")
                    Text("Directory")
                }
            
            ForumView()
                .tabItem {
                    Image(systemName: "bubble.left.and.bubble.right.fill")
                    Text("Forum")
                }
            
            EventsView()
                .tabItem {
                    Image(systemName: "calendar")
                    Text("Events")
                }
            
            ProfileView()
                .tabItem {
                    Image(systemName: "person.circle.fill")
                    Text("Profile")
                }
        }
    }
}

struct DirectoryView: View {
    @StateObject private var apiService = APIService()
    @State private var members: [DirectoryMember] = []
    @State private var isLoading = true
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationView {
            VStack {
                if isLoading {
                    ProgressView("Loading members...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let errorMessage = errorMessage {
                    VStack {
                        Text("Error: \(errorMessage)")
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                        
                        Button("Retry") {
                            loadDirectory()
                        }
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List(members) { member in
                        MemberRowView(member: member)
                    }
                }
            }
            .navigationTitle("Directory")
            .refreshable {
                loadDirectory()
            }
        }
        .onAppear {
            loadDirectory()
        }
    }
    
    func loadDirectory() {
        isLoading = true
        errorMessage = nil
        
        apiService.fetchDirectory()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    isLoading = false
                    if case .failure(let error) = completion {
                        errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { response in
                    if response.success {
                        members = response.members
                    } else {
                        errorMessage = "Failed to load directory"
                    }
                }
            )
            .store(in: &apiService.cancellables)
    }
}

struct MemberRowView: View {
    let member: DirectoryMember
    
    var body: some View {
        HStack {
            // Avatar
            AsyncImage(url: URL(string: member.image ?? "")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Circle()
                    .fill(Color.blue.opacity(0.3))
                    .overlay(
                        Text(member.initials)
                            .font(.headline)
                            .fontWeight(.medium)
                            .foregroundColor(.blue)
                    )
            }
            .frame(width: 50, height: 50)
            .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 4) {
                Text(member.displayName)
                    .font(.headline)
                    .fontWeight(.medium)
                
                if let employer = member.employer, !employer.isEmpty {
                    Text(employer)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                if let qualification = member.professionalQualification, !qualification.isEmpty {
                    Text(qualification)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
        }
        .padding(.vertical, 4)
    }
}

// Placeholder views for other tabs
struct ForumView: View {
    var body: some View {
        NavigationView {
            Text("Forum Coming Soon")
                .navigationTitle("Forum")
        }
    }
}

struct EventsView: View {
    var body: some View {
        NavigationView {
            Text("Events Coming Soon")
                .navigationTitle("Events")
        }
    }
}

struct ProfileView: View {
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                VStack {
                    Circle()
                        .fill(Color.blue.opacity(0.3))
                        .overlay(
                            Image(systemName: "person.fill")
                                .foregroundColor(.blue)
                                .font(.largeTitle)
                        )
                        .frame(width: 100, height: 100)
                    
                    Text("IMAN Member")
                        .font(.title2)
                        .fontWeight(.medium)
                    
                    Text("Authenticated via Email")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Button("Sign Out") {
                    // Handle sign out - for now just a placeholder
                    // In a real implementation, you'd clear stored auth state
                }
                .padding()
                .frame(maxWidth: .infinity)
                .background(Color.red)
                .foregroundColor(.white)
                .cornerRadius(10)
                .padding(.horizontal)
            }
            .navigationTitle("Profile")
            .padding()
        }
    }
}

#Preview {
    ContentView()
}