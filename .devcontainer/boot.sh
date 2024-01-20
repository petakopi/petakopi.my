#!/bin/bash

# echo "Setting SSH password for vscode user..."
sudo usermod --password "$(echo vscode | openssl passwd -1 -stdin)" vscode

# echo "Updating RubyGems..."
gem update --system -N

echo "Installing dependencies..."
bundle install
yarn install
yarn run build:css

echo "Creating database..."
bin/rails db:setup

echo "Done!"