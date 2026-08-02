{
  description = "NextJS Template";

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
      buildInputs = with pkgs; [
        nodejs_22
        pnpm
      ];
      nativeBuildInputs = buildInputs;
      npmDepsHash = "sha256-E1InKwgf4r5Pa5rmkbpUduAO0rlVV446t3KKvHCF0Ww=";
    in {
      devShells.default = pkgs.mkShell {
        inherit buildInputs;
        shellHook = ''
          #!/usr/bin/env bash
          ln -sfn ${ascii-cube-rs.packages.${system}.default} ./wasm-cube
        '';
      };

      packages.default = pkgs.buildNpmPackage {
        inherit pname version buildInputs npmDepsHash nativeBuildInputs;
        src = ./.;
        prePatch = ''
          ln -sfn ${ascii-cube-rs.packages.${system}.default} ./wasm-cube
        '';
        postInstall = ''
          ln -sfn ${ascii-cube-rs.packages.${system}.default} $out/lib/node_modules/portofolio/wasm-cube
          cp -rf dist/* $out/ 2>/dev/null || true
          
          mkdir -p $out/bin
          cat > $out/bin/portfolio <<EOF
          #!/usr/bin/env sh
          echo "Starting local portfolio server on http://localhost:8080..."
          cd $out
          exec ${pkgs.python3}/bin/python3 -m http.server 8080
          EOF
          chmod +x $out/bin/portfolio
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
          enable = lib.mkEnableOption "Portfolio service";
          port = lib.mkOption {
            type = lib.types.port;
            default = 8080;
            description = "Port on which to serve the portfolio";
          };
        };

        config = lib.mkIf config.services.portfolio.enable {
          services.nginx.enable = true;

          services.nginx.virtualHosts."portfolio.local" = {
            listen = [
              {
                addr = "0.0.0.0";
                port = config.services.portfolio.port;
              }
            ];
            root = "${pkg}";
            extraConfig = ''
              port_in_redirect off;
              absolute_redirect off;
            '';
          };
        };
      };
    };
}
