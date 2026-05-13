import SwiftUI

struct LeagueView: View {
    @EnvironmentObject var appVM: AppViewModel
    @State private var selectedTab = 0

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                leagueHeader
                Picker("", selection: $selectedTab) {
                    Text("Ranking").tag(0)
                    Text("Amigos").tag(1)
                    Text("Mis Ligas").tag(2)
                }
                .pickerStyle(.segmented)
                .padding(16)

                if selectedTab == 0 { rankingList }
                else if selectedTab == 1 { friendsList }
                else { leagueProgressView }
            }
            .background(Color.appBg)
            .navigationBarHidden(true)
        }
        .onAppear { appVM.generateLeagueStandings() }
    }

    private var leagueHeader: some View {
        ZStack {
            LinearGradient(colors: [Color(hex: appVM.user.league.color),
                                    Color(hex: appVM.user.league.color).opacity(0.7)],
                           startPoint: .topLeading, endPoint: .bottomTrailing)
                .frame(height: 180)
                .ignoresSafeArea(edges: .top)

            VStack(spacing: 8) {
                Text("Liga \(appVM.user.league.rawValue)")
                    .font(.largeTitle.bold())
                    .foregroundColor(.white)
                HStack(spacing: 8) {
                    Text(appVM.user.league.emoji).font(.title2)
                    Text("\(appVM.user.leagueXP) XP esta semana")
                        .font(.headline)
                        .foregroundColor(.white.opacity(0.9))
                }
                if let next = appVM.user.league.next {
                    VStack(spacing: 6) {
                        Text("Próxima: Liga \(next.rawValue) \(next.emoji)")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.8))
                        ProgressBar(
                            value: min(Double(appVM.user.leagueXP) / Double(next.xpRequired - appVM.user.league.xpRequired), 1.0),
                            color: .white
                        )
                        .padding(.horizontal, 40)
                        Text("\(max(0, next.xpRequired - appVM.user.leagueXP)) XP para ascender")
                            .font(.caption2)
                            .foregroundColor(.white.opacity(0.7))
                    }
                }
            }
            .padding(.top, 40)
        }
    }

    private var rankingList: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 8) {
                Text("Top 10 · Semana actual")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .padding(.top, 8)

                ForEach(appVM.currentLeagueStandings) { standing in
                    LeaderboardRow(standing: standing)
                }
                Spacer(minLength: 100)
            }
            .padding(.horizontal, 16)
        }
    }

    private var friendsList: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 12) {
                ForEach(appVM.user.friends) { friend in
                    FriendRow(friend: friend, myXP: appVM.user.weeklyXP)
                }
                addFriendCard
                Spacer(minLength: 100)
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)
        }
    }

    private var addFriendCard: some View {
        HStack {
            Image(systemName: "person.badge.plus")
                .font(.title2)
                .foregroundColor(.appBlue)
            Text("Invitar amigos")
                .font(.headline)
            Spacer()
            Image(systemName: "chevron.right").foregroundColor(.secondary)
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 6)
    }

    private var leagueProgressView: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 12) {
                ForEach(LeagueType.allCases, id: \.self) { league in
                    LeagueProgressRow(
                        league: league,
                        isCurrent: appVM.user.league == league,
                        isUnlocked: leagueUnlocked(league)
                    )
                }
                Spacer(minLength: 100)
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)
        }
    }

    private func leagueUnlocked(_ league: LeagueType) -> Bool {
        let all = LeagueType.allCases
        guard let userIdx = all.firstIndex(of: appVM.user.league),
              let leagueIdx = all.firstIndex(of: league) else { return false }
        return leagueIdx <= userIdx
    }
}

struct LeaderboardRow: View {
    let standing: LeagueStanding

    private var rankColor: Color {
        switch standing.rank {
        case 1: return .appYellow
        case 2: return Color(hex: "#A8A9AD")
        case 3: return Color(hex: "#CD7F32")
        default: return .secondary
        }
    }

    var body: some View {
        HStack(spacing: 14) {
            Text(standing.rank <= 3 ? ["🥇", "🥈", "🥉"][standing.rank - 1] : "\(standing.rank)")
                .font(standing.rank <= 3 ? .title2 : .headline)
                .foregroundColor(rankColor)
                .frame(width: 36)

            Text(standing.avatarEmoji).font(.title2)

            VStack(alignment: .leading, spacing: 2) {
                Text(standing.userName)
                    .font(.subheadline.bold())
                    .foregroundColor(standing.isCurrentUser ? .appRed : .primary)
                Text("\(standing.xp) XP")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            if standing.isCurrentUser {
                Text("Tú")
                    .font(.caption.bold())
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.appRed.opacity(0.12))
                    .foregroundColor(.appRed)
                    .cornerRadius(8)
            }
        }
        .padding(14)
        .background(standing.isCurrentUser ? Color.appRed.opacity(0.05) : Color.white)
        .cornerRadius(14)
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(standing.isCurrentUser ? Color.appRed.opacity(0.3) : Color.clear, lineWidth: 1.5)
        )
        .shadow(color: .black.opacity(0.04), radius: 4)
    }
}

struct FriendRow: View {
    let friend: FriendProfile
    let myXP: Int

    var body: some View {
        HStack(spacing: 14) {
            Text(friend.avatarEmoji).font(.title2)
            VStack(alignment: .leading, spacing: 2) {
                Text(friend.name).font(.subheadline.bold())
                HStack(spacing: 6) {
                    Text(friend.league.emoji)
                    Text(friend.league.rawValue)
                    Text("·")
                    Text("🔥 \(friend.streak) días")
                }
                .font(.caption)
                .foregroundColor(.secondary)
            }
            Spacer()
            VStack(alignment: .trailing) {
                Text("\(friend.xp) XP").font(.subheadline.bold())
                let diff = friend.xp - myXP
                Text(diff > 0 ? "+\(diff)" : "\(diff)")
                    .font(.caption.bold())
                    .foregroundColor(diff > 0 ? .appWrong : .appCorrect)
            }
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(14)
        .shadow(color: .black.opacity(0.04), radius: 4)
    }
}

struct LeagueProgressRow: View {
    let league: LeagueType
    let isCurrent: Bool
    let isUnlocked: Bool

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(isUnlocked ? Color(hex: league.color).opacity(0.2) : Color.gray.opacity(0.1))
                    .frame(width: 48, height: 48)
                Text(isUnlocked ? league.emoji : "🔒")
                    .font(.title2)
            }
            VStack(alignment: .leading, spacing: 4) {
                Text("Liga \(league.rawValue)")
                    .font(.headline)
                    .foregroundColor(isUnlocked ? .primary : .secondary)
                Text("\(league.xpRequired) XP para desbloquear")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            Spacer()
            if isCurrent {
                Text("Actual")
                    .font(.caption.bold())
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(Color(hex: league.color).opacity(0.15))
                    .foregroundColor(Color(hex: league.color))
                    .cornerRadius(8)
            } else if isUnlocked {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.appCorrect)
            }
        }
        .padding(14)
        .background(isCurrent ? Color(hex: league.color).opacity(0.08) : Color.white)
        .cornerRadius(14)
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(isCurrent ? Color(hex: league.color) : Color.clear, lineWidth: 1.5)
        )
        .shadow(color: .black.opacity(0.04), radius: 4)
    }
}
