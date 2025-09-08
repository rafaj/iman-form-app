import Foundation
import Combine

class APIService: ObservableObject {
    private let baseURL = "https://iman-form-app.vercel.app/api"
    private let session = URLSession.shared
    var cancellables = Set<AnyCancellable>()
    
    func fetchDirectory() -> AnyPublisher<DirectoryResponse, Error> {
        guard let url = URL(string: "\(baseURL)/mobile/directory") else {
            return Fail(error: URLError(.badURL))
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer iman-mobile-secure-key-2024", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        return session.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: DirectoryResponse.self, decoder: JSONDecoder())
            .eraseToAnyPublisher()
    }
}