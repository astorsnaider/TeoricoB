import SwiftUI

struct HomeView: View {
    @EnvironmentObject var appVM: AppViewModel
    @State private var showExam = false
    @State private var showDailyChallenge = false

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    headerSection
                    statsRow
                    if let dc = appVM.dailyChallenge {
                        dailyChallengeCard(dc)
                    }
                    quickContinueSection
                    examSimCard
                    Spacer(minLength: 100)
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
            }
            .background(Color.appBg)
            .navigationBarHidden(true)
        }
        .fullScreenCover(isPresented: $showDailyChallenge) {
            if let dc = appVM.dailyChallenge {
                QuizView(
                    quizVM: QuizViewModel(questions: dc.questions, isExamMode: false),
                    onComplete: { xp, perfect in
                        appVM.completeDailyChallenge(score: xp)
                    }
                )
            }
        }
        .fullScreenCover(isPresented: $showExam) {
            QuizView(
                quizVM: QuizViewModel(questions: appVM.generateExamQuestions(), isExamMode: true),
                onComplete: { xp, perfect in
                    appVM.addXP(xp)
                }
            )
        }
    }

    private var headerSection: some View {
        HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 4) {
                Text("¡Hola, \(appVM.user.name)! \(appVM.user.avatarEmoji)")
                    .font(.title2.bold())
                Text(motivationalMessage)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            Spacer()
            StreakBadge(streak: appVM.user.streak)
        }
        .padding(.top, 8)
    }

    private var motivationalMessage: String {
        let streak = appVM.user.streak
        if streak == 0 { return "Empieza tu racha hoy 🔥" }
        if streak < 3 { return "¡Llevas \(streak) días seguidos!" }
        if streak < 7 { return "¡Racha de \(streak) días! 🔥" }
        return "¡Increíble racha de \(streak) días! 🏆"
    }

    private var statsRow: some View {
        HStack(spacing: 12) {
            statCard(icon: "⭐", label: "XP Total", value: "\(appVM.user.xp)")
            statCard(icon: "❤️", label: "Vidas", value: "\(appVM.user.hearts)/\(appVM.user.maxHearts)")
            statCard(icon: appVM.user.league.emoji, label: "Liga", value: appVM.user.league.rawValue)
        }
    }

    private func statCard(icon: String, label: String, value: String) -> some View {
        VStack(spacing: 6) {
            Text(icon).font(.title2)
            Text(value).font(.headline.bold())
            Text(label).font(.caption).foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(14)
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.06), radius: 8)
    }

    private func dailyChallengeCard(_ dc: DailyChallenge) -> some View {
        Button {
            if !dc.isCompleted { showDailyChallenge = true; haptic(.medium) }
        } label: {
            HStack(spacing: 16) {
                ZStack {
                    Circle().fill(dc.isCompleted ? Color.appGreen : Color.appYellow)
                        .frame(width: 56, height: 56)
                    Text(dc.isCompleted ? "✅" : "⚡").font(.title2)
                }
                VStack(alignment: .leading, spacing: 4) {
                    Text("Reto Diario")
                        .font(.headline.bold())
                    Text(dc.isCompleted ? "¡Completado! +\(dc.xpReward) XP" : "\(dc.questions.count) preguntas · +\(dc.xpReward) XP")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                Spacer()
                if !dc.isCompleted {
                    Image(systemName: "chevron.right")
                        .foregroundColor(.secondary)
                }
            }
            .padding(16)
            .background(dc.isCompleted ? Color.appGreen.opacity(0.12) : Color.appYellow.opacity(0.15))
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(dc.isCompleted ? Color.appGreen : Color.appYellow, lineWidth: 1.5)
            )
            .cornerRadius(16)
        }
        .buttonStyle(.plain)
    }

    private var quickContinueSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Seguir estudiando")
                .font(.headline.bold())
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(appVM.topics.prefix(4)) { topic in
                    NavigationLink(destination: TopicDetailView(topic: topic)) {
                        TopicMiniCard(topic: topic, progress: appVM.progressForTopic(topic.id))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var examSimCard: some View {
        Button { showExam = true; haptic(.medium) } label: {
            HStack(spacing: 16) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(LinearGradient(colors: [Color.appRed, Color.appRed.opacity(0.8)],
                                             startPoint: .topLeading, endPoint: .bottomTrailing))
                        .frame(width: 56, height: 56)
                    Text("📋").font(.title2)
                }
                VStack(alignment: .leading, spacing: 4) {
                    Text("Examen Simulado")
                        .font(.headline.bold())
                        .foregroundColor(.primary)
                    Text("30 preguntas · Estilo DGT real")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                Spacer()
                Image(systemName: "chevron.right").foregroundColor(.secondary)
            }
            .padding(16)
            .background(Color.white)
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.06), radius: 8)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Supporting Views

struct StreakBadge: View {
    let streak: Int
    @State private var pulse = false

    var body: some View {
        HStack(spacing: 4) {
            Text("🔥").font(.title3)
                .scaleEffect(pulse ? 1.2 : 1.0)
                .animation(.easeInOut(duration: 0.8).repeatForever(autoreverses: true), value: pulse)
                .onAppear { if streak > 0 { pulse = true } }
            Text("\(streak)").font(.title3.bold()).foregroundColor(.appOrange)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color.appOrange.opacity(0.12))
        .cornerRadius(12)
    }
}

struct TopicMiniCard: View {
    let topic: Topic
    let progress: Double

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(topic.emoji).font(.title2)
                Spacer()
                if progress >= 1.0 {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.appGreen)
                }
            }
            Text(topic.name)
                .font(.subheadline.bold())
                .lineLimit(2)
            ProgressBar(value: progress, color: Color(hex: topic.colorHex))
            Text("\(Int(progress * 100))%")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.06), radius: 8)
    }
}

struct ProgressBar: View {
    let value: Double
    let color: Color

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: 4)
                    .fill(color.opacity(0.15))
                    .frame(height: 6)
                RoundedRectangle(cornerRadius: 4)
                    .fill(color)
                    .frame(width: geo.size.width * min(value, 1.0), height: 6)
                    .animation(.spring(response: 0.6), value: value)
            }
        }
        .frame(height: 6)
    }
}
