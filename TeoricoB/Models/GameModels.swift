import Foundation

struct Achievement: Identifiable, Codable {
    var id: String
    var name: String
    var description: String
    var emoji: String
    var isUnlocked: Bool = false
    var unlockedDate: Date?

    static let all: [Achievement] = [
        Achievement(id: "first_lesson",   name: "¡Arranque!",          description: "Completa tu primera lección",             emoji: "🚀"),
        Achievement(id: "streak_3",       name: "En Racha",            description: "Mantén una racha de 3 días",              emoji: "🔥"),
        Achievement(id: "streak_7",       name: "Semana de Fuego",     description: "Mantén una racha de 7 días",              emoji: "⚡"),
        Achievement(id: "streak_30",      name: "Mes Perfecto",        description: "Mantén una racha de 30 días",             emoji: "💫"),
        Achievement(id: "perfect_lesson", name: "Sin Errores",         description: "Completa una lección perfecta",           emoji: "⭐"),
        Achievement(id: "topic_complete", name: "Experto Temático",    description: "Completa todos los temas de una categoría",emoji: "🏆"),
        Achievement(id: "all_topics",     name: "¡Teórico Superado!",  description: "Completa todos los temas",                emoji: "🎓"),
        Achievement(id: "xp_100",         name: "Primer Centenar",     description: "Gana 100 XP",                             emoji: "💯"),
        Achievement(id: "xp_500",         name: "Quinientos Puntos",   description: "Gana 500 XP",                             emoji: "🌟"),
        Achievement(id: "xp_1000",        name: "¡Mil Puntos!",        description: "Gana 1000 XP",                            emoji: "🎯"),
        Achievement(id: "gold_league",    name: "Liga de Oro",         description: "Alcanza la Liga de Oro",                  emoji: "🥇"),
        Achievement(id: "diamond_league", name: "Diamante",            description: "Alcanza la Liga Diamante",                emoji: "💎"),
        Achievement(id: "exam_pass",      name: "Aprobado",            description: "Pasa el examen simulado",                 emoji: "🎉"),
        Achievement(id: "accuracy_90",    name: "Precisión de Cirujano",description: "Mantén +90% de acierto (50+ respuestas)",emoji: "🎯"),
        Achievement(id: "speed_answers",  name: "Velocista Mental",    description: "Responde 5 preguntas en menos de 8s cada una",emoji: "⚡"),
    ]
}

struct LeagueStanding: Identifiable {
    var id: UUID = UUID()
    var userName: String
    var avatarEmoji: String
    var xp: Int
    var rank: Int
    var isCurrentUser: Bool
}

struct ExamResult: Identifiable {
    var id: UUID = UUID()
    var date: Date
    var totalQuestions: Int
    var correctAnswers: Int
    var timeTaken: TimeInterval
    var passed: Bool

    var scorePercent: Double { Double(correctAnswers) / Double(totalQuestions) * 100 }
}

struct DailyChallenge {
    var date: Date
    var questions: [Question]
    var isCompleted: Bool = false
    var xpReward: Int = 50
}
