import Foundation
import Combine

class AppViewModel: ObservableObject {
    @Published var user: User
    @Published var isOnboardingComplete: Bool
    @Published var topics: [Topic]
    @Published var currentLeagueStandings: [LeagueStanding] = []
    @Published var dailyChallenge: DailyChallenge?
    @Published var newAchievements: [Achievement] = []
    @Published var showNewAchievement: Bool = false

    private let userKey = "savedUser_v2"
    private let onboardingKey = "onboardingComplete_v2"

    init() {
        if let data = UserDefaults.standard.data(forKey: "savedUser_v2"),
           let saved = try? JSONDecoder().decode(User.self, from: data) {
            self.user = saved
        } else {
            self.user = User(name: "", avatarEmoji: "🚗")
        }
        self.isOnboardingComplete = UserDefaults.standard.bool(forKey: "onboardingComplete_v2")
        self.topics = QuestionsDatabase.allTopics
        generateLeagueStandings()
        generateDailyChallenge()
        checkStreakValidity()
    }

    // MARK: - Onboarding
    func completeOnboarding(name: String, avatar: String) {
        user.name = name
        user.avatarEmoji = avatar
        isOnboardingComplete = true
        UserDefaults.standard.set(true, forKey: onboardingKey)
        saveUser()
    }

    // MARK: - Persistence
    func saveUser() {
        if let data = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(data, forKey: userKey)
        }
    }

    // MARK: - XP & Progress
    func addXP(_ amount: Int) {
        user.xp += amount
        user.weeklyXP += amount
        user.leagueXP += amount
        checkLeaguePromotion()
        checkAchievements()
        saveUser()
    }

    func loseHeart() {
        if user.hearts > 0 { user.hearts -= 1 }
        saveUser()
    }

    func restoreHeart() {
        if user.hearts < user.maxHearts { user.hearts += 1; saveUser() }
    }

    func recordAnswer(correct: Bool) {
        user.totalAnswered += 1
        if correct { user.totalCorrect += 1 }
        saveUser()
    }

    func completeLesson(lessonId: String, topicId: String, xpEarned: Int, perfect: Bool) {
        if !user.completedLessons.contains(lessonId) {
            user.completedLessons.append(lessonId)
        }
        addXP(xpEarned)
        checkTopicCompletion(topicId: topicId)
        updateStreak()
        if perfect { checkAchievement("perfect_lesson") }
        checkAchievements()
        saveUser()
    }

    func checkTopicCompletion(topicId: String) {
        guard let topic = topics.first(where: { $0.id == topicId }) else { return }
        let allDone = topic.lessons.allSatisfy { user.completedLessons.contains($0.id) }
        if allDone && !user.completedTopics.contains(topicId) {
            user.completedTopics.append(topicId)
            checkAchievement("topic_complete")
        }
        if user.completedTopics.count == topics.count {
            checkAchievement("all_topics")
        }
    }

    // MARK: - Streak
    func updateStreak() {
        let calendar = Calendar.current
        let now = Date()
        let last = user.lastActiveDate
        if calendar.isDateInToday(last) { return }
        if calendar.isDateInYesterday(last) {
            user.streak += 1
        } else {
            user.streak = 1
        }
        user.lastActiveDate = now
        checkAchievement(streakAchievementId())
        saveUser()
    }

    private func streakAchievementId() -> String? {
        if user.streak >= 30 { return "streak_30" }
        if user.streak >= 7 { return "streak_7" }
        if user.streak >= 3 { return "streak_3" }
        return nil
    }

    func checkStreakValidity() {
        let calendar = Calendar.current
        let last = user.lastActiveDate
        if !calendar.isDateInToday(last) && !calendar.isDateInYesterday(last) {
            if user.streak > 0 { user.streak = 0; saveUser() }
        }
    }

    // MARK: - League
    func checkLeaguePromotion() {
        guard let next = user.league.next else { return }
        if user.xp >= next.xpRequired {
            user.league = next
            if user.league == .gold { checkAchievement("gold_league") }
            if user.league == .diamond { checkAchievement("diamond_league") }
        }
    }

    // MARK: - Achievements
    func checkAchievement(_ id: String?) {
        guard let id = id, !user.achievements.contains(id) else { return }
        user.achievements.append(id)
        if let achievement = Achievement.all.first(where: { $0.id == id }) {
            newAchievements.append(achievement)
            showNewAchievement = true
        }
    }

    func checkAchievements() {
        if !user.completedLessons.isEmpty { checkAchievement("first_lesson") }
        if user.xp >= 100 { checkAchievement("xp_100") }
        if user.xp >= 500 { checkAchievement("xp_500") }
        if user.xp >= 1000 { checkAchievement("xp_1000") }
        if user.totalAnswered >= 50 && user.accuracy >= 90 { checkAchievement("accuracy_90") }
        if let id = streakAchievementId() { checkAchievement(id) }
    }

    func unlockAchievement(id: String) {
        guard !user.achievements.contains(id) else { return }
        user.achievements.append(id)
    }

    // MARK: - Helpers
    func isLessonCompleted(_ lessonId: String) -> Bool {
        user.completedLessons.contains(lessonId)
    }

    func isTopicCompleted(_ topicId: String) -> Bool {
        user.completedTopics.contains(topicId)
    }

    func progressForTopic(_ topicId: String) -> Double {
        guard let topic = topics.first(where: { $0.id == topicId }) else { return 0 }
        let completed = topic.lessons.filter { user.completedLessons.contains($0.id) }.count
        return Double(completed) / Double(topic.lessons.count)
    }

    // MARK: - League Standings
    func generateLeagueStandings() {
        let base = user.leagueXP
        let competitors: [(String, String, Int)] = [
            ("Carlos M.", "😎", base + 45),
            ("Ana García", "🤩", base + 30),
            ("Pablo R.", "🚀", base + 15),
            (user.name.isEmpty ? "Tú" : user.name, user.avatarEmoji, base),
            ("María L.", "⭐", max(0, base - 20)),
            ("David S.", "🎯", max(0, base - 45)),
            ("Laura T.", "💪", max(0, base - 80)),
            ("Miguel A.", "🔥", max(0, base - 110)),
            ("Sofía V.", "⚡", max(0, base - 150)),
            ("Roberto G.", "🏆", max(0, base - 200)),
        ]
        let sorted = competitors.sorted { $0.2 > $1.2 }
        currentLeagueStandings = sorted.enumerated().map { idx, c in
            LeagueStanding(userName: c.0, avatarEmoji: c.1, xp: c.2, rank: idx + 1,
                           isCurrentUser: c.0 == (user.name.isEmpty ? "Tú" : user.name))
        }
    }

    // MARK: - Daily Challenge
    func generateDailyChallenge() {
        let all = topics.flatMap { $0.lessons.flatMap { $0.questions } }
        let picked = Array(all.shuffled().prefix(10))
        dailyChallenge = DailyChallenge(date: Date(), questions: picked)
    }

    func completeDailyChallenge(score: Int) {
        guard var dc = dailyChallenge, !dc.isCompleted else { return }
        dc.isCompleted = true
        dailyChallenge = dc
        addXP(dc.xpReward)
        updateStreak()
    }

    // MARK: - Exam Simulation
    func generateExamQuestions() -> [Question] {
        let all = topics.flatMap { $0.lessons.flatMap { $0.questions } }
        return Array(all.shuffled().prefix(30))
    }

    func userAchievements() -> [Achievement] {
        Achievement.all.map { a in
            var copy = a
            copy.isUnlocked = user.achievements.contains(a.id)
            return copy
        }
    }
}
