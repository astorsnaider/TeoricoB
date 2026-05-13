import SwiftUI

@main
struct TeoricoBApp: App {
    @StateObject private var appViewModel = AppViewModel()

    var body: some Scene {
        WindowGroup {
            Group {
                if appViewModel.isOnboardingComplete {
                    MainTabView()
                } else {
                    OnboardingView()
                }
            }
            .environmentObject(appViewModel)
            .preferredColorScheme(.light)
        }
    }
}
