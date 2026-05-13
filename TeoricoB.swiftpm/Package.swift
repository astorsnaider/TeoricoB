// swift-tools-version: 5.8
import PackageDescription

let package = Package(
    name: "TeoricoB",
    platforms: [.iOS("17.0")],
    targets: [
        .executableTarget(
            name: "TeoricoB",
            path: "Sources/TeoricoB"
        )
    ]
)
