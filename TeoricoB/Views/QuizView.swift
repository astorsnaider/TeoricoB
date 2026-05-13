import SwiftUI

struct QuizView: View {
    @StateObject var quizVM: QuizViewModel
    @Environment(\.dismiss) var dismiss
    var onComplete: (Int, Bool) -> Void

    var body: some View {
        ZStack {
            Color.appBg.ignoresSafeArea()

            if quizVM.isComplete {
                QuizResultView(quizVM: quizVM, onDismiss: {
                    onComplete(quizVM.xpEarned, quizVM.isPerfect)
                    dismiss()
                })
                .transition(.asymmetric(insertion: .move(edge: .trailing), removal: .opacity))
            } else {
                VStack(spacing: 0) {
                    quizHeader
                    questionArea
                    if quizVM.showFeedback { feedbackArea }
                    continueButton
                }
                .animation(.spring(response: 0.3), value: quizVM.showFeedback)
            }

            if quizVM.showCelebration {
                ConfettiView().transition(.opacity)
            }
        }
        .animation(.spring(response: 0.4), value: quizVM.isComplete)
    }

    // MARK: - Header
    private var quizHeader: some View {
        VStack(spacing: 12) {
            HStack {
                Button { dismiss() } label: {
                    Image(systemName: "xmark")
                        .font(.headline)
                        .foregroundColor(.secondary)
                        .padding(10)
                        .background(Color.white)
                        .clipShape(Circle())
                        .shadow(color: .black.opacity(0.08), radius: 4)
                }
                Spacer()
                if let lesson = quizVM.lesson {
                    Text(lesson.title)
                        .font(.subheadline.bold())
                        .foregroundColor(.primary)
                }
                Spacer()
                Text("\(quizVM.currentIndex + 1)/\(quizVM.questions.count)")
                    .font(.subheadline.bold())
                    .foregroundColor(.secondary)
            }

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 6)
                        .fill(Color.gray.opacity(0.15))
                        .frame(height: 8)
                    RoundedRectangle(cornerRadius: 6)
                        .fill(LinearGradient(colors: [Color.appRed, Color.appOrange],
                                             startPoint: .leading, endPoint: .trailing))
                        .frame(width: geo.size.width * quizVM.progress, height: 8)
                        .animation(.spring(response: 0.5), value: quizVM.progress)
                }
            }
            .frame(height: 8)
        }
        .padding(.horizontal, 20)
        .padding(.top, 56)
        .padding(.bottom, 16)
        .background(Color.white.shadow(color: .black.opacity(0.05), radius: 8, y: 4))
    }

    // MARK: - Question
    private var questionArea: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                if let q = quizVM.current {
                    Text(q.text)
                        .font(.title3.bold())
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 24)
                        .frame(maxWidth: .infinity)

                    VStack(spacing: 12) {
                        ForEach(Array(q.options.enumerated()), id: \.offset) { idx, option in
                            AnswerButton(
                                text: option,
                                index: idx,
                                state: answerState(for: idx, question: q),
                                action: { quizVM.selectAnswer(idx) }
                            )
                            .shake(quizVM.shakeWrong && quizVM.selectedAnswer == idx && !quizVM.isCorrect)
                        }
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 24)
        }
    }

    private func answerState(for index: Int, question: Question) -> AnswerState {
        guard let selected = quizVM.selectedAnswer else { return .idle }
        if index == question.correctIndex { return .correct }
        if index == selected { return .wrong }
        return .dimmed
    }

    // MARK: - Feedback
    private var feedbackArea: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: quizVM.isCorrect ? "checkmark.circle.fill" : "xmark.circle.fill")
                    .foregroundColor(quizVM.isCorrect ? .appCorrect : .appWrong)
                Text(quizVM.isCorrect ? "¡Correcto!" : "Incorrecto")
                    .font(.headline.bold())
                    .foregroundColor(quizVM.isCorrect ? .appCorrect : .appWrong)
                Spacer()
                if quizVM.isCorrect {
                    Text("+10 XP")
                        .font(.caption.bold())
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(Color.appCorrect.opacity(0.15))
                        .foregroundColor(.appCorrect)
                        .cornerRadius(8)
                }
            }
            if let q = quizVM.current {
                Text(q.explanation)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(nil)
                if !quizVM.isCorrect {
                    HStack {
                        Text("Respuesta correcta: ")
                            .font(.caption.bold())
                        Text(q.correctAnswer)
                            .font(.caption.bold())
                            .foregroundColor(.appCorrect)
                    }
                }
            }
        }
        .padding(16)
        .background(quizVM.isCorrect ? Color.appCorrect.opacity(0.08) : Color.appWrong.opacity(0.08))
        .overlay(
            Rectangle()
                .fill(quizVM.isCorrect ? Color.appCorrect : Color.appWrong)
                .frame(width: 4)
                .cornerRadius(2),
            alignment: .leading
        )
        .cornerRadius(12)
        .padding(.horizontal, 20)
        .padding(.bottom, 8)
        .transition(.move(edge: .bottom).combined(with: .opacity))
    }

    // MARK: - Continue Button
    private var continueButton: some View {
        Group {
            if quizVM.showFeedback {
                Button {
                    haptic(.light)
                    withAnimation(.spring(response: 0.3)) { quizVM.next() }
                } label: {
                    Text(quizVM.currentIndex == quizVM.questions.count - 1 ? "Ver Resultado" : "Continuar")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(quizVM.isCorrect ? Color.appCorrect : Color.appWrong)
                        .foregroundColor(.white)
                        .cornerRadius(16)
                }
                .buttonStyle(BounceButtonStyle())
                .padding(.horizontal, 20)
                .padding(.bottom, 32)
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
    }
}

// MARK: - Answer Button
enum AnswerState { case idle, correct, wrong, dimmed }

struct AnswerButton: View {
    let text: String
    let index: Int
    let state: AnswerState
    let action: () -> Void

    private var borderColor: Color {
        switch state {
        case .correct: return .appCorrect
        case .wrong: return .appWrong
        case .idle: return Color.gray.opacity(0.2)
        case .dimmed: return Color.clear
        }
    }

    private var bgColor: Color {
        switch state {
        case .correct: return .appCorrect.opacity(0.12)
        case .wrong: return .appWrong.opacity(0.12)
        case .idle: return .white
        case .dimmed: return Color.gray.opacity(0.05)
        }
    }

    private var textColor: Color {
        switch state {
        case .dimmed: return .secondary.opacity(0.5)
        default: return .primary
        }
    }

    private var prefixLetters = ["A", "B", "C", "D"]

    var body: some View {
        Button(action: { if state == .idle { action() } }) {
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(borderColor.opacity(state == .idle ? 0.15 : 0.25))
                        .frame(width: 36, height: 36)
                    if state == .correct {
                        Image(systemName: "checkmark").font(.subheadline.bold()).foregroundColor(.appCorrect)
                    } else if state == .wrong {
                        Image(systemName: "xmark").font(.subheadline.bold()).foregroundColor(.appWrong)
                    } else {
                        Text(prefixLetters[min(index, 3)])
                            .font(.subheadline.bold())
                            .foregroundColor(state == .dimmed ? .secondary.opacity(0.4) : .secondary)
                    }
                }

                Text(text)
                    .font(.subheadline)
                    .foregroundColor(textColor)
                    .multilineTextAlignment(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(16)
            .background(bgColor)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(borderColor, lineWidth: state == .idle ? 1.5 : 2.5)
            )
            .cornerRadius(14)
            .animation(.spring(response: 0.2), value: state)
        }
        .buttonStyle(.plain)
        .disabled(state != .idle)
    }
}
