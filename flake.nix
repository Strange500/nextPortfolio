{
  description = "NextJS Template";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    systems.url = "github:nix-systems/x86_64-linux";
    flake-utils = {
      url = "github:numtide/flake-utils";
      inputs.systems.follows = "systems";
    };
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    ...
  }:
    (flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
      pname = "portfolio";
      version = "0.1.0";
      buildInputs = with pkgs; [
        nodejs_20
        nodePackages_latest.pnpm
      ];
      nativeBuildInputs = buildInputs;
      npmDepsHash = "sha256-KTl+aW6zIHwqnyF0nC5GfOJn7/F/zZsRzkaHmEtWt30="; # <prefetch-npm-deps package-lock.json>
    in {
      devShells.default = pkgs.mkShell {
        inherit buildInputs;
        shellHook = ''
          #!/usr/bin/env bash
        '';
      };

      packages.default = pkgs.buildNpmPackage {
        inherit pname version buildInputs npmDepsHash nativeBuildInputs;
        src = ./.;
        postInstall = ''
          cp -rf dist/* $out/
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
          };
        };
      };
    };
}
