from pathlib import Path

# Root of your project
ROOT = Path(".")

# Output file
OUTPUT_FILE = "copied_files.txt"

# Directories to skip
SKIP_DIRS = {
    ".git",
    "__pycache__",
    ".venv",
    "venv",
    "node_modules",
    ".next",
    "dist",
    "build",
    ".mypy_cache",
    ".pytest_cache",
    ".idea",
    ".vscode",
    "package-lock.json"
}

# File extensions to include
INCLUDE_EXTENSIONS = {
    ".py",
    ".tsx",
    ".ts",
    ".jsx",
    ".js",
    ".json",
    ".css",
    ".scss",
    ".html",
    ".md",
    ".txt",
    ".env.example",
    ".yml",
    ".yaml",
    ".toml",
    ".sql",
    ".sh",
    ".gitignore",
}

# Individual filenames to include
INCLUDE_FILENAMES = {
    "Dockerfile",
    "docker-compose.yml",
    "requirements.txt",
    "package.json",
    "README.md",
    "vercel.json",
    "tsconfig.json",
    "next.config.ts",
    "next.config.js",
    ".env.example",
}


def should_include(path: Path) -> bool:
    if any(part in SKIP_DIRS for part in path.parts):
        return False

    if path.name in INCLUDE_FILENAMES:
        return True

    if path.suffix in INCLUDE_EXTENSIONS:
        return True

    return False


with open(OUTPUT_FILE, "w", encoding="utf-8") as out:

    for file in sorted(ROOT.rglob("*")):

        if not file.is_file():
            continue

        if not should_include(file):
            continue

        relative = file.relative_to(ROOT)

        out.write("=" * 100 + "\n")
        out.write(f"FILE: {relative}\n")
        out.write("=" * 100 + "\n\n")

        try:
            content = file.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            out.write("[Binary file skipped]\n\n")
            continue
        except Exception as e:
            out.write(f"[Could not read file: {e}]\n\n")
            continue

        out.write(content)
        out.write("\n\n\n")

print(f"Done! Output written to {OUTPUT_FILE}")