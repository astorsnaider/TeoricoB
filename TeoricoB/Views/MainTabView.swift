import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var appVM: AppViewModel
    @State private var selectedTab = 0

    var body: some View {
        ZStack(alignment: .bottom) {
            TabView(selection: $selectedTab) {
                HomeView()
                    .tag(0)
                LearnView()
                    .tag(1)
                LeagueView()
                    .tag(2)
                ProfileView()
                    .tag(3)
            }

            // Custom Tab Bar
            HStack(spacing: 0) {
                tabItem(icon: "house.fill", label: "Inicio", tag: 0)
                tabItem(icon: "book.fill", label: "Aprender", tag: 1)
                tabItem(icon: "trophy.fill", label: "Liga", tag: 2)
                tabItem(icon: "person.fill", label: "Perfil", tag: 3)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(
                RoundedRectangle(cornerRadius: 24)
                    .fill(.white)
                    .shadow(color: .black.opacity(0.12), radius: 16, y: -4)
            )
            .padding(.horizontal, 24)
            .padding(.bottom, 8)
        }
        .ignoresSafeArea(edges: .bottom)
        .overlay(alignment: .top) {
            if appVM.showNewAchievement, let achievement = appVM.newAchievements.last {
                AchievementToast(achievement: achievement)
                    .transition(.move(edge: .top).combined(with: .opacity))
                    .onAppear {
                        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                            withAnimation { appVM.showNewAchievement = false }
                        }
                    }
            }
        }
        .animation(.spring(response: 0.3), value: appVM.showNewAchievement)
    }

    private func tabItem(icon: String, label: String, tag: Int) -> some View {
        Button {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                selectedTab = tag
                haptic(.light)
            }
        } label: {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 22, weight: selectedTab == tag ? .bold : .regular))
                    .foregroundColor(selectedTab == tag ? .appRed : .gray)
                    .scaleEffect(selectedTab == tag ? 1.15 : 1.0)
                Text(label)
                    .font(.system(size: 10, weight: selectedTab == tag ? .semibold : .regular))
                    .foregroundColor(selectedTab == tag ? .appRed : .gray)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.plain)
    }
}

struct AchievementToast: View {
    let achievement: Achievement

    var body: some View {
        HStack(spacing: 12) {
            Text(achievement.emoji).font(.title2)
            VStack(alignment: .leading, spacing: 2) {
                Text("¡Logro desbloqueado!").font(.caption.bold()).foregroundColor(.appYellow)
                Text(achievement.name).font(.subheadline.bold()).foregroundColor(.white)
            }
            Spacer()
        }
        .padding(16)
        .background(Color.appDark)
        .cornerRadius(16)
        .padding(.horizontal, 16)
        .padding(.top, 52)
        .shadow(color: .black.opacity(0.3), radius: 12)
    }
}
