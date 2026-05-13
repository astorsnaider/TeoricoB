import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var appVM: AppViewModel
    @State private var page = 0
    @State private var name = ""
    @State private var selectedAvatar = "🚗"

    private let avatars = ["🚗", "🚙", "🏎️", "🚕", "🚘", "🛻", "🚐", "🚌"]

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color.appRed, Color.appRed.opacity(0.7)],
                           startPoint: .topLeading, endPoint: .bottomTrailing)
                .ignoresSafeArea()

            VStack {
                if page == 0 { welcomePage }
                else if page == 1 { featuresPage }
                else { setupPage }
            }
            .animation(.spring(response: 0.4, dampingFraction: 0.8), value: page)
        }
    }

    private var welcomePage: some View {
        VStack(spacing: 32) {
            Spacer()
            Text("🚦").font(.system(size: 100))
                .shadow(color: .black.opacity(0.2), radius: 10)

            VStack(spacing: 12) {
                Text("TeóricoB")
                    .font(.system(size: 44, weight: .black))
                    .foregroundColor(.white)
                Text("Aprueba el carnet\nde conducir jugando")
                    .font(.title3)
                    .multilineTextAlignment(.center)
                    .foregroundColor(.white.opacity(0.85))
            }
            Spacer()

            VStack(spacing: 12) {
                Button { withAnimation { page = 1 } } label: {
                    Text("¡Empezar!")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.white)
                        .foregroundColor(.appRed)
                        .cornerRadius(16)
                }
                .buttonStyle(BounceButtonStyle())

                Text("Basado en las preguntas oficiales de la DGT")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
            }
            .padding(.horizontal, 32)
            .padding(.bottom, 48)
        }
        .transition(.asymmetric(insertion: .move(edge: .trailing), removal: .move(edge: .leading)))
    }

    private var featuresPage: some View {
        VStack(spacing: 32) {
            Spacer()
            Text("¿Cómo funciona?")
                .font(.largeTitle.bold())
                .foregroundColor(.white)

            VStack(spacing: 20) {
                featureRow(icon: "🔥", title: "Rachas diarias", desc: "Estudia cada día para mantener tu racha")
                featureRow(icon: "🏆", title: "Ligas y ranking", desc: "Compite con amigos y sube de liga")
                featureRow(icon: "❤️", title: "Sistema de vidas", desc: "Pierde vidas si fallas, recupéralas estudiando")
                featureRow(icon: "🎓", title: "Examen simulado", desc: "Practica con exámenes reales de 30 preguntas")
            }
            .padding(.horizontal, 32)

            Spacer()

            Button { withAnimation { page = 2 } } label: {
                Text("Continuar")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.white)
                    .foregroundColor(.appRed)
                    .cornerRadius(16)
            }
            .buttonStyle(BounceButtonStyle())
            .padding(.horizontal, 32)
            .padding(.bottom, 48)
        }
        .transition(.asymmetric(insertion: .move(edge: .trailing), removal: .move(edge: .leading)))
    }

    private func featureRow(icon: String, title: String, desc: String) -> some View {
        HStack(spacing: 16) {
            Text(icon).font(.title)
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.headline).foregroundColor(.white)
                Text(desc).font(.subheadline).foregroundColor(.white.opacity(0.75))
            }
            Spacer()
        }
        .padding(16)
        .background(Color.white.opacity(0.15))
        .cornerRadius(14)
    }

    private var setupPage: some View {
        VStack(spacing: 28) {
            Spacer()
            Text("¿Cómo te llamas?")
                .font(.largeTitle.bold())
                .foregroundColor(.white)

            TextField("Tu nombre", text: $name)
                .padding()
                .background(Color.white)
                .cornerRadius(14)
                .font(.title3)
                .padding(.horizontal, 32)

            Text("Elige tu avatar")
                .font(.headline)
                .foregroundColor(.white)

            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: 12) {
                ForEach(avatars, id: \.self) { av in
                    Button { selectedAvatar = av; haptic(.light) } label: {
                        Text(av)
                            .font(.largeTitle)
                            .frame(width: 64, height: 64)
                            .background(selectedAvatar == av ? Color.white : Color.white.opacity(0.2))
                            .cornerRadius(16)
                            .scaleEffect(selectedAvatar == av ? 1.15 : 1.0)
                            .animation(.spring(response: 0.2), value: selectedAvatar)
                    }
                    .buttonStyle(BounceButtonStyle())
                }
            }
            .padding(.horizontal, 32)

            Spacer()

            Button {
                guard !name.trimmingCharacters(in: .whitespaces).isEmpty else { return }
                haptic(.medium)
                appVM.completeOnboarding(name: name.trimmingCharacters(in: .whitespaces),
                                          avatar: selectedAvatar)
            } label: {
                Text("¡Vamos a aprobar!")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(name.isEmpty ? Color.white.opacity(0.4) : Color.white)
                    .foregroundColor(name.isEmpty ? .white : .appRed)
                    .cornerRadius(16)
            }
            .buttonStyle(BounceButtonStyle())
            .disabled(name.isEmpty)
            .padding(.horizontal, 32)
            .padding(.bottom, 48)
        }
        .transition(.asymmetric(insertion: .move(edge: .trailing), removal: .move(edge: .leading)))
    }
}
