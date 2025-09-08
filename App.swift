import SwiftUI
import GoogleSignIn

@main
struct IMANApp: App {
    @StateObject private var deepLinkHandler = DeepLinkHandler()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(deepLinkHandler)
                .onAppear {
                    // Configure Google Sign-In
                    guard let path = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist"),
                          let plist = NSDictionary(contentsOfFile: path),
                          let clientId = plist["CLIENT_ID"] as? String else {
                        print("Error: Could not find GoogleService-Info.plist or CLIENT_ID")
                        return
                    }
                    
                    GIDSignIn.sharedInstance.configuration = GIDConfiguration(clientID: clientId)
                }
                .onOpenURL { url in
                    print("📱 Received URL: \(url.absoluteString)")
                    
                    // Handle different URL schemes
                    if url.scheme == "iman-auth" {
                        // Handle authentication deep links
                        deepLinkHandler.handleAuthURL(url)
                    } else if url.scheme == "iman" {
                        // Handle general app deep links
                        deepLinkHandler.handleAppURL(url)
                    } else {
                        // Handle Google Sign-In URL
                        GIDSignIn.sharedInstance.handle(url)
                    }
                }
        }
    }
}

class DeepLinkHandler: ObservableObject {
    @Published var shouldAuthenticate = false
    @Published var authToken: String?
    @Published var authEmail: String?
    
    func handleAuthURL(_ url: URL) {
        print("🔐 Handling auth URL: \(url.absoluteString)")
        
        // Parse the URL components
        let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        
        // Look for authentication parameters
        if let queryItems = components?.queryItems {
            for item in queryItems {
                switch item.name {
                case "token":
                    authToken = item.value
                case "email":
                    authEmail = item.value
                default:
                    break
                }
            }
        }
        
        // If we have both token and email, trigger authentication
        if authToken != nil && authEmail != nil {
            shouldAuthenticate = true
        }
    }
    
    func handleAppURL(_ url: URL) {
        print("📱 Handling app URL: \(url.absoluteString)")
        
        // Handle general app navigation
        let path = url.path
        switch path {
        case "/directory":
            // Navigate to directory
            break
        case "/profile":
            // Navigate to profile
            break
        default:
            print("Unknown app path: \(path)")
        }
    }
    
    func completeAuthentication() {
        shouldAuthenticate = false
        authToken = nil
        authEmail = nil
    }
}