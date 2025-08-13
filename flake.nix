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
  
  outputs = { self, nixpkgs, flake-utils, ... }:
    (flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
      pname = "portofolio";
      version = "0.1.0";
      buildInputs = with pkgs; [
        nodejs_20
        nodePackages_latest.pnpm
      ];
      nativeBuildInputs = buildInputs;
      npmDepsHash = "sha256-HiLm2VAtakCLQAwzEzNGH68MNlxgtNVo7bM7JRNtJi4="; # <prefetch-npm-deps package-lock.json>
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
          mkdir -p $out/bin
          exe="$out/bin/${pname}"
          lib="$out/lib/node_modules/${pname}"
          cp -r ./.next $lib
          touch $exe
          chmod +x $exe
          echo "
          #!/usr/bin/env bash
          cd $lib
          # first arg is the port
          ${pkgs.nodePackages_latest.pnpm}/bin/pnpm run start --port \$1
          " > $exe
        '';
      };
    })) // {
      nixosModules.default = { config, lib, pkgs, ... }: {
        options.services.portfolio = {
          enable = lib.mkEnableOption "Portfolio service";
          port = lib.mkOption {
            type = lib.types.port;
            default = 3000;
            description = "Port on which the Portfolio service will run.";
          };
        };
        
        config = lib.mkIf config.services.portfolio.enable {
          systemd.services.portfolio = {
            description = "Portfolio NextJS app";
            after = [ "network.target" ];
            wantedBy = [ "multi-user.target" ];
            serviceConfig = {
              ExecStart = "${self.packages.${pkgs.system}.default}/bin/portofolio ${toString config.services.portfolio.port}";
              Restart = "always";
              User = "portfolio";
            };
          };
          
          users.users.portfolio = {
            isSystemUser = true;
            group = "portfolio";
          };
          users.groups.portfolio = {};
        };
      };
    };
}