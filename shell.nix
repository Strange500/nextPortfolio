{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.devbox
    pkgs.nodejs_22
    pkgs.pnpm   # If you are using Yarn as your package manager
    pkgs.git    # For version control
    pkgs.vite   # If you're planning to use Vite for development
    pkgs.nodePackages."@tailwindcss/language-server"
  ];




  # Optionally, you can also set environment variables or shellCommands here
  shellHook = ''
    echo "Welcome to the Next.js development shell!"
    echo "Starting the development environment..."
  '';
}
