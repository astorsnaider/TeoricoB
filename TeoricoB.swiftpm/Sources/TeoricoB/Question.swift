import Foundation
import SwiftUI

struct Topic: Identifiable, Codable {
    var id: String
    var name: String
    var emoji: String
    var description: String
    var colorHex: String
    var lessons: [Lesson]

    var totalQuestions: Int { lessons.reduce(0) { $0 + $1.questions.count } }
    var totalLessons: Int { lessons.count }
}

struct Lesson: Identifiable, Codable {
    var id: String
    var title: String
    var subtitle: String
    var questions: [Question]
    var difficulty: Difficulty

    enum Difficulty: String, Codable {
        case easy = "Básico"
        case medium = "Intermedio"
        case hard = "Avanzado"

        var color: String {
            switch self {
            case .easy: return "#4CAF50"
            case .medium: return "#FF9800"
            case .hard: return "#F44336"
            }
        }
    }
}

struct Question: Identifiable, Codable {
    var id: String
    var text: String
    var options: [String]
    var correctIndex: Int
    var explanation: String
    var hint: String?
    var category: String

    var correctAnswer: String { options[correctIndex] }
}
