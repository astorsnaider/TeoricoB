import Foundation
import Combine

class QuizViewModel: ObservableObject {
    @Published var currentIndex: Int = 0
    @Published var selectedAnswer: Int? = nil
    @Published var showFeedback: Bool = false
    @Published var isCorrect: Bool = false
    @Published var correctCount: Int = 0
    @Published var wrongCount: Int = 0
    @Published var isComplete: Bool = false
    @Published var showCelebration: Bool = false
    @Published var timeElapsed: Double = 0
    @Published var shakeWrong: Bool = false
    @Published var questionAnswerTimes: [Double] = []

    private var questionStartTime: Date = Date()
    private var timer: AnyCancellable?

    let questions: [Question]
    let lesson: Lesson?
    let topic: Topic?
    let isExamMode: Bool

    var current: Question? { questions.indices.contains(currentIndex) ? questions[currentIndex] : nil }
    var progress: Double { Double(currentIndex) / Double(questions.count) }
    var isPerfect: Bool { wrongCount == 0 && isComplete }
    var accuracy: Double { guard (correctCount + wrongCount) > 0 else { return 0 }; return Double(correctCount) / Double(correctCount + wrongCount) * 100 }

    var xpEarned: Int {
        let base = correctCount * 10
        let perfectBonus = isPerfect ? 20 : 0
        let speedBonus = timeElapsed < Double(questions.count) * 8 ? 10 : 0
        return base + perfectBonus + speedBonus
    }

    var grade: String {
        if accuracy >= 90 { return "Sobresaliente" }
        if accuracy >= 70 { return "Notable" }
        if accuracy >= 50 { return "Aprobado" }
        return "Necesitas repasar"
    }

    var gradeEmoji: String {
        if accuracy >= 90 { return "🌟" }
        if accuracy >= 70 { return "⭐" }
        if accuracy >= 50 { return "👍" }
        return "📚"
    }

    init(questions: [Question], lesson: Lesson? = nil, topic: Topic? = nil, isExamMode: Bool = false) {
        self.questions = questions.shuffled()
        self.lesson = lesson
        self.topic = topic
        self.isExamMode = isExamMode
        startTimer()
    }

    func selectAnswer(_ index: Int) {
        guard selectedAnswer == nil, !isComplete else { return }
        selectedAnswer = index
        isCorrect = index == current?.correctIndex
        let elapsed = Date().timeIntervalSince(questionStartTime)
        questionAnswerTimes.append(elapsed)

        if isCorrect {
            correctCount += 1
            showCelebration = true
            hapticNotification(.success)
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
                self.showCelebration = false
            }
        } else {
            wrongCount += 1
            shakeWrong = true
            hapticNotification(.error)
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                self.shakeWrong = false
            }
        }
        showFeedback = true
    }

    func next() {
        if currentIndex < questions.count - 1 {
            currentIndex += 1
            selectedAnswer = nil
            showFeedback = false
            isCorrect = false
            questionStartTime = Date()
        } else {
            isComplete = true
            timer?.cancel()
        }
    }

    func restart() {
        currentIndex = 0
        selectedAnswer = nil
        showFeedback = false
        isCorrect = false
        correctCount = 0
        wrongCount = 0
        isComplete = false
        timeElapsed = 0
        questionAnswerTimes = []
        questionStartTime = Date()
        startTimer()
    }

    private func startTimer() {
        questionStartTime = Date()
        timer = Timer.publish(every: 1, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                self?.timeElapsed += 1
            }
    }

    var fastAnswersCount: Int {
        questionAnswerTimes.filter { $0 < 8 }.count
    }

    var examPassed: Bool {
        guard isExamMode else { return false }
        return wrongCount <= 3
    }
}
