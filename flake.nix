{
  description = "NextJS portfolio - served as a production Node server";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    systems.url = "github:nix-systems/x86_64-linux";
    flake-utils = {
      url = "github:numtide/flake-utils";
      inputs.systems.follows = "systems";
    };
    ascii-cube-rs.url = "github:Strange500/ascii-cube-rs";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    ascii-cube-rs,
    ...
  }:
    (flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
      pname = "portfolio";
      version = "0.1.0";
      nodejs = pkgs.nodejs_22;
      buildInputs = with pkgs; [
        nodejs_22
        pnpm
        python3Packages.weasyprint
      ];
      nativeBuildInputs = buildInputs;
      npmDepsHash = "sha256-+sN1A6pW8Uwb+DFXckFqFszG8WSEN7XINPPiAGrOtXY=";
    in {
      devShells.default = pkgs.mkShell {
        inherit buildInputs;
        shellHook = ''
          #!/usr/bin/env bash
          ln -sfn ${ascii-cube-rs.packages.${system}.default} ./wasm-cube
        '';
      };

      # Self-contained Next.js standalone production server (`next build` with
      # `output: 'standalone'` emits .next/standalone with a traced node_modules
      # and a ready-to-run server.js). The output is runnable via
      # `${pkg}/bin/portfolio` and listens on $PORT (default 8080).
      packages.default = pkgs.buildNpmPackage {
        inherit pname version buildInputs npmDepsHash nativeBuildInputs;
        src = ./.;
        prePatch = ''
          ln -sfn ${ascii-cube-rs.packages.${system}.default} ./wasm-cube
        '';
        installPhase = ''
          runHook preInstall
          mkdir -p $out
          # Standalone server + its traced runtime deps.
          cp -r .next/standalone/. $out/
          # Static assets are NOT traced into standalone; copy them alongside.
          cp -r .next/static $out/.next/static
          cp -r public $out/public

          mkdir -p $out/bin
          cat > $out/bin/portfolio <<'EOF'
          #!/usr/bin/env sh
          export HOSTNAME="''${HOSTNAME:-0.0.0.0}"
          export PORT="''${PORT:-8080}"
          exec ${nodejs}/bin/node "$(dirname "$0")/../server.js"
          EOF
          chmod +x $out/bin/portfolio
          runHook postInstall
        '';
      };
    }))
    // {
      nixosModules.default = {
        config,
        lib,
        pkgs,
        ...
      }: let
        pkg = self.packages.${pkgs.system}.default;
      in {
        options.services.portfolio = {
          enable = lib.mkEnableOption "Portfolio Next.js server";
          port = lib.mkOption {
            type = lib.types.port;
            default = 8080;
            description = "Port on which the Next.js server listens (bound to localhost).";
          };
        };

        config = lib.mkIf config.services.portfolio.enable {
          systemd.services.portfolio = {
            wantedBy = ["multi-user.target"];
            after = ["network.target"];
            environment = {
              HOSTNAME = "127.0.0.1";
              PORT = toString config.services.portfolio.port;
            };
            serviceConfig = {
              Type = "simple";
              ExecStart = "${pkg}/bin/portfolio";
              Restart = "always";
              DynamicUser = true;
            };
          };
        };
      };
    };
}