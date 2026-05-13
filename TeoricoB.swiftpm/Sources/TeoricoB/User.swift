import Foundation

struct User: Codable {
    var id: UUID = UUID()
    var name: String
    var avatarEmoji: String
    var xp: Int = 0
    var streak: Int = 0
    var hearts: Int = 5
    var maxHearts: Int = 5
    var league: LeagueType = .bronze
    var leagueXP: Int = 0
    var completedTopics: [String] = []
    var completedLessons: [String] = []
    var achievements: [String] = []
    var lastActiveDate: Date = Date()
    var gems: Int = 50
    var totalCorrect: Int = 0
    var totalAnswered: Int = 0
    var weeklyXP: Int = 0
    var friends: [FriendProfile] = FriendProfile.sampleFriends

    var level: Int { (xp / 100) + 1 }
    var xpInCurrentLevel: Int { xp % 100 }
    var xpToNextLevel: Int { 100 - xpInCurrentLevel }

    var accuracy: Double {
        guard totalAnswered > 0 else { return 0 }
        return Double(totalCorrect) / Double(totalAnswered) * 100
    }

    var hasCompletedLesson: Bool { !completedLessons.isEmpty }
}

struct FriendProfile: Codable, Identifiable {
    var id: UUID = UUID()
    var name: String
    var avatarEmoji: String
    var xp: Int
    var streak: Int
    var league: LeagueType

    static let sampleFriends: [FriendProfile] = [
        FriendProfile(name: "Carlos M.", avatarEmoji: "😎", xp: 1240, streak: 12, league: .silver),
        FriendProfile(name: "Ana García", avatarEmoji: "🤩", xp: 890, streak: 5, league: .bronze),
        FriendProfile(name: "Pablo R.", avatarEmoji: "🚀", xp: 3200, streak: 28, league: .gold),
        FriendProfile(name: "María L.", avatarEmoji: "⭐", xp: 560, streak: 3, league: .bronze),
    ]
}

enum LeagueType: String, Codable, CaseIterable {
    case bronze = "Bronce"
    case silver = "Plata"
    case gold = "Oro"
    case sapphire = "Zafiro"
    case ruby = "Rubí"
    case emerald = "Esmeralda"
    case amethyst = "Amatista"
    case pearl = "Perla"
    case obsidian = "Obsidiana"
    case diamond = "Diamante"

    var emoji: String {
        switch self {
        case .bronze: return "🥉"
        case .silver: return "🥈"
        case .gold: return "🥇"
        case .sapphire: return "💙"
        case .ruby: return "❤️"
        case .emerald: return "💚"
        case .amethyst: return "💜"
        case .pearl: return "🔮"
        case .obsidian: return "⚫"
        case .diamond: return "💎"
        }
    }

    var color: String {
        switch self {
        case .bronze: return "#CD7F32"
        case .silver: return "#A8A9AD"
        case .gold: return "#FFD700"
        case .sapphire: return "#0F52BA"
        case .ruby: return "#E0115F"
        case .emerald: return "#50C878"
        case .amethyst: return "#9966CC"
        case .pearl: return "#B0A090"
        case .obsidian: return "#3D3635"
        case .diamond: return "#00BFFF"
        }
    }

    var xpRequired: Int {
        switch self {
        case .bronze: return 0
        case .silver: return 500
        case .gold: return 1500
        case .sapphire: return 3000
        case .ruby: return 5500
        case .emerald: return 9000
        case .amethyst: return 14000
        case .pearl: return 20000
        case .obsidian: return 28000
        case .diamond: return 40000
        }
    }

    var next: LeagueType? {
        let all = LeagueType.allCases
        guard let idx = all.firstIndex(of: self), idx < all.count - 1 else { return nil }
        return all[idx + 1]
    }

    var xpToPromote: Int {
        guard let next = next else { return 0 }
        return next.xpRequired - self.xpRequired
    }
}
