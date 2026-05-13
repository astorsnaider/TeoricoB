import SwiftUI

// MARK: - Color Theme
extension Color {
    static let appRed      = Color(hex: "#E63946")
    static let appBlue     = Color(hex: "#457B9D")
    static let appGreen    = Color(hex: "#2A9D8F")
    static let appOrange   = Color(hex: "#F4A261")
    static let appYellow   = Color(hex: "#FFD166")
    static let appDark     = Color(hex: "#264653")
    static let appBg       = Color(hex: "#F2F2F7")
    static let appCard     = Color.white
    static let appCorrect  = Color(hex: "#06D6A0")
    static let appWrong    = Color(hex: "#EF476F")

    init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: .alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch cleaned.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(.sRGB, red: Double(r)/255, green: Double(g)/255, blue: Double(b)/255, opacity: Double(a)/255)
    }
}

// MARK: - Shake Modifier
struct ShakeModifier: GeometryEffect {
    var amount: CGFloat = 8
    var shakesPerUnit = 3
    var animatableData: CGFloat

    func effectValue(size: CGSize) -> ProjectionTransform {
        ProjectionTransform(CGAffineTransform(translationX: amount * sin(animatableData * .pi * CGFloat(shakesPerUnit)), y: 0))
    }
}

extension View {
    func shake(_ trigger: Bool) -> some View {
        modifier(ShakeEffect(trigger: trigger))
    }
}

struct ShakeEffect: ViewModifier {
    var trigger: Bool
    @State private var shakeVal: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .modifier(ShakeModifier(animatableData: shakeVal))
            .onChange(of: trigger) { _, val in
                guard val else { return }
                withAnimation(.linear(duration: 0.4)) { shakeVal = 2 }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { shakeVal = 0 }
            }
    }
}

// MARK: - Bounce Button Style
struct BounceButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.93 : 1.0)
            .animation(.spring(response: 0.2, dampingFraction: 0.6), value: configuration.isPressed)
    }
}

// MARK: - Confetti Particle
struct ConfettiView: View {
    @State private var particles: [(id: UUID, x: CGFloat, y: CGFloat, color: Color, scale: CGFloat, rotation: Double)] = []

    var body: some View {
        ZStack {
            ForEach(particles, id: \.id) { p in
                RoundedRectangle(cornerRadius: 2)
                    .fill(p.color)
                    .frame(width: 8, height: 8)
                    .scaleEffect(p.scale)
                    .rotationEffect(.degrees(p.rotation))
                    .position(x: p.x, y: p.y)
            }
        }
        .ignoresSafeArea()
        .allowsHitTesting(false)
        .onAppear { spawnParticles() }
    }

    private func spawnParticles() {
        let colors: [Color] = [.appRed, .appYellow, .appGreen, .appBlue, .appOrange]
        particles = (0..<60).map { _ in
            (UUID(), CGFloat.random(in: 0...UIScreen.main.bounds.width),
             CGFloat.random(in: -50...200),
             colors.randomElement()!,
             CGFloat.random(in: 0.5...1.5),
             Double.random(in: 0...360))
        }
        withAnimation(.easeOut(duration: 1.5)) {
            particles = particles.map { p in
                var q = p
                q.y = CGFloat.random(in: 300...900)
                q.rotation = Double.random(in: 0...720)
                return q
            }
        }
    }
}

// MARK: - Haptic
func haptic(_ style: UIImpactFeedbackGenerator.FeedbackStyle = .medium) {
    UIImpactFeedbackGenerator(style: style).impactOccurred()
}

func hapticNotification(_ type: UINotificationFeedbackGenerator.FeedbackType) {
    UINotificationFeedbackGenerator().notificationOccurred(type)
}

// MARK: - Gradient helpers
extension LinearGradient {
    static func topDown(_ color: Color) -> LinearGradient {
        LinearGradient(colors: [color, color.opacity(0.7)], startPoint: .top, endPoint: .bottom)
    }
}
