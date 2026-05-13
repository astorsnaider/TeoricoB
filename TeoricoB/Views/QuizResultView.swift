import SwiftUI

struct QuizResultView: View {
    @ObservedObject var quizVM: QuizViewModel
    let onDismiss: () -> Void
    @State private var xpAnimated: Int = 0
    @State private var showConfetti = false

    var body: some View {
        ZStack {
            Color.appBg.ignoresSafeArea()
            if showConfetti { ConfettiView() }

            ScrollView(showsIndicators: false) {
                VStack(spacing: 28) {
                    Spacer(minLength: 40)
                    resultEmoji
                    resultTitle
                    if quizVM.isExamMode { examResultBanner }
                    statsCards
                    xpCard
                    if quizVM.isPerfect { perfectBonusCard }
                    actionButtons
                    Spacer(minLength: 100)
                }
                .padding(.horizontal, 24)
            }
        }
        .onAppear {
            if quizVM.isPerfect || (quizVM.isExamMode && quizVM.examPassed) {
                withAnimation(.easeIn(duration: 0.3)) { showConfetti = true }
                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                    withAnimation { showConfetti = false }
                }
            }
            withAnimation(.easeOut(duration: 1.2).delay(0.3)) {
                xpAnimated = quizVM.xpEarned
            }
        }
    }

    private var resultEmoji: some View {
        Text(quizVM.gradeEmoji)
            .font(.system(size: 90))
            .scaleEffect(1.0)
            .animation(.spring(response: 0.6, dampingFraction: 0.5).delay(0.1), value: true)
    }

    private var resultTitle: some View {
        VStack(spacing: 8) {
            Text(quizVM.grade)
                .font(.largeTitle.bold())
            if let lesson = quizVM.lesson {
                Text(lesson.title)
                    .font(.title3)
                    .foregroundColor(.secondary)
            }
        }
    }

    private var examResultBanner: some View {
        HStack(spacing: 12) {
            Image(systemName: quizVM.examPassed ? "checkmark.seal.fill" : "xmark.seal.fill")
                .font(.title)
                .foregroundColor(quizVM.examPassed ? .appCorrect : .appWrong)
            VStack(alignment: .leading, spacing: 4) {
                Text(quizVM.examPassed ? "¡EXAMEN APROBADO!" : "Examen no superado")
                    .font(.headline.bold())
                    .foregroundColor(quizVM.examPassed ? .appCorrect : .appWrong)
                Text(quizVM.examPassed
                     ? "¡Enhorabuena! \(quizVM.wrongCount) errores (máximo 3 permitidos)"
                     : "\(quizVM.wrongCount) errores. Se permiten como máximo 3")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            Spacer()
        }
        .padding(16)
        .background(quizVM.examPassed ? Color.appCorrect.opacity(0.1) : Color.appWrong.opacity(0.1))
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(quizVM.examPassed ? Color.appCorrect : Color.appWrong, lineWidth: 1.5)
        )
    }

    private var statsCards: some View {
        HStack(spacing: 12) {
            statCard("✅", "\(quizVM.correctCount)", "Correctas", .appCorrect)
            statCard("❌", "\(quizVM.wrongCount)", "Incorrectas", .appWrong)
            statCard("🎯", "\(Int(quizVM.accuracy))%", "Precisión", .appBlue)
        }
    }

    private func statCard(_ icon: String, _ value: String, _ label: String, _ color: Color) -> some View {
        VStack(spacing: 8) {
            Text(icon).font(.title2)
            Text(value).font(.title2.bold()).foregroundColor(color)
            Text(label).font(.caption).foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(16)
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 6)
    }

    private var xpCard: some View {
        VStack(spacing: 12) {
            Text("XP Ganados")
                .font(.headline)
                .foregroundColor(.secondary)

            Text("+\(xpAnimated) XP")
                .font(.system(size: 48, weight: .black, design: .rounded))
                .foregroundStyle(LinearGradient(colors: [Color.appYellow, Color.appOrange],
                                                startPoint: .leading, endPoint: .trailing))

            HStack(spacing: 16) {
                xpRow("🎯 Respuestas correctas", "+\(quizVM.correctCount * 10) XP")
                if quizVM.isPerfect { xpRow("⭐ Lección perfecta", "+20 XP") }
            }
        }
        .padding(20)
        .background(Color.white)
        .cornerRadius(20)
        .shadow(color: .appYellow.opacity(0.2), radius: 12)
    }

    private func xpRow(_ label: String, _ value: String) -> some View {
        VStack(spacing: 2) {
            Text(value).font(.caption.bold()).foregroundColor(.appOrange)
            Text(label).font(.caption2).foregroundColor(.secondary).multilineTextAlignment(.center)
        }
    }

    private var perfectBonusCard: some View {
        HStack {
            Text("⭐").font(.largeTitle)
            VStack(alignment: .leading, spacing: 4) {
                Text("¡Lección Perfecta!").font(.headline.bold())
                Text("Completaste el tema sin ningún error").font(.subheadline).foregroundColor(.secondary)
            }
            Spacer()
        }
        .padding(16)
        .background(LinearGradient(colors: [Color.appYellow.opacity(0.2), Color.appOrange.opacity(0.1)],
                                   startPoint: .leading, endPoint: .trailing))
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.appYellow, lineWidth: 1.5))
    }

    private var actionButtons: some View {
        VStack(spacing: 12) {
            Button {
                haptic(.medium)
                onDismiss()
            } label: {
                Text("Continuar")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.appRed)
                    .foregroundColor(.white)
                    .cornerRadius(16)
            }
            .buttonStyle(BounceButtonStyle())

            Button {
                haptic(.light)
                quizVM.restart()
            } label: {
                Text("Repetir lección")
                    .font(.subheadline.bold())
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.white)
                    .foregroundColor(.appRed)
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.appRed, lineWidth: 1.5))
                    .cornerRadius(16)
            }
            .buttonStyle(BounceButtonStyle())
        }
    }
}
