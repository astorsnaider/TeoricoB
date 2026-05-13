import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var appVM: AppViewModel
    @State private var showResetAlert = false

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    profileHeader
                    statsGrid
                    achievementsSection
                    settingsSection
                    Spacer(minLength: 100)
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
            }
            .background(Color.appBg)
            .navigationTitle("Perfil")
            .navigationBarTitleDisplayMode(.large)
        }
        .alert("¿Reiniciar progreso?", isPresented: $showResetAlert) {
            Button("Cancelar", role: .cancel) {}
            Button("Reiniciar", role: .destructive) { resetProgress() }
        } message: {
            Text("Se perderá todo tu progreso, XP y logros. Esta acción no se puede deshacer.")
        }
    }

    private var profileHeader: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(LinearGradient(colors: [Color.appRed, Color.appOrange],
                                         startPoint: .topLeading, endPoint: .bottomTrailing))
                    .frame(width: 100, height: 100)
                Text(appVM.user.avatarEmoji)
                    .font(.system(size: 54))
            }
            .shadow(color: .appRed.opacity(0.3), radius: 12)

            VStack(spacing: 4) {
                Text(appVM.user.name)
                    .font(.title2.bold())
                HStack(spacing: 6) {
                    Text(appVM.user.league.emoji)
                    Text("Liga \(appVM.user.league.rawValue)")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            }

            HStack(spacing: 24) {
                VStack {
                    Text("\(appVM.user.streak)")
                        .font(.title2.bold())
                        .foregroundColor(.appOrange)
                    Text("🔥 Racha").font(.caption).foregroundColor(.secondary)
                }
                Divider().frame(height: 36)
                VStack {
                    Text("Nv.\(appVM.user.level)")
                        .font(.title2.bold())
                        .foregroundColor(.appBlue)
                    Text("⭐ Nivel").font(.caption).foregroundColor(.secondary)
                }
                Divider().frame(height: 36)
                VStack {
                    Text("\(appVM.user.achievements.count)")
                        .font(.title2.bold())
                        .foregroundColor(.appGreen)
                    Text("🏆 Logros").font(.caption).foregroundColor(.secondary)
                }
            }
            .padding(16)
            .background(Color.white)
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.06), radius: 8)
        }
    }

    private var statsGrid: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Estadísticas").font(.headline.bold())

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                statCard("🎯", "Precisión", "\(Int(appVM.user.accuracy))%", .appGreen)
                statCard("❓", "Respondidas", "\(appVM.user.totalAnswered)", .appBlue)
                statCard("✅", "Correctas", "\(appVM.user.totalCorrect)", .appCorrect)
                statCard("⭐", "XP Total", "\(appVM.user.xp)", .appYellow)
                statCard("📚", "Lecciones", "\(appVM.user.completedLessons.count)", .appOrange)
                statCard("🏅", "Temas", "\(appVM.user.completedTopics.count)/\(appVM.topics.count)", .appRed)
            }
        }
    }

    private func statCard(_ icon: String, _ label: String, _ value: String, _ color: Color) -> some View {
        VStack(spacing: 8) {
            Text(icon).font(.title2)
            Text(value).font(.title3.bold()).foregroundColor(color)
            Text(label).font(.caption).foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(16)
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 6)
    }

    private var achievementsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Logros").font(.headline.bold())
                Spacer()
                Text("\(appVM.user.achievements.count)/\(Achievement.all.count)")
                    .font(.caption.bold())
                    .foregroundColor(.secondary)
            }

            let achievements = appVM.userAchievements()
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 12) {
                ForEach(achievements) { achievement in
                    AchievementBadge(achievement: achievement)
                }
            }
        }
    }

    private var settingsSection: some View {
        VStack(spacing: 12) {
            Text("Configuración").font(.headline.bold())
                .frame(maxWidth: .infinity, alignment: .leading)

            VStack(spacing: 0) {
                settingRow(icon: "bell.fill", label: "Recordatorio diario", color: .appOrange) {
                    // Toggle notifications
                }
                Divider().padding(.leading, 52)
                settingRow(icon: "questionmark.circle.fill", label: "Cómo usar la app", color: .appBlue) {}
                Divider().padding(.leading, 52)
                settingRow(icon: "star.fill", label: "Valora la app", color: .appYellow) {}
                Divider().padding(.leading, 52)
                settingRow(icon: "arrow.counterclockwise", label: "Reiniciar progreso", color: .appWrong) {
                    showResetAlert = true
                }
            }
            .background(Color.white)
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.05), radius: 6)
        }
    }

    private func settingRow(icon: String, label: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: { haptic(.light); action() }) {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(color.opacity(0.15))
                        .frame(width: 36, height: 36)
                    Image(systemName: icon).foregroundColor(color).font(.subheadline)
                }
                Text(label).font(.subheadline).foregroundColor(.primary)
                Spacer()
                Image(systemName: "chevron.right").font(.caption).foregroundColor(.secondary)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
        .buttonStyle(.plain)
    }

    private func resetProgress() {
        appVM.user.xp = 0
        appVM.user.streak = 0
        appVM.user.hearts = 5
        appVM.user.league = .bronze
        appVM.user.leagueXP = 0
        appVM.user.completedTopics = []
        appVM.user.completedLessons = []
        appVM.user.achievements = []
        appVM.user.totalCorrect = 0
        appVM.user.totalAnswered = 0
        appVM.user.weeklyXP = 0
        appVM.saveUser()
        hapticNotification(.warning)
    }
}

struct AchievementBadge: View {
    let achievement: Achievement

    var body: some View {
        VStack(spacing: 6) {
            ZStack {
                Circle()
                    .fill(achievement.isUnlocked ? Color.appYellow.opacity(0.15) : Color.gray.opacity(0.1))
                    .frame(width: 56, height: 56)
                Text(achievement.isUnlocked ? achievement.emoji : "🔒")
                    .font(.title2)
                    .saturation(achievement.isUnlocked ? 1 : 0)
            }
            Text(achievement.name)
                .font(.system(size: 9, weight: .medium))
                .multilineTextAlignment(.center)
                .foregroundColor(achievement.isUnlocked ? .primary : .secondary)
                .lineLimit(2)
        }
    }
}
