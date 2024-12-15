# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
    pkgs.mongodb-6_0
  ];

  # Sets environment variables in the workspace
  env = {
    MONGODB_URI = "mongodb://localhost:27017/protrack";
    NODE_ENV = "development";
  };

  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
      "mongodb.mongodb-vscode"  # MongoDB extension for VS Code
    ];

    workspace = {
      # Runs when a workspace is first created with this `dev.nix` file
      onCreate = {
        npm-install = "npm ci --no-audit --prefer-offline --no-progress --timing";
        setup-mongodb = "mkdir -p ~/data/db";  # Create MongoDB data directory

        # Open editors for the following files by default, if they exist:
        default.openFiles = [
          "client/src/App.tsx"
          "client/src/App.ts"
          "client/src/App.jsx"
          "client/src/App.js"
        ];
      };

      # To run something each time the workspace is (re)started, use the `onStart` hook
      onStart = {
        start-mongodb = "mongod --dbpath ~/data/db &";  # Start MongoDB daemon
      };
    };

    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "start"];
          manager = "web";
        };
      };
    };
  };
}