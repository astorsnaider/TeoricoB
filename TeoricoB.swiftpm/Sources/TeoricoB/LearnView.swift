import SwiftUI

struct LearnView: View {
    @EnvironmentObject var appVM: AppViewModel

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    xpBanner
                    ForEach(appVM.topics) { topic in
                        NavigationLink(destination: TopicDetailView(topic: topic)) {
                            TopicCard(topic: topic,
                                      progress: appVM.progressForTopic(topic.id),
                                      isCompleted: appVM.isTopicCompleted(topic.id))
                        }
                        .buttonStyle(.plain)
                    }
                    Spacer(minLength: 100)
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
            }
            .background(Color.appBg)
            .navigationTitle("Aprender")
            .navigationBarTitleDisplayMode(.large)
        }
    }

    private var xpBanner: some View {
        HStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Nivel \(appVM.user.level)")
                    .font(.headline.bold())
                Text("\(appVM.user.xpInCurrentLevel)/100 XP para el siguiente nivel")
                    .font(.caption)
                    .foregroundColor(.secondary)
                ProgressBar(value: Double(appVM.user.xpInCurrentLevel) / 100.0, color: .appYellow)
                    .padding(.top, 4)
            }
            Spacer()
            Text("⭐ \(appVM.user.xp) XP")
                .font(.subheadline.bold())
                .foregroundColor(.appYellow)
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.06), radius: 8)
    }
}

struct TopicCard: View {
    let topic: Topic
    let progress: Double
    let isCompleted: Bool

    var body: some View {
        HStack(spacing: 16) {
            ZStack {
                RoundedRectangle(cornerRadius: 14)
                    .fill(Color(hex: topic.colorHex).opacity(0.15))
                    .frame(width: 60, height: 60)
                Text(topic.emoji).font(.title)
            }

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(topic.name)
                        .font(.headline.bold())
                    Spacer()
                    if isCompleted {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.appGreen)
                    } else {
                        Text("\(Int(progress * 100))%")
                            .font(.caption.bold())
                            .foregroundColor(Color(hex: topic.colorHex))
                    }
                }
                Text(topic.description)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
                ProgressBar(value: progress, color: Color(hex: topic.colorHex))
                HStack {
                    Text("\(topic.totalLessons) lecciones")
                    Text("·")
                    Text("\(topic.totalQuestions) preguntas")
                }
                .font(.caption2)
                .foregroundColor(.secondary)
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(18)
        .shadow(color: .black.opacity(0.06), radius: 8)
    }
}

// MARK: - Topic Detail
struct TopicDetailView: View {
    @EnvironmentObject var appVM: AppViewModel
    let topic: Topic
    @State private var selectedLesson: Lesson? = nil
    @State private var showQuiz = false

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 0) {
                topicHeader
                    .padding(.bottom, 24)

                VStack(spacing: 16) {
                    ForEach(Array(topic.lessons.enumerated()), id: \.element.id) { idx, lesson in
                        LessonRow(lesson: lesson,
                                  index: idx,
                                  isCompleted: appVM.isLessonCompleted(lesson.id),
                                  topicColor: Color(hex: topic.colorHex))
                        .onTapGesture {
                            selectedLesson = lesson
                            haptic(.medium)
                        }
                    }
                }
                .padding(.horizontal, 16)
                Spacer(minLength: 100)
            }
        }
        .background(Color.appBg)
        .navigationTitle(topic.name)
        .navigationBarTitleDisplayMode(.inline)
        .fullScreenCover(item: $selectedLesson) { lesson in
            QuizView(
                quizVM: QuizViewModel(questions: lesson.questions, lesson: lesson, topic: topic),
                onComplete: { xp, perfect in
                    appVM.completeLesson(lessonId: lesson.id, topicId: topic.id, xpEarned: xp, perfect: perfect)
                }
            )
        }
    }

    private var topicHeader: some View {
        ZStack {
            Rectangle()
                .fill(LinearGradient(colors: [Color(hex: topic.colorHex), Color(hex: topic.colorHex).opacity(0.7)],
                                     startPoint: .topLeading, endPoint: .bottomTrailing))
                .frame(height: 180)
                .ignoresSafeArea(edges: .top)
            VStack(spacing: 12) {
                Text(topic.emoji).font(.system(size: 60))
                Text(topic.description)
                    .font(.subheadline)
                    .foregroundColor(.white.opacity(0.9))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
                HStack(spacing: 16) {
                    Label("\(topic.totalLessons) lecciones", systemImage: "book.fill")
                    Label("\(topic.totalQuestions) preguntas", systemImage: "questionmark.circle.fill")
                }
                .font(.caption.bold())
                .foregroundColor(.white.opacity(0.85))
            }
        }
    }
}

struct LessonRow: View {
    let lesson: Lesson
    let index: Int
    let isCompleted: Bool
    let topicColor: Color

    var body: some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(isCompleted ? topicColor : Color.gray.opacity(0.15))
                    .frame(width: 48, height: 48)
                if isCompleted {
                    Image(systemName: "checkmark").font(.headline.bold()).foregroundColor(.white)
                } else {
                    Text("\(index + 1)").font(.headline.bold()).foregroundColor(.secondary)
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(lesson.title).font(.headline)
                Text(lesson.subtitle).font(.subheadline).foregroundColor(.secondary)
                HStack(spacing: 8) {
                    Text(lesson.difficulty.rawValue)
                        .font(.caption.bold())
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Color(hex: lesson.difficulty.color).opacity(0.15))
                        .foregroundColor(Color(hex: lesson.difficulty.color))
                        .cornerRadius(6)
                    Text("\(lesson.questions.count) preguntas")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            Spacer()
            Image(systemName: isCompleted ? "arrow.clockwise" : "play.fill")
                .foregroundColor(topicColor)
                .font(.subheadline)
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 6)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(isCompleted ? topicColor.opacity(0.3) : Color.clear, lineWidth: 1.5)
        )
    }
}
